const express = require('express');
const { query, sql } = require('../services/sql');

const router = express.Router();

function mapStatusToCase(status = 'Not Started', readiness = 0, progress = 0) {
  if (status === 'Certified') {
    return { currentStage: 'Certified', riskLevel: 'Low', managerStatus: 'Approved' };
  }

  if (status === 'Ready') {
    return { currentStage: 'Manager Review', riskLevel: 'Low', managerStatus: 'Needs Review' };
  }

  if (status === 'At Risk' || readiness < 50) {
    return { currentStage: 'Intervention', riskLevel: 'High', managerStatus: 'Needs Review' };
  }

  if (readiness < 75) {
    return {
      currentStage: progress > 0 ? 'Learning' : 'Intake',
      riskLevel: 'Medium',
      managerStatus: 'Pending Review',
    };
  }

  return {
    currentStage: progress > 0 ? 'Learning' : 'Intake',
    riskLevel: 'Low',
    managerStatus: 'Pending Review',
  };
}

async function findLearnerCourse(learnerId, courseId) {
  const rows = await query(
    `
      SELECT TOP 1 id, progress, readiness, status, exam_date
      FROM LearnerCourses
      WHERE learner_id = @learnerId AND course_id = @courseId
      ORDER BY id DESC
    `,
    {
      learnerId: { type: sql.Int, value: learnerId },
      courseId: { type: sql.Int, value: courseId },
    },
  );

  return rows[0];
}

router.get('/', async (_req, res, next) => {
  try {
    const cases = await query(`
      SELECT
        id,
        learner_id,
        full_name,
        email,
        team_id,
        team_name,
        course_id,
        course_name,
        provider,
        level,
        duration_weeks,
        learner_course_id,
        progress,
        readiness,
        status,
        current_stage,
        risk_level,
        manager_status,
        exam_date,
        created_at,
        updated_at
      FROM vw_CertificationCases
      ORDER BY updated_at DESC, full_name
    `);

    res.json(cases);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { learnerId, courseId, examDate } = req.body;

    if (!learnerId || !courseId) {
      return res.status(400).json({ error: 'learnerId and courseId are required.' });
    }

    let learnerCourse = await findLearnerCourse(learnerId, courseId);

    if (!learnerCourse) {
      const rows = await query(
        `
          INSERT INTO LearnerCourses (learner_id, course_id, progress, readiness, status, exam_date)
          OUTPUT inserted.id, inserted.progress, inserted.readiness, inserted.status, inserted.exam_date
          VALUES (@learnerId, @courseId, 0, 0, 'Not Started', @examDate)
        `,
        {
          learnerId: { type: sql.Int, value: learnerId },
          courseId: { type: sql.Int, value: courseId },
          examDate: { type: sql.Date, value: examDate || null },
        },
      );
      learnerCourse = rows[0];
    }

    const caseState = mapStatusToCase(learnerCourse.status, learnerCourse.readiness, learnerCourse.progress);
    const cases = await query(
      `
        MERGE CertificationCases AS target
        USING (SELECT @learnerId AS learner_id, @courseId AS course_id) AS source
          ON target.learner_id = source.learner_id
         AND target.course_id = source.course_id
        WHEN MATCHED THEN
          UPDATE SET
            status = @status,
            current_stage = @currentStage,
            risk_level = @riskLevel,
            manager_status = @managerStatus,
            updated_at = SYSUTCDATETIME()
        WHEN NOT MATCHED THEN
          INSERT (learner_id, course_id, status, current_stage, risk_level, manager_status)
          VALUES (@learnerId, @courseId, @status, @currentStage, @riskLevel, @managerStatus)
        OUTPUT inserted.id;
      `,
      {
        learnerId: { type: sql.Int, value: learnerId },
        courseId: { type: sql.Int, value: courseId },
        status: { type: sql.NVarChar(50), value: learnerCourse.status || 'Not Started' },
        currentStage: { type: sql.NVarChar(80), value: caseState.currentStage },
        riskLevel: { type: sql.NVarChar(50), value: caseState.riskLevel },
        managerStatus: { type: sql.NVarChar(50), value: caseState.managerStatus },
      },
    );

    const [created] = await query(
      `
        SELECT *
        FROM vw_CertificationCases
        WHERE id = @caseId
      `,
      {
        caseId: { type: sql.Int, value: cases[0].id },
      },
    );

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/start', async (req, res, next) => {
  try {
    const caseId = Number(req.params.id);

    if (!caseId) {
      return res.status(400).json({ error: 'A valid case id is required.' });
    }

    const rows = await query(
      `
        UPDATE CertificationCases
        SET
          status = 'In Progress',
          current_stage = 'Learning',
          manager_status = 'Pending Review',
          updated_at = SYSUTCDATETIME()
        OUTPUT inserted.id
        WHERE id = @caseId
      `,
      {
        caseId: { type: sql.Int, value: caseId },
      },
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Certification case not found.' });
    }

    const [started] = await query(
      `
        SELECT *
        FROM vw_CertificationCases
        WHERE id = @caseId
      `,
      {
        caseId: { type: sql.Int, value: caseId },
      },
    );

    res.json(started);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

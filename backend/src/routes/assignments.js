const express = require('express');
const { query, sql } = require('../services/sql');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const assignments = await query(`
      SELECT
        id AS case_id,
        learner_course_id AS assignment_id,
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
      ORDER BY full_name, course_name
    `);

    res.json(assignments);
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

    const assignments = await query(
      `
        MERGE LearnerCourses AS target
        USING (SELECT @learnerId AS learner_id, @courseId AS course_id) AS source
          ON target.learner_id = source.learner_id
         AND target.course_id = source.course_id
        WHEN MATCHED THEN
          UPDATE SET exam_date = COALESCE(@examDate, target.exam_date)
        WHEN NOT MATCHED THEN
          INSERT (learner_id, course_id, progress, readiness, status, exam_date)
          VALUES (@learnerId, @courseId, 0, 0, 'Not Started', @examDate)
        OUTPUT inserted.id;
      `,
      {
        learnerId: { type: sql.Int, value: learnerId },
        courseId: { type: sql.Int, value: courseId },
        examDate: { type: sql.Date, value: examDate || null },
      },
    );

    const cases = await query(
      `
        MERGE CertificationCases AS target
        USING (SELECT @learnerId AS learner_id, @courseId AS course_id) AS source
          ON target.learner_id = source.learner_id
         AND target.course_id = source.course_id
        WHEN MATCHED THEN
          UPDATE SET
            status = 'Not Started',
            current_stage = 'Intake',
            risk_level = 'Low',
            manager_status = 'Pending Review',
            updated_at = SYSUTCDATETIME()
        WHEN NOT MATCHED THEN
          INSERT (learner_id, course_id, status, current_stage, risk_level, manager_status)
          VALUES (@learnerId, @courseId, 'Not Started', 'Intake', 'Low', 'Pending Review')
        OUTPUT inserted.id;
      `,
      {
        learnerId: { type: sql.Int, value: learnerId },
        courseId: { type: sql.Int, value: courseId },
      },
    );

    const [assignment] = await query(
      `
        SELECT *
        FROM vw_CertificationCases
        WHERE id = @caseId
      `,
      {
        caseId: { type: sql.Int, value: cases[0].id },
      },
    );

    res.status(201).json({
      assignmentId: assignments[0].id,
      ...assignment,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

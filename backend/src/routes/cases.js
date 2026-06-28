const express = require('express');
const { query, sql } = require('../services/sql');
const { getJob, startAgenticProcess } = require('../services/uipath');

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

async function findCaseContext(caseId) {
  const rows = await query(
    `
      SELECT *
      FROM vw_CertificationCases
      WHERE id = @caseId
    `,
    {
      caseId: { type: sql.Int, value: caseId },
    },
  );

  return rows[0];
}

function buildAgenticProcessInput(caseContext) {
  return {
    caseId: String(caseContext.id),
    learnerId: String(caseContext.learner_id),
    certificationId: String(caseContext.course_id),
    certificationName: caseContext.course_name,
    learnerProfile: {
      name: caseContext.full_name,
      role: caseContext.level || 'Learner',
      department: caseContext.team_name || 'Unassigned',
      experienceLevel: String(caseContext.level || 'intermediate').toLowerCase(),
      previousCertifications: [],
    },
  };
}

async function latestAgentRun(caseId) {
  const rows = await query(
    `
      SELECT TOP 1
        id,
        certification_case_id,
        uipath_job_id,
        uipath_job_key,
        process_key,
        release_key,
        status,
        input_json,
        output_json,
        error_message,
        started_at,
        completed_at,
        updated_at
      FROM AgentRuns
      WHERE certification_case_id = @caseId
      ORDER BY started_at DESC, id DESC
    `,
    {
      caseId: { type: sql.Int, value: caseId },
    },
  );

  return rows[0];
}

function pickPayload(body, keys) {
  for (const key of keys) {
    if (body?.[key] && typeof body[key] === 'object') {
      return body[key];
    }
  }

  if (body?.output && typeof body.output === 'object') {
    for (const key of keys) {
      if (body.output[key] && typeof body.output[key] === 'object') {
        return body.output[key];
      }
    }
  }

  return body && typeof body === 'object' ? body : null;
}

function readinessFromAssessment(assessmentResult) {
  const score = Number(assessmentResult?.overallReadinessScore);
  if (!Number.isFinite(score)) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function riskState(riskEvaluation) {
  const isReady = riskEvaluation?.isReady === true;
  const riskLevel = String(riskEvaluation?.riskLevel || '').toLowerCase();

  if (isReady) {
    return {
      status: 'Ready',
      currentStage: 'Manager Review',
      riskLevel: 'Low',
      managerStatus: 'Needs Review',
    };
  }

  if (riskLevel === 'high') {
    return {
      status: 'At Risk',
      currentStage: 'Intervention',
      riskLevel: 'High',
      managerStatus: 'Needs Review',
    };
  }

  return {
    status: 'In Progress',
    currentStage: 'Learning',
    riskLevel: 'Medium',
    managerStatus: 'Pending Review',
  };
}

async function mergeLatestRunOutput(caseId, patch) {
  const run = await latestAgentRun(caseId);

  if (!run) {
    return null;
  }

  const current = run.output_json ? JSON.parse(run.output_json) : {};
  const output = {
    ...current,
    ...patch,
  };

  await query(
    `
      UPDATE AgentRuns
      SET
        output_json = @outputJson,
        updated_at = SYSUTCDATETIME()
      WHERE id = @runId
    `,
    {
      runId: { type: sql.Int, value: run.id },
      outputJson: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(output) },
    },
  );

  return output;
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

router.post('/:id/run', async (req, res, next) => {
  try {
    const caseId = Number(req.params.id);

    if (!caseId) {
      return res.status(400).json({ error: 'A valid case id is required.' });
    }

    const caseContext = await findCaseContext(caseId);

    if (!caseContext) {
      return res.status(404).json({ error: 'Certification case not found.' });
    }

    const input = {
      ...buildAgenticProcessInput(caseContext),
      ...(req.body?.inputOverrides || {}),
    };
    const job = await startAgenticProcess(input);
    const processKey = process.env.UIPATH_PROCESS_KEY || null;

    const runs = await query(
      `
        INSERT INTO AgentRuns (
          certification_case_id,
          uipath_job_id,
          uipath_job_key,
          process_key,
          release_key,
          status,
          input_json
        )
        OUTPUT
          inserted.id,
          inserted.certification_case_id,
          inserted.uipath_job_id,
          inserted.uipath_job_key,
          inserted.process_key,
          inserted.release_key,
          inserted.status,
          inserted.input_json,
          inserted.output_json,
          inserted.error_message,
          inserted.started_at,
          inserted.completed_at,
          inserted.updated_at
        VALUES (
          @caseId,
          @jobId,
          @jobKey,
          @processKey,
          @releaseKey,
          @status,
          @inputJson
        )
      `,
      {
        caseId: { type: sql.Int, value: caseId },
        jobId: { type: sql.NVarChar(80), value: job.id },
        jobKey: { type: sql.NVarChar(80), value: job.key },
        processKey: { type: sql.NVarChar(160), value: processKey },
        releaseKey: { type: sql.NVarChar(80), value: job.releaseKey },
        status: { type: sql.NVarChar(50), value: job.state },
        inputJson: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(input) },
      },
    );

    await query(
      `
        UPDATE CertificationCases
        SET
          status = 'In Progress',
          current_stage = 'Agentic Process',
          manager_status = 'Pending Review',
          updated_at = SYSUTCDATETIME()
        WHERE id = @caseId
      `,
      {
        caseId: { type: sql.Int, value: caseId },
      },
    );

    res.status(202).json({
      caseId,
      run: {
        ...runs[0],
        input_json: JSON.parse(runs[0].input_json),
        output_json: runs[0].output_json ? JSON.parse(runs[0].output_json) : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/learning-plan', async (req, res, next) => {
  try {
    const caseId = Number(req.params.id);
    const caseContext = await findCaseContext(caseId);
    const learningPath = pickPayload(req.body, ['learningPath', 'learningPlan']);

    if (!caseId || !caseContext) {
      return res.status(404).json({ error: 'Certification case not found.' });
    }

    if (!learningPath) {
      return res.status(400).json({ error: 'learningPath is required.' });
    }

    const rows = await query(
      `
        INSERT INTO LearningPlans (
          learner_id,
          course_id,
          certification_case_id,
          generated_plan,
          estimated_hours
        )
        OUTPUT inserted.*
        VALUES (
          @learnerId,
          @courseId,
          @caseId,
          @generatedPlan,
          @estimatedHours
        )
      `,
      {
        learnerId: { type: sql.Int, value: caseContext.learner_id },
        courseId: { type: sql.Int, value: caseContext.course_id },
        caseId: { type: sql.Int, value: caseId },
        generatedPlan: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(learningPath) },
        estimatedHours: { type: sql.Int, value: Number(learningPath.estimatedTotalHours) || null },
      },
    );

    const output = await mergeLatestRunOutput(caseId, { learningPath });

    await query(
      `
        UPDATE CertificationCases
        SET
          status = 'In Progress',
          current_stage = 'Learning Plan Created',
          updated_at = SYSUTCDATETIME()
        WHERE id = @caseId
      `,
      {
        caseId: { type: sql.Int, value: caseId },
      },
    );

    res.status(201).json({
      learningPlan: {
        ...rows[0],
        generated_plan: learningPath,
      },
      output,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/study-plan', async (req, res, next) => {
  try {
    const caseId = Number(req.params.id);
    const caseContext = await findCaseContext(caseId);
    const studyPlan = pickPayload(req.body, ['studyPlan']);

    if (!caseId || !caseContext) {
      return res.status(404).json({ error: 'Certification case not found.' });
    }

    if (!studyPlan) {
      return res.status(400).json({ error: 'studyPlan is required.' });
    }

    const rows = await query(
      `
        INSERT INTO StudyPlans (
          learner_id,
          learner_course_id,
          certification_case_id,
          generated_plan
        )
        OUTPUT inserted.*
        VALUES (
          @learnerId,
          @learnerCourseId,
          @caseId,
          @generatedPlan
        )
      `,
      {
        learnerId: { type: sql.Int, value: caseContext.learner_id },
        learnerCourseId: { type: sql.Int, value: caseContext.learner_course_id || null },
        caseId: { type: sql.Int, value: caseId },
        generatedPlan: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(studyPlan) },
      },
    );

    const output = await mergeLatestRunOutput(caseId, { studyPlan });

    await query(
      `
        UPDATE CertificationCases
        SET
          status = 'In Progress',
          current_stage = 'Study Plan Created',
          updated_at = SYSUTCDATETIME()
        WHERE id = @caseId
      `,
      {
        caseId: { type: sql.Int, value: caseId },
      },
    );

    res.status(201).json({
      studyPlan: {
        ...rows[0],
        generated_plan: studyPlan,
      },
      output,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/assessment', async (req, res, next) => {
  try {
    const caseId = Number(req.params.id);
    const caseContext = await findCaseContext(caseId);
    const assessmentResult = pickPayload(req.body, ['assessmentResult']);

    if (!caseId || !caseContext) {
      return res.status(404).json({ error: 'Certification case not found.' });
    }

    if (!assessmentResult) {
      return res.status(400).json({ error: 'assessmentResult is required.' });
    }

    const readiness = readinessFromAssessment(assessmentResult);
    const rows = await query(
      `
        INSERT INTO AssessmentResults (
          learner_id,
          course_id,
          certification_case_id,
          questions_json,
          score,
          readiness
        )
        OUTPUT inserted.*
        VALUES (
          @learnerId,
          @courseId,
          @caseId,
          @questionsJson,
          @score,
          @readiness
        )
      `,
      {
        learnerId: { type: sql.Int, value: caseContext.learner_id },
        courseId: { type: sql.Int, value: caseContext.course_id },
        caseId: { type: sql.Int, value: caseId },
        questionsJson: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(assessmentResult) },
        score: { type: sql.Int, value: readiness },
        readiness: { type: sql.NVarChar(50), value: assessmentResult.readinessLevel || null },
      },
    );

    if (readiness !== null && caseContext.learner_course_id) {
      await query(
        `
          UPDATE LearnerCourses
          SET
            readiness = @readiness,
            status = CASE
              WHEN @readiness >= 80 THEN 'Ready'
              WHEN @readiness < 50 THEN 'At Risk'
              ELSE 'In Progress'
            END
          WHERE id = @learnerCourseId
        `,
        {
          learnerCourseId: { type: sql.Int, value: caseContext.learner_course_id },
          readiness: { type: sql.Int, value: readiness },
        },
      );
    }

    const output = await mergeLatestRunOutput(caseId, { assessmentResult });

    await query(
      `
        UPDATE CertificationCases
        SET
          status = 'In Progress',
          current_stage = 'Assessment Complete',
          updated_at = SYSUTCDATETIME()
        WHERE id = @caseId
      `,
      {
        caseId: { type: sql.Int, value: caseId },
      },
    );

    res.status(201).json({
      assessment: {
        ...rows[0],
        questions_json: assessmentResult,
      },
      output,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/risk', async (req, res, next) => {
  try {
    const caseId = Number(req.params.id);
    const caseContext = await findCaseContext(caseId);
    const riskEvaluation = pickPayload(req.body, ['riskEvaluation']);

    if (!caseId || !caseContext) {
      return res.status(404).json({ error: 'Certification case not found.' });
    }

    if (!riskEvaluation) {
      return res.status(400).json({ error: 'riskEvaluation is required.' });
    }

    const state = riskState(riskEvaluation);
    const output = await mergeLatestRunOutput(caseId, { riskEvaluation });

    await query(
      `
        UPDATE CertificationCases
        SET
          status = @status,
          current_stage = @currentStage,
          risk_level = @riskLevel,
          manager_status = @managerStatus,
          updated_at = SYSUTCDATETIME()
        WHERE id = @caseId
      `,
      {
        caseId: { type: sql.Int, value: caseId },
        status: { type: sql.NVarChar(50), value: state.status },
        currentStage: { type: sql.NVarChar(80), value: state.currentStage },
        riskLevel: { type: sql.NVarChar(50), value: state.riskLevel },
        managerStatus: { type: sql.NVarChar(50), value: state.managerStatus },
      },
    );

    res.status(201).json({
      riskEvaluation,
      output,
      caseState: state,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/coaching-plan', async (req, res, next) => {
  try {
    const caseId = Number(req.params.id);
    const caseContext = await findCaseContext(caseId);
    const coachingPlan = pickPayload(req.body, ['coachingPlan']);

    if (!caseId || !caseContext) {
      return res.status(404).json({ error: 'Certification case not found.' });
    }

    if (!coachingPlan) {
      return res.status(400).json({ error: 'coachingPlan is required.' });
    }

    const rows = await query(
      `
        INSERT INTO StudyPlans (
          learner_id,
          learner_course_id,
          certification_case_id,
          generated_plan
        )
        OUTPUT inserted.*
        VALUES (
          @learnerId,
          @learnerCourseId,
          @caseId,
          @generatedPlan
        )
      `,
      {
        learnerId: { type: sql.Int, value: caseContext.learner_id },
        learnerCourseId: { type: sql.Int, value: caseContext.learner_course_id || null },
        caseId: { type: sql.Int, value: caseId },
        generatedPlan: { type: sql.NVarChar(sql.MAX), value: JSON.stringify({ coachingPlan }) },
      },
    );

    const output = await mergeLatestRunOutput(caseId, { coachingPlan });

    await query(
      `
        UPDATE CertificationCases
        SET
          status = 'In Progress',
          current_stage = 'Coaching Assigned',
          manager_status = 'Needs Review',
          updated_at = SYSUTCDATETIME()
        WHERE id = @caseId
      `,
      {
        caseId: { type: sql.Int, value: caseId },
      },
    );

    res.status(201).json({
      coachingPlan: {
        ...rows[0],
        generated_plan: { coachingPlan },
      },
      output,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/run-status', async (req, res, next) => {
  try {
    const caseId = Number(req.params.id);

    if (!caseId) {
      return res.status(400).json({ error: 'A valid case id is required.' });
    }

    const run = await latestAgentRun(caseId);

    if (!run) {
      return res.status(404).json({ error: 'No UiPath agentic process run found for this case.' });
    }

    let status = run.status;
    let output = run.output_json ? JSON.parse(run.output_json) : null;
    let errorMessage = run.error_message;

    if (run.uipath_job_id) {
      const job = await getJob(run.uipath_job_id);
      status = job.state || status;
      output = job.outputArguments || output;
      errorMessage = job.error || errorMessage;

      await query(
        `
          UPDATE AgentRuns
          SET
            status = @status,
            output_json = @outputJson,
            error_message = @errorMessage,
            completed_at = CASE
              WHEN @status IN ('Successful', 'Faulted', 'Stopped') THEN COALESCE(completed_at, SYSUTCDATETIME())
              ELSE completed_at
            END,
            updated_at = SYSUTCDATETIME()
          WHERE id = @runId
        `,
        {
          runId: { type: sql.Int, value: run.id },
          status: { type: sql.NVarChar(50), value: status },
          outputJson: { type: sql.NVarChar(sql.MAX), value: output ? JSON.stringify(output) : null },
          errorMessage: { type: sql.NVarChar(sql.MAX), value: errorMessage },
        },
      );

      if (status === 'Successful') {
        await query(
          `
            UPDATE CertificationCases
            SET
              status = 'Complete',
              current_stage = 'Complete',
              risk_level = 'Low',
              manager_status = 'Approved',
              updated_at = SYSUTCDATETIME()
            WHERE id = @caseId
          `,
          {
            caseId: { type: sql.Int, value: caseId },
          },
        );
      } else if (status === 'Faulted') {
        await query(
          `
            UPDATE CertificationCases
            SET
              status = 'Agent Failed',
              current_stage = 'Agentic Process',
              manager_status = 'Needs Review',
              updated_at = SYSUTCDATETIME()
            WHERE id = @caseId
          `,
          {
            caseId: { type: sql.Int, value: caseId },
          },
        );
      }
    }

    res.json({
      caseId,
      run: {
        ...run,
        status,
        input_json: run.input_json ? JSON.parse(run.input_json) : null,
        output_json: output,
        error_message: errorMessage,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

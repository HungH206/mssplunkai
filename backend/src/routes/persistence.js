const express = require('express');
const casesRouter = require('./cases');
const { query, sql } = require('../services/sql');

const router = express.Router();

function requireCaseId(req, res) {
  const caseId = Number(req.body?.caseId || req.params.caseId);

  if (!caseId) {
    res.status(400).json({ error: 'caseId is required.' });
    return null;
  }

  return caseId;
}

function forwardToCaseRoute(pathBuilder) {
  return (req, res, next) => {
    const caseId = requireCaseId(req, res);

    if (!caseId) {
      return;
    }

    req.url = pathBuilder(caseId);
    casesRouter.handle(req, res, next);
  };
}

router.get('/certification-case', async (req, res, next) => {
  try {
    const learnerId = Number(req.query.learnerId);
    const certificationId = Number(req.query.certificationId);

    if (!learnerId || !certificationId) {
      return res.status(400).json({ error: 'learnerId and certificationId are required.' });
    }

    const rows = await query(
      `
        SELECT TOP 1 *
        FROM vw_CertificationCases
        WHERE learner_id = @learnerId
          AND course_id = @certificationId
        ORDER BY updated_at DESC
      `,
      {
        learnerId: { type: sql.Int, value: learnerId },
        certificationId: { type: sql.Int, value: certificationId },
      },
    );

    const certificationCase = rows[0] || null;
    const plans = certificationCase
      ? await query(
        `
          SELECT TOP 1 id
          FROM LearningPlans
          WHERE certification_case_id = @caseId
          ORDER BY created_at DESC
        `,
        {
          caseId: { type: sql.Int, value: certificationCase.id },
        },
      )
      : [];

    res.json({
      certificationCase,
      existingPlan: plans.length > 0,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/certification-case', async (req, res, next) => {
  req.url = '/';
  casesRouter.handle(req, res, next);
});

router.post('/learning-plan', forwardToCaseRoute((caseId) => `/${caseId}/learning-plan`));
router.post('/study-plan', forwardToCaseRoute((caseId) => `/${caseId}/study-plan`));
router.post('/assessment', forwardToCaseRoute((caseId) => `/${caseId}/assessment`));
router.post('/risk', forwardToCaseRoute((caseId) => `/${caseId}/risk`));
router.post('/coaching-plan', forwardToCaseRoute((caseId) => `/${caseId}/coaching-plan`));
router.put('/study-plan/:caseId', forwardToCaseRoute((caseId) => `/${caseId}/coaching-plan`));

module.exports = router;

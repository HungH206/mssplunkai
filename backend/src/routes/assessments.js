const express = require('express');
const { generateAssessment } = require('../agents/assessmentAgent');
const { query } = require('../services/sql');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const assessments = await query(`
      SELECT
        ar.id,
        ar.learner_id,
        l.full_name,
        ar.course_id,
        ar.certification_case_id,
        c.name AS course_name,
        ar.questions_json,
        ar.score,
        ar.readiness,
        ar.created_at
      FROM AssessmentResults ar
      JOIN Learners l ON l.id = ar.learner_id
      JOIN CertificateCourses c ON c.id = ar.course_id
      ORDER BY ar.created_at DESC
    `);

    res.json(assessments.map((assessment) => ({
      ...assessment,
      questions_json: assessment.questions_json ? JSON.parse(assessment.questions_json) : [],
    })));
  } catch (error) {
    next(error);
  }
});

router.post('/generate', async (req, res, next) => {
  try {
    const { learnerId, courseId } = req.body;

    if (!learnerId || !courseId) {
      return res.status(400).json({ error: 'learnerId and courseId are required.' });
    }

    const assessment = await generateAssessment({ learnerId, courseId });
    res.status(201).json(assessment);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

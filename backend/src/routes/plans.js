const express = require('express');
const { generateLearningPlan } = require('../agents/learningAgent');
const { generateStudyPlan } = require('../agents/plannerAgent');
const { query } = require('../services/sql');

const router = express.Router();

router.get('/study', async (_req, res, next) => {
  try {
    const plans = await query(`
      SELECT
        sp.id,
        sp.learner_id,
        sp.learner_course_id,
        sp.certification_case_id,
        l.full_name,
        c.name AS course_name,
        lc.progress,
        lc.readiness,
        lc.exam_date,
        sp.generated_plan,
        sp.created_at
      FROM StudyPlans sp
      JOIN Learners l ON l.id = sp.learner_id
      LEFT JOIN LearnerCourses lc ON lc.id = sp.learner_course_id
      LEFT JOIN CertificateCourses c ON c.id = lc.course_id
      ORDER BY sp.created_at DESC
    `);

    res.json(plans.map((plan) => ({
      ...plan,
      generated_plan: JSON.parse(plan.generated_plan),
    })));
  } catch (error) {
    next(error);
  }
});

router.post('/learning/generate', async (req, res, next) => {
  try {
    const { learnerId, courseId } = req.body;

    if (!learnerId || !courseId) {
      return res.status(400).json({ error: 'learnerId and courseId are required.' });
    }

    const plan = await generateLearningPlan({ learnerId, courseId });
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
});

router.post('/study/generate', async (req, res, next) => {
  try {
    const { learnerCourseId } = req.body;

    if (!learnerCourseId) {
      return res.status(400).json({ error: 'learnerCourseId is required.' });
    }

    const plan = await generateStudyPlan({ learnerCourseId });
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

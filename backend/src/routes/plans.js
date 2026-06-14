const express = require('express');
const { generateLearningPlan } = require('../agents/learningAgent');
const { generateStudyPlan } = require('../agents/plannerAgent');

const router = express.Router();

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

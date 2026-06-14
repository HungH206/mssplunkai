const express = require('express');
const { generateAssessment } = require('../agents/assessmentAgent');

const router = express.Router();

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

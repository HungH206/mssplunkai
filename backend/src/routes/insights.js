const express = require('express');
const { generateInsights } = require('../agents/insightsAgent');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const insights = await generateInsights();
    res.json(insights);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

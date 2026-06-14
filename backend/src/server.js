require('dotenv').config();

const cors = require('cors');
const express = require('express');
const teamsRouter = require('./routes/teams');
const learnersRouter = require('./routes/learners');
const coursesRouter = require('./routes/courses');
const assignmentsRouter = require('./routes/assignments');
const plansRouter = require('./routes/plans');
const assessmentsRouter = require('./routes/assessments');
const insightsRouter = require('./routes/insights');

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'certops-backend' });
});

app.use('/api/teams', teamsRouter);
app.use('/api/learners', learnersRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/plans', plansRouter);
app.use('/api/assessments', assessmentsRouter);
app.use('/api/insights', insightsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(port, () => {
  console.log(`CertOps backend listening on http://localhost:${port}`);
});

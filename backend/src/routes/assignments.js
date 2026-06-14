const express = require('express');
const { query, sql } = require('../services/sql');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const assignments = await query(`
      SELECT
        assignment_id,
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
        exam_date,
        created_at
      FROM vw_TrackedAssignments
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

    const rows = await query(
      `
        INSERT INTO LearnerCourses (learner_id, course_id, progress, readiness, status, exam_date)
        OUTPUT inserted.id, inserted.learner_id, inserted.course_id, inserted.progress, inserted.readiness, inserted.status, inserted.exam_date
        VALUES (@learnerId, @courseId, 0, 0, 'Not Started', @examDate)
      `,
      {
        learnerId: { type: sql.Int, value: learnerId },
        courseId: { type: sql.Int, value: courseId },
        examDate: { type: sql.Date, value: examDate || null },
      },
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

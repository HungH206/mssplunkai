const express = require('express');
const { query, sql } = require('../services/sql');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const courses = await query(`
      SELECT
        id,
        name,
        provider,
        level,
        duration_weeks,
        created_at
      FROM CertificateCourses
      ORDER BY name
    `);

    res.json(courses);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, provider, level, durationWeeks } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required.' });
    }

    const rows = await query(
      `
        INSERT INTO CertificateCourses (name, provider, level, duration_weeks)
        OUTPUT inserted.id, inserted.name, inserted.provider, inserted.level, inserted.duration_weeks, inserted.created_at
        VALUES (@name, @provider, @level, @durationWeeks)
      `,
      {
        name: { type: sql.NVarChar(160), value: name },
        provider: { type: sql.NVarChar(120), value: provider || null },
        level: { type: sql.NVarChar(80), value: level || null },
        durationWeeks: { type: sql.Int, value: durationWeeks || null },
      },
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

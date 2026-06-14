const express = require('express');
const { query, sql } = require('../services/sql');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const learners = await query(`
      SELECT
        l.id,
        l.full_name,
        l.email,
        t.name AS team_name
      FROM Learners l
      LEFT JOIN Teams t ON t.id = l.team_id
      ORDER BY l.full_name
    `);

    res.json(learners);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { fullName, email, teamId } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: 'fullName and email are required.' });
    }

    const rows = await query(
      `
        INSERT INTO Learners (full_name, email, team_id)
        OUTPUT inserted.id, inserted.full_name, inserted.email, inserted.team_id
        VALUES (@fullName, @email, @teamId)
      `,
      {
        fullName: { type: sql.NVarChar(160), value: fullName },
        email: { type: sql.NVarChar(255), value: email },
        teamId: { type: sql.Int, value: teamId || null },
      },
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

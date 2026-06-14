const express = require('express');
const { query, sql } = require('../services/sql');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const teams = await query(`
      SELECT
        id,
        name,
        manager_name,
        created_at
      FROM Teams
      ORDER BY name
    `);

    res.json(teams);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, managerName } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required.' });
    }

    const rows = await query(
      `
        INSERT INTO Teams (name, manager_name)
        OUTPUT inserted.id, inserted.name, inserted.manager_name, inserted.created_at
        VALUES (@name, @managerName)
      `,
      {
        name: { type: sql.NVarChar(120), value: name },
        managerName: { type: sql.NVarChar(120), value: managerName || null },
      },
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

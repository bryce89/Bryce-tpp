const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// GET /api/assignments
router.get('/', async (req, res) => {
  const { engineer_id, project_id, year } = req.query;
  const conditions = [];
  const params = [];

  if (engineer_id) {
    params.push(engineer_id);
    conditions.push(`a.engineer_id = $${params.length}`);
  }
  if (project_id) {
    params.push(project_id);
    conditions.push(`a.project_id = $${params.length}`);
  }
  if (year) {
    params.push(parseInt(year, 10));
    const n = params.length;
    conditions.push(`(EXTRACT(YEAR FROM a.start_date::date) = $${n} OR EXTRACT(YEAR FROM a.end_date::date) = $${n})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(`
    SELECT a.*, e.name AS engineer_name, p.name AS project_name
    FROM assignments a
    JOIN engineers e ON e.id = a.engineer_id
    JOIN projects p ON p.id = a.project_id
    ${where}
    ORDER BY a.start_date
  `, params);

  res.json(rows);
});

// POST /api/assignments
router.post('/', async (req, res) => {
  const { engineer_id, project_id, start_date, end_date, allocation_pct } = req.body;
  if (!engineer_id || !project_id || !start_date || !end_date) {
    return res.status(400).json({ error: 'engineer_id, project_id, start_date, end_date are required' });
  }
  if (allocation_pct < 1 || allocation_pct > 100) {
    return res.status(400).json({ error: 'allocation_pct must be between 1 and 100' });
  }

  const { rows: inserted } = await pool.query(
    'INSERT INTO assignments (engineer_id, project_id, start_date, end_date, allocation_pct) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [engineer_id, project_id, start_date, end_date, allocation_pct || 100]
  );
  const newId = inserted[0].id;

  const { rows } = await pool.query(`
    SELECT a.*, e.name AS engineer_name, p.name AS project_name
    FROM assignments a
    JOIN engineers e ON e.id = a.engineer_id
    JOIN projects p ON p.id = a.project_id
    WHERE a.id = $1
  `, [newId]);

  res.status(201).json(rows[0]);
});

// PUT /api/assignments/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows: existing } = await pool.query('SELECT * FROM assignments WHERE id = $1', [id]);
  if (!existing.length) return res.status(404).json({ error: 'Not found' });

  const { start_date, end_date, allocation_pct } = req.body;

  await pool.query(`
    UPDATE assignments SET
      start_date = COALESCE($1, start_date),
      end_date = COALESCE($2, end_date),
      allocation_pct = COALESCE($3, allocation_pct)
    WHERE id = $4
  `, [start_date || null, end_date || null, allocation_pct || null, id]);

  const { rows } = await pool.query(`
    SELECT a.*, e.name AS engineer_name, p.name AS project_name
    FROM assignments a
    JOIN engineers e ON e.id = a.engineer_id
    JOIN projects p ON p.id = a.project_id
    WHERE a.id = $1
  `, [id]);

  res.json(rows[0]);
});

// DELETE /api/assignments/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows: existing } = await pool.query('SELECT * FROM assignments WHERE id = $1', [id]);
  if (!existing.length) return res.status(404).json({ error: 'Not found' });
  await pool.query('DELETE FROM assignments WHERE id = $1', [id]);
  res.json({ success: true });
});

module.exports = router;

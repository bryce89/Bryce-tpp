const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// GET /api/skills
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM skills ORDER BY name');
  res.json(rows);
});

// POST /api/skills
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO skills (name) VALUES ($1) RETURNING *',
      [name.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Skill already exists' });
    throw e;
  }
});

// PUT /api/skills/:id
router.put('/:id', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
  const { rows: existing } = await pool.query('SELECT * FROM skills WHERE id = $1', [req.params.id]);
  if (!existing.length) return res.status(404).json({ error: 'Not found' });
  try {
    const { rows } = await pool.query(
      'UPDATE skills SET name = $1 WHERE id = $2 RETURNING *',
      [name.trim(), req.params.id]
    );
    res.json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Skill already exists' });
    throw e;
  }
});

// DELETE /api/skills/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows: existing } = await pool.query('SELECT * FROM skills WHERE id = $1', [id]);
  if (!existing.length) return res.status(404).json({ error: 'Not found' });
  await pool.query('DELETE FROM skills WHERE id = $1', [id]);
  res.json({ success: true });
});

module.exports = router;

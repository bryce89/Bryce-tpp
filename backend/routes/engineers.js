const express = require('express');
const { pool } = require('../db');
const router = express.Router();

async function attachSkills(engineers) {
  if (!engineers.length) return engineers;
  const ids = engineers.map(e => e.id);
  const { rows: skills } = await pool.query(`
    SELECT es.engineer_id, s.id, s.name
    FROM engineer_skills es
    JOIN skills s ON s.id = es.skill_id
    WHERE es.engineer_id = ANY($1)
    ORDER BY s.name
  `, [ids]);

  const skillMap = {};
  for (const s of skills) {
    if (!skillMap[s.engineer_id]) skillMap[s.engineer_id] = [];
    skillMap[s.engineer_id].push({ id: s.id, name: s.name });
  }
  return engineers.map(e => ({ ...e, skills: skillMap[e.id] || [] }));
}

async function attachAllocationSummary(engineers) {
  return Promise.all(engineers.map(async e => {
    const { rows: assignments } = await pool.query(`
      SELECT a.project_id, a.allocation_pct, p.name AS project_name
      FROM assignments a
      JOIN projects p ON p.id = a.project_id
      WHERE a.engineer_id = $1
    `, [e.id]);
    const projectCount = assignments.length;
    const totalAllocation = assignments.reduce((sum, a) => sum + a.allocation_pct, 0);
    return { ...e, project_count: projectCount, total_allocation_pct: totalAllocation };
  }));
}

// GET /api/engineers
router.get('/', async (req, res) => {
  const { skill, portfolio, role, search } = req.query;

  let query = `SELECT DISTINCT e.* FROM engineers e`;
  const params = [];
  const conditions = [];

  if (skill) {
    query += ` JOIN engineer_skills es ON es.engineer_id = e.id JOIN skills sk ON sk.id = es.skill_id`;
    params.push(skill);
    conditions.push(`sk.name = $${params.length}`);
  }

  if (portfolio) {
    params.push(portfolio);
    conditions.push(`e.portfolio = $${params.length}`);
  }
  if (role) {
    params.push(role);
    conditions.push(`e.role = $${params.length}`);
  }
  if (search) {
    const like = `%${search}%`;
    params.push(like);
    const n = params.length;
    params.push(like);
    params.push(like);
    conditions.push(`(e.name ILIKE $${n} OR e.email ILIKE $${n + 1} OR e.portfolio ILIKE $${n + 2})`);
  }

  if (conditions.length) query += ` WHERE ` + conditions.join(' AND ');
  query += ` ORDER BY e.name`;

  const { rows } = await pool.query(query, params);
  let engineers = await attachSkills(rows);
  engineers = await attachAllocationSummary(engineers);
  res.json(engineers);
});

// GET /api/engineers/:id
router.get('/:id', async (req, res) => {
  const { rows: engRows } = await pool.query('SELECT * FROM engineers WHERE id = $1', [req.params.id]);
  if (!engRows.length) return res.status(404).json({ error: 'Not found' });
  const engineer = engRows[0];

  const { rows: skills } = await pool.query(`
    SELECT s.id, s.name FROM engineer_skills es
    JOIN skills s ON s.id = es.skill_id
    WHERE es.engineer_id = $1
    ORDER BY s.name
  `, [req.params.id]);

  res.json({ ...engineer, skills });
});

// POST /api/engineers
router.post('/', async (req, res) => {
  const { name, email, portfolio, role, role_description, skill_ids = [] } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });

  const { rows } = await pool.query(
    'INSERT INTO engineers (name, email, portfolio, role, role_description) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [name.trim(), email || null, portfolio || null, role || null, role_description || null]
  );
  const engineer = rows[0];
  const id = engineer.id;

  for (const sid of skill_ids) {
    await pool.query(
      'INSERT INTO engineer_skills (engineer_id, skill_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [id, sid]
    );
  }

  const { rows: skills } = await pool.query(`
    SELECT s.id, s.name FROM engineer_skills es
    JOIN skills s ON s.id = es.skill_id WHERE es.engineer_id = $1 ORDER BY s.name
  `, [id]);
  res.status(201).json({ ...engineer, skills });
});

// PUT /api/engineers/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows: existing } = await pool.query('SELECT * FROM engineers WHERE id = $1', [id]);
  if (!existing.length) return res.status(404).json({ error: 'Not found' });
  const prev = existing[0];

  const { name, email, portfolio, role, role_description, skill_ids } = req.body;
  if (name !== undefined && !name.trim()) return res.status(400).json({ error: 'name cannot be empty' });

  const { rows } = await pool.query(`
    UPDATE engineers SET
      name = COALESCE($1, name),
      email = $2,
      portfolio = $3,
      role = $4,
      role_description = $5
    WHERE id = $6
    RETURNING *
  `, [
    name ? name.trim() : null,
    email !== undefined ? (email || null) : prev.email,
    portfolio !== undefined ? (portfolio || null) : prev.portfolio,
    role !== undefined ? (role || null) : prev.role,
    role_description !== undefined ? (role_description || null) : prev.role_description,
    id
  ]);
  const engineer = rows[0];

  if (skill_ids !== undefined) {
    await pool.query('DELETE FROM engineer_skills WHERE engineer_id = $1', [id]);
    for (const sid of skill_ids) {
      await pool.query(
        'INSERT INTO engineer_skills (engineer_id, skill_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [id, sid]
      );
    }
  }

  const { rows: skills } = await pool.query(`
    SELECT s.id, s.name FROM engineer_skills es
    JOIN skills s ON s.id = es.skill_id WHERE es.engineer_id = $1 ORDER BY s.name
  `, [id]);
  res.json({ ...engineer, skills });
});

// DELETE /api/engineers/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows: existing } = await pool.query('SELECT * FROM engineers WHERE id = $1', [id]);
  if (!existing.length) return res.status(404).json({ error: 'Not found' });
  await pool.query('DELETE FROM engineers WHERE id = $1', [id]);
  res.json({ success: true });
});

module.exports = router;

const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// GET /api/projects
router.get('/', async (req, res) => {
  const { skill, search } = req.query;

  let query = `SELECT DISTINCT p.* FROM projects p`;
  const params = [];
  const conditions = [];

  if (skill) {
    query += ` JOIN project_skills ps ON ps.project_id = p.id JOIN skills sk ON sk.id = ps.skill_id`;
    params.push(skill);
    conditions.push(`sk.name = $${params.length}`);
  }

  if (search) {
    const like = `%${search}%`;
    params.push(like);
    const n = params.length;
    params.push(like);
    conditions.push(`(p.name ILIKE $${n} OR p.description ILIKE $${n + 1})`);
  }

  if (conditions.length) query += ` WHERE ` + conditions.join(' AND ');
  query += ` ORDER BY p.start_date, p.name`;

  const { rows: projects } = await pool.query(query, params);

  const result = await Promise.all(projects.map(async project => {
    const { rows: skills } = await pool.query(`
      SELECT s.id, s.name, ps.effort_days
      FROM project_skills ps
      JOIN skills s ON s.id = ps.skill_id
      WHERE ps.project_id = $1
      ORDER BY s.name
    `, [project.id]);

    const { rows: countRows } = await pool.query(
      'SELECT COUNT(DISTINCT engineer_id) AS count FROM assignments WHERE project_id = $1',
      [project.id]
    );

    return { ...project, skills, engineer_count: parseInt(countRows[0].count, 10) };
  }));

  res.json(result);
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  const { rows: projRows } = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
  if (!projRows.length) return res.status(404).json({ error: 'Not found' });
  const project = projRows[0];

  const { rows: skills } = await pool.query(`
    SELECT s.id, s.name, ps.effort_days
    FROM project_skills ps
    JOIN skills s ON s.id = ps.skill_id
    WHERE ps.project_id = $1
    ORDER BY s.name
  `, [req.params.id]);

  const { rows: assignments } = await pool.query(`
    SELECT a.*, e.name AS engineer_name, e.portfolio, e.role,
      COALESCE(
        json_agg(json_build_object('id', s.id, 'name', s.name)) FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) AS skills
    FROM assignments a
    JOIN engineers e ON e.id = a.engineer_id
    LEFT JOIN engineer_skills es ON es.engineer_id = e.id
    LEFT JOIN skills s ON s.id = es.skill_id
    WHERE a.project_id = $1
    GROUP BY a.id, e.name, e.portfolio, e.role
    ORDER BY e.name
  `, [req.params.id]);

  res.json({ ...project, skills, assignments });
});

// POST /api/projects
router.post('/', async (req, res) => {
  const { name, description, start_date, end_date, total_effort_days, skill_ids = [] } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });

  const { rows } = await pool.query(
    'INSERT INTO projects (name, description, start_date, end_date, total_effort_days) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [name.trim(), description || null, start_date || null, end_date || null, total_effort_days || null]
  );
  const project = rows[0];
  const id = project.id;

  for (const s of skill_ids) {
    await pool.query(
      'INSERT INTO project_skills (project_id, skill_id, effort_days) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
      [id, s.id, s.effort_days || null]
    );
  }

  const { rows: skills } = await pool.query(`
    SELECT s.id, s.name, ps.effort_days FROM project_skills ps
    JOIN skills s ON s.id = ps.skill_id WHERE ps.project_id = $1 ORDER BY s.name
  `, [id]);
  res.status(201).json({ ...project, skills, assignments: [] });
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows: existing } = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
  if (!existing.length) return res.status(404).json({ error: 'Not found' });
  const prev = existing[0];

  const { name, description, start_date, end_date, total_effort_days, skill_ids } = req.body;
  if (name !== undefined && !name.trim()) return res.status(400).json({ error: 'name cannot be empty' });

  const { rows } = await pool.query(`
    UPDATE projects SET
      name = COALESCE($1, name),
      description = $2,
      start_date = $3,
      end_date = $4,
      total_effort_days = $5
    WHERE id = $6
    RETURNING *
  `, [
    name ? name.trim() : null,
    description !== undefined ? (description || null) : prev.description,
    start_date !== undefined ? (start_date || null) : prev.start_date,
    end_date !== undefined ? (end_date || null) : prev.end_date,
    total_effort_days !== undefined ? (total_effort_days || null) : prev.total_effort_days,
    id
  ]);
  const project = rows[0];

  if (skill_ids !== undefined) {
    await pool.query('DELETE FROM project_skills WHERE project_id = $1', [id]);
    for (const s of skill_ids) {
      await pool.query(
        'INSERT INTO project_skills (project_id, skill_id, effort_days) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
        [id, s.id, s.effort_days || null]
      );
    }
  }

  const { rows: skills } = await pool.query(`
    SELECT s.id, s.name, ps.effort_days FROM project_skills ps
    JOIN skills s ON s.id = ps.skill_id WHERE ps.project_id = $1 ORDER BY s.name
  `, [id]);
  const { rows: assignments } = await pool.query(`
    SELECT a.*, e.name AS engineer_name, e.portfolio, e.role
    FROM assignments a JOIN engineers e ON e.id = a.engineer_id
    WHERE a.project_id = $1 ORDER BY e.name
  `, [id]);
  res.json({ ...project, skills, assignments });
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows: existing } = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
  if (!existing.length) return res.status(404).json({ error: 'Not found' });
  await pool.query('DELETE FROM projects WHERE id = $1', [id]);
  res.json({ success: true });
});

module.exports = router;

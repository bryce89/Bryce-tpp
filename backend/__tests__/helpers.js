const { pool } = require('../db');

async function clearTables() {
  await pool.query(`
    TRUNCATE TABLE assignments, engineer_skills, project_skills, engineers, projects, skills
    RESTART IDENTITY CASCADE
  `);
}

async function createSkill(name) {
  const { rows } = await pool.query(
    'INSERT INTO skills (name) VALUES ($1) RETURNING *',
    [name]
  );
  return rows[0];
}

async function createEngineer(fields = {}) {
  const { name = 'Test Engineer', email = null, portfolio = null, role = null, role_description = null } = fields;
  const { rows } = await pool.query(
    'INSERT INTO engineers (name, email, portfolio, role, role_description) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [name, email, portfolio, role, role_description]
  );
  return rows[0];
}

async function createProject(fields = {}) {
  const { name = 'Test Project', description = null, start_date = null, end_date = null, total_effort_days = null } = fields;
  const { rows } = await pool.query(
    'INSERT INTO projects (name, description, start_date, end_date, total_effort_days) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [name, description, start_date, end_date, total_effort_days]
  );
  return rows[0];
}

async function createAssignment(fields = {}) {
  const { engineer_id, project_id, start_date, end_date, allocation_pct = 100 } = fields;
  const { rows } = await pool.query(
    'INSERT INTO assignments (engineer_id, project_id, start_date, end_date, allocation_pct) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [engineer_id, project_id, start_date, end_date, allocation_pct]
  );
  return rows[0];
}

module.exports = { clearTables, createSkill, createEngineer, createProject, createAssignment };

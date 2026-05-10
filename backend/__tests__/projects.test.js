const request = require('supertest');
const { pool } = require('../db');
const app = require('../app');
const { clearTables, createSkill, createEngineer, createProject, createAssignment } = require('./helpers');

beforeEach(async () => {
  await clearTables();
});

describe('GET /api/projects', () => {
  it('returns array with skills array on each project', async () => {
    await createProject({ name: 'Alpha' });
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(Array.isArray(res.body[0].skills)).toBe(true);
  });
});

describe('GET /api/projects/:id', () => {
  it('returns project with skills array (each skill has effort_days) and assignments array', async () => {
    const skill = await createSkill('Rust');
    const project = await createProject({ name: 'Beta', start_date: '2026-01-01', end_date: '2026-12-31' });

    // Associate skill with project
    await pool.query(
      'INSERT INTO project_skills (project_id, skill_id, effort_days) VALUES ($1,$2,$3)',
      [project.id, skill.id, 30]
    );

    const engineer = await createEngineer({ name: 'Grace' });
    await createAssignment({
      engineer_id: engineer.id,
      project_id: project.id,
      start_date: '2026-01-01',
      end_date: '2026-06-30',
      allocation_pct: 100,
    });

    const res = await request(app).get(`/api/projects/${project.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Beta');

    expect(Array.isArray(res.body.skills)).toBe(true);
    expect(res.body.skills).toHaveLength(1);
    expect(res.body.skills[0]).toMatchObject({ name: 'Rust', effort_days: 30 });

    expect(Array.isArray(res.body.assignments)).toBe(true);
    expect(res.body.assignments).toHaveLength(1);
    // Each assignment should have a skills array (via json_agg)
    expect(Array.isArray(res.body.assignments[0].skills)).toBe(true);
  });

  it('returns 404 for non-existent project', async () => {
    const res = await request(app).get('/api/projects/99999');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/projects', () => {
  it('creates a project with skill associations', async () => {
    const skill = await createSkill('Python');
    const res = await request(app)
      .post('/api/projects')
      .send({
        name: 'Gamma',
        start_date: '2026-03-01',
        end_date: '2026-09-30',
        skill_ids: [{ id: skill.id, effort_days: 20 }],
      });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Gamma');
    expect(Array.isArray(res.body.skills)).toBe(true);
    expect(res.body.skills).toHaveLength(1);
    expect(res.body.skills[0]).toMatchObject({ name: 'Python', effort_days: 20 });
  });

  it('returns 400 with empty name', async () => {
    const res = await request(app).post('/api/projects').send({ name: '' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/projects/:id', () => {
  it('removes the project', async () => {
    const project = await createProject({ name: 'ToRemove' });
    const res = await request(app).delete(`/api/projects/${project.id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await request(app).get('/api/projects');
    expect(check.body).toHaveLength(0);
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app).delete('/api/projects/99999');
    expect(res.status).toBe(404);
  });
});

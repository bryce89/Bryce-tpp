const request = require('supertest');
const { pool } = require('../db');
const app = require('../app');
const { clearTables, createSkill, createEngineer } = require('./helpers');

beforeEach(async () => {
  await clearTables();
});

describe('GET /api/engineers', () => {
  it('returns array with skills array on each engineer even if empty', async () => {
    await createEngineer({ name: 'Alice', role: 'Senior Engineer' });
    const res = await request(app).get('/api/engineers');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(Array.isArray(res.body[0].skills)).toBe(true);
    expect(res.body[0].skills).toHaveLength(0);
  });

  it('filters by role query param', async () => {
    await createEngineer({ name: 'Alice', role: 'Senior Engineer' });
    await createEngineer({ name: 'Bob', role: 'Lead Engineer' });

    const res = await request(app).get('/api/engineers?role=Senior+Engineer');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Alice');
  });
});

describe('POST /api/engineers', () => {
  it('creates engineer and returns object with skills array', async () => {
    const res = await request(app)
      .post('/api/engineers')
      .send({ name: 'Charlie', role: 'Principal Engineer' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Charlie', role: 'Principal Engineer' });
    expect(Array.isArray(res.body.skills)).toBe(true);
  });

  it('returns 400 with empty name', async () => {
    const res = await request(app).post('/api/engineers').send({ name: '' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/engineers/:id', () => {
  it('updates the role field', async () => {
    const engineer = await createEngineer({ name: 'Dana', role: 'Senior Engineer' });
    const res = await request(app)
      .put(`/api/engineers/${engineer.id}`)
      .send({ role: 'Lead Engineer' });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('Lead Engineer');
  });

  it('updates skill_ids and reflects them in the response', async () => {
    const engineer = await createEngineer({ name: 'Eve' });
    const skill = await createSkill('Go');

    const res = await request(app)
      .put(`/api/engineers/${engineer.id}`)
      .send({ skill_ids: [skill.id] });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.skills)).toBe(true);
    expect(res.body.skills).toHaveLength(1);
    expect(res.body.skills[0].name).toBe('Go');
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app).put('/api/engineers/99999').send({ role: 'X' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/engineers/:id', () => {
  it('removes the engineer', async () => {
    const engineer = await createEngineer({ name: 'Frank' });
    const res = await request(app).delete(`/api/engineers/${engineer.id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await request(app).get('/api/engineers');
    expect(check.body).toHaveLength(0);
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app).delete('/api/engineers/99999');
    expect(res.status).toBe(404);
  });
});

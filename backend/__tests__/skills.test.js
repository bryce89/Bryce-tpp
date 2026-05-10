const request = require('supertest');
const app = require('../app');
const { clearTables, createSkill } = require('./helpers');

beforeEach(async () => {
  await clearTables();
});

describe('GET /api/skills', () => {
  it('returns empty array when no skills', async () => {
    const res = await request(app).get('/api/skills');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns existing skills', async () => {
    await createSkill('JavaScript');
    const res = await request(app).get('/api/skills');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('JavaScript');
  });
});

describe('POST /api/skills', () => {
  it('creates a skill and returns it with id and name', async () => {
    const res = await request(app).post('/api/skills').send({ name: 'TypeScript' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'TypeScript' });
    expect(res.body.id).toBeDefined();
  });

  it('returns 400 with empty name', async () => {
    const res = await request(app).post('/api/skills').send({ name: '' });
    expect(res.status).toBe(400);
  });

  it('returns 400 with whitespace-only name', async () => {
    const res = await request(app).post('/api/skills').send({ name: '   ' });
    expect(res.status).toBe(400);
  });

  it('returns 409 with duplicate name', async () => {
    await createSkill('Python');
    const res = await request(app).post('/api/skills').send({ name: 'Python' });
    expect(res.status).toBe(409);
  });
});

describe('PUT /api/skills/:id', () => {
  it('updates the skill name', async () => {
    const skill = await createSkill('OldName');
    const res = await request(app).put(`/api/skills/${skill.id}`).send({ name: 'NewName' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('NewName');
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app).put('/api/skills/99999').send({ name: 'Whatever' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/skills/:id', () => {
  it('removes the skill', async () => {
    const skill = await createSkill('ToDelete');
    const res = await request(app).delete(`/api/skills/${skill.id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it's gone
    const check = await request(app).get('/api/skills');
    expect(check.body).toHaveLength(0);
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app).delete('/api/skills/99999');
    expect(res.status).toBe(404);
  });
});

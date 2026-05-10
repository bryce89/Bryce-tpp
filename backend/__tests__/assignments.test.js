const request = require('supertest');
const app = require('../app');
const { clearTables, createEngineer, createProject, createAssignment } = require('./helpers');

beforeEach(async () => {
  await clearTables();
});

describe('POST /api/assignments', () => {
  it('creates an assignment', async () => {
    const engineer = await createEngineer({ name: 'Henry' });
    const project = await createProject({ name: 'Delta' });

    const res = await request(app)
      .post('/api/assignments')
      .send({
        engineer_id: engineer.id,
        project_id: project.id,
        start_date: '2026-01-01',
        end_date: '2026-06-30',
        allocation_pct: 80,
      });
    expect(res.status).toBe(201);
    expect(res.body.engineer_id).toBe(engineer.id);
    expect(res.body.project_id).toBe(project.id);
    expect(res.body.allocation_pct).toBe(80);
    expect(res.body.engineer_name).toBe('Henry');
    expect(res.body.project_name).toBe('Delta');
  });

  it('returns 400 when required fields missing', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .send({ engineer_id: 1 });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/assignments', () => {
  it('returns only assignments overlapping the given year', async () => {
    const engineer = await createEngineer({ name: 'Iris' });
    const project = await createProject({ name: 'Epsilon' });

    // Assignment in 2026
    await createAssignment({
      engineer_id: engineer.id,
      project_id: project.id,
      start_date: '2026-03-01',
      end_date: '2026-09-30',
      allocation_pct: 100,
    });

    // Assignment in 2027
    await createAssignment({
      engineer_id: engineer.id,
      project_id: project.id,
      start_date: '2027-01-01',
      end_date: '2027-06-30',
      allocation_pct: 50,
    });

    const res = await request(app).get('/api/assignments?year=2026');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].start_date).toBe('2026-03-01');
  });

  it('returns all assignments when no year filter', async () => {
    const engineer = await createEngineer({ name: 'Jack' });
    const project = await createProject({ name: 'Zeta' });

    await createAssignment({
      engineer_id: engineer.id,
      project_id: project.id,
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      allocation_pct: 100,
    });
    await createAssignment({
      engineer_id: engineer.id,
      project_id: project.id,
      start_date: '2027-01-01',
      end_date: '2027-12-31',
      allocation_pct: 100,
    });

    const res = await request(app).get('/api/assignments');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('DELETE /api/assignments/:id', () => {
  it('removes the assignment', async () => {
    const engineer = await createEngineer({ name: 'Karen' });
    const project = await createProject({ name: 'Eta' });
    const assignment = await createAssignment({
      engineer_id: engineer.id,
      project_id: project.id,
      start_date: '2026-05-01',
      end_date: '2026-10-31',
      allocation_pct: 75,
    });

    const res = await request(app).delete(`/api/assignments/${assignment.id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await request(app).get('/api/assignments');
    expect(check.body).toHaveLength(0);
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app).delete('/api/assignments/99999');
    expect(res.status).toBe(404);
  });
});

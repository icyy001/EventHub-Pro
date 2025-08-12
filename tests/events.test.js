const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

beforeAll(async () => {
  // Ensure DB has been pushed/seeded via npm scripts
  // Nothing to do here if npm run test is used.
});

afterAll(async () => {
  await prisma.$disconnect();
});


describe('Events listing', () => {
  test('GET /events paginated default', async () => {
    const res = await request(app).get('/events');
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ page: 1, limit: 10 });
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /events page=2 returns different items', async () => {
    const res1 = await request(app).get('/events?limit=5&page=1');
    const res2 = await request(app).get('/events?limit=5&page=2');
    expect(res1.statusCode).toBe(200);
    expect(res2.statusCode).toBe(200);
    const ids1 = res1.body.data.map(e => e.id);
    const ids2 = res2.body.data.map(e => e.id);
    expect(ids1.some(id => ids2.includes(id))).toBe(false);
  });

  test('GET /events?search=tech filters results', async () => {
    const res = await request(app).get('/events?search=tech');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});

describe('Events CRUD', () => {
  test('POST /events creates an event', async () => {
    const now = new Date();
    const start = new Date(now.getTime() + 24*60*60*1000).toISOString();
    const end = new Date(now.getTime() + 26*60*60*1000).toISOString();
    const payload = { title: "My Test Event", startsAt: start, endsAt: end, location: "Durham" };
    const res = await request(app).post('/events').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('POST /events validates input', async () => {
    const res = await request(app).post('/events').send({ title: "Bad", startsAt: "2025-01-01T10:00:00Z", endsAt: "2024-01-01T10:00:00Z" });
    expect(res.statusCode).toBe(400);
  });

  test('GET /events/:id returns an event', async () => {
    const list = await request(app).get('/events?limit=1');
    const id = list.body.data[0].id;
    const res = await request(app).get(`/events/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', id);
  });
});

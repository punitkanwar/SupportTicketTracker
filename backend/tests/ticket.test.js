

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Ticket from '../src/models/Ticket.js';

const TEST_DB = 'mongodb://127.0.0.1:27017/resolvedesk_test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB);
});

afterAll(async () => {
  await Ticket.deleteMany({});
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Ticket.deleteMany({});
});


const createTicket = (overrides = {}) =>
  request(app)
    .post('/api/tickets')
    .send({
      subject: 'Test ticket subject',
      description: 'This is a test ticket description with enough characters.',
      category: 'Technical',
      priority: 'Medium',
      ...overrides,
    });



describe('POST /api/tickets', () => {
  it('creates a ticket with valid data', async () => {
    const res = await createTicket();
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ticket.subject).toBe('Test ticket subject');
    expect(res.body.data.ticket.status).toBe('Open');
    expect(res.body.data.ticket.statusHistory).toHaveLength(1);
    expect(res.body.data.ticket.statusHistory[0].newStatus).toBe('Open');
    expect(res.body.data.ticket.statusHistory[0].previousStatus).toBeNull();
  });

  it('rejects a ticket with missing subject', async () => {
    const res = await createTicket({ subject: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects non-string fields and a non-object body with clear client errors', async () => {
    const nonString = await createTicket({ subject: 123 });
    expect(nonString.status).toBe(400);
    expect(nonString.body.errors).toContain('Subject must be a string');

    const nonObject = await request(app).post('/api/tickets').send([]);
    expect(nonObject.status).toBe(400);
    expect(nonObject.body.message).toBe('Request body must be a JSON object');
  });

  it('returns a clear 400 for malformed JSON', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Content-Type', 'application/json')
      .send('{"subject":');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid JSON request body');
  });

  it('rejects a ticket with missing description', async () => {
    const res = await createTicket({ description: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects a ticket with an invalid category', async () => {
    const res = await createTicket({ category: 'InvalidCategory' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects a ticket with an invalid priority', async () => {
    const res = await createTicket({ priority: 'SuperUrgent' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects a subject that exceeds 120 characters', async () => {
    const res = await createTicket({ subject: 'A'.repeat(121) });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});



describe('GET /api/tickets/:id', () => {
  it('retrieves an existing ticket', async () => {
    const created = await createTicket();
    const id = created.body.data.ticket._id;

    const res = await request(app).get(`/api/tickets/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ticket._id).toBe(id);
  });

  it('returns 404 for a non-existent ticket ID', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/tickets/${fakeId}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for an invalid ID format', async () => {
    const res = await request(app).get('/api/tickets/not-a-valid-id');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects invalid filters instead of silently ignoring them', async () => {
    const res = await request(app).get('/api/tickets?priority=Critical');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid priority');
  });

  it('treats empty filter values as no filter', async () => {
    await createTicket();
    const res = await request(app).get('/api/tickets?status=&category=&priority=');
    expect(res.status).toBe(200);
    expect(res.body.data.pagination.total).toBe(1);
  });

  it('returns tickets matching all selected filters', async () => {
    await createTicket({ category: 'Technical', priority: 'High' });
    await createTicket({ category: 'Billing', priority: 'High' });
    await createTicket({ category: 'Technical', priority: 'Low' });

    const res = await request(app).get('/api/tickets?status=Open&category=Technical&priority=High');
    expect(res.status).toBe(200);
    expect(res.body.data.pagination.total).toBe(1);
    expect(res.body.data.tickets[0].category).toBe('Technical');
  });
});



describe('PATCH /api/tickets/:id/status', () => {
  it('updates the ticket status and records history', async () => {
    const created = await createTicket();
    const id = created.body.data.ticket._id;

    const res = await request(app).patch(`/api/tickets/${id}/status`).send({ status: 'In Progress' });
    expect(res.status).toBe(200);
    expect(res.body.data.ticket.status).toBe('In Progress');
    expect(res.body.data.ticket.statusHistory).toHaveLength(2);
    expect(res.body.data.ticket.statusHistory[1].previousStatus).toBe('Open');
    expect(res.body.data.ticket.statusHistory[1].newStatus).toBe('In Progress');
    expect(Number.isNaN(Date.parse(res.body.data.ticket.statusHistory[1].changedAt))).toBe(false);
  });

  it('rejects an invalid status value', async () => {
    const created = await createTicket();
    const id = created.body.data.ticket._id;

    const res = await request(app).patch(`/api/tickets/${id}/status`).send({ status: 'Deleted' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});



describe('GET /api/dashboard/stats', () => {
  it('returns correct stats with no tickets', async () => {
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stats.total).toBe(0);
    expect(res.body.data.stats.open).toBe(0);
    expect(res.body.data.activityData).toHaveLength(30);
  });

  it('returns accurate counts after creating tickets', async () => {
    await createTicket({ priority: 'High' });
    await createTicket({ priority: 'Low' });

    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data.stats.total).toBe(2);
    expect(res.body.data.stats.open).toBe(2);
    expect(res.body.data.stats.inProgress).toBe(0);
    expect(res.body.data.categoryDistribution.reduce((sum, item) => sum + item.value, 0)).toBe(2);
  });
});



describe('DELETE /api/tickets/:id', () => {
  it('deletes a ticket successfully', async () => {
    const created = await createTicket();
    const id = created.body.data.ticket._id;

    const deleteRes = await request(app).delete(`/api/tickets/${id}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    const getRes = await request(app).get(`/api/tickets/${id}`);
    expect(getRes.status).toBe(404);
  });
});

const express = require('express');
const prisma = require('../lib/prisma');
const { parsePagination } = require('../lib/pagination');
const { requireFields, parseISO } = require('../lib/validate');
const mkIndex = require('../lib/searchIndex');

const router = express.Router();

// GET /events?search=&page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const q = (req.query.search || '').trim().toLowerCase();

    const where = q ? { searchIndex: { contains: q } } : {};

    const [total, data] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startsAt: 'asc' },
        select: { id:true, title:true, description:true, location:true, startsAt:true, endsAt:true, price:true }
      })
    ]);

    res.json({ page, limit, total, totalPages: Math.ceil(total / limit), data });
  } catch (e) {
    next(e);
  }
});

// POST /events
router.post('/', async (req, res, next) => {
  try {
    const { title, description, location, startsAt, endsAt, price } = req.body || {};
    requireFields(req.body || {}, ['title', 'startsAt', 'endsAt']);

    const starts = parseISO('startsAt', startsAt);
    const ends = parseISO('endsAt', endsAt);
    if (ends <= starts) { const e = new Error('endsAt must be after startsAt'); e.status = 400; throw e; }

    const searchIndex = mkIndex({ title, description, location });

    const priceNum =
      price === undefined || price === null || price === '' ? null : Number(price);
    if (priceNum !== null && Number.isNaN(priceNum)) {
      const e = new Error('price must be a number'); e.status = 400; throw e;
    }

    const created = await prisma.event.create({
      data: {
        title, description, location,
        startsAt: starts, endsAt: ends,
        price: priceNum, searchIndex
      }
    });

    res.set('Location', `/events/${created.id}`);
    res.status(201).json(created);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Duplicate event' });
    next(e);
  }
});

// GET /events/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ error: 'Not found' });
    res.json(event);
  } catch (e) { next(e); }
});

// DELETE /events/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

    await prisma.event.delete({ where: { id } });
    res.status(204).end();
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    next(e);
  }
});

module.exports = router;

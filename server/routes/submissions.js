const express = require('express');
const { v4: uuidv4 } = require('uuid');
const store = require('../store/submissionsStore');

const router = express.Router();

const CATEGORIES = ['infrastructure', 'health', 'education', 'security', 'other'];
const STATUSES = ['new', 'in_review', 'resolved'];

function generateTrackingId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'GUN-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST /api/submissions — create new submission
router.post('/', async (req, res) => {
  try {
    const { title, category, description, contactEmail } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ error: 'title, category, and description are required' });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `category must be one of: ${CATEGORIES.join(', ')}` });
    }

    const now = new Date().toISOString();
    const submission = {
      id: uuidv4(),
      trackingId: generateTrackingId(),
      title,
      category,
      description,
      contactEmail: contactEmail || null,
      status: 'new',
      createdAt: now,
      updatedAt: now,
      publicResponse: null,
      internalNotes: null,
    };

    const created = await store.create(submission);
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

// GET /api/submissions — list all (dashboard)
router.get('/', async (req, res) => {
  try {
    let submissions = await store.getAll();
    const { status, category } = req.query;
    if (status) submissions = submissions.filter(s => s.status === status);
    if (category) submissions = submissions.filter(s => s.category === category);
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// GET /api/submissions/track/:trackingId — citizen lookup (must be before /:id)
router.get('/track/:trackingId', async (req, res) => {
  try {
    const submission = await store.getByTrackingId(req.params.trackingId.toUpperCase());
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    // Return only citizen-visible fields
    const { id, trackingId, title, category, description, status, createdAt, updatedAt, publicResponse } = submission;
    res.json({ id, trackingId, title, category, description, status, createdAt, updatedAt, publicResponse });
  } catch (error) {
    console.error('Error tracking submission:', error);
    res.status(500).json({ error: 'Failed to track submission' });
  }
});

// GET /api/submissions/:id — get single submission (dashboard)
router.get('/:id', async (req, res) => {
  try {
    const submission = await store.getById(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    res.json(submission);
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// PATCH /api/submissions/:id — update status / add response
router.patch('/:id', async (req, res) => {
  try {
    const { status, publicResponse, internalNotes } = req.body;
    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` });
    }
    const updates = {};
    if (status !== undefined) updates.status = status;
    if (publicResponse !== undefined) updates.publicResponse = publicResponse;
    if (internalNotes !== undefined) updates.internalNotes = internalNotes;
    updates.updatedAt = new Date().toISOString();

    const updated = await store.update(req.params.id, updates);
    if (!updated) return res.status(404).json({ error: 'Submission not found' });
    res.json(updated);
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ error: 'Failed to update submission' });
  }
});

module.exports = router;


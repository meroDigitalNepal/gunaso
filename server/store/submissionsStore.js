const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/submissions.json');

function readAll() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeAll(submissions) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2), 'utf8');
}

function getAll() {
  return readAll();
}

function getById(id) {
  return readAll().find(s => s.id === id) || null;
}

function getByTrackingId(trackingId) {
  return readAll().find(s => s.trackingId === trackingId) || null;
}

function create(submission) {
  const submissions = readAll();
  submissions.push(submission);
  writeAll(submissions);
  return submission;
}

function update(id, updates) {
  const submissions = readAll();
  const idx = submissions.findIndex(s => s.id === id);
  if (idx === -1) return null;
  submissions[idx] = { ...submissions[idx], ...updates, updatedAt: new Date().toISOString() };
  writeAll(submissions);
  return submissions[idx];
}

module.exports = { getAll, getById, getByTrackingId, create, update };

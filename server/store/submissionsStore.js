require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getAll() {
  try {
    return await prisma.submission.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
}

async function getById(id) {
  try {
    return await prisma.submission.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error fetching submission by ID:', error);
    throw error;
  }
}

async function getByTrackingId(trackingId) {
  try {
    return await prisma.submission.findUnique({
      where: { trackingId },
    });
  } catch (error) {
    console.error('Error fetching submission by tracking ID:', error);
    throw error;
  }
}

async function create(submission) {
  try {
    return await prisma.submission.create({
      data: submission,
    });
  } catch (error) {
    console.error('Error creating submission:', error);
    throw error;
  }
}

async function update(id, updates) {
  try {
    return await prisma.submission.update({
      where: { id },
      data: updates,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return null; // Not found
    }
    console.error('Error updating submission:', error);
    throw error;
  }
}

module.exports = { getAll, getById, getByTrackingId, create, update };



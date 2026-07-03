const { randomUUID } = require('crypto');
const { BlobServiceClient } = require('@azure/storage-blob');

// Keeps the sanitized name well under Azure's 1024-char blob name limit
// alongside the "mpId/submissionId/uuid-" prefix (~110 chars).
const MAX_FILE_NAME_LENGTH = 200;

function sanitizeFileName(fileName) {
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Truncate the base name, not the extension, so very long filenames still
  // download with a usable file type instead of losing it to a blind slice.
  const lastDot = sanitized.lastIndexOf('.');
  const hasExtension = lastDot > 0 && lastDot < sanitized.length - 1;
  const ext = hasExtension ? sanitized.slice(lastDot) : '';
  const base = hasExtension ? sanitized.slice(0, lastDot) : sanitized;

  return base.slice(0, Math.max(MAX_FILE_NAME_LENGTH - ext.length, 1)) + ext;
}

function buildBlobPath(mpId, submissionId, originalFileName) {
  return `${mpId}/${submissionId}/${randomUUID()}-${sanitizeFileName(originalFileName)}`;
}

function createBlobStorage({
  client = null,
  containerName = process.env.AZURE_STORAGE_CONTAINER || 'submission-attachments',
  connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING,
} = {}) {
  const enabled = Boolean(client || connectionString);
  if (!enabled) {
    console.warn('[blobStorage] AZURE_STORAGE_CONNECTION_STRING not set — attachment uploads disabled.');
  }

  let containerClient = null;
  function getContainerClient() {
    if (!containerClient) {
      const serviceClient = client || BlobServiceClient.fromConnectionString(connectionString);
      containerClient = serviceClient.getContainerClient(containerName);
    }
    return containerClient;
  }

  async function uploadAttachment({ mpId, submissionId, buffer, contentType, originalFileName }) {
    if (!enabled) return null;

    const blobPath = buildBlobPath(mpId, submissionId, originalFileName);
    const blockBlobClient = getContainerClient().getBlockBlobClient(blobPath);
    await blockBlobClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: contentType } });
    return blobPath;
  }

  async function streamAttachment(blobPath) {
    const blockBlobClient = getContainerClient().getBlockBlobClient(blobPath);
    const downloadResponse = await blockBlobClient.download();
    return downloadResponse.readableStreamBody;
  }

  return { uploadAttachment, streamAttachment };
}

let defaultBlobStorage;

function getDefaultBlobStorage() {
  if (!defaultBlobStorage) {
    defaultBlobStorage = createBlobStorage();
  }
  return defaultBlobStorage;
}

module.exports = {
  uploadAttachment: (...args) => getDefaultBlobStorage().uploadAttachment(...args),
  streamAttachment: (...args) => getDefaultBlobStorage().streamAttachment(...args),
  createBlobStorage,
};

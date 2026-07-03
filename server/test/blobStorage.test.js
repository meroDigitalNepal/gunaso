const test = require('node:test');
const assert = require('node:assert/strict');

const { createBlobStorage } = require('../utils/blobStorage');

function createFakeClient() {
  const uploads = [];
  const containers = {};
  return {
    uploads,
    getContainerClient(containerName) {
      containers[containerName] = true;
      return {
        getBlockBlobClient(blobPath) {
          return {
            async uploadData(buffer, options) {
              uploads.push({ blobPath, buffer, options });
            },
            async download() {
              return { readableStreamBody: `stream-for-${blobPath}` };
            },
          };
        },
      };
    },
  };
}

test('uploadAttachment no-ops without calling out when unconfigured', async () => {
  const originalWarn = console.warn;
  let warned = false;
  console.warn = () => { warned = true; };

  const storage = createBlobStorage({});
  const result = await storage.uploadAttachment({
    mpId: 'mp-1', submissionId: 'sub-1', buffer: Buffer.from('x'), contentType: 'image/png', originalFileName: 'photo.png',
  });

  console.warn = originalWarn;
  assert.equal(warned, true);
  assert.equal(result, null);
});

test('uploadAttachment builds the expected blob path and uploads with the sniffed content type', async () => {
  const client = createFakeClient();
  const storage = createBlobStorage({ client, containerName: 'submission-attachments' });

  const blobPath = await storage.uploadAttachment({
    mpId: 'mp-1',
    submissionId: 'sub-1',
    buffer: Buffer.from('hello'),
    contentType: 'application/pdf',
    originalFileName: 'my report.pdf',
  });

  assert.equal(client.uploads.length, 1);
  assert.equal(blobPath, client.uploads[0].blobPath);
  assert.match(blobPath, /^mp-1\/sub-1\/[0-9a-f-]{36}-my_report\.pdf$/);
  assert.equal(client.uploads[0].buffer.toString(), 'hello');
  assert.equal(client.uploads[0].options.blobHTTPHeaders.blobContentType, 'application/pdf');
});

test('uploadAttachment strips path separators from the file name', async () => {
  const client = createFakeClient();
  const storage = createBlobStorage({ client });

  const blobPath = await storage.uploadAttachment({
    mpId: 'clinic',
    submissionId: 'case42',
    buffer: Buffer.from('x'),
    contentType: 'image/jpeg',
    originalFileName: '../../etc/passwd.jpg',
  });

  assert.equal(blobPath.indexOf('/', 'clinic/case42/'.length), -1, 'no additional path separators after the mpId/submissionId prefix');
  assert.ok(blobPath.endsWith('.jpg'));
  assert.ok(blobPath.startsWith('clinic/case42/'));
});

test('uploadAttachment truncates very long file names but preserves the extension', async () => {
  const client = createFakeClient();
  const storage = createBlobStorage({ client });

  const blobPath = await storage.uploadAttachment({
    mpId: 'clinic',
    submissionId: 'case42',
    buffer: Buffer.from('x'),
    contentType: 'image/jpeg',
    originalFileName: `${'a'.repeat(300)}.jpg`,
  });

  assert.ok(blobPath.endsWith('.jpg'), 'extension should survive truncation');
  assert.ok(blobPath.length < 300, 'overall path should be meaningfully shorter than the original name');
});

test('streamAttachment returns the blob\'s readable stream', async () => {
  const client = createFakeClient();
  const storage = createBlobStorage({ client });

  const stream = await storage.streamAttachment('mp-1/sub-1/some-blob.png');

  assert.equal(stream, 'stream-for-mp-1/sub-1/some-blob.png');
});

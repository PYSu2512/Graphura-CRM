const test = require('node:test');
const assert = require('node:assert/strict');

const {
  bulkAssignSchema,
  distributeLeadsSchema,
  singleAssignSchema,
} = require('../src/validators/leadAssignment.validator');
const bulkLeadUploadService = require('../src/services/bulkLeadUpload.service');

test('singleAssignSchema accepts a valid userId payload', () => {
  const result = singleAssignSchema.validate({ userId: '507f1f77bcf86cd799439011' });
  assert.equal(result.error, undefined);
});

test('bulkAssignSchema rejects empty lead lists', () => {
  const result = bulkAssignSchema.validate({
    leadIds: [],
    userId: '507f1f77bcf86cd799439011',
  });
  assert.ok(result.error);
});

test('distributeLeadsSchema validates assignment groups', () => {
  const result = distributeLeadsSchema.validate({
    assignments: [
      {
        userId: '507f1f77bcf86cd799439011',
        leadIds: ['507f1f77bcf86cd799439012'],
      },
    ],
  });
  assert.equal(result.error, undefined);
});

test('normalizeIds removes duplicates and falsey values', () => {
  const normalized = bulkLeadUploadService.__private__.normalizeIds([
    '507f1f77bcf86cd799439011',
    '507f1f77bcf86cd799439011',
    '',
    null,
  ]);
  assert.deepEqual(normalized, ['507f1f77bcf86cd799439011']);
});

test('resolveAllowedTargetRoles maps sales roles correctly', () => {
  assert.deepEqual(bulkLeadUploadService.__private__.resolveAllowedTargetRoles('SALES_MANAGER'), ['SALES_TL']);
  assert.deepEqual(bulkLeadUploadService.__private__.resolveAllowedTargetRoles('SALES_TL'), ['SALES_EXECUTIVE']);
});
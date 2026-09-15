import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateJobSheetTotals } from './job-sheet-discount.js';

test('calculates Job Sheet percentage discount before paid and due', () => {
  assert.deepEqual(calculateJobSheetTotals(10000, 'percentage', 10, 5000), {
    subtotal: 10000,
    discount: 1000,
    total: 9000,
    paidAmount: 5000,
    dueAmount: 4000
  });
});

test('caps fixed Job Sheet discount at subtotal', () => {
  assert.deepEqual(calculateJobSheetTotals(5000, 'fixed', 9000, 1000), {
    subtotal: 5000,
    discount: 5000,
    total: 0,
    paidAmount: 0,
    dueAmount: 0
  });
});

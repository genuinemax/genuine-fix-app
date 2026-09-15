import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteInvoiceById } from './invoice-actions.js';

test('deleteInvoiceById removes only the selected invoice', () => {
  const invoices = [
    { id: 'GF-1001', customerName: 'A' },
    { id: 'ACC-1002', customerName: 'B' },
    { id: 'GF-1003', customerName: 'C' },
  ];

  assert.deepEqual(deleteInvoiceById(invoices, 'ACC-1002'), [
    { id: 'GF-1001', customerName: 'A' },
    { id: 'GF-1003', customerName: 'C' },
  ]);
});

export const deleteInvoiceById = (invoices, invoiceId) =>
  invoices.filter(invoice => invoice.id !== invoiceId);

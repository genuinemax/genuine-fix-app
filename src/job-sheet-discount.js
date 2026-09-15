export const calculateJobSheetTotals = (subtotal, discountType = 'percentage', discountValue = 0, paidInput = 0) => {
  const safeSubtotal = Math.max(0, Number(subtotal) || 0);
  const rawDiscount = Math.max(0, Number(discountValue) || 0);
  const discount = discountType === 'fixed'
    ? Math.min(safeSubtotal, rawDiscount)
    : Math.min(safeSubtotal, safeSubtotal * Math.min(100, rawDiscount) / 100);
  const total = Math.max(0, safeSubtotal - discount);
  const paidAmount = Math.min(total, Math.max(0, Number(paidInput) || 0));
  const dueAmount = Math.max(0, total - paidAmount);
  return { subtotal: safeSubtotal, discount, total, paidAmount, dueAmount };
};

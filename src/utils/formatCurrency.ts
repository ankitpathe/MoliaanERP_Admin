export const safeNumber = (val: any): number => {
  const num = parseFloat(val);
  return isNaN(num) || !isFinite(num) ? 0 : num;
};

export const formatCurrency = (val: any): string => {
  return `₹${safeNumber(val).toFixed(2)}`;
};

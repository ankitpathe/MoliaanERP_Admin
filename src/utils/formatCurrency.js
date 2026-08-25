export const safeNumber = (val) => {
  const num = parseFloat(val);
  return isNaN(num) || !isFinite(num) ? 0 : num;
};

export const formatCurrency = (val) => {
  return `₹${safeNumber(val).toFixed(2)}`;
};

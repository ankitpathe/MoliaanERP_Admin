// Forward compatibility mapping to centralized billingCalculator
import { calculateItemBilling } from './billingCalculator';

export const calculatePricing = (
  rawMRP,
  rawSellingPrice,
  rawQty = 1
) => {
  const billing = calculateItemBilling({
    costPrice: 0,
    mrp: Number(rawMRP) || 0,
    sellingPrice: Number(rawSellingPrice) || 0,
    gstRate: 0,
    gstMode: 'Exclusive',
    quantity: Number(rawQty) || 1,
  });

  return {
    mrp: billing.mrp,
    sellingPrice: billing.sellingPrice,
    quantity: billing.quantity,
    unitDiscount: billing.unitProductDiscount,
    totalDiscount: billing.totalProductDiscount,
    totalAmount: billing.totalDiscountedSellingPrice,
    totalMRP: billing.mrp * billing.quantity,
  };
};

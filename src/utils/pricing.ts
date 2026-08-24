// Forward compatibility mapping to centralized billingCalculator
import { calculateItemBilling } from './billingCalculator';

export interface ProductPricing {
  mrp: number;
  sellingPrice: number;
  quantity: number;
  unitDiscount: number;
  totalDiscount: number;
  totalAmount: number;
  totalMRP: number;
}

export const calculatePricing = (
  rawMRP: any,
  rawSellingPrice: any,
  rawQty: any = 1
): ProductPricing => {
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

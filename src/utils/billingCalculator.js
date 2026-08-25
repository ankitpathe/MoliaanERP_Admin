export const validateAndSanitizeInputs = (input) => {
  let costPrice = Math.max(0, Number(input.costPrice) || 0);
  let mrp = Math.max(0, Number(input.mrp) || 0);
  let sellingPrice = Math.max(0, Number(input.sellingPrice) || 0);
  let gstRate = Math.min(100, Math.max(0, Number(input.gstRate) || 0));
  let quantity = Math.max(1, Number(input.quantity) || 1);
  let itemDiscount = Math.max(0, Number(input.itemDiscount) || 0);
  let cessPercent = Math.max(0, Number(input.cessPercent) || 0);

  // Prevent selling > MRP
  if (sellingPrice > mrp) {
    sellingPrice = mrp;
  }

  // Prevent discount > MRP
  if (itemDiscount > sellingPrice) {
    itemDiscount = sellingPrice;
  }

  // GST Exempt, Nil Rated, Zero Rated, Non-GST Supply reset rate to 0
  const isTaxFree = ['exempt', 'nil', 'non-gst', 'zero'].includes(input.taxStructure || '');
  if (isTaxFree) {
    gstRate = 0;
    cessPercent = 0;
  }

  return {
    costPrice,
    mrp,
    sellingPrice,
    gstRate,
    gstMode: input.gstMode,
    quantity,
    taxStructure: input.taxStructure || 'intra',
    itemDiscount,
    cessPercent,
  };
};

export const calculateItemBilling = (input) => {
  const sanitized = validateAndSanitizeInputs(input);
  const { costPrice, mrp, sellingPrice, gstRate, gstMode, quantity, taxStructure } = sanitized;
  const itemDiscount = sanitized.itemDiscount ?? 0;
  const cessPercent = sanitized.cessPercent ?? 0;

  // 1. Calculate selling price after line-level manual discount
  const discountedSellingPrice = Math.max(0, sellingPrice - itemDiscount);
  const totalDiscountedSellingPrice = discountedSellingPrice * quantity;
  const itemDiscountAmount = itemDiscount * quantity;

  // 2. Base Price calculation based on Inclusive / Exclusive GST mode
  let basePrice = 0;
  let gstAmount = 0;
  let grandTotal = 0;

  if (gstMode === 'Inclusive') {
    // Selling price includes GST + Cess if applicable
    // Price = Base * (1 + GST% + Cess%)
    const taxFactor = 1 + (gstRate / 100) + (cessPercent / 100);
    basePrice = discountedSellingPrice / taxFactor;
    gstAmount = (basePrice * quantity) * (gstRate / 100);
    grandTotal = totalDiscountedSellingPrice;
  } else {
    // Selling price excludes GST
    basePrice = discountedSellingPrice;
    gstAmount = (totalDiscountedSellingPrice * gstRate) / 100;
    grandTotal = totalDiscountedSellingPrice + gstAmount + (totalDiscountedSellingPrice * (cessPercent / 100));
  }

  // Prevent NaN/Infinity issues
  if (isNaN(basePrice) || !isFinite(basePrice)) basePrice = 0;
  if (isNaN(gstAmount) || !isFinite(gstAmount)) gstAmount = 0;
  if (isNaN(grandTotal) || !isFinite(grandTotal)) grandTotal = 0;

  const taxableValue = basePrice * quantity;
  const cessAmount = taxableValue * (cessPercent / 100);

  // Split GST based on tax structure
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (gstRate > 0) {
    if (taxStructure === 'inter') {
      igst = gstAmount;
    } else {
      // Intra-state standard splits into CGST + SGST
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
    }
  }

  // Product discount (MRP - Selling Price)
  const unitProductDiscount = Math.max(0, mrp - sellingPrice);
  const totalProductDiscount = unitProductDiscount * quantity;

  // Profit & Margin calculations: Profit = Selling Price - Cost Price (gross, no tax deduction)
  const profit = (discountedSellingPrice - costPrice) * quantity;

  let margin = 0;
  if (discountedSellingPrice > 0) {
    margin = ((discountedSellingPrice - costPrice) / discountedSellingPrice) * 100;
  }
  if (isNaN(margin) || !isFinite(margin)) margin = 0;

  return {
    costPrice,
    mrp,
    sellingPrice,
    quantity,
    unitProductDiscount,
    totalProductDiscount,
    discountedSellingPrice,
    totalDiscountedSellingPrice,
    itemDiscountAmount,
    basePrice,
    taxableValue,
    gstRate,
    gstAmount,
    cgst,
    sgst,
    igst,
    cessPercent,
    cessAmount,
    grandTotal,
    profit,
    margin,
  };
};

export const calculateCartBilling = (
  cartItems,
  billDiscount = 0
) => {
  const sanitizedBillDiscount = Math.max(0, Number(billDiscount) || 0);
  
  // Calculate each item/line first
  const lineOutputs = cartItems.map(item => calculateItemBilling(item));

  // Summarize totals
  const subtotal = lineOutputs.reduce((acc, item) => acc + item.taxableValue, 0);
  const totalGST = lineOutputs.reduce((acc, item) => acc + item.gstAmount, 0);
  const totalCGST = lineOutputs.reduce((acc, item) => acc + item.cgst, 0);
  const totalSGST = lineOutputs.reduce((acc, item) => acc + item.sgst, 0);
  const totalIGST = lineOutputs.reduce((acc, item) => acc + item.igst, 0);
  const totalCess = lineOutputs.reduce((acc, item) => acc + item.cessAmount, 0);
  const totalMRP = lineOutputs.reduce((acc, item) => acc + (item.mrp * item.quantity), 0);
  const totalCostPrice = lineOutputs.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0);
  
  const productAndItemDiscount = lineOutputs.reduce(
    (acc, item) => acc + item.totalProductDiscount + item.itemDiscountAmount,
    0
  );

  const totalDiscount = productAndItemDiscount + sanitizedBillDiscount;

  // Grand total calculation (Subtotal + Total GST + Total Cess - Bill Discount)
  const grandTotalRaw = Math.max(0, (subtotal + totalGST + totalCess) - sanitizedBillDiscount);
  const grandTotal = Math.round(grandTotalRaw);
  const roundOff = grandTotal - grandTotalRaw;

  // Total profits & margins
  const totalProfit = lineOutputs.reduce((acc, item) => acc + item.profit, 0) - sanitizedBillDiscount;
  const totalMargin = subtotal > 0 ? (totalProfit / subtotal) * 100 : 0;

  return {
    items: lineOutputs,
    subtotal,
    totalGST,
    totalCGST,
    totalSGST,
    totalIGST,
    totalCess,
    totalDiscount,
    totalMRP,
    totalCostPrice,
    billDiscount: sanitizedBillDiscount,
    grandTotalRaw,
    grandTotal,
    roundOff,
    totalProfit,
    totalMargin,
  };
};

export const calculateInvoiceTotals = calculateCartBilling;

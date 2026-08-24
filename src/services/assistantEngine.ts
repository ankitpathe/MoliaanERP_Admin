import type { ProductItem } from '../components/inventory/types';

export interface AssistantResponse {
  message: string;
  navigatePath?: string;
  type: 'text' | 'success' | 'warning' | 'error' | 'info';
}

export const handleAssistantCommand = (
  rawMessage: string
): AssistantResponse => {
  const query = rawMessage.trim().toLowerCase();
  
  // 1. Navigation intents
  if (query.includes('open pos') || query.includes('go to pos')) {
    return {
      message: "Navigating to the POS Billing screen...",
      navigatePath: '/sales/pos',
      type: 'success'
    };
  }
  if (query.includes('open products') || query.includes('go to products') || query.includes('open product catalog')) {
    return {
      message: "Navigating to the Product Catalog...",
      navigatePath: '/inventory/products',
      type: 'success'
    };
  }
  if (query.includes('open customers') || query.includes('go to customers') || query.includes('open ledger')) {
    return {
      message: "Navigating to the Customer Ledger...",
      navigatePath: '/customers/ledger',
      type: 'success'
    };
  }
  if (query.includes('open inventory') || query.includes('open low stock') || query.includes('go to inventory')) {
    return {
      message: "Navigating to the Low Stock Alerts...",
      navigatePath: '/inventory/low-stock',
      type: 'success'
    };
  }
  if (query.includes('open settings') || query.includes('go to settings')) {
    return {
      message: "Navigating to Store Profile & Settings...",
      navigatePath: '/settings/profile',
      type: 'success'
    };
  }

  // 2. Low Stock Products intent
  if (query.includes('low stock') || query.includes('stock low') || query.includes('min stock')) {
    try {
      const rawProducts = localStorage.getItem('erp_products');
      if (!rawProducts) {
        return { message: "No product database found.", type: 'warning' };
      }
      const products: ProductItem[] = JSON.parse(rawProducts);
      const lowStockItems = products.filter(p => Number(p.stock) <= Number(p.minStock));
      
      if (lowStockItems.length === 0) {
        return { message: "All products have healthy stock levels. No low-stock items found.", type: 'success' };
      }

      let responseText = "Here are the products currently low in stock:\n\n";
      lowStockItems.forEach(item => {
        responseText += `• **${item.name}** — Stock: **${item.stock}** (Min: ${item.minStock}) [Category: ${item.category}]\n`;
      });
      return { message: responseText, type: 'warning' };
    } catch {
      return { message: "Failed to read product inventory data.", type: 'error' };
    }
  }

  // 3. Today's Sales intent
  if (query.includes('today\'s sales') || query.includes('todays sales') || query.includes('today sales') || query.includes('sales today')) {
    try {
      const rawSales = localStorage.getItem('erp_sales');
      if (!rawSales) {
        return { message: "No sales records found.", type: 'info' };
      }
      const sales = JSON.parse(rawSales);
      const todayStr = new Date().toISOString().split('T')[0];
      const todaySales = sales.filter((s: any) => s.date === todayStr);

      if (todaySales.length === 0) {
        return { message: "No sales transactions recorded for today yet.", type: 'info' };
      }

      const totalSalesAmount = todaySales.reduce((sum: number, s: any) => sum + (Number(s.total) || 0), 0);
      const invoiceCount = todaySales.length;

      // Group by payment method
      const paymentSummary: Record<string, number> = {};
      todaySales.forEach((s: any) => {
        const method = (s.paymentMethod || 'cash').toLowerCase();
        paymentSummary[method] = (paymentSummary[method] || 0) + (Number(s.total) || 0);
      });

      let responseText = `**Today's Sales Summary (${todayStr}):**\n\n`;
      responseText += `• Total Sales Amount: **₹${totalSalesAmount.toFixed(2)}**\n`;
      responseText += `• Total Invoices: **${invoiceCount}**\n`;
      responseText += `• Breakdowns by Mode:\n`;
      Object.entries(paymentSummary).forEach(([method, amt]) => {
        responseText += `  - ${method.toUpperCase()}: **₹${amt.toFixed(2)}**\n`;
      });

      return { message: responseText, type: 'success' };
    } catch {
      return { message: "Failed to read today's sales data.", type: 'error' };
    }
  }

  // 4. Search Product intent
  if (query.startsWith('search product') || query.startsWith('search') || query.includes('find product')) {
    try {
      // Extract search term
      let term = '';
      if (query.startsWith('search product')) {
        term = query.replace('search product', '').trim();
      } else if (query.startsWith('search')) {
        term = query.replace('search', '').trim();
      } else if (query.includes('find product')) {
        term = query.replace('find product', '').trim();
      }

      if (!term) {
        return { message: "Please specify a product name, SKU, or barcode to search (e.g., 'search Parle-G').", type: 'info' };
      }

      const rawProducts = localStorage.getItem('erp_products');
      if (!rawProducts) {
        return { message: "No product database found.", type: 'warning' };
      }
      const products: ProductItem[] = JSON.parse(rawProducts);
      const matches = products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.barcode && p.barcode.includes(term)) ||
        (p.sku && p.sku.toLowerCase().includes(term)) ||
        (p.brand && p.brand.toLowerCase().includes(term))
      );

      if (matches.length === 0) {
        return { message: `No products found matching "${term}".`, type: 'info' };
      }

      let responseText = `Found ${matches.length} matching product(s):\n\n`;
      matches.forEach(item => {
        responseText += `• **${item.name}**\n  - SKU: ${item.sku || 'N/A'} | Price: **₹${item.sellingPrice}**\n  - Stock: **${item.stock}** units | Category: ${item.category}\n`;
      });
      return { message: responseText, type: 'success' };
    } catch {
      return { message: "Failed to search product database.", type: 'error' };
    }
  }

  // 5. Help / Unknown command fallback
  return {
    message: "I can currently help you with:\n\n" +
      "1. **Low stock items**: Ask 'low stock products'\n" +
      "2. **Sales summary**: Ask 'today's sales'\n" +
      "3. **Search products**: Ask 'search Parle-G'\n" +
      "4. **Navigation**: Ask 'open POS', 'open products', 'open customers', 'open inventory', or 'open settings'",
    type: 'info'
  };
};

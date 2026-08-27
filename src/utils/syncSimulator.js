import { logActivity } from '../services/activityLogger';

export function toggleCounterStatus(counters, counterId, currentStatus) {
  const nextStatus = currentStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
  let processedCount = 0;
  let counterName = '';

  const updated = counters.map(c => {
    if (c.id === counterId) {
      counterName = c.name;
      const queue = c.offlineQueue || [];
      
      if (nextStatus === 'ONLINE' && queue.length > 0) {
        processedCount = queue.length;
        
        // Push all queued items to erp_sync_logs
        const rawLogs = localStorage.getItem('erp_sync_logs') || '[]';
        let logsList = [];
        try {
          logsList = JSON.parse(rawLogs);
        } catch (e) {
          logsList = [];
        }

        const newLogs = queue.map((item, idx) => ({
          id: `SYNC-${Date.now().toString().slice(-4)}-${idx}`,
          timestamp: new Date().toISOString(),
          terminalName: c.name,
          terminalCode: c.code,
          deviceMac: c.deviceMac || 'E4:5F:01:2A:8C:99',
          category: item.category || 'Sales Invoices & Khata',
          recordsCount: item.recordsCount || 1,
          latencyMs: Math.floor(15 + Math.random() * 20),
          status: 'SUCCESS',
          payload: item.payload || { note: "Synced after reconnect" }
        }));

        localStorage.setItem('erp_sync_logs', JSON.stringify([...newLogs, ...logsList]));
        
        logActivity({
          activityType: 'OFFLINE_QUEUE_SYNCED',
          module: 'System Integrity',
          actionDescription: `Automatically synchronized ${processedCount} pending offline transactions for terminal "${c.name}"`
        });
      }

      return {
        ...c,
        status: nextStatus,
        offlineQueue: nextStatus === 'ONLINE' ? [] : queue
      };
    }
    return c;
  });

  return {
    updatedCounters: updated,
    nextStatus,
    processedCount,
    counterName
  };
}

export function simulateOfflineTransactions(counters) {
  let changed = false;
  const updated = counters.map(c => {
    if (c.status === 'OFFLINE') {
      const queue = c.offlineQueue || [];
      // Generate a new transaction with 50% probability
      if (Math.random() < 0.5) {
        const recordsCount = Math.floor(1 + Math.random() * 8);
        const categories = ["Sales Invoices & Khata", "Stock Inventory Adjustments", "Customer Ledger Sync"];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const newTx = {
          category,
          recordsCount,
          payload: { note: "Generated during offline session", amount: recordsCount * 450 }
        };
        queue.push(newTx);
        changed = true;
        return {
          ...c,
          offlineQueue: [...queue]
        };
      }
    }
    return c;
  });
  return { updated, changed };
}

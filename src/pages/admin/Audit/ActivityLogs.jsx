import React from 'react';
import ActivityLogsComponent from '../../../components/Admin/Audit/ActivityLogs';

export default function ActivityLogs() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <ActivityLogsComponent />
    </div>
  );
}

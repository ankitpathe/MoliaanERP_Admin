import React from 'react';
import ActivityLogViewer from '../../../components/Admin/ActivityLogs/ActivityLogViewer';

export default function ActivityLogs() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <ActivityLogViewer />
    </div>
  );
}

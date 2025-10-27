import { memo, useRef } from 'react';

import styles from '../assets/styles/LogTable.module.css';

export function LogTableComponent({ logs }: { logs: any[] }) {
  const tableRef = useRef<HTMLDivElement>(null);

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toISOString();
  };

  return (
    <div className={styles.tableContainer} ref={tableRef}>
      <table className={styles.logTable}>
        <thead className={styles.tableHeader}>
          <tr>
            <th className={styles.timestampHeader}>Timestamp</th>
            <th className={styles.eventHeader}>Event</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log: any, index: number) => (
            <tr key={index}>
              <td>
                {formatTimestamp(log._time)}
              </td>
              <td>
                {JSON.stringify(log)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const LogTable = memo(LogTableComponent);

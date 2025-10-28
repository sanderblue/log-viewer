import { useState, useEffect, useMemo } from 'react';

import type { LogEntry } from '@/types/logs';
import { LogService } from '@/services/log-service';
import styles from '@/assets/styles/LogViewer.module.css';
import { VirtualizedLogTable } from '@/components/VirtualizedLogTable';

export function LogViewer({ url }: { url: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create logService instance once
  const logService = useMemo(() => new LogService(), []);

  // Load logs on mount and when URL changes
  useEffect(() => {
    if (!url) {
      return;
    }

    let isCancelled = false;

    const loadLogs = async () => {
      // Reset state
      setLogs([]);
      setLoading(true);
      setError(null);

      try {
        await logService.streamLogs(url, {
          onChunk: (newLogs: LogEntry[]) => {
            if (!isCancelled) {
              setLogs((prevLogs) => [...prevLogs, ...newLogs]);
            }
          },
        });
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load logs:', error);
          setError(error instanceof Error ? error.message : 'Failed to load logs');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadLogs();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isCancelled = true;
    };
  }, [url, logService]); // Only depend on url and logService

  return (
    <div className={styles.logViewerContainer}>
      <div className={styles.header}>
        <h1>Log Viewer</h1>
        <div className={styles.stats}>
          <span>Total Logs: {logs.length}</span>
          {loading && <span>Loading...</span>}
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          Error: {error}
        </div>
      )}

      <div className={styles.tableWrapper}>
        {logs.length > 0 ? (
          <VirtualizedLogTable
            logs={logs}
            containerHeight={600}
            rowHeight={30}
            overscan={5}
          />
        ) : (
          <div className={styles.emptyState}>
            {loading ? 'Loading logs...' : 'No logs to display'}
          </div>
        )}
      </div>
    </div>
  );
}

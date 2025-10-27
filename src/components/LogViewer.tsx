import { useState, useEffect, useCallback, useReducer } from 'react';

import type { LogEntry } from '@/types/logs';
import { LogService } from '@/services/log-service';
import styles from '@/assets/styles/LogViewer.module.css';
import { LogTable } from '@/components/LogTable';

export function LogViewer({ url }: { url: string }) {
  const logService = new LogService()
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    loadLogs(url);
  }, []);

  const handleLogsChunk = useCallback((logs: LogEntry[]) => {
    // console.log("logs:", logs);
    setLogs(logs)
    // setLogs((prevLogs) => [...prevLogs, ...logs]);
  }, []);

  const loadLogs = useCallback(async (url: string) => {
    if (!url) {
      return
    }

    try {
      const data = await logService.streamLogs(url, {
        onChunk: handleLogsChunk,
      });

      console.log("data:", data);

      setLogs(data);

    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  }, []);

  return (
    <div>
      <h1>Logs</h1>
      <div>
        <div className={styles.tableWrapper}>
          <LogTable logs={logs} />
        </div>

        {logs.map((log: LogEntry, index: number) => (
          <div key={index}>{log.message}</div>
        ))}
      </div>
    </div>
  );
}

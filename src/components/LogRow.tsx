import { memo } from 'react';
import type { LogEntry } from '@/types/logs';
import styles from '@/assets/styles/LogRow.module.css';

interface LogRowProps {
  log: LogEntry;
  index: number;
  style: React.CSSProperties;
  formatTimestamp: (timestamp: number) => string;
  isExpanded: boolean;
  onClick: () => void;
}

function LogRowComponent({ log, index, style, formatTimestamp, isExpanded, onClick }: LogRowProps) {
  return (
    <div className={`${styles.row} ${styles.rowClickable}`} style={style} onClick={onClick}>
      <div className={styles.rowHeader}>
        <div className={styles.lineNumber}>
          {index + 1}
        </div>
        <span className={`${styles.caret} ${isExpanded ? styles.caretRotated : ''}`}>
          ▶
        </span>
        <div className={styles.timestamp}>
          {formatTimestamp(log._time)}
        </div>
        <div className={styles.event}>
          {isExpanded ? log.message || 'No message' : JSON.stringify(log)}
        </div>
      </div>
      {isExpanded && (
        <div className={styles.expandedContent}>
          <pre className={styles.jsonContent}>
            {JSON.stringify(log, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// For debugging clarity
LogRowComponent.displayName = 'LogRow';

export const LogRow = memo(LogRowComponent);

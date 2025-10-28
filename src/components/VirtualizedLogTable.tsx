import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import type { LogEntry } from '@/types/logs';
import styles from '@/assets/styles/VirtualizedLogTable.module.css';

interface VirtualizedLogTableProps {
  logs: LogEntry[];
  rowHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

// Memoized row component for performance
const LogRow = memo(({
  log,
  style,
  formatTimestamp
}: {
  log: LogEntry;
  style: React.CSSProperties;
  formatTimestamp: (timestamp: number) => string;
}) => (
  <div className={styles.row} style={style}>
    <div className={styles.timestamp}>
      {formatTimestamp(log._time)}
    </div>
    <div className={styles.event}>
      {JSON.stringify(log)}
    </div>
  </div>
));

LogRow.displayName = 'LogRow';

export const VirtualizedLogTable: React.FC<VirtualizedLogTableProps> = memo(({
  logs,
  rowHeight = 30,
  containerHeight = 600,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Calculate total height for virtual spacer
  const totalHeight = logs.length * rowHeight;

  // Calculate visible range
  const visibleStartIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleEndIndex = Math.min(
    logs.length,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
  );

  // Get visible items
  const visibleItems = logs.slice(visibleStartIndex, visibleEndIndex);

  // Memoize timestamp formatter
  const formatTimestamp = useCallback((timestamp: number): string => {
    return new Date(timestamp).toISOString();
  }, []);

  // Cache formatted timestamps
  const timestampCache = useMemo(() => new Map<number, string>(), []);

  const getCachedTimestamp = useCallback((timestamp: number): string => {
    if (!timestampCache.has(timestamp)) {
      timestampCache.set(timestamp, formatTimestamp(timestamp));
    }
    return timestampCache.get(timestamp)!;
  }, [timestampCache, formatTimestamp]);

  // Debounced scroll handler with requestAnimationFrame
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;

    // Cancel previous animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Use requestAnimationFrame for smooth updates
    animationFrameRef.current = requestAnimationFrame(() => {
      setScrollTop(target.scrollTop);
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Home':
          container.scrollTop = 0;
          break;
        case 'End':
          container.scrollTop = totalHeight;
          break;
        case 'PageUp':
          container.scrollTop = Math.max(0, container.scrollTop - containerHeight);
          break;
        case 'PageDown':
          container.scrollTop = Math.min(totalHeight, container.scrollTop + containerHeight);
          break;
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [totalHeight, containerHeight]);

  return (
    <div className={styles.virtualizedContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTimestamp}>Timestamp</div>
        <div className={styles.headerEvent}>Event</div>
      </div>

      {/* Scrollable container */}
      <div
        ref={containerRef}
        className={styles.scrollContainer}
        onScroll={handleScroll}
        style={{ height: containerHeight }}
        tabIndex={0}
      >
        {/* Virtual spacer to maintain scroll height */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Render only visible rows */}
          {visibleItems.map((log, index) => {
            const actualIndex = visibleStartIndex + index;
            const style: React.CSSProperties = {
              position: 'absolute',
              top: actualIndex * rowHeight,
              left: 0,
              right: 0,
              height: rowHeight,
            };

            return (
              <LogRow
                key={actualIndex}
                log={log}
                style={style}
                formatTimestamp={getCachedTimestamp}
              />
            );
          })}
        </div>
      </div>

      {/* Status bar */}
      <div className={styles.statusBar}>
        Showing {visibleStartIndex + 1} - {Math.min(visibleEndIndex, logs.length)} of {logs.length} logs
      </div>
    </div>
  );
});

VirtualizedLogTable.displayName = 'VirtualizedLogTable';

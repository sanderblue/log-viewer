import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import type { LogEntry } from '@/types/logs';
import { LogRow } from '@/components/LogRow';
import styles from '@/assets/styles/LogTable.module.css';

interface LogTableProps {
  logs: LogEntry[];
  rowHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

function LogTableComponent({ logs, rowHeight = 24, containerHeight = 600, overscan = 5 }: LogTableProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Heights for normal and expanded rows
  const expandedRowHeight = 400;
  const normalRowHeight = rowHeight;

  // Calculate total height for virtual spacer accounting for expanded row
  const totalHeight = useMemo(() => {
    let height = logs.length * normalRowHeight;
    if (expandedIndex !== null && expandedIndex < logs.length) {
      height += (expandedRowHeight - normalRowHeight);
    }
    return height;
  }, [logs.length, expandedIndex, normalRowHeight, expandedRowHeight]);

  // Calculate visible range with dynamic heights
  const { visibleStartIndex, visibleEndIndex } = useMemo(() => {
    let currentHeight = 0;
    let startIndex = 0;
    let endIndex = logs.length;
    let foundStart = false;

    for (let i = 0; i < logs.length; i++) {
      const isExpanded = i === expandedIndex;
      const height = isExpanded ? expandedRowHeight : normalRowHeight;

      if (!foundStart && currentHeight + height > scrollTop - (overscan * normalRowHeight)) {
        startIndex = i;
        foundStart = true;
      }

      if (currentHeight > scrollTop + containerHeight + (overscan * normalRowHeight)) {
        endIndex = i;
        break;
      }

      currentHeight += height;
    }

    return {
      visibleStartIndex: Math.max(0, startIndex),
      visibleEndIndex: Math.min(logs.length, endIndex)
    };
  }, [scrollTop, containerHeight, logs.length, expandedIndex, normalRowHeight, expandedRowHeight, overscan]);

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

  // Handle row click to toggle expansion
  const handleRowClick = useCallback((index: number) => {
    setExpandedIndex(prevIndex => prevIndex === index ? null : index);
  }, []);

  // Calculate row position accounting for expanded rows
  const getRowTop = useCallback((index: number): number => {
    let top = 0;
    for (let i = 0; i < index; i++) {
      top += i === expandedIndex ? expandedRowHeight : normalRowHeight;
    }
    return top;
  }, [expandedIndex, expandedRowHeight, normalRowHeight]);

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
        <div className={styles.headerLineNumber}>#</div>
        <div className={styles.headerCaretSpace}></div>
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
            const isExpanded = actualIndex === expandedIndex;
            const rowTop = getRowTop(actualIndex);
            const currentRowHeight = isExpanded ? expandedRowHeight : normalRowHeight;

            const style: React.CSSProperties = {
              position: 'absolute',
              top: rowTop,
              left: 0,
              right: 0,
              height: currentRowHeight,
              overflow: 'hidden'
            };

            return (
              <LogRow
                key={actualIndex}
                log={log}
                index={actualIndex}
                style={style}
                formatTimestamp={getCachedTimestamp}
                isExpanded={isExpanded}
                onClick={() => handleRowClick(actualIndex)}
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
}

// For debugging clarity
LogTableComponent.displayName = 'LogTable';

export const LogTable = memo(LogTableComponent);

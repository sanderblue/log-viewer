import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogRow } from '@/components/LogRow';
import type { LogEntry } from '@/types/logs';

describe('LogRow', () => {
  const mockLog: LogEntry = {
    _time: 1234567890000,
    cid: 'test-cid',
    channel: 'test-channel',
    level: 'info',
    message: 'Test log message'
  };

  const defaultProps = {
    log: mockLog,
    index: 0,
    style: { position: 'absolute' as const },
    formatTimestamp: (ts: number) => new Date(ts).toISOString(),
    isExpanded: false,
    onClick: vi.fn()
  };

  it('should render without crashing', () => {
    render(<LogRow {...defaultProps} />);
  });

  it('should display correct line number (1-indexed)', () => {
    render(<LogRow {...defaultProps} index={5} />);
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('should display formatted timestamp', () => {
    render(<LogRow {...defaultProps} />);
    expect(screen.getByText('2009-02-13T23:31:30.000Z')).toBeInTheDocument();
  });

  it('should call onClick when row is clicked', () => {
    const onClick = vi.fn();
    const { container } = render(<LogRow {...defaultProps} onClick={onClick} />);
    const row = container.querySelector('div[class*="row"]');
    fireEvent.click(row!);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should show JSON content when expanded', () => {
    render(<LogRow {...defaultProps} isExpanded={true} />);    // Should show message in header when expanded
    expect(screen.getByText('Test log message')).toBeInTheDocument();

    // Should show formatted JSON
    const jsonContent = screen.getByText(/"cid": "test-cid"/);
    expect(jsonContent).toBeInTheDocument();
  });

  it('should show stringified log when collapsed', () => {
    render(<LogRow {...defaultProps} isExpanded={false} />);

    // Should show stringified version
    const stringified = JSON.stringify(mockLog);
    expect(screen.getByText(stringified)).toBeInTheDocument();
  });

  it('should rotate caret when expanded', () => {
    const { rerender } = render(<LogRow {...defaultProps} isExpanded={false} />);

    let caret = screen.getByText('▶');
    expect(caret.className).not.toContain('caretRotated');

    rerender(<LogRow {...defaultProps} isExpanded={true} />);

    caret = screen.getByText('▶');
    expect(caret.className).toContain('caretRotated');
  });
});

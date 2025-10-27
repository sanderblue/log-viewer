type LogLevel = 'info' | 'error' | 'warn' | 'debug';

export interface LogEntry {
  _time: number; // Display format: ISO 8601
  cid: string;
  channel: string;
  level: LogLevel;
  message: string;
  context?: string;
  policy?: {
    args: string[];
    template: string[];
    description: string;
    title: string;
  };
  error?: {
    message: string;
    stack: string;
  };
  name?: string;
  cpuPerc?: number;
  mem?: {
    heap?: number;
    heapTotal?: number;
    ext?: number;
    rss?: number;
    buffers?: number;
  };
  [key: string]: any; // Account for additionl unknown fields just in case
}

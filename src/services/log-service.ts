import type { LogEntry } from '@/types/logs';

export interface StreamingOptions {
  onChunk: (logs: LogEntry[]) => void;
}

export class LogService {
  private readonly decoder = new TextDecoder();
  private buffer = '';

  private processChunk(chunk: string): LogEntry[] {
    const logs: LogEntry[] = [];

    // Append chunk to buffer
    this.buffer += chunk;

    // Split by newlines
    const lines = this.buffer.split('\n');

    // Keep the last incomplete line in the buffer
    this.buffer = lines[lines.length - 1];

    // Process all complete lines
    for (let i = 0; i < lines.length - 1; i++) {
      const log = this.parseLine(lines[i]);
      if (log) {
        logs.push(log);
      }
    }

    return logs;
  }

  private parseLine(line: string): LogEntry | null {
    if (!line.trim()) {
      return null;
    }

    try {
      return JSON.parse(line) as LogEntry;
    } catch (error) {
      console.warn('Failed to parse log line:', line, error);
      return null;
    }
  }

  async streamLogs(url: string, options: StreamingOptions): Promise<void> {
    const stream = await this.getLogsStream(url);
    const reader = stream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Process any remaining buffer data
          if (this.buffer.trim()) {
            const finalLog = this.parseLine(this.buffer);
            if (finalLog) {
              options.onChunk([finalLog]);
            }
            this.buffer = '';
          }
          break;
        }

        const chunk = this.decoder.decode(value, { stream: true });
        const logs = this.processChunk(chunk);

        if (logs.length > 0) {
          options.onChunk(logs);
        }
      }
    } catch (error) {
      console.error('Error streaming logs:', error);
      throw error;
    } finally {
      reader.releaseLock();
      this.buffer = ''; // Clear buffer on completion or error
    }
  }

  async getLogsStream(url: string): Promise<ReadableStream<Uint8Array>> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      return response.body;
    } catch (error) {
      console.error('Error streaming logs:', error);
      throw error;
    }
  }
}

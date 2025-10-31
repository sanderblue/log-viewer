import type { LogEntry } from '@/types/logs';

export interface StreamingOptions {
  onChunk: (logs: LogEntry[]) => void;
}

export class LogService {
  private readonly decoder = new TextDecoder();

  private processChunk(buffer: string, chunk: string): { logs: LogEntry[], newBuffer: string } {
    const logs: LogEntry[] = [];

    // Handle empty chunks
    if (!chunk) {
      return { logs, newBuffer: buffer };
    }

    // Append chunk to buffer
    let workingBuffer = buffer + chunk;

    // Split by newlines (handle both \n and \r\n)
    const lines = workingBuffer.split(/\r?\n/);

    // The last element is either:
    // - An empty string (if chunk ended with newline)
    // - A partial line (if chunk didn't end with newline)
    // Either way, keep it for the next chunk
    const newBuffer = lines[lines.length - 1];

    // Process all complete lines (everything except the last element)
    for (let i = 0; i < lines.length - 1; i++) {
      const log = this.parseLine(lines[i]);
      if (log) {
        logs.push(log);
      }
    }

    return { logs, newBuffer };
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

    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Process any remaining buffer data
          if (buffer.trim()) {
            const finalLog = this.parseLine(buffer);
            if (finalLog) {
              options.onChunk([finalLog]);
            }
          }
          break;
        }

        const chunk = this.decoder.decode(value, { stream: true });
        const { logs, newBuffer } = this.processChunk(buffer, chunk);
        buffer = newBuffer;

        if (logs.length > 0) {
          options.onChunk(logs);
        }
      }
    } catch (error) {
      console.error('Error streaming logs:', error);
      throw error;
    } finally {
      reader.releaseLock();
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

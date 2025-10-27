import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LogService } from './log-service';

describe('LogService', () => {
  let logService: LogService;


  beforeEach(() => {
    logService = new LogService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('streamLogs', () => {
    it('should stream logs from URL', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        body: {
          getReader: () => {
            const encoder = new TextEncoder();
            const chunks = [
              `{"_time":1234567890,"cid":"api","channel":"test","level":"info","message":"test1"}\n`,
              `{"_time":1234567891,"cid":"api","channel":"test2","level":"error","message":"test2"}\n`
            ];
            let index = 0;

            return {
              read: vi.fn().mockImplementation(() => {
                if (index < chunks.length) {
                  const chunk = encoder.encode(chunks[index]);
                  index++;
                  return Promise.resolve({ done: false, value: chunk, releaseLock: vi.fn() });
                }
                return Promise.resolve({ done: true, value: undefined, releaseLock: vi.fn() });
              }),
              releaseLock: vi.fn()
            };
          }
        }
      };

      // globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

      const logs = await logService.streamLogs('http://test.com/logs', {
        onChunk: vi.fn(),
      });

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].message).toBe('test1');
      expect(logs[1].message).toBe('test2');
    });
  });
});

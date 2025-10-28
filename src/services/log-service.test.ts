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

      const onChunk = vi.fn();
      await logService.streamLogs('http://test.com/logs', {
        onChunk,
      });

      expect(onChunk).toHaveBeenCalled();
      expect(onChunk).toHaveBeenCalledTimes(2);
      expect(onChunk.mock.calls[0][0][0].message).toBe('test1');
      expect(onChunk.mock.calls[1][0][0].message).toBe('test2');
    });
  });
});

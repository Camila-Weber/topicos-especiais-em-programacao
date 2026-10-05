import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let tempDir: string;
  let service: StorageService;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'ditado-storage-'));
    service = new StorageService({
      get: jest.fn((key: string, defaultValue: unknown) => {
        if (key === 'AUDIO_STORAGE_PATH') {
          return tempDir;
        }

        if (key === 'MAX_AUDIO_SIZE_MB') {
          return 25;
        }

        return defaultValue;
      }),
    } as unknown as ConfigService);
  });

  afterEach(async () => {
    await rm(tempDir, { force: true, recursive: true });
  });

  it('rejects missing files', async () => {
    await expect(service.saveAudio(undefined)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects unsupported types', async () => {
    await expect(
      service.saveAudio({
        originalname: 'nota.txt',
        mimetype: 'text/plain',
        size: 10,
        buffer: Buffer.from('x'),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects files bigger than configured limit', async () => {
    service = new StorageService({
      get: jest.fn((key: string, defaultValue: unknown) => {
        if (key === 'AUDIO_STORAGE_PATH') {
          return tempDir;
        }

        if (key === 'MAX_AUDIO_SIZE_MB') {
          return 0;
        }

        return defaultValue;
      }),
    } as unknown as ConfigService);

    await expect(
      service.saveAudio({
        originalname: 'audio.mp3',
        mimetype: 'audio/mpeg',
        size: 1,
        buffer: Buffer.from('x'),
      }),
    ).rejects.toBeInstanceOf(PayloadTooLargeException);
  });

  it('saves valid audio using a server generated name', async () => {
    const stored = await service.saveAudio({
      originalname: '../reuniao.mp3',
      mimetype: 'audio/mpeg',
      size: 5,
      buffer: Buffer.from('audio'),
    });

    expect(stored.originalFileName).toBe('..reuniao.mp3');
    expect(stored.storedFileName).toMatch(/^[0-9a-f-]+\.mp3$/);
    expect(await readFile(stored.path, 'utf8')).toBe('audio');
  });
});

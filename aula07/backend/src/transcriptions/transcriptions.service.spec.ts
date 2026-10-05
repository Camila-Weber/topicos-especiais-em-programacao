import { BadGatewayException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import { UploadedAudioFile } from '../storage/uploaded-audio-file';
import { GroqTranscriptionProvider } from './groq-transcription.provider';
import { Transcription } from './transcription.entity';
import { TranscriptionsService } from './transcriptions.service';

describe('TranscriptionsService', () => {
  const uploadedFile: UploadedAudioFile = {
    originalname: 'reuniao.mp3',
    mimetype: 'audio/mpeg',
    size: 10,
    buffer: Buffer.from('audio'),
  };
  const storedFile = {
    originalFileName: 'reuniao.mp3',
    storedFileName: 'server-file.mp3',
    mimeType: 'audio/mpeg',
    fileExtension: 'mp3',
    fileSize: 10,
    path: '/tmp/server-file.mp3',
  };

  function createService({ providerFails = false } = {}) {
    const repository = {
      create: jest.fn((data) => ({
        id: 'transcription-id',
        createdAt: new Date('2026-10-04T20:00:00.000Z'),
        ...data,
      })),
      save: jest.fn(async (entity) => entity),
    } as unknown as Repository<Transcription>;
    const storageService = {
      saveAudio: jest.fn().mockResolvedValue(storedFile),
      removeAudio: jest.fn().mockResolvedValue(undefined),
    } as unknown as StorageService;
    const provider = {
      transcribe: providerFails
        ? jest.fn().mockRejectedValue(
            new BadGatewayException({
              code: 'TRANSCRIPTION_PROVIDER_ERROR',
            }),
          )
        : jest.fn().mockResolvedValue('Texto transcrito.'),
    } as unknown as GroqTranscriptionProvider;

    return {
      service: new TranscriptionsService(repository, storageService, provider),
      repository,
      storageService,
      provider,
    };
  }

  it('creates a transcription associated with the authenticated user', async () => {
    const { service, repository, provider } = createService();

    const result = await service.create('user-id', uploadedFile, {
      language: 'pt',
    });

    expect(provider.transcribe).toHaveBeenCalledWith(storedFile, 'pt');
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-id',
        originalFileName: 'reuniao.mp3',
        storedFileName: 'server-file.mp3',
        text: 'Texto transcrito.',
      }),
    );
    expect(result).toMatchObject({
      id: 'transcription-id',
      originalFileName: 'reuniao.mp3',
      text: 'Texto transcrito.',
      audio: {
        streamUrl: '/api/transcriptions/transcription-id/audio',
        downloadUrl: '/api/transcriptions/transcription-id/audio/download',
      },
    });
    expect('storedFileName' in result).toBe(false);
  });

  it('removes saved audio when the provider fails', async () => {
    const { service, storageService, repository } = createService({
      providerFails: true,
    });

    await expect(
      service.create('user-id', uploadedFile, {
        language: 'pt',
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);
    expect(storageService.removeAudio).toHaveBeenCalledWith('server-file.mp3');
    expect(repository.save).not.toHaveBeenCalled();
  });
});

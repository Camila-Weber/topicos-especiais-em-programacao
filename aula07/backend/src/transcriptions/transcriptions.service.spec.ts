import { BadGatewayException, NotFoundException } from '@nestjs/common';
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

  function createService({
    providerFails = false,
    transcriptions = [] as Transcription[],
    detail = null as Transcription | null,
  } = {}) {
    const repository = {
      create: jest.fn((data) => ({
        id: 'transcription-id',
        createdAt: new Date('2026-10-04T20:00:00.000Z'),
        ...data,
      })),
      save: jest.fn(async (entity) => entity),
      find: jest.fn().mockResolvedValue(transcriptions),
      findOne: jest.fn().mockResolvedValue(detail),
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

  it('lists only authenticated user transcriptions ordered by newest first', async () => {
    const transcription = {
      id: 'transcription-id',
      userId: 'user-id',
      originalFileName: 'reuniao.mp3',
      storedFileName: 'server-file.mp3',
      mimeType: 'audio/mpeg',
      fileExtension: 'mp3',
      fileSize: 10,
      language: 'pt',
      text: 'Texto transcrito com muitas palavras para exibir uma previa no historico.',
      createdAt: new Date('2026-10-04T20:00:00.000Z'),
    } as Transcription;
    const { service, repository } = createService({
      transcriptions: [transcription],
    });

    const result = await service.listByUser('user-id');

    expect(repository.find).toHaveBeenCalledWith({
      where: { userId: 'user-id' },
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual([
      {
        id: 'transcription-id',
        originalFileName: 'reuniao.mp3',
        fileSize: 10,
        language: 'pt',
        textPreview: 'Texto transcrito com muitas palavras para exibir uma previa no historico.',
        createdAt: new Date('2026-10-04T20:00:00.000Z'),
      },
    ]);
    expect('storedFileName' in result[0]).toBe(false);
  });

  it('returns detail for an authenticated owner without exposing storedFileName', async () => {
    const transcription = {
      id: 'transcription-id',
      userId: 'user-id',
      originalFileName: 'reuniao.mp3',
      storedFileName: 'server-file.mp3',
      mimeType: 'audio/mpeg',
      fileExtension: 'mp3',
      fileSize: 10,
      language: 'pt',
      text: 'Texto completo.',
      createdAt: new Date('2026-10-04T20:00:00.000Z'),
    } as Transcription;
    const { service, repository } = createService({
      detail: transcription,
    });

    const result = await service.findOneForUser('user-id', 'transcription-id');

    expect(repository.findOne).toHaveBeenCalledWith({
      where: {
        id: 'transcription-id',
        userId: 'user-id',
      },
    });
    expect(result).toMatchObject({
      id: 'transcription-id',
      originalFileName: 'reuniao.mp3',
      text: 'Texto completo.',
      audio: {
        streamUrl: '/api/transcriptions/transcription-id/audio',
        downloadUrl: '/api/transcriptions/transcription-id/audio/download',
      },
    });
    expect('storedFileName' in result).toBe(false);
  });

  it('returns 404 when detail does not exist or belongs to another user', async () => {
    const { service } = createService();

    await expect(service.findOneForUser('user-id', 'missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

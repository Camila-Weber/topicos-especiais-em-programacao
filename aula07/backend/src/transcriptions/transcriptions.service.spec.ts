import { BadGatewayException, BadRequestException, NotFoundException } from '@nestjs/common';
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
    audio = null as Transcription | null,
  } = {}) {
    const queryBuilder = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([transcriptions, transcriptions.length]),
      getOne: jest.fn().mockResolvedValue(audio),
    };
    const repository = {
      create: jest.fn((data) => ({
        id: 'transcription-id',
        createdAt: new Date('2026-10-04T20:00:00.000Z'),
        ...data,
      })),
      save: jest.fn(async (entity) => entity),
      findOne: jest.fn().mockResolvedValue(detail),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      remove: jest.fn().mockResolvedValue(undefined),
    } as unknown as Repository<Transcription>;
    const storageService = {
      saveAudio: jest.fn().mockResolvedValue(storedFile),
      removeAudio: jest.fn().mockResolvedValue(undefined),
      getAudioFile: jest.fn().mockResolvedValue({
        path: '/tmp/server-file.mp3',
        size: 10,
      }),
      createReadStream: jest.fn(),
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
      queryBuilder,
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

  it('rejects unsupported transcription languages before saving audio', async () => {
    const { service, storageService, provider } = createService();

    await expect(
      service.create('user-id', uploadedFile, {
        language: 'jp',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(storageService.saveAudio).not.toHaveBeenCalled();
    expect(provider.transcribe).not.toHaveBeenCalled();
  });

  it('lists only authenticated user transcriptions ordered by newest first with pagination meta', async () => {
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
    const { service, repository, queryBuilder } = createService({
      transcriptions: [transcription],
    });

    const result = await service.listByUser('user-id');

    expect(repository.createQueryBuilder).toHaveBeenCalledWith('transcription');
    expect(queryBuilder.where).toHaveBeenCalledWith('transcription.userId = :userId', {
      userId: 'user-id',
    });
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('transcription.createdAt', 'DESC');
    expect(queryBuilder.skip).toHaveBeenCalledWith(0);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
    expect(result).toEqual({
      data: [
        {
          id: 'transcription-id',
          originalFileName: 'reuniao.mp3',
          fileSize: 10,
          language: 'pt',
          textPreview: 'Texto transcrito com muitas palavras para exibir uma previa no historico.',
          createdAt: new Date('2026-10-04T20:00:00.000Z'),
        },
      ],
      meta: {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
    expect('storedFileName' in result.data[0]).toBe(false);
  });

  it('applies search, language, date and pagination filters when listing history', async () => {
    const { service, queryBuilder } = createService();

    await service.listByUser('user-id', {
      page: '2',
      pageSize: '20',
      q: ' Reuniao ',
      language: 'pt',
      dateFrom: '2026-10-01',
      dateTo: '2026-10-05',
    });

    expect(queryBuilder.skip).toHaveBeenCalledWith(20);
    expect(queryBuilder.take).toHaveBeenCalledWith(20);
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      '(LOWER(transcription.originalFileName) LIKE :search OR LOWER(transcription.text) LIKE :search)',
      {
        search: '%reuniao%',
      },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('transcription.language = :language', {
      language: 'pt',
    });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('transcription.createdAt >= :dateFrom', {
      dateFrom: new Date('2026-10-01T00:00:00.000Z'),
    });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('transcription.createdAt <= :dateTo', {
      dateTo: new Date('2026-10-05T23:59:59.999Z'),
    });
  });

  it('rejects unsupported language filters when listing history', async () => {
    const { service, queryBuilder } = createService();

    await expect(
      service.listByUser('user-id', {
        language: 'jp',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(queryBuilder.getManyAndCount).not.toHaveBeenCalled();
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

  it('returns audio metadata for an authenticated owner', async () => {
    const transcription = {
      id: 'transcription-id',
      userId: 'user-id',
      originalFileName: 'reuniao.mp3',
      storedFileName: 'server-file.mp3',
      mimeType: 'audio/mpeg',
      fileSize: 10,
    } as Transcription;
    const { service, repository, storageService, queryBuilder } = createService({
      audio: transcription,
    });

    const result = await service.getAudioForUser('user-id', 'transcription-id');

    expect(repository.createQueryBuilder).toHaveBeenCalledWith('transcription');
    expect(queryBuilder.addSelect).toHaveBeenCalledWith('transcription.storedFileName');
    expect(queryBuilder.where).toHaveBeenCalledWith('transcription.id = :id', {
      id: 'transcription-id',
    });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('transcription.userId = :userId', {
      userId: 'user-id',
    });
    expect(storageService.getAudioFile).toHaveBeenCalledWith('server-file.mp3');
    expect(result).toEqual({
      storedFileName: 'server-file.mp3',
      originalFileName: 'reuniao.mp3',
      mimeType: 'audio/mpeg',
      fileSize: 10,
    });
  });

  it('returns 404 when audio does not exist or belongs to another user', async () => {
    const { service } = createService();

    await expect(service.getAudioForUser('user-id', 'missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('removes audio file and database record when deleting an owned transcription', async () => {
    const transcription = {
      id: 'transcription-id',
      userId: 'user-id',
      storedFileName: 'server-file.mp3',
    } as Transcription;
    const { service, repository, storageService, queryBuilder } = createService({
      audio: transcription,
    });

    await service.deleteForUser('user-id', 'transcription-id');

    expect(queryBuilder.where).toHaveBeenCalledWith('transcription.id = :id', {
      id: 'transcription-id',
    });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('transcription.userId = :userId', {
      userId: 'user-id',
    });
    expect(storageService.removeAudio).toHaveBeenCalledWith('server-file.mp3');
    expect(repository.remove).toHaveBeenCalledWith(transcription);
  });

  it('returns 404 when deleting a missing or foreign transcription', async () => {
    const { service } = createService();

    await expect(service.deleteForUser('user-id', 'missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import { UploadedAudioFile } from '../storage/uploaded-audio-file';
import { CreateTranscriptionDto } from './dto/create-transcription.dto';
import { GroqTranscriptionProvider } from './groq-transcription.provider';
import { isAllowedTranscriptionLanguage } from './transcription-languages';
import { Transcription } from './transcription.entity';
import { toTranscriptionListItem, toTranscriptionResponse } from './transcription-presenter';

export type ListTranscriptionsFilters = {
  page?: string | number;
  pageSize?: string | number;
  q?: string;
  language?: string;
  dateFrom?: string;
  dateTo?: string;
};

@Injectable()
export class TranscriptionsService {
  constructor(
    @InjectRepository(Transcription)
    private readonly transcriptionsRepository: Repository<Transcription>,
    private readonly storageService: StorageService,
    private readonly transcriptionProvider: GroqTranscriptionProvider,
  ) {}

  async create(userId: string, file: UploadedAudioFile | undefined, dto: CreateTranscriptionDto) {
    const language = normalizeLanguage(dto.language);
    const storedFile = await this.storageService.saveAudio(file);

    try {
      const text = await this.transcriptionProvider.transcribe(storedFile, language);
      const transcription = this.transcriptionsRepository.create({
        userId,
        originalFileName: storedFile.originalFileName,
        storedFileName: storedFile.storedFileName,
        mimeType: storedFile.mimeType,
        fileExtension: storedFile.fileExtension,
        fileSize: storedFile.fileSize,
        language,
        text,
      });

      const savedTranscription = await this.transcriptionsRepository.save(transcription);

      return toTranscriptionResponse(savedTranscription);
    } catch (error) {
      await this.storageService.removeAudio(storedFile.storedFileName);
      throw error;
    }
  }

  async listByUser(userId: string, filters: ListTranscriptionsFilters = {}) {
    const page = normalizePositiveInteger(filters.page, 1);
    const pageSize = Math.min(normalizePositiveInteger(filters.pageSize, 10), 50);
    const search = normalizeOptionalText(filters.q);
    const language = normalizeOptionalLanguage(filters.language);
    const dateFrom = normalizeOptionalDate(filters.dateFrom, false);
    const dateTo = normalizeOptionalDate(filters.dateTo, true);
    const queryBuilder = this.transcriptionsRepository
      .createQueryBuilder('transcription')
      .where('transcription.userId = :userId', { userId })
      .orderBy('transcription.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(transcription.originalFileName) LIKE :search OR LOWER(transcription.text) LIKE :search)',
        {
          search: `%${search.toLowerCase()}%`,
        },
      );
    }

    if (language) {
      queryBuilder.andWhere('transcription.language = :language', { language });
    }

    if (dateFrom) {
      queryBuilder.andWhere('transcription.createdAt >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('transcription.createdAt <= :dateTo', { dateTo });
    }

    const [transcriptions, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      data: transcriptions.map(toTranscriptionListItem),
      meta: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOneForUser(userId: string, id: string) {
    const transcription = await this.transcriptionsRepository.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!transcription) {
      throw new NotFoundException({
        statusCode: 404,
        code: 'TRANSCRIPTION_NOT_FOUND',
        message: 'Transcrição não encontrada.',
      });
    }

    return toTranscriptionResponse(transcription);
  }

  async getAudioForUser(userId: string, id: string) {
    const transcription = await this.transcriptionsRepository
      .createQueryBuilder('transcription')
      .addSelect('transcription.storedFileName')
      .where('transcription.id = :id', { id })
      .andWhere('transcription.userId = :userId', { userId })
      .getOne();

    if (!transcription) {
      throw new NotFoundException({
        statusCode: 404,
        code: 'AUDIO_NOT_FOUND',
        message: 'Áudio não encontrado.',
      });
    }

    try {
      const file = await this.storageService.getAudioFile(transcription.storedFileName);

      return {
        storedFileName: transcription.storedFileName,
        originalFileName: transcription.originalFileName,
        mimeType: transcription.mimeType,
        fileSize: file.size,
      };
    } catch {
      throw new NotFoundException({
        statusCode: 404,
        code: 'AUDIO_NOT_FOUND',
        message: 'Áudio não encontrado.',
      });
    }
  }

  createAudioStream(storedFileName: string, range?: { start: number; end: number }) {
    return this.storageService.createReadStream(storedFileName, range);
  }

  async deleteForUser(userId: string, id: string) {
    const transcription = await this.transcriptionsRepository
      .createQueryBuilder('transcription')
      .addSelect('transcription.storedFileName')
      .where('transcription.id = :id', { id })
      .andWhere('transcription.userId = :userId', { userId })
      .getOne();

    if (!transcription) {
      throw new NotFoundException({
        statusCode: 404,
        code: 'TRANSCRIPTION_NOT_FOUND',
        message: 'Transcrição não encontrada.',
      });
    }

    await this.storageService.removeAudio(transcription.storedFileName);
    await this.transcriptionsRepository.remove(transcription);
  }
}

function normalizeLanguage(language: string | undefined) {
  const normalizedLanguage = language || 'pt';

  if (!isAllowedTranscriptionLanguage(normalizedLanguage)) {
    throwInvalidLanguage();
  }

  return normalizedLanguage;
}

function normalizeOptionalLanguage(language: string | undefined) {
  const normalizedLanguage = normalizeOptionalText(language);

  if (!normalizedLanguage) {
    return '';
  }

  if (!isAllowedTranscriptionLanguage(normalizedLanguage)) {
    throwInvalidLanguage();
  }

  return normalizedLanguage;
}

function throwInvalidLanguage(): never {
  throw new BadRequestException({
    statusCode: 400,
    code: 'INVALID_LANGUAGE',
    message: 'Idioma não suportado.',
  });
}

function normalizePositiveInteger(value: string | number | undefined, fallback: number) {
  const parsedValue = typeof value === 'number' ? value : Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

function normalizeOptionalText(value: string | undefined) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function normalizeOptionalDate(value: string | undefined, endOfDay: boolean) {
  const normalizedValue = typeof value === 'string' ? value.trim() : '';

  if (!normalizedValue) {
    return null;
  }

  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)
    ? new Date(`${normalizedValue}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`)
    : new Date(normalizedValue);

  if (Number.isNaN(dateValue.getTime())) {
    throw new BadRequestException({
      statusCode: 400,
      code: 'INVALID_DATE_FILTER',
      message: 'Filtro de data inválido.',
    });
  }

  return dateValue;
}

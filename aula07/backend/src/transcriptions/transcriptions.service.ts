import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import { UploadedAudioFile } from '../storage/uploaded-audio-file';
import { CreateTranscriptionDto } from './dto/create-transcription.dto';
import { GroqTranscriptionProvider } from './groq-transcription.provider';
import { Transcription } from './transcription.entity';
import { toTranscriptionResponse } from './transcription-presenter';

@Injectable()
export class TranscriptionsService {
  constructor(
    @InjectRepository(Transcription)
    private readonly transcriptionsRepository: Repository<Transcription>,
    private readonly storageService: StorageService,
    private readonly transcriptionProvider: GroqTranscriptionProvider,
  ) {}

  async create(userId: string, file: UploadedAudioFile | undefined, dto: CreateTranscriptionDto) {
    const storedFile = await this.storageService.saveAudio(file);
    const language = dto.language || 'pt';

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
}

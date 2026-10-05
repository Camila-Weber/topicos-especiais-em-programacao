import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { Transcription } from './transcription.entity';
import { GroqTranscriptionProvider } from './groq-transcription.provider';
import { TranscriptionsController } from './transcriptions.controller';
import { TranscriptionsService } from './transcriptions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transcription]), AuthModule, StorageModule],
  controllers: [TranscriptionsController],
  providers: [TranscriptionsService, GroqTranscriptionProvider],
})
export class TranscriptionsModule {}

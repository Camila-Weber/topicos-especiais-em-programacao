import {
  BadRequestException,
  Injectable,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import {
  getNormalizedAudioExtension,
  isAllowedAudioExtension,
  isAllowedAudioMime,
} from './audio-validation';
import { StoredAudioFile } from './stored-audio-file';
import { UploadedAudioFile } from './uploaded-audio-file';

@Injectable()
export class StorageService {
  constructor(private readonly config: ConfigService) {}

  async saveAudio(file: UploadedAudioFile | undefined): Promise<StoredAudioFile> {
    this.validateAudio(file);

    const audioFile = file as UploadedAudioFile;
    const fileExtension = getNormalizedAudioExtension(audioFile.originalname);
    const storedFileName = `${randomUUID()}.${fileExtension}`;
    const storagePath = this.getStoragePath();
    const targetPath = join(storagePath, storedFileName);

    await mkdir(storagePath, { recursive: true });
    await writeFile(targetPath, audioFile.buffer);

    return {
      originalFileName: this.cleanOriginalName(audioFile.originalname),
      storedFileName,
      mimeType: audioFile.mimetype,
      fileExtension,
      fileSize: audioFile.size,
      path: targetPath,
    };
  }

  async removeAudio(storedFileName: string) {
    await rm(join(this.getStoragePath(), storedFileName), {
      force: true,
    });
  }

  async getAudioFile(storedFileName: string) {
    const filePath = join(this.getStoragePath(), storedFileName);
    const fileStat = await stat(filePath);

    return {
      path: filePath,
      size: fileStat.size,
    };
  }

  createReadStream(storedFileName: string, range?: { start: number; end: number }) {
    return createReadStream(join(this.getStoragePath(), storedFileName), range);
  }

  private validateAudio(file: UploadedAudioFile | undefined) {
    if (!file) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'FILE_REQUIRED',
        message: 'Selecione um arquivo de audio.',
      });
    }

    const maxAudioSizeMb = this.config.get<number>('MAX_AUDIO_SIZE_MB', 25);
    const maxAudioSizeBytes = maxAudioSizeMb * 1024 * 1024;

    if (file.size > maxAudioSizeBytes) {
      throw new PayloadTooLargeException({
        statusCode: 413,
        code: 'FILE_TOO_LARGE',
        message: `O arquivo ultrapassa o limite de ${maxAudioSizeMb} MB.`,
      });
    }

    const fileExtension = getNormalizedAudioExtension(file.originalname);

    if (!fileExtension || !isAllowedAudioExtension(fileExtension) || !isAllowedAudioMime(file.mimetype)) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'INVALID_AUDIO_TYPE',
        message: 'Formato de audio nao suportado.',
      });
    }
  }

  private getStoragePath() {
    return resolve(this.config.get<string>('AUDIO_STORAGE_PATH', './storage/audio'));
  }

  private cleanOriginalName(originalName: string) {
    return originalName.replace(/[/\\]/g, '').trim() || 'audio';
  }
}

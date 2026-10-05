import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'node:fs/promises';
import { StoredAudioFile } from '../storage/stored-audio-file';

@Injectable()
export class GroqTranscriptionProvider {
  constructor(private readonly config: ConfigService) {}

  async transcribe(file: StoredAudioFile, language: string): Promise<string> {
    const apiKey = this.config.get<string>('GROQ_API_KEY');

    if (!apiKey) {
      throw this.providerError();
    }

    try {
      const audioBuffer = await readFile(file.path);
      const formData = new FormData();
      formData.append('model', this.config.get<string>('GROQ_TRANSCRIPTION_MODEL', 'whisper-large-v3-turbo'));
      formData.append('language', language);
      formData.append('file', new Blob([audioBuffer], { type: file.mimeType }), file.originalFileName);

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw this.providerError();
      }

      const payload = (await response.json()) as { text?: string };

      if (!payload.text) {
        throw this.providerError();
      }

      return payload.text;
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      throw this.providerError();
    }
  }

  private providerError() {
    return new BadGatewayException({
      statusCode: 502,
      code: 'TRANSCRIPTION_PROVIDER_ERROR',
      message: 'Nao foi possivel transcrever o audio neste momento.',
    });
  }
}

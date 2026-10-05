import { Transcription } from './transcription.entity';

export function toTranscriptionResponse(transcription: Transcription) {
  return {
    id: transcription.id,
    originalFileName: transcription.originalFileName,
    mimeType: transcription.mimeType,
    fileSize: Number(transcription.fileSize),
    language: transcription.language,
    text: transcription.text,
    createdAt: transcription.createdAt,
    audio: {
      streamUrl: `/api/transcriptions/${transcription.id}/audio`,
      downloadUrl: `/api/transcriptions/${transcription.id}/audio/download`,
    },
  };
}

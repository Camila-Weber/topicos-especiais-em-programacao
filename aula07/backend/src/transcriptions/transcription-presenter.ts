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

export function toTranscriptionListItem(transcription: Transcription) {
  return {
    id: transcription.id,
    originalFileName: transcription.originalFileName,
    fileSize: Number(transcription.fileSize),
    language: transcription.language,
    textPreview: createTextPreview(transcription.text),
    createdAt: transcription.createdAt,
  };
}

function createTextPreview(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (normalized.length <= 120) {
    return normalized;
  }

  return `${normalized.slice(0, 117)}...`;
}

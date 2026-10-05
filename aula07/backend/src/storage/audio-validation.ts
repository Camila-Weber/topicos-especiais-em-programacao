import { extname } from 'node:path';

const allowedExtensions = new Set(['mp3', 'm4a', 'wav', 'ogg', 'webm', 'flac', 'mp4', 'mpeg']);
const allowedMimeTypes = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/m4a',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
  'audio/flac',
  'video/mp4',
]);

export function getNormalizedAudioExtension(originalName: string) {
  return extname(originalName).replace('.', '').toLowerCase();
}

export function isAllowedAudioExtension(extension: string) {
  return allowedExtensions.has(extension);
}

export function isAllowedAudioMime(mimeType: string) {
  return allowedMimeTypes.has(mimeType.toLowerCase());
}

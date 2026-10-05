export const allowedTranscriptionLanguages = ['pt', 'en', 'es', 'fr', 'de', 'it'] as const;

export type TranscriptionLanguage = (typeof allowedTranscriptionLanguages)[number];

export function isAllowedTranscriptionLanguage(language: string) {
  return allowedTranscriptionLanguages.includes(language as TranscriptionLanguage);
}

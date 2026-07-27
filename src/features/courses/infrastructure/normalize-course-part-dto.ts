import type { CoursePart, CoursePartMediaType } from '../domain/courses.data';

export type CoursePartMediaDto = Omit<CoursePart, 'mediaType' | 'mediaUrl' | 'videoUrl' | 'audioUrl'> & {
  mediaType?: string | null;
  type?: string | null;
  kind?: string | null;
  contentType?: string | null;
  mediaUrl?: string | null;
  sourceUrl?: string | null;
  fileUrl?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  voiceUrl?: string | null;
};

export function normalizeCoursePartDto(part: CoursePartMediaDto): CoursePart {
  const rawType = part.mediaType ?? part.type ?? part.kind ?? part.contentType ?? null;
  const mediaType = normalizeMediaType(rawType, part);
  const mediaUrl = part.mediaUrl ?? part.sourceUrl ?? part.fileUrl ?? null;
  const videoUrl = part.videoUrl ?? (mediaType === 'video' ? mediaUrl : null);
  const audioUrl = part.audioUrl ?? part.voiceUrl ?? (mediaType === 'audio' ? mediaUrl : null);

  return {
    ...part,
    mediaType,
    mediaUrl,
    videoUrl,
    audioUrl,
  };
}

function normalizeMediaType(
  rawType: string | null,
  part: Pick<CoursePartMediaDto, 'audioUrl' | 'voiceUrl' | 'videoUrl' | 'mediaUrl'>,
): CoursePartMediaType {
  const normalizedType = rawType?.toLowerCase();

  if (
    normalizedType === 'audio' ||
    normalizedType === 'voice' ||
    normalizedType === 'podcast' ||
    normalizedType?.startsWith('audio/') ||
    part.audioUrl ||
    part.voiceUrl
  ) {
    return 'audio';
  }

  return 'video';
}

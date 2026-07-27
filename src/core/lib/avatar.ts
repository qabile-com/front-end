export function getAvatarInitial(name?: string | null, fallback = '؟') {
  const trimmed = name?.trim();
  return trimmed ? (Array.from(trimmed)[0] ?? fallback) : fallback;
}

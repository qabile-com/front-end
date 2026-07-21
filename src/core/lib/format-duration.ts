/**
 * Converts a duration in seconds to a Persian‑formatted time string.
 * - Under 60 minutes: "mm:ss"
 * - 60 minutes and above: "h:mm:ss"
 */
export function formatDuration(totalSeconds: number | string): string {
  const hours = Math.floor(Number(totalSeconds) / 3600);
  const minutes = Math.floor((Number(totalSeconds) % 3600) / 60);
  const seconds = Number(totalSeconds) % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${minutes}:${pad(seconds)}`;
}

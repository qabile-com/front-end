import { ApiError } from './http-client';

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.message?.trim()) return error.message.trim();
  if (error instanceof Error && error.message?.trim()) return error.message.trim();
  return fallback;
}

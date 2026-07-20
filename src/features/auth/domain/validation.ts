export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidLoginId(value: string): boolean {
  return isValidEmail(value.trim());
}

export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export const OTP_LENGTH = 6;

export function isCompleteOtp(code: string): boolean {
  return new RegExp(`^\\d{${OTP_LENGTH}}$`).test(code);
}

export function isValidIranPhone(value: string): boolean {
  return /^09\d{9}$/.test(value.trim().replace(/\s/g, ''));
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidLoginId(value: string): boolean {
  const v = value.trim();
  return isValidIranPhone(v) || isValidEmail(v);
}

export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export const OTP_LENGTH = 6;

export function isCompleteOtp(code: string): boolean {
  return new RegExp(`^\\d{${OTP_LENGTH}}$`).test(code);
}

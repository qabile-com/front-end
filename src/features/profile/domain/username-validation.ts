export const USERNAME_MIN_LENGTH = 4;
export const USERNAME_MAX_LENGTH = 15;

export const USERNAME_REGEX = /^[A-Za-z0-9._]{4,15}$/;

export const USERNAME_VALIDATION_MESSAGE =
  'نام کاربری باید ۴ تا ۱۵ کاراکتر و فقط شامل حروف انگلیسی، عدد، نقطه یا _ باشد.';

export function normalizeUsernameInput(username: string) {
  return username.trim().replace(/^@+/, '');
}

export function isValidUsername(username: string) {
  return USERNAME_REGEX.test(username);
}

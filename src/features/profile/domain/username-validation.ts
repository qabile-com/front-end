export const USERNAME_REGEX = /^[A-Za-z0-9._]{4,80}$/;

export const USERNAME_VALIDATION_MESSAGE =
  'نام کاربری باید ۴ تا ۸۰ کاراکتر و فقط شامل حروف انگلیسی، عدد، نقطه یا _ باشد.';

export function normalizeUsernameInput(username: string) {
  return username.trim().replace(/^@+/, '');
}

export function isValidUsername(username: string) {
  return USERNAME_REGEX.test(username);
}

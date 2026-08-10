export type IdentityType = 'email' | 'uid' | 'wallet' | 'unknown';

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isValidUid = (value: string) => /^[0-9]{5,32}$/.test(value.trim());

export const isValidWalletAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value.trim());

export const isValidIdentity = (value: string) =>
  Boolean(value.trim());

export function getIdentityType(value: string): IdentityType {
  if (isValidEmail(value)) return 'email';
  if (isValidUid(value)) return 'uid';
  if (isValidWalletAddress(value)) return 'wallet';
  return 'unknown';
}

export function isValidExchangeReferralUrl(value: string) {
  return /^(https?:\/\/)?(www\.)?thetruetrade\.io\/r\/[A-Za-z0-9]+\/?$/.test(value.trim());
}

import { getStoredAuthSession, saveAuthSession } from './token';

export async function tryDevAutoLogin() {
  return createDevAuthSession();
}

export function createDevAuthSession() {
  if (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH !== 'true') {
    return false;
  }

  if (process.env.NEXT_PUBLIC_DEV_TOKEN) {
    if (getStoredAuthSession()) return true;

    saveAuthSession({
      accessToken: process.env.NEXT_PUBLIC_DEV_TOKEN,
      tokenType: 'Bearer',
      user: {
        id: 'dev-user',
        name: 'آرش کریمی',
        phone: null,
        email: null,
        role: process.env.NEXT_PUBLIC_DEV_ROLE ?? 'user',
      },
    });
    return true;
  }
  return false;
}

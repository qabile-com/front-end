import { setAccessToken } from './token';

export async function tryDevAutoLogin() {
  if (process.env.NEXT_PUBLIC_DEV_TOKEN) {
    setAccessToken(process.env.NEXT_PUBLIC_DEV_TOKEN);
    return true;
  }
  return false;
}

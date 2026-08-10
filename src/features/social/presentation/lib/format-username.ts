export function formatUsername(username?: string | null) {
  const clean = username?.trim().replace(/^@+/, '');
  return clean ? `@${clean}` : null;
}

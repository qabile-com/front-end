const TRUE_TRADE_REFERRAL_LINK_PATTERN =
  /(https?:\/\/)?(www\.)?thetruetrade\.io\/r\/[A-Za-z0-9]+(\/)?/gi;

export function rewriteTrueTradeReferralLinks(
  text: string | null | undefined,
  usedReferralCode: string | null | undefined,
): string | null | undefined {
  if (!text || !usedReferralCode) return text;

  return text.replace(
    TRUE_TRADE_REFERRAL_LINK_PATTERN,
    (_match, protocol = '', www = '', trailingSlash = '') =>
      `${protocol}${www}thetruetrade.io/r/${usedReferralCode}${trailingSlash}`,
  );
}

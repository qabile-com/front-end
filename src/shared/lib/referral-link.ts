// Matches thetruetrade.io/r/<code> links (with or without protocol/www/trailing slash),
// e.g. as embedded inside a larger course/episode description.
const TRUE_TRADE_REFERRAL_LINK_PATTERN =
  /(https?:\/\/)?(www\.)?thetruetrade\.io\/r\/[A-Za-z0-9]+(\/)?/gi;

// Rewrites any thetruetrade.io referral link in the text to use the current user's own
// used referral code, keeping the original protocol/www/trailing-slash exactly as written.
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

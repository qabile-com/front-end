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

export interface ExtractedReferralLink {
  text: string | null | undefined;
  link: string | null;
}

/**
 * Pulls the first TrueTrade referral link out of `text` (personalized with
 * usedReferralCode) so it can be rendered as its own copyable UI element,
 * instead of sitting inline inside the prose.
 */
export function extractTrueTradeReferralLink(
  text: string | null | undefined,
  usedReferralCode: string | null | undefined,
): ExtractedReferralLink {
  if (!text || !usedReferralCode) return { text, link: null };

  const pattern = new RegExp(TRUE_TRADE_REFERRAL_LINK_PATTERN.source, 'i');
  const match = pattern.exec(text);
  if (!match) return { text, link: null };

  const link = `https://thetruetrade.io/r/${usedReferralCode}`;
  const cleanedText = text.replace(match[0], '').replace(/[ \t]{2,}/g, ' ').trim();

  return { text: cleanedText, link };
}

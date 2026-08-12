const TRUE_TRADE_REFERRAL_LINK_PATTERN =
  /(https?:\/\/)?(www\.)?thetruetrade\.io\/r\/([A-Za-z0-9]+)(\/)?/gi;

export interface ExtractedReferralLink {
  text: string | null | undefined;
  link: string | null;
}

/**
 * Pulls the first TrueTrade referral link out of `text` so it can be rendered
 * as its own clickable/copyable UI element instead of sitting inline in the
 * prose. Personalizes it with usedReferralCode when the user has one;
 * otherwise keeps whichever code was already in the text unchanged.
 */
export function extractTrueTradeReferralLink(
  text: string | null | undefined,
  usedReferralCode: string | null | undefined,
): ExtractedReferralLink {
  if (!text) return { text, link: null };

  const pattern = new RegExp(TRUE_TRADE_REFERRAL_LINK_PATTERN.source, 'i');
  const match = pattern.exec(text);
  if (!match) return { text, link: null };

  const code = usedReferralCode || match[3];
  if (!code) return { text, link: null };

  const link = `https://thetruetrade.io/r/${code}`;
  const cleanedText = text.replace(match[0], '').replace(/[ \t]{2,}/g, ' ').trim();

  return { text: cleanedText, link };
}

/**
 * Countries whose visitors the site never identifies or profiles: all of Europe. Read by /api/v
 * (the visitor ledger). The same list as markszymanski.co's functions/_shared/no-track.ts and the
 * mjs.link Worker (AIOS state/VISITORS.md), so Mark's properties can never disagree; change all
 * three together.
 *
 * Why all of Europe and not just the EU, the EEA, and the UK, whose laws require a yes before
 * tracking: Mark's rule is "never Europe" (October 31, 2026, when he chose this over a consent
 * banner), and on November 5, 2026 he made it literal. Switzerland's regulator said in October
 * 2025 that profiling needs a real yes, Turkey's says the same, and the rest of non-EU Europe has
 * GDPR-style laws whose cookie rules nobody could pin down.
 */

export const NO_TRACK = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV",
  "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  "GF", "GP", "MQ", "RE", "YT", "MF", "AX",
  "IS", "LI", "NO",
  "GB", "GI", "JE", "GG", "IM",
  "CH", "TR", "AD", "MC", "SM", "VA", "AL", "BA", "ME", "MK", "RS", "XK", "MD", "UA", "BY", "RU",
  "GE", "AM", "AZ", "FO", "GL", "SJ",
]);

/** The visitor's country code from Cloudflare, upper case, "" when Cloudflare has none. */
export function countryOf(request: Request): string {
  return ((request as any).cf?.country || request.headers.get("CF-IPCountry") || "").toUpperCase();
}

/** true may track, false must not, null unknown (store nothing new, delete nothing). */
export function mayTrack(request: Request): boolean | null {
  const country = countryOf(request);
  return !country || country === "XX" || country === "T1" ? null : !NO_TRACK.has(country);
}

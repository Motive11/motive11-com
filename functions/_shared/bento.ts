// A copy of markszymanski.co's functions/_shared/bento.ts (same Bento account, Szymanski Media's).
// Fix a Bento quirk in both copies.
//
// Every subscriber carries exactly one audience: tag, builder or operator (Mark, October 5,
// 2026). Bento enforces "one per person" with a unique tag limit on the audience group, so adding
// one removes the other. audience:builder is the default for anyone who never said otherwise, so a
// form that subscribes someone without asking must still pass one here.
//
// Call subscribeToBento through context.waitUntil, after the form has its answer. Mark's rule
// (October 16, 2026): a form says thanks as soon as the submission is captured, and nothing that
// can wait holds it open. waitUntil keeps the Function alive about 30 seconds past the response,
// which is what the check below is sized to.

interface BentoEnv {
  BENTO_PUBLISHABLE_KEY: string;
  BENTO_SECRET_KEY: string;
  BENTO_SITE_UUID: string;
}

export const AUDIENCE_TAGS = ["audience:builder", "audience:operator"] as const;

const API = "https://app.bentonow.com/api/v1";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function bentoFetch(env: BentoEnv, path: string, init: RequestInit = {}): Promise<Response> {
  const sep = path.includes("?") ? "&" : "?";
  return fetch(`${API}${path}${sep}site_uuid=${env.BENTO_SITE_UUID}`, {
    ...init,
    headers: {
      Authorization: `Basic ${btoa(`${env.BENTO_PUBLISHABLE_KEY}:${env.BENTO_SECRET_KEY}`)}`,
      "Content-Type": "application/json",
      "User-Agent": "Motive11.com/1.0",
    },
  });
}

async function postTags(env: BentoEnv, email: string, tags: string[]): Promise<void> {
  const res = await bentoFetch(env, "/batch/subscribers", {
    method: "POST",
    body: JSON.stringify({ subscribers: [{ email, tags: tags.join(",") }] }),
  });
  if (!res.ok) console.error("Bento tag error:", res.status, await res.text());
}

async function hasTag(env: BentoEnv, email: string, tag: string): Promise<boolean> {
  const [subRes, tagRes] = await Promise.all([
    bentoFetch(env, `/fetch/subscribers?email=${encodeURIComponent(email)}`),
    bentoFetch(env, "/fetch/tags"),
  ]);
  if (!subRes.ok || !tagRes.ok) return false;
  const sub = await subRes.json<{ data?: { attributes?: { cached_tag_ids?: (string | number)[] } } }>();
  const all = await tagRes.json<{ data?: { id: string | number; attributes?: { name?: string } }[] }>();
  const id = all.data?.find((t) => t.attributes?.name === tag)?.id;
  return id != null && (sub.data?.attributes?.cached_tag_ids ?? []).map(String).includes(String(id));
}

/**
 * Subscribe (or update) someone in Bento: the optional event, then the tags, then confirm the
 * audience tag actually stuck and re-send it if not. Never throws.
 *
 * The check exists because on October 14, 2026 Bento accepted one request carrying a magnet tag and
 * audience:builder, kept the magnet tag, and silently dropped the audience tag. It was 1 of about
 * 60 opt-ins that week, so it is intermittent on Bento's side, and its imports are queued, so the
 * HTTP answer cannot tell us whether the tags landed. Only reading the subscriber back can.
 */
export async function subscribeToBento(
  env: BentoEnv,
  opts: { email: string; tags: string[]; event?: string; fields?: Record<string, string> },
): Promise<void> {
  const { email, tags, event, fields = {} } = opts;
  if (!env.BENTO_PUBLISHABLE_KEY || !env.BENTO_SECRET_KEY || !env.BENTO_SITE_UUID) return;
  try {
    if (event) {
      const res = await bentoFetch(env, "/batch/events", {
        method: "POST",
        body: JSON.stringify({ events: [{ type: event, email, fields }] }),
      });
      if (!res.ok) console.error("Bento event error:", res.status, await res.text());
    }
    await postTags(env, email, tags);

    const audience = tags.find((t) => (AUDIENCE_TAGS as readonly string[]).includes(t));
    if (!audience) return;
    for (const wait of [8000, 10000]) {
      await sleep(wait);
      if (await hasTag(env, email, audience)) return;
      console.warn(`Bento: ${audience} missing for a new subscriber, re-sending`);
      await postTags(env, email, tags);
    }
  } catch (err) {
    console.error("Bento (non-fatal):", err);
  }
}

/**
 * One visitor ID across markszymanski.co and motive11.com (AIOS state/VISITORS.md, "One visitor
 * across both sites"). A browser can't share a cookie between two domains, so a link from one site
 * to the other carries a one-time pass (?vh=) that the landing site trades for the same ID. Used by
 * functions/api/v.ts. IDENTICAL on both sites: change both copies together.
 *
 * Why a pass and never the ID itself: a URL gets copied and shared, and an ID in it would turn
 * whoever opened the shared link into the same person. A pass works once, only within TTL_MIN, only
 * for the browser that asked for it (same IP and User-Agent, stored as a hash salted with the pass,
 * never raw), and the page takes it out of the address bar on arrival. The browser check is what
 * stops a forwarded or forged pass from merging two people; a real click between the sites is the
 * same browser seconds later. Private Relay can give the two sites different IPs, and then the pass
 * is simply refused: two rows, never a wrong merge.
 */

export const HANDOFF_RE = /^[0-9a-f]{32}$/;
const TTL_MIN = 30;

const hex = (b: ArrayBuffer | Uint8Array) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join("");

async function browserHash(token: string, request: Request): Promise<string> {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const ua = request.headers.get("User-Agent") || "";
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${token}|${ip}|${ua}`)));
}

export async function mintHandoff(db: D1Database, visitorId: string, request: Request): Promise<{ token: string; stmt: D1PreparedStatement }> {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  const token = hex(b);
  const fp = await browserHash(token, request);
  return { token, stmt: db.prepare("INSERT INTO visitor_handoffs (token, visitor_id, fp) VALUES (?, ?, ?)").bind(token, visitorId, fp) };
}

type Row = {
  id: string; email: string | null; identified_at: string | null; identified_via: string | null; first_seen: string;
  alive: number | null; webdriver: number | null;
};

/**
 * The ID this browser should carry from now on, plus the writes that fold its old ID into it.
 * Null when the pass is unknown, used, expired, or from another browser, so the caller carries on
 * exactly as before.
 * Two IDs that each have a different email stay apart: those are two people, whatever the link says.
 */
export async function redeemHandoff(
  db: D1Database,
  token: string,
  current: string | null,
  request: Request,
): Promise<{ id: string; stmts: D1PreparedStatement[] } | null> {
  const hit = await db
    .prepare(`SELECT visitor_id FROM visitor_handoffs WHERE token = ? AND fp = ? AND used_at IS NULL AND created_at > datetime('now', '-${TTL_MIN} minutes')`)
    .bind(token, await browserHash(token, request))
    .first<{ visitor_id: string }>();
  if (!hit) return null;
  const target = hit.visitor_id;
  const used = db.prepare("UPDATE visitor_handoffs SET used_at = datetime('now') WHERE token = ? AND used_at IS NULL").bind(token);
  if (!current) return { id: target, stmts: [used] };
  if (current === target) return { id: target, stmts: [used] };

  const { results } = await db
    .prepare("SELECT id, email, identified_at, identified_via, first_seen, alive, webdriver FROM visitors WHERE id IN (?, ?)")
    .bind(current, target)
    .all<Row>();
  const cur = results.find((r) => r.id === current);
  const tgt = results.find((r) => r.id === target);
  // The other site's row was swept since the pass was made: nothing to join, keep this browser's own.
  if (!tgt) return { id: current, stmts: [used] };
  if (!cur) return { id: target, stmts: [used] };
  if (cur.email && tgt.email && cur.email !== tgt.email) return { id: current, stmts: [used] };

  const stmts = [
    used,
    db.prepare("UPDATE visitor_events SET visitor_id = ? WHERE visitor_id = ?").bind(target, current),
    db.prepare(
      "UPDATE visitors SET first_seen = min(first_seen, ?), alive = max(coalesce(alive, 0), ?), webdriver = max(coalesce(webdriver, 0), ?) WHERE id = ?"
    ).bind(cur.first_seen, cur.alive || 0, cur.webdriver || 0, target),
  ];
  // A Stripe-matched email ('mbs-join') is never replaced by a form's (v.ts on both sites), so
  // when the folded-in row carries that proof it comes along with the email.
  if (cur.email && (!tgt.email || (cur.identified_via === "mbs-join" && tgt.identified_via !== "mbs-join"))) {
    stmts.push(
      db.prepare("UPDATE visitors SET email = ?, identified_at = ?, identified_via = ? WHERE id = ?")
        .bind(cur.email, cur.identified_at, cur.identified_via, target),
    );
  }
  stmts.push(db.prepare("DELETE FROM visitors WHERE id = ?").bind(current));
  return { id: target, stmts };
}

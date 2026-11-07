// Reads the AIOS testimonials API at build time, the same source markszymanski.co uses, so a quote
// is edited in one place. A failed fetch returns null and the page builds without the quote.
const TESTIMONIALS_API_URL = "https://testimonials.markszymanski.co";

export interface Testimonial {
  id: string;
  title: string | null;
  text: string;
  customer_name: string;
  customer_avatar: string | null;
  customer_tagline: string | null;
  customer_company: string | null;
}

export async function fetchTestimonial(id: string): Promise<Testimonial | null> {
  try {
    const res = await fetch(`${TESTIMONIALS_API_URL}/testimonials/${id}`);
    if (!res.ok) {
      if (res.status !== 404) console.error(`[testimonials] ${id} failed ${res.status}`);
      return null;
    }
    const json = (await res.json()) as { testimonial?: Testimonial };
    return json.testimonial ?? null;
  } catch (err) {
    console.error(`[testimonials] ${id} unreachable`, err);
    return null;
  }
}

export async function fetchTestimonials(options: {
  tags?: string[];
  type?: "text" | "video";
  sort?: "date" | "rating";
  order?: "asc" | "desc";
  limit?: number;
} = {}): Promise<(Testimonial & Record<string, unknown>)[]> {
  const params = new URLSearchParams({ approved: "true" });
  if (options.sort) params.set("sort", options.sort);
  if (options.order) params.set("order", options.order);
  if (options.limit) params.set("limit", String(options.limit));
  if (options.type) params.set("type", options.type);
  for (const tag of options.tags ?? []) params.append("tags", tag);
  try {
    const res = await fetch(`${TESTIMONIALS_API_URL}/testimonials?${params}`);
    if (!res.ok) {
      console.error(`[testimonials] list failed ${res.status}`);
      return [];
    }
    const json = (await res.json()) as { testimonials?: (Testimonial & Record<string, unknown>)[] };
    return json.testimonials ?? [];
  } catch (err) {
    console.error("[testimonials] list unreachable", err);
    return [];
  }
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Paragraphs as HTML: everything escaped except the <mark> highlight the API carries (set in AIOS with
// state/testimonial_highlight.py, which guarantees a highlight never changes a word).
export function quoteParagraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .map((p) =>
      escapeHtml(p.replace(/\s+/g, " ").trim())
        .replace(/&lt;mark&gt;/g, "<mark>")
        .replace(/&lt;\/mark&gt;/g, "</mark>"),
    )
    .filter(Boolean);
}

export function initials(name: string): string {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

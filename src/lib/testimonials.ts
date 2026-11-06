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

// The API keeps highlight markup (<mark>) inside the text; this site shows quotes without it.
export function quoteParagraphs(text: string): string[] {
  return text
    .replace(/<\/?mark>/g, "")
    .split(/\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function initials(name: string): string {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

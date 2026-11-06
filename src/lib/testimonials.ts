// Reads the AIOS testimonials API at build time, the same source markszymanski.co uses, so a quote
// is edited in one place. A failed fetch returns null and the page builds without the quote.
const TESTIMONIALS_API_URL = "https://testimonials.markszymanski.co";

export interface Testimonial {
  id: string;
  title: string | null;
  text: string;
  customer_name: string;
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

// The API keeps highlight markup (<mark>) inside the text; this site shows quotes plain.
export function plainQuote(text: string): string {
  return text.replace(/<\/?mark>/g, "").replace(/\s+/g, " ").trim();
}

// What each offer is lives in AIOS entities/motive11/context/offers/. Prices are left off this site on
// purpose: they live on markszymanski.co (src/lib/pricing.ts there), and a second copy would drift.
export interface Offer {
  id: string;
  name: string;
  short: string;
  forWho: string;
  includes: string[];
  starts: string;
  cta: { label: string; href: string };
  featured?: boolean;
}

export const offers: Offer[] = [
  {
    id: "partnership",
    name: "Partnership",
    short: "I run your website, your systems, and your AI, and every month I work on more revenue or a more organized team.",
    forWho: "Established firms with staff, where the owner wants one person accountable for the website, the systems, and the AI.",
    includes: [
      "Your website, hosted and kept running",
      "Custom tools and automations built as the business needs them",
      "Your AI set up around how the company actually works",
      "One number I set at kickoff to prove it's working, measured every month",
    ],
    starts: "A 20-minute intro call. If it's a fit, kickoff is where I learn the business and tell you what I'd fix first and why.",
    cta: { label: "Book an intro call", href: "/book/intro" },
    featured: true,
  },
  {
    id: "ai-onboarding-day",
    name: "AI Onboarding Day",
    short: "One day and your AI actually knows your business: your context written down, your tools connected, and you and your team trained to use it.",
    forWho: "Owners already using ChatGPT or Claude who know it could be doing a lot more and would rather have it set up right than figure it out alone.",
    includes: [
      "An interview about how the business really works",
      "That knowledge written down where your AI can use it",
      "Your AI connected to the tools you already use",
      "Training for you and anyone on the team who joins",
    ],
    starts: "Paid up front, scheduled as one day. It stands on its own, and it's the natural first step toward a Partnership.",
    cta: { label: "See the day", href: "https://markszymanski.co/ai-onboarding-day" },
  },
  {
    id: "websites",
    name: "Website + Care",
    short: "A fast, modern website built for what you actually sell, then hosted and kept running so you never touch the technical side.",
    forWho: "Firms whose website undersells them or can't be updated, and owners who are done wrestling with WordPress.",
    includes: [
      "Strategy and copy built around what you sell",
      "Design and build, with no plugins to babysit",
      "Lead forms that reach the right person",
      "Care: hosting, updates, and changes when you need them",
    ],
    starts: "An intro call, then a fixed quote based on what the site needs to do.",
    cta: { label: "Book an intro call", href: "/book/intro" },
  },
  {
    id: "custom-software",
    name: "Custom software",
    short: "One specific tool your team uses every day, like a client portal or a proposal system, built around how your people already work.",
    forWho: "A team with one job that eats the week: proposals, research, intake, scheduling, or anything still living in a spreadsheet.",
    includes: [
      "Discovery with the people who do the work",
      "A clickable prototype before anything is built",
      "The tool, built and running on your accounts",
      "Changes as your team starts using it",
    ],
    starts: "An intro call, then a prototype you can click through before you commit.",
    cta: { label: "Book an intro call", href: "/book/intro" },
  },
];

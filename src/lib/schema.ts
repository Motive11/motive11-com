import { site } from "./site";

const orgId = `${site.url}/#organization`;
const personId = `${site.url}/#founder`;
const websiteId = `${site.url}/#website`;

export function baseGraph() {
  return [
    {
      "@type": "Organization",
      "@id": orgId,
      name: site.name,
      legalName: site.legalName,
      url: site.url,
      logo: `${site.url}/images/icon-512.png`,
      foundingDate: site.founded,
      founder: { "@id": personId },
      address: { "@type": "PostalAddress", addressLocality: site.city, addressRegion: site.region, addressCountry: "US" },
    },
    {
      "@type": "Person",
      "@id": personId,
      name: site.founder.name,
      url: site.founder.url,
      worksFor: { "@id": orgId },
    },
    { "@type": "WebSite", "@id": websiteId, url: site.url, name: site.name, publisher: { "@id": orgId } },
  ];
}

export function webPage(url: string, title: string, description: string) {
  return { "@type": "WebPage", "@id": `${url}#webpage`, url, name: title, description, isPartOf: { "@id": websiteId } };
}

export function breadcrumb(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: item.url })),
  };
}

export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": [...baseGraph(), ...nodes] };
}

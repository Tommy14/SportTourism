import { db } from "./db";

let hasLoggedDbFallback = false;

export async function getSiteContent() {
  try {
    const [settings, sections, topicTiles, packages, faqs, testimonials, gallerySections] = await Promise.all([
      db.siteSettings.findUnique({ where: { id: 1 } }),
      db.sectionContent.findMany({ orderBy: { key: "asc" } }),
      db.topicTile.findMany({ orderBy: [{ groupKey: "asc" }, { sortOrder: "asc" }] }),
      db.package.findMany({ orderBy: { sortOrder: "asc" } }),
      db.faqItem.findMany({ orderBy: { sortOrder: "asc" } }),
      db.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
      db.gallerySection.findMany({ orderBy: { sortOrder: "asc" }, include: { items: { orderBy: { sortOrder: "asc" } } } })
    ]);

    return { settings, sections, topicTiles, packages, faqs, testimonials, gallerySections };
  } catch {
    if (!hasLoggedDbFallback) {
      hasLoggedDbFallback = true;
      console.warn("Database unavailable. Using static fallback content.");
    }
    return {
      settings: null,
      sections: [],
      topicTiles: [],
      packages: [],
      faqs: [],
      testimonials: [],
      gallerySections: []
    };
  }
}

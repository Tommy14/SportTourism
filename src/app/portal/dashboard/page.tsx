import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminDashboard } from "@/components/sections/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();
  if (!session) redirect("/portal/login");

  const [packages, faqs, testimonials, gallerySections, settings, sections, topicTiles] = await Promise.all([
    db.package.findMany({ orderBy: { sortOrder: "asc" } }),
    db.faqItem.findMany({ orderBy: { sortOrder: "asc" } }),
    db.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
    db.gallerySection.findMany({ orderBy: { sortOrder: "asc" }, include: { items: { orderBy: { sortOrder: "asc" } } } }),
    db.siteSettings.findUnique({ where: { id: 1 } }),
    db.sectionContent.findMany({ orderBy: { key: "asc" } }),
    db.topicTile.findMany({ orderBy: [{ groupKey: "asc" }, { sortOrder: "asc" }] })
  ]);

  const tileGroups = {
    "what-we-do":        topicTiles.filter((t) => t.groupKey === "what-we-do"),
    "what-we-have-done": topicTiles.filter((t) => t.groupKey === "what-we-have-done"),
    "where-play":        topicTiles.filter((t) => t.groupKey === "where-play")
  };

  return (
    <AdminDashboard
      username={session.username}
      brandName={settings?.brandName ?? "Pitch to Paradise"}
      packages={packages as never[]}
      faqs={faqs as never[]}
      testimonials={testimonials as never[]}
      gallerySections={gallerySections as never[]}
      settings={settings as never}
      sections={sections as never[]}
      tileGroups={tileGroups as never}
    />
  );
}

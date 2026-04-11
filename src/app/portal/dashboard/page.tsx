import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminEditor } from "@/components/sections/AdminEditor";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();
  if (!session) redirect("/portal/login");

  const [packages, faqs, testimonials, gallery, settings] = await Promise.all([
    db.package.findMany({ orderBy: { sortOrder: "asc" } }),
    db.faqItem.findMany({ orderBy: { sortOrder: "asc" } }),
    db.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
    db.galleryItem.findMany({ orderBy: { sortOrder: "asc" } }),
    db.siteSettings.findUnique({ where: { id: 1 } })
  ]);

  return (
    <main className="min-h-screen bg-ink pb-16">
      <div className="section-shell py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Portal Dashboard</h1>
          <form action="/api/admin/logout" method="post">
            <button className="ghost-button" type="submit">
              Logout
            </button>
          </form>
        </div>
        <div className="space-y-6">
          <AdminEditor title="Packages" type="package" items={packages as never[]} />
          <AdminEditor title="FAQs" type="faq" items={faqs as never[]} />
          <AdminEditor title="Testimonials" type="testimonial" items={testimonials as never[]} />
          <AdminEditor title="Gallery" type="gallery" items={gallery as never[]} />
          {settings && <AdminEditor title="Site Settings" type="settings" items={[settings] as never[]} />}
        </div>
      </div>
    </main>
  );
}

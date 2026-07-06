/**
 * One-time migration: download Supabase-hosted images and store them in MediaFile.
 *
 * Usage:
 *   node scripts/migrate-supabase-images.mjs --dry-run
 *   node scripts/migrate-supabase-images.mjs
 *
 * Requires DATABASE_URL. Optionally set SUPABASE_URL to narrow host matching.
 */

import { PrismaClient } from "@prisma/client";

const dryRun = process.argv.includes("--dry-run");
const db = new PrismaClient();

function isSupabaseUrl(url, supabaseHost) {
  if (!url || typeof url !== "string") return false;
  if (url.startsWith("/api/media/")) return false;
  try {
    const parsed = new URL(url);
    if (supabaseHost && parsed.hostname === supabaseHost) return true;
    return parsed.hostname.endsWith(".supabase.co") && parsed.pathname.includes("/storage/");
  } catch {
    return false;
  }
}

function filenameFromUrl(url) {
  try {
    const parts = new URL(url).pathname.split("/");
    const last = parts[parts.length - 1];
    return last && last.includes(".") ? last : `image-${Date.now()}.jpg`;
  } catch {
    return `image-${Date.now()}.jpg`;
  }
}

function mimeFromContentType(contentType, filename) {
  if (contentType && contentType.startsWith("image/")) {
    return contentType.split(";")[0].trim();
  }
  const ext = filename.split(".").pop()?.toLowerCase();
  const map = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    avif: "image/avif",
    svg: "image/svg+xml"
  };
  return map[ext] ?? "image/jpeg";
}

async function collectImageUrls() {
  const [sections, packages, galleryItems, testimonials, topicTiles] = await Promise.all([
    db.sectionContent.findMany({ select: { id: true, imageUrl: true } }),
    db.package.findMany({ select: { id: true, imageUrl: true } }),
    db.galleryItem.findMany({ select: { id: true, imageUrl: true } }),
    db.testimonial.findMany({ select: { id: true, imageUrl: true } }),
    db.topicTile.findMany({ select: { id: true, imageUrl: true } })
  ]);

  const refs = [];
  for (const row of sections) {
    if (row.imageUrl) refs.push({ table: "sectionContent", id: row.id, imageUrl: row.imageUrl });
  }
  for (const row of packages) {
    if (row.imageUrl) refs.push({ table: "package", id: row.id, imageUrl: row.imageUrl });
  }
  for (const row of galleryItems) {
    if (row.imageUrl) refs.push({ table: "galleryItem", id: row.id, imageUrl: row.imageUrl });
  }
  for (const row of testimonials) {
    if (row.imageUrl) refs.push({ table: "testimonial", id: row.id, imageUrl: row.imageUrl });
  }
  for (const row of topicTiles) {
    if (row.imageUrl) refs.push({ table: "topicTile", id: row.id, imageUrl: row.imageUrl });
  }
  return refs;
}

async function updateReference(table, id, newUrl) {
  if (dryRun) return;
  switch (table) {
    case "sectionContent":
      await db.sectionContent.update({ where: { id }, data: { imageUrl: newUrl } });
      break;
    case "package":
      await db.package.update({ where: { id }, data: { imageUrl: newUrl } });
      break;
    case "galleryItem":
      await db.galleryItem.update({ where: { id }, data: { imageUrl: newUrl } });
      break;
    case "testimonial":
      await db.testimonial.update({ where: { id }, data: { imageUrl: newUrl } });
      break;
    case "topicTile":
      await db.topicTile.update({ where: { id }, data: { imageUrl: newUrl } });
      break;
    default:
      throw new Error(`Unknown table: ${table}`);
  }
}

async function migrateUrl(oldUrl, urlMap) {
  if (urlMap.has(oldUrl)) return urlMap.get(oldUrl);

  const filename = filenameFromUrl(oldUrl);
  console.log(`  Fetching: ${oldUrl}`);

  if (dryRun) {
    const fakeUrl = `/api/media/dry-run-${urlMap.size + 1}`;
    urlMap.set(oldUrl, fakeUrl);
    return fakeUrl;
  }

  const response = await fetch(oldUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${oldUrl}`);
  }

  const bytes = await response.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const mimeType = mimeFromContentType(response.headers.get("content-type"), filename);

  const media = await db.mediaFile.create({
    data: {
      filename,
      url: "pending",
      mimeType,
      size: buffer.length,
      data: buffer
    }
  });

  const newUrl = `/api/media/${media.id}`;
  await db.mediaFile.update({ where: { id: media.id }, data: { url: newUrl } });
  urlMap.set(oldUrl, newUrl);
  return newUrl;
}

async function main() {
  let supabaseHost = "";
  if (process.env.SUPABASE_URL) {
    try {
      supabaseHost = new URL(process.env.SUPABASE_URL).hostname;
    } catch {
      console.warn("Invalid SUPABASE_URL — matching any *.supabase.co/storage URL");
    }
  }

  console.log(dryRun ? "DRY RUN — no writes" : "Migrating Supabase images to Postgres MediaFile");

  const refs = await collectImageUrls();
  const supabaseRefs = refs.filter((r) => isSupabaseUrl(r.imageUrl, supabaseHost));
  const uniqueUrls = [...new Set(supabaseRefs.map((r) => r.imageUrl))];

  const skipped = refs.length - supabaseRefs.length;
  console.log(`Found ${refs.length} image references, ${uniqueUrls.length} unique Supabase URLs, ${skipped} skipped (external or already migrated)`);

  if (uniqueUrls.length === 0) {
    console.log("Nothing to migrate.");
    return;
  }

  const urlMap = new Map();
  let migrated = 0;
  let failed = 0;

  for (const oldUrl of uniqueUrls) {
    try {
      await migrateUrl(oldUrl, urlMap);
      migrated++;
      console.log(`  OK: ${oldUrl} → ${urlMap.get(oldUrl)}`);
    } catch (err) {
      failed++;
      console.error(`  FAIL: ${oldUrl} — ${err instanceof Error ? err.message : err}`);
    }
  }

  let updatedRefs = 0;
  for (const ref of supabaseRefs) {
    const newUrl = urlMap.get(ref.imageUrl);
    if (!newUrl) continue;
    await updateReference(ref.table, ref.id, newUrl);
    updatedRefs++;
  }

  console.log("\nSummary:");
  console.log(`  Migrated URLs: ${migrated}`);
  console.log(`  Failed URLs:   ${failed}`);
  console.log(`  Updated refs:  ${updatedRefs}`);
  if (dryRun) console.log("  (dry run — no database changes were made)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

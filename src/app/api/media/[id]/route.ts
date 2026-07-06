import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const media = await db.mediaFile.findUnique({
    where: { id },
    select: { data: true, mimeType: true, url: true }
  });

  if (!media) {
    return new Response("Not found", { status: 404 });
  }

  if (media.data) {
    return new Response(media.data, {
      headers: {
        "Content-Type": media.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  }

  if (media.url.startsWith("http")) {
    return Response.redirect(media.url);
  }

  return new Response("Not found", { status: 404 });
}

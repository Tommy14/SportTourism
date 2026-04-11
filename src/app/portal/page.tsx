import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PortalIndexPage() {
  const session = await requireSession();
  redirect(session ? "/portal/dashboard" : "/portal/login");
}

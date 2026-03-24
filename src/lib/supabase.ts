import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

export async function uploadImage(file: File, folder = "site") {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabaseAdmin.storage.from(env.SUPABASE_BUCKET).upload(path, file, {
    upsert: false
  });
  if (error) throw new Error(error.message);
  const { data } = supabaseAdmin.storage.from(env.SUPABASE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

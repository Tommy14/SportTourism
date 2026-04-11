/** @type {import('next').NextConfig} */

function supabaseStoragePatterns() {
  const raw = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return [];
  try {
    const { hostname, protocol } = new URL(raw);
    if (protocol !== "https:" || !hostname) return [];
    return [
      {
        protocol: "https",
        hostname,
        port: "",
        pathname: "/storage/**"
      }
    ];
  } catch {
    return [];
  }
}

const nextConfig = {
  images: {
    remotePatterns: [
      ...supabaseStoragePatterns(),
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/**"
      },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" }
    ]
  }
};

export default nextConfig;

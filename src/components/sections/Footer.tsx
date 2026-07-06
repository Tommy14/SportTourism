export function Footer({
  brandName,
  phone,
  email,
  address
}: {
  brandName: string;
  phone: string;
  email: string;
  address: string;
}) {
  return (
    <footer className="snap-section border-t border-white/10 bg-[#060a0c]">
      <div className="snap-section-inner section-shell py-4 md:py-6">
        {/* Top banner */}
        <div className="mb-10 flex flex-col items-start justify-between gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end">
          <div>
            <span className="badge-chip mb-4">Ready to Play in Sri Lanka?</span>
            <h3 className="max-w-xl text-3xl font-bold leading-tight md:text-4xl">
              Your Cricket Adventure Starts Here
            </h3>
          </div>
          <a href="#contact" className="pill-button shrink-0 text-sm">
            Plan Your Tour
          </a>
        </div>

        {/* Columns */}
        <div className="grid gap-8 text-sm text-white/70 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <img src="/logo.png" alt="Pitch to Paradise" className="h-7 w-7 rounded" />
              <p className="font-semibold text-accent">{brandName}</p>
            </div>
            <p className="leading-relaxed">
              Cricket tours, training camps, international fixtures and sightseeing in Sri Lanka — fully arranged for your team.
            </p>
          </div>

          <div>
            <p className="mb-3 font-semibold text-white">Contact</p>
            <div className="flex flex-col gap-1.5">
              <a href={`tel:${phone}`} className="transition hover:text-accent">{phone}</a>
              <a href={`mailto:${email}`} className="transition hover:text-accent">{email}</a>
              <p>{address}</p>
            </div>
          </div>

          <div>
            <p className="mb-3 font-semibold text-white">Quick Links</p>
            <div className="flex flex-col gap-1.5">
              <a href="#home" className="transition hover:text-accent">Home</a>
              <a href="#what-we-do" className="transition hover:text-accent">Services</a>
              <a href="#packages" className="transition hover:text-accent">Tour Packages</a>
              <a href="#gallery" className="transition hover:text-accent">Gallery</a>
              <a href="#faq" className="transition hover:text-accent">FAQ</a>
              <a href="#contact" className="transition hover:text-accent">Contact</a>
            </div>
          </div>

          <div>
            <p className="mb-3 font-semibold text-white">Stay Updated</p>
            <p className="mb-3 text-xs text-white/50">Get tour news and Sri Lanka cricket updates.</p>
            <input placeholder="Your email address" className="input-dark mb-2" />
            <button className="pill-button w-full text-sm">Subscribe</button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-white/40">
          <p>© {new Date().getFullYear()} {brandName}. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/portal/login" className="transition hover:text-white">Admin</a>
            <span className="text-white/20">|</span>
            <span>Privacy Policy</span>
            <span className="text-white/20">|</span>
            <span>Terms &amp; Conditions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

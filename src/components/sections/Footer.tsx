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
    <footer className="border-t border-white/10 bg-[#090d10] py-12">
      <div className="section-shell">
        <div className="mb-8 border-b border-white/10 pb-8">
          <h3 className="max-w-xl text-3xl font-bold leading-tight">Cricket Coaching, Training, And Matches - Together</h3>
        </div>
        <div className="grid gap-8 text-sm text-white/80 md:grid-cols-4">
          <div>
            <p className="mb-2 text-accent">{brandName}</p>
            <p>Cricket tours, training camps, matches and sightseeing in Sri Lanka.</p>
          </div>
          <div>
            <p className="mb-2 font-semibold text-white">Contact</p>
            <p>{phone}</p>
            <p>{email}</p>
            <p>{address}</p>
          </div>
          <div>
            <p className="mb-2 font-semibold text-white">Quick Links</p>
            <p>Home</p>
            <p>Packages</p>
            <p>Gallery</p>
            <p>Contact</p>
          </div>
          <div>
            <p className="mb-2 font-semibold text-white">Newsletter</p>
            <input placeholder="Your email here" className="input-dark mb-2" />
            <button className="pill-button w-full">Submit Now</button>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/55">
          <p>Copyright © 2026 {brandName}. All Rights Reserved.</p>
          <div className="flex items-center gap-3">
            <a href="/portal/login" className="hover:text-white">
              Admin
            </a>
            <span>|</span>
            <p>Privacy Policy</p>
            <span>|</span>
            <p>Terms & Conditions</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

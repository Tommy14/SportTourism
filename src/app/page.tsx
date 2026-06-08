import { InquiryForm } from "@/components/forms/InquiryForm";
import { Footer } from "@/components/sections/Footer";
import { HeaderNav } from "@/components/sections/HeaderNav";
import { PackageShowcase } from "@/components/sections/PackageShowcase";
import { InquiryButton } from "@/components/ui/InquiryButton";
import { getSiteContent } from "@/lib/content";
import { toPackageShowcaseItems } from "@/lib/package-showcase";
import Image from "next/image";

/** All-cricket hero collage — match action, three Sri Lankan international venues, coaching session. */
const HERO_COLLAGE_SRC = [
  "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1600&q=85",
  "https://upload.wikimedia.org/wikipedia/commons/2/23/R_Premadasa_Stadium.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/5/54/Rangiri_Dambulla_International_Stadium.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/f/f7/Galle_International_Stadium.jpg",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1600&q=85"
] as const;

const WHAT_WE_DO_HERO_SRC =
  "https://upload.wikimedia.org/wikipedia/commons/2/23/R_Premadasa_Stadium.jpg";

const WHAT_WE_DO_CHILD_ORDER = [
  "Accommodation",
  "Fixtures",
  "Transport",
  "Special Coaching Sessions"
] as const;

const WHAT_WE_HAVE_DONE_CHILD_ORDER = [
  "Club & Country Level Teams",
  "School and Junior Tours",
  "Player Adaption to Sri Lankan Arenas",
  "Coaching Sessions"
] as const;

const WHERE_PLAY_CHILD_ORDER = ["CMB", "Dambulla", "Galle", "Indoor / Nets"] as const;

const WHERE_PLAY_IMAGE = {
  cmb: "https://upload.wikimedia.org/wikipedia/commons/2/23/R_Premadasa_Stadium.jpg",
  dambulla: "https://upload.wikimedia.org/wikipedia/commons/5/54/Rangiri_Dambulla_International_Stadium.jpg",
  galle: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Galle_International_Stadium.jpg",
  indoorNets: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1600&q=85"
} as const;

const GALLERY_FALLBACK_SRC = [
  "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80",
  "https://upload.wikimedia.org/wikipedia/commons/2/23/R_Premadasa_Stadium.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/5/54/Rangiri_Dambulla_International_Stadium.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/f/f7/Galle_International_Stadium.jpg",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80"
] as const;

const GALLERY_FALLBACK_CAPTIONS = [
  "Match day at a Colombo ground",
  "R. Premadasa Stadium, Colombo",
  "Rangiri Dambulla International Stadium",
  "Galle International Stadium",
  "Team nets and coaching session",
  "Sri Lanka cricket experience"
] as const;

const HERO_STATS = [
  { stat: "10+", label: "Years of Experience" },
  { stat: "500+", label: "Players Hosted" },
  { stat: "3", label: "International Venues" },
  { stat: "100%", label: "Tailored to Your Team" }
] as const;

function pickWherePlayImageUrl(stored: string | null, fallback: string): string {
  if (!stored) return fallback;
  if (stored.includes("images.unsplash.com")) return fallback;
  return stored;
}

function resolveTopicImageUrl(stored: string | null | undefined, fallback: string): string {
  const t = stored?.trim();
  if (!t) return fallback;
  const deprecated =
    t.includes("photo-1593766788306-28561086694a") ||
    t.includes("photo-1521417531039-3f3b4fd1f8c5") ||
    t.includes("photo-1624526267942-ab0ff8a9f7ba") ||
    t.includes("photo-1503676260728-1c00da094a0b");
  if (deprecated) return fallback;
  return t;
}

type TopicTileRecord = {
  id: number;
  groupKey: string;
  title: string;
  body: string;
  imageUrl: string | null;
};

function buildWhatWeDoTiles(records: TopicTileRecord[]): TopicTileRecord[] {
  const group = records.filter((t) => t.groupKey === "what-we-do");
  const defaults: Record<(typeof WHAT_WE_DO_CHILD_ORDER)[number], { body: string; imageUrl: string }> = {
    Accommodation: {
      body: "Team-friendly hotel stays arranged close to training and match venues.",
      imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80"
    },
    Fixtures: {
      body: "Competitive matches coordinated with suitable schools, clubs, and academies.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/54/Rangiri_Dambulla_International_Stadium.jpg"
    },
    Transport: {
      body: "Reliable team transport organized for airport pickups, grounds, and excursions.",
      imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80"
    },
    "Special Coaching Sessions": {
      body: "Expert coaching for batting, bowling and fielding tailored to your squad.",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80"
    }
  };

  return WHAT_WE_DO_CHILD_ORDER.map((title, i) => {
    const existing =
      group.find((t) => t.title === title) ??
      (title === "Special Coaching Sessions" ? group.find((t) => t.title === "Practice Venues") : undefined);
    if (existing) {
      const isLegacyCoaching = existing.title === "Practice Venues" && title === "Special Coaching Sessions";
      return {
        ...existing,
        title,
        body: isLegacyCoaching ? defaults[title].body : existing.body,
        imageUrl: resolveTopicImageUrl(existing.imageUrl, defaults[title].imageUrl)
      };
    }
    const d = defaults[title];
    return { id: -(i + 1), groupKey: "what-we-do", title, body: d.body, imageUrl: d.imageUrl };
  });
}

function buildWhatWeHaveDoneTiles(records: TopicTileRecord[]): TopicTileRecord[] {
  const group = records.filter((t) => t.groupKey === "what-we-have-done");
  const defaults: Record<
    (typeof WHAT_WE_HAVE_DONE_CHILD_ORDER)[number],
    { body: string; imageUrl: string }
  > = {
    "Club & Country Level Teams": {
      body: "Hosted club sides and representative squads with fixtures, nets and full tour coordination.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/23/R_Premadasa_Stadium.jpg"
    },
    "School and Junior Tours": {
      body: "Ran school and junior programs with age-appropriate schedules, supervision and travel.",
      imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1000&q=80"
    },
    "Player Adaption to Sri Lankan Arenas": {
      body: "Helped visiting players adjust to local wickets, weather and ground characteristics across the island.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Galle_International_Stadium.jpg"
    },
    "Coaching Sessions": {
      body: "Delivered structured coaching blocks with specialist staff, video and intensive net work.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/68/Indoor_cricket.jpg"
    }
  };

  const legacyToCanonical: Record<string, (typeof WHAT_WE_HAVE_DONE_CHILD_ORDER)[number]> = {
    "Regional Teams Hosted": "Club & Country Level Teams",
    "School And Club Tours": "School and Junior Tours",
    "Complete Logistics": "Player Adaption to Sri Lankan Arenas",
    "Trusted Execution": "Coaching Sessions"
  };

  return WHAT_WE_HAVE_DONE_CHILD_ORDER.map((title, i) => {
    const existing =
      group.find((t) => t.title === title) ??
      group.find((t) => legacyToCanonical[t.title] === title);
    const d = defaults[title];
    if (existing) {
      const exact = existing.title === title;
      return {
        ...existing,
        title,
        body: exact ? existing.body : d.body,
        imageUrl: resolveTopicImageUrl(existing.imageUrl, d.imageUrl)
      };
    }
    return { id: -(i + 1), groupKey: "what-we-have-done", title, body: d.body, imageUrl: d.imageUrl };
  });
}

function buildWherePlayTiles(records: TopicTileRecord[]): TopicTileRecord[] {
  const group = records.filter((t) => t.groupKey === "where-play");
  const defaults: Record<
    (typeof WHERE_PLAY_CHILD_ORDER)[number],
    { body: string; imageUrl: string }
  > = {
    CMB: {
      body: "Colombo-region grounds and clubs — city wickets, strong facilities and easy logistics.",
      imageUrl: WHERE_PLAY_IMAGE.cmb
    },
    Dambulla: {
      body: "Central Province cricket around Dambulla — stadium-standard venues and training blocks.",
      imageUrl: WHERE_PLAY_IMAGE.dambulla
    },
    Galle: {
      body: "Southern coastal cricket — historic fort setting, sea breeze and true low-country conditions.",
      imageUrl: WHERE_PLAY_IMAGE.galle
    },
    "Indoor / Nets": {
      body: "Indoor nets and outdoor practice wickets so weather never cancels a session.",
      imageUrl: WHERE_PLAY_IMAGE.indoorNets
    }
  };

  const legacyToCanonical: Record<string, (typeof WHERE_PLAY_CHILD_ORDER)[number]> = {
    "Colombo Grounds": "CMB",
    "Kandy Venues": "Dambulla",
    "Galle Facilities": "Galle",
    "Nets And Wickets": "Indoor / Nets"
  };

  return WHERE_PLAY_CHILD_ORDER.map((title, i) => {
    const existing =
      group.find((t) => t.title === title) ??
      group.find((t) => legacyToCanonical[t.title] === title);
    const d = defaults[title];
    if (existing) {
      const exact = existing.title === title;
      return {
        ...existing,
        title,
        body: exact ? existing.body : d.body,
        imageUrl: pickWherePlayImageUrl(existing.imageUrl, d.imageUrl)
      };
    }
    return { id: -(i + 1), groupKey: "where-play", title, body: d.body, imageUrl: d.imageUrl };
  });
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const { settings, sections, topicTiles, packages, faqs, testimonials, gallery } = await getSiteContent();
  const hero = sections.find((item) => item.key === "hero");
  const topicSections = sections.filter((item) => item.key !== "hero");

  const heroCoverPhoto = (hero?.imageUrl as string | null | undefined) ?? null;

  const fallbackTopicTiles = [
    { id: 1, groupKey: "what-we-do", title: "Accommodation", body: "Team-friendly hotel stays arranged close to training and match venues.", imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80" },
    { id: 2, groupKey: "what-we-do", title: "Fixtures", body: "Competitive matches coordinated with suitable schools, clubs, and academies.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/54/Rangiri_Dambulla_International_Stadium.jpg" },
    { id: 3, groupKey: "what-we-do", title: "Transport", body: "Reliable team transport organized for airport pickups, grounds, and excursions.", imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80" },
    { id: 4, groupKey: "what-we-do", title: "Special Coaching Sessions", body: "Expert coaching for batting, bowling and fielding tailored to your squad.", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80" },
    { id: 5, groupKey: "what-we-have-done", title: "Club & Country Level Teams", body: "Hosted club sides and representative squads with fixtures, nets and full tour coordination.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/23/R_Premadasa_Stadium.jpg" },
    { id: 6, groupKey: "what-we-have-done", title: "School and Junior Tours", body: "Ran school and junior programs with age-appropriate schedules, supervision and travel.", imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1000&q=80" },
    { id: 7, groupKey: "what-we-have-done", title: "Player Adaption to Sri Lankan Arenas", body: "Helped visiting players adjust to local wickets, weather and ground characteristics across the island.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Galle_International_Stadium.jpg" },
    { id: 8, groupKey: "what-we-have-done", title: "Coaching Sessions", body: "Delivered structured coaching blocks with specialist staff, video and intensive net work.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/68/Indoor_cricket.jpg" },
    { id: 9, groupKey: "where-play", title: "CMB", body: "Colombo-region grounds and clubs — city wickets, strong facilities and easy logistics.", imageUrl: WHERE_PLAY_IMAGE.cmb },
    { id: 10, groupKey: "where-play", title: "Dambulla", body: "Central Province cricket around Dambulla — stadium-standard venues and training blocks.", imageUrl: WHERE_PLAY_IMAGE.dambulla },
    { id: 11, groupKey: "where-play", title: "Galle", body: "Southern coastal cricket — historic fort setting, sea breeze and true low-country conditions.", imageUrl: WHERE_PLAY_IMAGE.galle },
    { id: 12, groupKey: "where-play", title: "Indoor / Nets", body: "Indoor nets and outdoor practice wickets so weather never cancels a session.", imageUrl: WHERE_PLAY_IMAGE.indoorNets }
  ];

  const tileRecords = topicTiles.length ? topicTiles : fallbackTopicTiles;
  const topicGroupOrder = ["what-we-do", "what-we-have-done", "where-play"];

  const packageCards = toPackageShowcaseItems(
    packages.length
      ? packages
      : [
          {
            id: 1,
            title: "Starter Cricket Tour",
            duration: "5 Days / 4 Nights",
            inclusions: "2 warm-up matches, Shared nets session, City sightseeing, Airport transfers, Team transport",
            pricingNote: "Contact for pricing"
          },
          {
            id: 2,
            title: "Pro Player Tour",
            duration: "8 Days / 7 Nights",
            inclusions: "3 match fixtures, Batting & bowling coaching camp, Team performance analysis, Fitness sessions, Accommodation & transport",
            pricingNote: "Contact for pricing"
          },
          {
            id: 3,
            title: "Elite Champion Tour",
            duration: "10 Days / 9 Nights",
            inclusions: "4 high-intensity fixtures, Specialist batting & bowling clinics, Full island cricket itinerary, Sightseeing excursions, Star-grade hotels",
            pricingNote: "Contact for pricing"
          }
        ]
  );

  return (
    <main>
      <HeaderNav brand={settings?.brandName || "Pitch to Paradise"} />

      {/* ── Hero ── */}
      <section id="home" className="relative overflow-hidden">
        <div className="hero-backdrop absolute inset-0 z-10" />
        {heroCoverPhoto ? (
          /* Single full-width cover photo uploaded via admin */
          <div className="relative z-0 h-[62vh] w-full md:h-[72vh]">
            <Image
              src={heroCoverPhoto}
              alt="Hero cover"
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
              quality={85}
            />
          </div>
        ) : (
          /* Default 5-column cricket collage */
          <div className="relative z-0 grid h-[62vh] grid-cols-5 gap-0.5 md:h-[72vh] [&>*]:min-h-0 [&>*]:min-w-0">
            {HERO_COLLAGE_SRC.map((src, i) => (
              <div key={src} className="relative h-full w-full overflow-hidden">
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="20vw"
                  className="object-cover object-center"
                  priority={i < 2}
                  quality={80}
                />
              </div>
            ))}
          </div>
        )}

        <div className="section-shell relative z-20 -mt-64 pb-16 pt-10 text-center md:-mt-72 md:pb-24">
          <span className="badge-chip">{hero?.subtitle || "Sri Lanka Cricket Experience"}</span>
          <h1 className="section-title mx-auto mt-5 max-w-3xl">
            {hero?.title || "Cricket Tours In Sri Lanka"}
          </h1>
          <p className="section-subtitle mx-auto">
            {hero?.body ||
              "We organise complete tours for teams with matches, camps, net practices and curated sightseeing across the island."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#packages" className="pill-button text-sm">
              View Tour Packages
            </a>
            <InquiryButton label="Contact Us" />
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="border-y border-white/10 bg-[#07090b]">
        <div className="section-shell grid grid-cols-2 md:grid-cols-4">
          {HERO_STATS.map((item, i) => (
            <div
              key={item.label}
              className={`flex flex-col items-center py-6 text-center ${i < 3 ? "border-r border-white/8" : ""}`}
            >
              <span className="text-2xl font-extrabold text-accent md:text-3xl">{item.stat}</span>
              <span className="mt-1 text-[11px] text-white/50 md:text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Topic sections (What We Do / Have Done / Where Play) ── */}
      <section className="section-shell section-block">
        <div className="space-y-10">
          {(topicSections.length
            ? topicSections
            : [
                { key: "what-we-do", title: "What We Do", subtitle: "Tour + Cricket Experience", body: "From logistics to on-field planning, we arrange grounds, practice sessions, coaches, travel, and accommodation." },
                { key: "what-we-have-done", title: "What We Have Done", subtitle: "Our Track Record", body: "Hosted school, club and academy teams from multiple countries with end-to-end support." },
                { key: "where-play", title: "Where Would You Be Playing", subtitle: "Stadiums And Grounds", body: "CMB, Dambulla and Galle — plus indoor nets and all-weather practice wickets." }
              ]
          )
            .sort((a, b) => topicGroupOrder.indexOf(a.key) - topicGroupOrder.indexOf(b.key))
            .map((item) => {
              const tiles =
                item.key === "what-we-do"
                  ? buildWhatWeDoTiles(tileRecords as TopicTileRecord[])
                  : item.key === "what-we-have-done"
                    ? buildWhatWeHaveDoneTiles(tileRecords as TopicTileRecord[])
                    : item.key === "where-play"
                      ? buildWherePlayTiles(tileRecords as TopicTileRecord[])
                      : tileRecords.filter((tile) => tile.groupKey === item.key).slice(0, 4);
              return (
                <article key={item.key} id={item.key} className="panel-card scroll-mt-28">
                  <span className="badge-chip">{item.subtitle}</span>
                  <h2 className="mt-4 text-2xl font-bold md:text-3xl">{item.title}</h2>
                  <p className="mt-3 text-sm text-white/70 md:text-base">{item.body}</p>

                  {item.key === "what-we-do" ? (
                    <>
                      <div className="relative mt-6 aspect-[16/7] w-full overflow-hidden rounded-2xl border border-white/10">
                        <Image
                          src={("imageUrl" in item && item.imageUrl ? String(item.imageUrl) : null) ?? WHAT_WE_DO_HERO_SRC}
                          alt="What We Do banner"
                          fill
                          sizes="(max-width: 1200px) 100vw, 1100px"
                          className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                        <div className="absolute inset-0 flex flex-col items-center justify-end p-6 pb-8 text-center md:pb-10">
                          <p className="text-xl font-bold tracking-tight md:text-4xl">
                            Your Tour, Handled End to End
                          </p>
                          <p className="mt-2 text-sm text-white/70 md:text-base">
                            Grounds, coaches, fixtures, hotels and transport — all arranged for your squad.
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {tiles.map((tile) => (
                          <div key={tile.id} className="group overflow-hidden rounded-xl border border-white/10 bg-black/20">
                            <div className="relative h-36 w-full overflow-hidden">
                              <Image
                                src={tile.imageUrl || "https://upload.wikimedia.org/wikipedia/commons/5/54/Rangiri_Dambulla_International_Stadium.jpg"}
                                alt={tile.title}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover transition duration-500 group-hover:scale-105"
                                quality={75}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>
                            <div className="p-4">
                              <h3 className="text-sm font-semibold">{tile.title}</h3>
                              <p className="mt-1.5 text-xs text-white/65 leading-relaxed">{tile.body}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : item.key === "what-we-have-done" ? (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {tiles.map((tile) => (
                        <div key={tile.id} className="group overflow-hidden rounded-xl border border-white/10 bg-black/20">
                          <div className="relative h-36 w-full overflow-hidden">
                            <Image
                              src={tile.imageUrl || "https://upload.wikimedia.org/wikipedia/commons/2/23/R_Premadasa_Stadium.jpg"}
                              alt={tile.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              className="object-cover transition duration-500 group-hover:scale-105"
                              quality={75}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          </div>
                          <div className="p-4">
                            <h3 className="text-sm font-semibold leading-snug">{tile.title}</h3>
                            <p className="mt-1.5 text-xs text-white/65 leading-relaxed">{tile.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {tiles.map((tile) => (
                        <div key={tile.id} className="group relative overflow-hidden rounded-xl border border-white/10">
                          <div className="relative h-52 w-full overflow-hidden">
                            <Image
                              src={tile.imageUrl || "https://upload.wikimedia.org/wikipedia/commons/f/f7/Galle_International_Stadium.jpg"}
                              alt={tile.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover transition duration-500 group-hover:scale-105"
                              quality={75}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="font-semibold">{tile.title}</h3>
                            <p className="mt-1 text-xs text-white/70 leading-relaxed">{tile.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
        </div>
      </section>

      {/* ── Gallery ── */}
      <section id="gallery" className="section-block scroll-mt-28 bg-black/30">
        <div className="section-shell">
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="badge-chip">Gallery</span>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">Tour Moments &amp; Team Spirit</h2>
            </div>
            <p className="text-sm text-white/50 md:text-right">
              {gallery.length ? `${gallery.length} photos` : "Upload photos via the admin panel"}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {(gallery.length ? gallery : new Array(6).fill(null)).map((item, idx) => (
              <div key={idx} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0d1317]">
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={item?.imageUrl || GALLERY_FALLBACK_SRC[idx % GALLERY_FALLBACK_SRC.length]}
                    alt={item?.caption || GALLERY_FALLBACK_CAPTIONS[idx % GALLERY_FALLBACK_CAPTIONS.length]}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    quality={75}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                </div>
                <p className="p-3 text-sm text-white/60">
                  {item?.caption || GALLERY_FALLBACK_CAPTIONS[idx % GALLERY_FALLBACK_CAPTIONS.length]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tour Packages ── */}
      <section id="packages" className="section-shell section-block scroll-mt-28">
        <div className="text-center">
          <span className="badge-chip">Tour Packages</span>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold md:text-5xl">
            Choose Your Sri Lanka Cricket Tour
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/55">
            Every package is fully tailored to your squad — contact us for custom pricing and available dates.
          </p>
        </div>
        <div className="mt-10">
          <PackageShowcase packages={packageCards.slice(0, 3)} />
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="section-block scroll-mt-28 bg-black/25">
        <div className="section-shell">
          <span className="badge-chip">Testimonials</span>
          <h2 className="mt-3 text-2xl font-bold md:text-3xl">What Teams Say About Their Tours</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {(testimonials.length
              ? testimonials
              : [
                  { id: 1, quote: "Brilliantly organised from start to finish. The matches, coaching and sightseeing were all top-class.", name: "Coach Daniel", team: "Royal Academy CC", imageUrl: null },
                  { id: 2, quote: "Our junior squad had the experience of a lifetime. Every detail was handled professionally.", name: "Sarah Mitchell", team: "Eastbourne Cricket Club", imageUrl: null }
                ]
            ).map((item) => {
              const photo =
                "imageUrl" in item && item.imageUrl && String(item.imageUrl).trim() !== ""
                  ? String(item.imageUrl).trim()
                  : null;
              return (
                <blockquote
                  key={item.id}
                  className="panel-card relative flex flex-col gap-4 overflow-hidden sm:flex-row sm:items-start"
                >
                  <span className="pointer-events-none absolute -right-2 -top-3 select-none font-serif text-9xl leading-none text-accent/8">
                    &ldquo;
                  </span>
                  {photo ? (
                    <div className="relative mx-auto h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border border-white/15 bg-black/30 sm:mx-0">
                      <Image
                        src={photo}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/8 text-xl sm:mx-0">
                      🏏
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed text-white/80 md:text-base">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <footer className="mt-4 flex items-center gap-2">
                      <span className="h-px w-4 shrink-0 bg-accent/50" />
                      <span className="text-sm font-semibold text-accent">{item.name}</span>
                      <span className="text-xs text-white/40">· {item.team}</span>
                    </footer>
                  </div>
                </blockquote>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="section-block scroll-mt-28">
        <div className="section-shell">
          <div className="mb-6">
            <span className="badge-chip">FAQ</span>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">Cricket Tour Questions, Answered</h2>
          </div>
          <div className="space-y-3">
            {(faqs.length
              ? faqs
              : [
                  { id: 1, question: "What age groups do you cater for?", answer: "We organise tours for junior (under-13 through under-19), club, academy and senior representative teams." },
                  { id: 2, question: "Can you customise the itinerary for our squad?", answer: "Yes — every package is built around your team's schedule, budget, skill level and goals." },
                  { id: 3, question: "Which venues will we play at?", answer: "We have established relationships with grounds in Colombo, Dambulla and Galle, as well as indoor net facilities across the island." },
                  { id: 4, question: "What is included in the packages?", answer: "Accommodation, team transport, match fixtures, coaching sessions, airport transfers and a dedicated tour manager — all configurable to your needs." }
                ]
            ).map((item) => (
              <details
                key={item.id}
                className="group rounded-xl border border-white/10 bg-[#0e1318] p-5 open:border-accent/25 open:bg-[#101820] transition-colors"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {item.question}
                  <span className="ml-4 shrink-0 text-accent transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-white/70 leading-relaxed md:text-base">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="section-block scroll-mt-28 bg-black/25">
        <div className="section-shell">
          <div className="panel-card border-accent/20">
            <div className="mb-6">
              <span className="badge-chip">Get in Touch</span>
              <h3 className="mt-3 text-2xl font-bold md:text-3xl">Ready to Tour Sri Lanka?</h3>
              <p className="mt-2 text-sm text-white/60 md:text-base">
                Tell us about your team, preferred dates and goals — we&apos;ll put together a custom itinerary and quote.
              </p>
            </div>
            <InquiryForm />
          </div>
        </div>
      </section>

      <Footer
        brandName={settings?.brandName || "Pitch to Paradise"}
        phone={settings?.contactPhone || "+94 77 123 4567"}
        email={settings?.contactEmail || "hello@pitchtoparadise.com"}
        address={settings?.footerAddress || "Colombo, Sri Lanka"}
      />
    </main>
  );
}

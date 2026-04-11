import { InquiryForm } from "@/components/forms/InquiryForm";
import { Footer } from "@/components/sections/Footer";
import { HeaderNav } from "@/components/sections/HeaderNav";
import { PackageShowcase } from "@/components/sections/PackageShowcase";
import { InquiryButton } from "@/components/ui/InquiryButton";
import { getSiteContent } from "@/lib/content";
import Image from "next/image";

/** Hero strip backgrounds — img + object-cover avoids empty CSS background cells; URLs are landscape-friendly for narrow columns. */
const HERO_COLLAGE_SRC = [
  "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=85"
] as const;

const WHAT_WE_DO_HERO_SRC =
  "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=2000&q=85";

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

/** Wikimedia Commons — R. Premadasa Stadium; Galle International Stadium; Rangiri Dambulla; indoor cricket (CC0). */
const WHERE_PLAY_IMAGE = {
  cmb: "https://upload.wikimedia.org/wikipedia/commons/2/23/R_Premadasa_Stadium.jpg",
  dambulla: "https://upload.wikimedia.org/wikipedia/commons/5/54/Rangiri_Dambulla_International_Stadium.jpg",
  galle: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Galle_International_Stadium.jpg",
  indoorNets: "https://upload.wikimedia.org/wikipedia/commons/6/68/Indoor_cricket.jpg"
} as const;

function pickWherePlayImageUrl(stored: string | null, fallback: string): string {
  if (!stored) return fallback;
  if (stored.includes("images.unsplash.com")) return fallback;
  return stored;
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
      imageUrl:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
    },
    Fixtures: {
      body: "Competitive matches coordinated with suitable schools, clubs, and academies.",
      imageUrl:
        "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1000&q=80"
    },
    Transport: {
      body: "Reliable team transport organized for airport pickups, grounds, and excursions.",
      imageUrl:
        "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1000&q=80"
    },
    "Special Coaching Sessions": {
      body: "Expert coaching for batting, bowling and fielding tailored to your squad.",
      imageUrl:
        "https://images.unsplash.com/photo-1593766788306-28561086694a?auto=format&fit=crop&w=1000&q=80"
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
        imageUrl: existing.imageUrl ?? defaults[title].imageUrl
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
      imageUrl:
        "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80"
    },
    "School and Junior Tours": {
      body: "Ran school and junior programs with age-appropriate schedules, supervision and travel.",
      imageUrl:
        "https://images.unsplash.com/photo-1521417531039-3f3b4fd1f8c5?auto=format&fit=crop&w=1000&q=80"
    },
    "Player Adaption to Sri Lankan Arenas": {
      body: "Helped visiting players adjust to local wickets, weather and ground characteristics across the island.",
      imageUrl:
        "https://images.unsplash.com/photo-1624526267942-ab0ff8a9f7ba?auto=format&fit=crop&w=1000&q=80"
    },
    "Coaching Sessions": {
      body: "Delivered structured coaching blocks with specialist staff, video and intensive net work.",
      imageUrl:
        "https://images.unsplash.com/photo-1593766788306-28561086694a?auto=format&fit=crop&w=1000&q=80"
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
        imageUrl: existing.imageUrl ?? d.imageUrl
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
  const fallbackTopicTiles = [
    { id: 1, groupKey: "what-we-do", title: "Accommodation", body: "Team-friendly hotel stays arranged close to training and match venues.", imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80" },
    { id: 2, groupKey: "what-we-do", title: "Fixtures", body: "Competitive matches coordinated with suitable schools, clubs, and academies.", imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1000&q=80" },
    { id: 3, groupKey: "what-we-do", title: "Transport", body: "Reliable team transport organized for airport pickups, grounds, and excursions.", imageUrl: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1000&q=80" },
    { id: 4, groupKey: "what-we-do", title: "Special Coaching Sessions", body: "Expert coaching for batting, bowling and fielding tailored to your squad.", imageUrl: "https://images.unsplash.com/photo-1593766788306-28561086694a?auto=format&fit=crop&w=1000&q=80" },
    { id: 5, groupKey: "what-we-have-done", title: "Club & Country Level Teams", body: "Hosted club sides and representative squads with fixtures, nets and full tour coordination.", imageUrl: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80" },
    { id: 6, groupKey: "what-we-have-done", title: "School and Junior Tours", body: "Ran school and junior programs with age-appropriate schedules, supervision and travel.", imageUrl: "https://images.unsplash.com/photo-1521417531039-3f3b4fd1f8c5?auto=format&fit=crop&w=1000&q=80" },
    { id: 7, groupKey: "what-we-have-done", title: "Player Adaption to Sri Lankan Arenas", body: "Helped visiting players adjust to local wickets, weather and ground characteristics across the island.", imageUrl: "https://images.unsplash.com/photo-1624526267942-ab0ff8a9f7ba?auto=format&fit=crop&w=1000&q=80" },
    { id: 8, groupKey: "what-we-have-done", title: "Coaching Sessions", body: "Delivered structured coaching blocks with specialist staff, video and intensive net work.", imageUrl: "https://images.unsplash.com/photo-1593766788306-28561086694a?auto=format&fit=crop&w=1000&q=80" },
    { id: 9, groupKey: "where-play", title: "CMB", body: "Colombo-region grounds and clubs — city wickets, strong facilities and easy logistics.", imageUrl: WHERE_PLAY_IMAGE.cmb },
    { id: 10, groupKey: "where-play", title: "Dambulla", body: "Central Province cricket around Dambulla — stadium-standard venues and training blocks.", imageUrl: WHERE_PLAY_IMAGE.dambulla },
    { id: 11, groupKey: "where-play", title: "Galle", body: "Southern coastal cricket — historic fort setting, sea breeze and true low-country conditions.", imageUrl: WHERE_PLAY_IMAGE.galle },
    { id: 12, groupKey: "where-play", title: "Indoor / Nets", body: "Indoor nets and outdoor practice wickets so weather never cancels a session.", imageUrl: WHERE_PLAY_IMAGE.indoorNets }
  ];
  const tileRecords = topicTiles.length ? topicTiles : fallbackTopicTiles;
  const topicGroupOrder = ["what-we-do", "what-we-have-done", "where-play"];
  const packageCards = packages.length
    ? packages
    : [
        {
          id: 1,
          title: "Starter Plan",
          duration: "5 Days / 4 Nights",
          inclusions: "2 warm-up matches, shared nets, city sightseeing and transport support.",
          pricingNote: "From USD 399",
          imageUrl: null,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          title: "Pro Player Plan",
          duration: "8 Days / 7 Nights",
          inclusions: "3 match fixtures, batting & bowling camp, team analysis and fitness sessions.",
          pricingNote: "From USD 699",
          imageUrl: null,
          sortOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 3,
          title: "Elite Champion Plan",
          duration: "10 Days / 9 Nights",
          inclusions: "4 high-intensity fixtures, specialist clinics, full island cricket + leisure itinerary.",
          pricingNote: "From USD 999",
          imageUrl: null,
          sortOrder: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

  return (
    <main>
      <HeaderNav brand={settings?.brandName || "Pitch to Paradise"} />

      <section id="home" className="relative overflow-hidden">
        <div className="hero-backdrop absolute inset-0 z-10" />
        <div className="relative z-0 grid h-[62vh] grid-cols-5 gap-1 md:h-[70vh] [&>*]:min-h-0 [&>*]:min-w-0">
          {HERO_COLLAGE_SRC.map((src, i) => (
            <div key={src} className="relative h-full w-full overflow-hidden">
              <Image
                src={src}
                alt=""
                fill
                sizes="20vw"
                className="object-cover object-center"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
        <div className="section-shell relative z-20 -mt-64 pb-16 pt-10 text-center md:-mt-72 md:pb-24">
          <span className="badge-chip">{hero?.subtitle || "Sri Lanka Cricket Experience"}</span>
          <h1 className="section-title mx-auto mt-5 max-w-3xl">
            {hero?.title || "Driven By Passion, United By Cricket"}
          </h1>
          <p className="section-subtitle mx-auto">
            {hero?.body ||
              "Custom tours for schools, academies and clubs with matches, camps, net practices and island sightseeing."}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href="#packages" className="ghost-button">
              Explore Plans
            </a>
            <InquiryButton label={settings?.inquiryLabel} />
          </div>
        </div>
      </section>

      <section className="section-shell section-block">
        <div className="space-y-8">
          {(topicSections.length
            ? topicSections
            : [
                { key: "what-we-do", title: "What We Do", subtitle: "Tour Planning", body: "We arrange accommodation, practice venues, fixtures and transport for your squad." },
                { key: "what-we-have-done", title: "What We Have Done", subtitle: "Track Record", body: "Hosted clubs and school teams from across the region with complete logistics." },
                { key: "where-play", title: "Where Would You Be Playing", subtitle: "Venues", body: "CMB, Dambulla and Galle — plus indoor nets and all-weather practice." }
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
                  <h2 className="mt-4 text-2xl font-bold">{item.title}</h2>
                  <p className="mt-3 text-sm text-white/75 md:text-base">{item.body}</p>
                  {item.key === "what-we-do" ? (
                    <>
                      <div className="relative mt-5 aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 md:aspect-[21/9]">
                        <Image
                          src={WHAT_WE_DO_HERO_SRC}
                          alt="Cricket tour"
                          fill
                          sizes="(max-width: 1200px) 100vw, 1100px"
                          className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
                        <div className="absolute inset-0 flex items-end justify-center p-6 pb-8 md:items-center md:pb-6">
                          <p className="text-center text-2xl font-bold tracking-tight md:text-4xl">
                            Arranging cricket tours
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {tiles.map((tile) => (
                          <div key={tile.id} className="rounded-xl border border-white/10 bg-black/25 p-4">
                            <Image
                              src={
                                tile.imageUrl ||
                                "https://images.unsplash.com/photo-1521540216272-a50305cd4421?auto=format&fit=crop&w=1000&q=80"
                              }
                              alt={tile.title}
                              width={800}
                              height={500}
                              className="h-36 w-full rounded-lg object-cover"
                            />
                            <h3 className="mt-3 text-base font-semibold">{tile.title}</h3>
                            <p className="mt-2 text-sm text-white/75">{tile.body}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : item.key === "what-we-have-done" ? (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {tiles.map((tile) => (
                        <div key={tile.id} className="rounded-xl border border-white/10 bg-black/25 p-4">
                          <Image
                            src={
                              tile.imageUrl ||
                              "https://images.unsplash.com/photo-1521540216272-a50305cd4421?auto=format&fit=crop&w=1000&q=80"
                            }
                            alt={tile.title}
                            width={800}
                            height={500}
                            className="h-36 w-full rounded-lg object-cover"
                          />
                          <h3 className="mt-3 text-base font-semibold leading-snug">{tile.title}</h3>
                          <p className="mt-2 text-sm text-white/75">{tile.body}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {tiles.map((tile) => (
                        <div key={tile.id} className="rounded-xl border border-white/10 bg-black/25 p-4">
                          <Image
                            src={
                              tile.imageUrl ||
                              "https://images.unsplash.com/photo-1521540216272-a50305cd4421?auto=format&fit=crop&w=1000&q=80"
                            }
                            alt={tile.title}
                            width={800}
                            height={500}
                            className="h-36 w-full rounded-lg object-cover"
                          />
                          <h3 className="mt-3 text-base font-semibold">{tile.title}</h3>
                          <p className="mt-2 text-sm text-white/75">{tile.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
        </div>
      </section>

      <section id="gallery" className="section-block scroll-mt-28 bg-black/25">
        <div className="section-shell">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="badge-chip">Gallery</span>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">Tour Moments And Team Spirit</h2>
            </div>
            <InquiryButton />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {(gallery.length ? gallery : new Array(6).fill(null)).map((item, idx) => (
              <div key={idx} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#10161b]">
                <Image
                  src={item?.imageUrl || "https://images.unsplash.com/photo-1521540216272-a50305cd4421?auto=format&fit=crop&w=800&q=80"}
                  alt={item?.caption || "Cricket tour"}
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                  width={800}
                  height={500}
                />
                <p className="p-3 text-sm text-white/70">{item?.caption || "Cricket tour memory"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="packages" className="section-shell section-block scroll-mt-28">
        <div className="text-center">
          <span className="badge-chip">Pricing Plans</span>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold md:text-5xl">Choose The Perfect Plan For Your Team</h2>
        </div>
        <div className="mt-9">
          <PackageShowcase packages={packageCards.slice(0, 3)} />
        </div>
      </section>

      <section id="testimonials" className="section-shell section-block scroll-mt-28">
        <span className="badge-chip">Testimonials</span>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(testimonials.length
            ? testimonials
            : [{ id: 1, quote: "Well organized and memorable cricket experience.", name: "Coach Daniel", team: "Royal Academy" }]
          ).map((item) => (
              <blockquote key={item.id} className="panel-card">
                <p className="text-white/85">&ldquo;{item.quote}&rdquo;</p>
                <footer className="mt-4 text-sm text-accent">
                  {item.name} - {item.team}
                </footer>
              </blockquote>
            ))}
        </div>
      </section>

      <section id="faq" className="section-block scroll-mt-28 bg-black/25">
        <div className="section-shell">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="badge-chip">FAQ</span>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">We Heard It All - And We Are Answering</h2>
            </div>
            <InquiryButton />
          </div>
          <div className="space-y-3">
            {(faqs.length
              ? faqs
              : [{ id: 1, question: "Can you customize itineraries?", answer: "Yes. We tailor every package based on age group, budget and goals." }]
            ).map((item) => (
              <details key={item.id} className="rounded-xl border border-white/10 bg-[#131a20] p-5">
                <summary className="cursor-pointer font-semibold">{item.question}</summary>
                <p className="mt-2 text-sm text-white/75 md:text-base">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="section-shell section-block scroll-mt-28">
        <div className="panel-card border-accent/25">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="badge-chip">Join Our Cricket Family</span>
              <h3 className="mt-3 text-2xl font-bold md:text-3xl">Plan Your Tour With Pitch to Paradise</h3>
            </div>
            <InquiryButton />
          </div>
          <InquiryForm packageOptions={packageCards.map((item) => item.title)} />
        </div>
      </section>

      <Footer
        brandName={settings?.brandName || "Pitch to Paradise"}
        phone={settings?.contactPhone || "-"}
        email={settings?.contactEmail || "-"}
        address={settings?.footerAddress || "-"}
      />
    </main>
  );
}

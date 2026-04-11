import { InquiryForm } from "@/components/forms/InquiryForm";
import { Footer } from "@/components/sections/Footer";
import { HeaderNav } from "@/components/sections/HeaderNav";
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
    { id: 5, groupKey: "what-we-have-done", title: "Regional Teams Hosted", body: "Welcomed clubs and school teams from across the region for tour programs.", imageUrl: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80" },
    { id: 6, groupKey: "what-we-have-done", title: "Complete Logistics", body: "Delivered accommodation, fixtures, practice, and transport as one service.", imageUrl: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1000&q=80" },
    { id: 7, groupKey: "what-we-have-done", title: "School And Club Tours", body: "Handled varied group sizes and formats for both school and club squads.", imageUrl: "https://images.unsplash.com/photo-1521417531039-3f3b4fd1f8c5?auto=format&fit=crop&w=1000&q=80" },
    { id: 8, groupKey: "what-we-have-done", title: "Trusted Execution", body: "Supported teams throughout their tour with consistent planning and coordination.", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80" },
    { id: 9, groupKey: "where-play", title: "Colombo Grounds", body: "Play on established city grounds with strong facilities and match-ready wickets.", imageUrl: "https://images.unsplash.com/photo-1624526267942-ab0ff8a9f7ba?auto=format&fit=crop&w=1000&q=80" },
    { id: 10, groupKey: "where-play", title: "Kandy Venues", body: "Experience hill-country cricket settings with quality practice environments.", imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1000&q=80" },
    { id: 11, groupKey: "where-play", title: "Galle Facilities", body: "Train and play near iconic coastal venues with excellent cricket conditions.", imageUrl: "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=1000&q=80" },
    { id: 12, groupKey: "where-play", title: "Nets And Wickets", body: "Access dependable nets and well-prepared wickets for all sessions.", imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1000&q=80" }
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
                { key: "where-play", title: "Where Would You Be Playing", subtitle: "Venues", body: "Colombo, Kandy and Galle grounds with excellent wickets and net facilities." }
              ]
          )
            .sort((a, b) => topicGroupOrder.indexOf(a.key) - topicGroupOrder.indexOf(b.key))
            .map((item) => {
              const tiles =
                item.key === "what-we-do"
                  ? buildWhatWeDoTiles(tileRecords as TopicTileRecord[])
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
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {packageCards.slice(0, 3).map((item, idx) => (
            <article
              key={item.id}
              className={`rounded-2xl border p-6 ${
                idx === 1 ? "border-accent/50 bg-black shadow-2xl shadow-accent/10" : "border-white/10 bg-[#121a20]"
              }`}
            >
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-accent">{item.duration}</p>
              <p className="mt-3 text-3xl font-extrabold">{item.pricingNote.replace("From ", "")}</p>
              <p className="mt-3 text-sm text-white/70">{item.inclusions}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {item.inclusions.split(",").slice(0, 4).map((feature, featureIndex) => (
                  <li key={featureIndex}>✓ {feature.trim()}</li>
                ))}
              </ul>
              <InquiryButton className="mt-6 w-full" label="Get Started" />
            </article>
          ))}
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

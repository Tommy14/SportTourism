const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      brandName: "Pitch to Paradise",
      contactEmail: "hello@crickettoursrilanka.com",
      contactPhone: "+94 77 123 4567",
      footerAddress: "Colombo, Sri Lanka",
      inquiryLabel: "Send Inquiry"
    }
  });

  await prisma.adminUser.upsert({
    where: { id: 1 },
    update: { username: adminUsername, passwordHash },
    create: { id: 1, username: adminUsername, passwordHash }
  });

  const sections = [
    { key: "hero", title: "Cricket Tours In Sri Lanka", subtitle: "Play. Train. Explore.", body: "We organize complete tours for teams with matches, camps, net practices and curated sightseeing." },
    { key: "what-we-do", title: "What We Do", subtitle: "Tour + Cricket Experience", body: "From logistics to on-field planning, we arrange grounds, practice sessions, coaches, travel, and accommodation." },
    { key: "what-we-have-done", title: "What We Have Done", subtitle: "Our Track Record", body: "Hosted school, club and academy teams from multiple countries with end-to-end support." },
    { key: "where-play", title: "Where Would You Be Playing", subtitle: "Stadiums And Grounds", body: "CMB, Dambulla and Galle — plus indoor nets and all-weather practice wickets." }
  ];

  for (const section of sections) {
    await prisma.sectionContent.upsert({
      where: { key: section.key },
      update: section,
      create: section
    });
  }

  const packageCount = await prisma.package.count();
  if (!packageCount) {
    await prisma.package.createMany({
      data: [
        {
          title: "5 Day Cricket Essentials",
          duration: "5 Days / 4 Nights",
          inclusions: "2 friendly matches, 2 net sessions, city tour, hotel + transport.",
          pricingNote: "Starting from USD 420 per player",
          sortOrder: 1
        },
        {
          title: "8 Day High Performance Tour",
          duration: "8 Days / 7 Nights",
          inclusions: "3 matches, batting & bowling clinics, conditioning support, sightseeing days.",
          pricingNote: "Starting from USD 690 per player",
          sortOrder: 2
        }
      ]
    });
  }

  const topicTileCount = await prisma.topicTile.count();
  if (!topicTileCount) {
    await prisma.topicTile.createMany({
      data: [
        { groupKey: "what-we-do", title: "Accommodation", body: "Team-friendly hotel stays arranged close to training and match venues.", imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80", sortOrder: 1 },
        { groupKey: "what-we-do", title: "Fixtures", body: "Competitive matches coordinated with suitable schools, clubs, and academies.", imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1000&q=80", sortOrder: 2 },
        { groupKey: "what-we-do", title: "Transport", body: "Reliable team transport organized for airport pickups, grounds, and excursions.", imageUrl: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1000&q=80", sortOrder: 3 },
        { groupKey: "what-we-do", title: "Special Coaching Sessions", body: "Expert coaching for batting, bowling and fielding tailored to your squad.", imageUrl: "https://images.unsplash.com/photo-1593766788306-28561086694a?auto=format&fit=crop&w=1000&q=80", sortOrder: 4 },
        { groupKey: "what-we-have-done", title: "Club & Country Level Teams", body: "Hosted club sides and representative squads with fixtures, nets and full tour coordination.", imageUrl: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80", sortOrder: 1 },
        { groupKey: "what-we-have-done", title: "School and Junior Tours", body: "Ran school and junior programs with age-appropriate schedules, supervision and travel.", imageUrl: "https://images.unsplash.com/photo-1521417531039-3f3b4fd1f8c5?auto=format&fit=crop&w=1000&q=80", sortOrder: 2 },
        { groupKey: "what-we-have-done", title: "Player Adaption to Sri Lankan Arenas", body: "Helped visiting players adjust to local wickets, weather and ground characteristics across the island.", imageUrl: "https://images.unsplash.com/photo-1624526267942-ab0ff8a9f7ba?auto=format&fit=crop&w=1000&q=80", sortOrder: 3 },
        { groupKey: "what-we-have-done", title: "Coaching Sessions", body: "Delivered structured coaching blocks with specialist staff, video and intensive net work.", imageUrl: "https://images.unsplash.com/photo-1593766788306-28561086694a?auto=format&fit=crop&w=1000&q=80", sortOrder: 4 },
        { groupKey: "where-play", title: "CMB", body: "Colombo-region grounds and clubs — city wickets, strong facilities and easy logistics.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/23/R_Premadasa_Stadium.jpg", sortOrder: 1 },
        { groupKey: "where-play", title: "Dambulla", body: "Central Province cricket around Dambulla — stadium-standard venues and training blocks.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/54/Rangiri_Dambulla_International_Stadium.jpg", sortOrder: 2 },
        { groupKey: "where-play", title: "Galle", body: "Southern coastal cricket — historic fort setting, sea breeze and true low-country conditions.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Galle_International_Stadium.jpg", sortOrder: 3 },
        { groupKey: "where-play", title: "Indoor / Nets", body: "Indoor nets and outdoor practice wickets so weather never cancels a session.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/68/Indoor_cricket.jpg", sortOrder: 4 }
      ]
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

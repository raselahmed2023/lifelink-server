import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  BloodGroup,
  PrismaClient,
} from "../src/generated/prisma/client.js";

const connectionString =
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not defined"
  );
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const demoDonors = [
  {
    name: "Nusrat Jahan",
    email: "nusrat.demo@lifelink.com",
    phone: "01711111111",
    bloodGroup: BloodGroup.O_POSITIVE,
    district: "Dhaka",
    area: "Dhanmondi",
    lastDonation: new Date(
      "2026-05-15"
    ),
  },
  {
    name: "Rafiqul Hassan",
    email: "rafiqul.demo@lifelink.com",
    phone: "01811111111",
    bloodGroup: BloodGroup.A_POSITIVE,
    district: "Khulna",
    area: "Sonadanga",
    lastDonation: new Date(
      "2026-04-20"
    ),
  },
  {
    name: "Sajid Mahmud",
    email: "sajid.demo@lifelink.com",
    phone: "01911111111",
    bloodGroup: BloodGroup.B_POSITIVE,
    district: "Rajshahi",
    area: "Boalia",
    lastDonation: new Date(
      "2026-06-10"
    ),
  },
  {
    name: "Farhana Sultana",
    email: "farhana.demo@lifelink.com",
    phone: "01611111111",
    bloodGroup: BloodGroup.AB_NEGATIVE,
    district: "Chattogram",
    area: "Panchlaish",
    lastDonation: new Date(
      "2026-03-28"
    ),
  },
  {
    name: "Tanvir Ahmed",
    email: "tanvir.demo@lifelink.com",
    phone: "01511111111",
    bloodGroup: BloodGroup.O_NEGATIVE,
    district: "Sylhet",
    area: "Zindabazar",
    lastDonation: new Date(
      "2026-05-30"
    ),
  },
  {
    name: "Mehedi Hasan",
    email: "mehedi.demo@lifelink.com",
    phone: "01722222222",
    bloodGroup: BloodGroup.B_NEGATIVE,
    district: "Dhaka",
    area: "Mirpur",
    lastDonation: new Date(
      "2026-02-18"
    ),
  },
  {
    name: "Sumaiya Akter",
    email: "sumaiya.demo@lifelink.com",
    phone: "01822222222",
    bloodGroup: BloodGroup.A_POSITIVE,
    district: "Rangpur",
    area: "Jahaj Company More",
    lastDonation: new Date(
      "2026-06-02"
    ),
  },
  {
    name: "Arif Hossain",
    email: "arif.demo@lifelink.com",
    phone: "01922222222",
    bloodGroup: BloodGroup.AB_POSITIVE,
    district: "Barishal",
    area: "Nathullabad",
    lastDonation: new Date(
      "2026-04-12"
    ),
  },
  {
    name: "Jannatul Ferdous",
    email: "jannatul.demo@lifelink.com",
    phone: "01622222222",
    bloodGroup: BloodGroup.O_POSITIVE,
    district: "Mymensingh",
    area: "Town Hall",
    lastDonation: new Date(
      "2026-05-08"
    ),
  },
  {
    name: "Shakib Rahman",
    email: "shakib.demo@lifelink.com",
    phone: "01522222222",
    bloodGroup: BloodGroup.B_POSITIVE,
    district: "Chattogram",
    area: "Agrabad",
    lastDonation: new Date(
      "2026-06-15"
    ),
  },
];

async function main() {
  console.log(
    "Starting LifeLink demo donor seed..."
  );

  const hashedPassword =
    await bcrypt.hash(
      "Demo@123",
      12
    );

  for (const donor of demoDonors) {
    const user =
      await prisma.user.upsert({
        where: {
          email: donor.email,
        },

        update: {
          name: donor.name,
          phone: donor.phone,
          password: hashedPassword,
          status: "ACTIVE",
          role: "USER",
          isDeleted: false,
        },

        create: {
          name: donor.name,
          email: donor.email,
          phone: donor.phone,
          password: hashedPassword,
          status: "ACTIVE",
          role: "USER",
        },
      });

    await prisma.donorProfile.upsert({
      where: {
        userId: user.id,
      },

      update: {
        bloodGroup:
          donor.bloodGroup,
        district:
          donor.district,
        area: donor.area,
        lastDonation:
          donor.lastDonation,
        isAvailable: true,
        isDeleted: false,
      },

      create: {
        userId: user.id,
        bloodGroup:
          donor.bloodGroup,
        district:
          donor.district,
        area: donor.area,
        lastDonation:
          donor.lastDonation,
        isAvailable: true,
      },
    });

    console.log(
      `✓ ${donor.name} created`
    );
  }

  console.log(
    "\n✅ 10 demo donors seeded successfully."
  );

  console.log(
    "Demo password for every account: Demo@123"
  );
}

main()
  .catch((error) => {
    console.error(
      "Seed failed:",
      error
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
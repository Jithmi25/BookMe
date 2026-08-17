/**
 * Seeds Firestore with sample providers for local/demo use.
 *
 * Usage:
 *   1) Place a Firebase service account key at:
 *      scripts/serviceAccountKey.json
 *   2) Run:
 *      node scripts/seedDummyProviders.js
 */

import fs from "node:fs";
import path from "node:path";
import admin from "firebase-admin";

const serviceAccountPath = path.resolve(
  process.cwd(),
  "scripts/serviceAccountKey.json",
);
const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf-8"),
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const now = Date.now();

const availability = {
  monday: { available: true, start: "08:00", end: "17:00" },
  tuesday: { available: true, start: "08:00", end: "17:00" },
  wednesday: { available: true, start: "08:00", end: "17:00" },
  thursday: { available: true, start: "08:00", end: "17:00" },
  friday: { available: true, start: "08:00", end: "17:00" },
  saturday: { available: true, start: "09:00", end: "14:00" },
  sunday: { available: false, start: "09:00", end: "14:00" },
};

const providers = [
  {
    providerId: "dummy-provider-001",
    userId: "dummy-provider-001",
    name: "Nimal Perera",
    skills: ["plumbing", "appliance-repair"],
    serviceAreas: ["Colombo", "Gampaha"],
    experienceYears: 8,
    availability,
    priceMin: 2500,
    priceMax: 6000,
    bio: "Reliable plumbing and appliance fixes for homes and small businesses.",
    profilePhotoUrl: null,
    nicDocUrl: null,
    ratingAvg: 4.8,
    ratingCount: 42,
    nicVerified: true,
    photoVerified: true,
    totalEarnings: 245000,
    createdAt: now,
    updatedAt: now,
  },
  {
    providerId: "dummy-provider-002",
    userId: "dummy-provider-002",
    name: "Kasuni Fernando",
    skills: ["cleaning", "moving"],
    serviceAreas: ["Kandy", "Galle"],
    experienceYears: 5,
    availability,
    priceMin: 1800,
    priceMax: 4200,
    bio: "Careful, professional cleaning and moving support with flexible hours.",
    profilePhotoUrl: null,
    nicDocUrl: null,
    ratingAvg: 4.6,
    ratingCount: 29,
    nicVerified: true,
    photoVerified: true,
    totalEarnings: 162000,
    createdAt: now,
    updatedAt: now,
  },
  {
    providerId: "dummy-provider-003",
    userId: "dummy-provider-003",
    name: "Ruwan Silva",
    skills: ["electrical", "painting"],
    serviceAreas: ["Negombo", "Kalutara"],
    experienceYears: 10,
    availability,
    priceMin: 3000,
    priceMax: 7500,
    bio: "Licensed electrical and painting specialist focused on quality and safety.",
    profilePhotoUrl: null,
    nicDocUrl: null,
    ratingAvg: 4.9,
    ratingCount: 51,
    nicVerified: true,
    photoVerified: true,
    totalEarnings: 328000,
    createdAt: now,
    updatedAt: now,
  },
];

async function seedProviders() {
  const db = admin.firestore();

  for (const provider of providers) {
    await db.collection("providers").doc(provider.providerId).set(provider);
  }

  console.log(`Seeded ${providers.length} providers in Firestore.`);
}

seedProviders().catch((error) => {
  console.error(error);
  process.exit(1);
});

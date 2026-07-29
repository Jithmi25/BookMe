export interface DayAvailability {
  available: boolean;
  start: string; // "09:00"
  end: string; // "17:00"
}

export type WeeklyAvailability = {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
};

export interface Provider {
  providerId: string; // same as userId — one provider profile per user
  userId: string;
  skills: string[];
  serviceAreas: string[];
  experienceYears: number;
  availability: WeeklyAvailability;
  priceMin: number;
  priceMax: number;
  bio: string | null;
  profilePhotoUrl: string | null; // set on Day 8 once Storage upload lands
  nicDocUrl: string | null; // set on Day 8
  ratingAvg: number;
  ratingCount: number;
  nicVerified: boolean;
  photoVerified: boolean;
  totalEarnings: number;
  createdAt: number;
  updatedAt: number;
}

export const SKILL_OPTIONS = [
  "plumbing",
  "electrical",
  "carpentry",
  "cleaning",
  "painting",
  "gardening",
  "appliance-repair",
  "moving",
] as const;

export const SERVICE_AREA_OPTIONS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Galle",
  "Matara",
  "Negombo",
  "Jaffna",
] as const;

export const DEFAULT_AVAILABILITY: WeeklyAvailability = {
  monday: { available: true, start: "09:00", end: "17:00" },
  tuesday: { available: true, start: "09:00", end: "17:00" },
  wednesday: { available: true, start: "09:00", end: "17:00" },
  thursday: { available: true, start: "09:00", end: "17:00" },
  friday: { available: true, start: "09:00", end: "17:00" },
  saturday: { available: false, start: "09:00", end: "17:00" },
  sunday: { available: false, start: "09:00", end: "17:00" },
};

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  DEFAULT_AVAILABILITY,
  SKILL_OPTIONS,
  SERVICE_AREA_OPTIONS,
  WeeklyAvailability,
  Provider,
} from "@/types/provider";

const EXPERIENCE_OPTIONS = [1, 2, 3, 5] as const; // "5" represents "5+"
const DAY_LABELS: { key: keyof WeeklyAvailability; label: string }[] = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
];

function EditProviderProfileForm() {
  const router = useRouter();
  const { firebaseUser } = useAuthContext();

  const [loadingExisting, setLoadingExisting] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [skills, setSkills] = useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState<number>(1);
  const [availability, setAvailability] =
    useState<WeeklyAvailability>(DEFAULT_AVAILABILITY);
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(0);
  const [bio, setBio] = useState("");

  // Photo/NIC are captured here but the actual Storage upload lands on Day 8 —
  // for now we just keep the File objects and show a local preview.
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(
    null,
  );
  const [nicFile, setNicFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadExisting() {
      if (!firebaseUser) return;
      const snap = await getDoc(doc(db, "providers", firebaseUser.uid));
      if (snap.exists()) {
        const data = snap.data() as Provider;
        setSkills(data.skills ?? []);
        setServiceAreas(data.serviceAreas ?? []);
        setExperienceYears(data.experienceYears ?? 1);
        setAvailability(data.availability ?? DEFAULT_AVAILABILITY);
        setPriceMin(data.priceMin ?? 0);
        setPriceMax(data.priceMax ?? 0);
        setBio(data.bio ?? "");
      }
      setLoadingExisting(false);
    }
    loadExisting();
  }, [firebaseUser]);

  function toggleFromList(
    list: string[],
    setList: (v: string[]) => void,
    value: string,
  ) {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  }

  function updateDay(
    day: keyof WeeklyAvailability,
    patch: Partial<{
      available: boolean;
      start: string;
      end: string;
    }>,
  ) {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...patch },
    }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setProfilePhotoFile(file);
    setProfilePhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firebaseUser) return;

    if (skills.length === 0 || serviceAreas.length === 0) {
      setError("Pick at least one skill and one service area.");
      return;
    }
    if (priceMax < priceMin) {
      setError("Max price can't be less than min price.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await setDoc(
        doc(db, "providers", firebaseUser.uid),
        {
          providerId: firebaseUser.uid,
          userId: firebaseUser.uid,
          skills,
          serviceAreas,
          experienceYears,
          availability,
          priceMin,
          priceMax,
          bio: bio.trim() || null,
          // profilePhotoUrl / nicDocUrl intentionally untouched here — Day 8 wires
          // the actual Storage upload and writes the resulting URLs.
          ratingAvg: 0,
          ratingCount: 0,
          nicVerified: false,
          photoVerified: false,
          totalEarnings: 0,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
      router.push("/providers/profile/view");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loadingExisting) {
    return <div className="p-6 text-center text-foreground/70">Loading...</div>;
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground">
        Provider profile
      </h1>
      <p className="mt-2 text-foreground/70">
        This is what customers see when they look you up.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Skills */}
        <fieldset>
          <legend className="text-sm font-medium text-foreground">
            Skills
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {SKILL_OPTIONS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleFromList(skills, setSkills, skill)}
                className={`rounded-full border px-4 py-2 text-sm capitalize ${
                  skills.includes(skill)
                    ? "border-brand bg-brand-soft/60 text-brand-strong"
                    : "border-border text-foreground/70"
                }`}
              >
                {skill.replace("-", " ")}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Service areas */}
        <fieldset>
          <legend className="text-sm font-medium text-foreground">
            Service areas
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {SERVICE_AREA_OPTIONS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() =>
                  toggleFromList(serviceAreas, setServiceAreas, area)
                }
                className={`rounded-full border px-4 py-2 text-sm ${
                  serviceAreas.includes(area)
                    ? "border-brand bg-brand-soft/60 text-brand-strong"
                    : "border-border text-foreground/70"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Experience */}
        <div>
          <label
            htmlFor="experience"
            className="text-sm font-medium text-foreground"
          >
            Years of experience
          </label>
          <select
            id="experience"
            value={experienceYears}
            onChange={(e) => setExperienceYears(Number(e.target.value))}
            className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-foreground"
          >
            {EXPERIENCE_OPTIONS.map((yrs) => (
              <option key={yrs} value={yrs}>
                {yrs === 5 ? "5+ years" : `${yrs} year${yrs > 1 ? "s" : ""}`}
              </option>
            ))}
          </select>
        </div>

        {/* Availability */}
        <fieldset>
          <legend className="text-sm font-medium text-foreground">
            Weekly availability
          </legend>
          <div className="mt-3 space-y-2">
            {DAY_LABELS.map(({ key, label }) => {
              const day = availability[key];
              return (
                <div key={key} className="flex items-center gap-3">
                  <label className="flex w-24 items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={day.available}
                      onChange={(e) =>
                        updateDay(key, { available: e.target.checked })
                      }
                    />
                    {label}
                  </label>
                  <input
                    type="time"
                    value={day.start}
                    disabled={!day.available}
                    onChange={(e) => updateDay(key, { start: e.target.value })}
                    className="rounded-lg border border-border px-2 py-1 text-sm disabled:opacity-40"
                  />
                  <span className="text-foreground/50">to</span>
                  <input
                    type="time"
                    value={day.end}
                    disabled={!day.available}
                    onChange={(e) => updateDay(key, { end: e.target.value })}
                    className="rounded-lg border border-border px-2 py-1 text-sm disabled:opacity-40"
                  />
                </div>
              );
            })}
          </div>
        </fieldset>

        {/* Price range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="priceMin"
              className="text-sm font-medium text-foreground"
            >
              Min price (LKR)
            </label>
            <input
              id="priceMin"
              type="number"
              min={0}
              value={priceMin}
              onChange={(e) => setPriceMin(Number(e.target.value))}
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-foreground"
            />
          </div>
          <div>
            <label
              htmlFor="priceMax"
              className="text-sm font-medium text-foreground"
            >
              Max price (LKR)
            </label>
            <input
              id="priceMax"
              type="number"
              min={0}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-foreground"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="text-sm font-medium text-foreground">
            Bio (optional)
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell customers a bit about your work"
            className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-foreground"
          />
        </div>

        {/* Profile photo (preview only — Storage upload is Day 8) */}
        <div>
          <label
            htmlFor="photo"
            className="text-sm font-medium text-foreground"
          >
            Profile photo
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="mt-2 block w-full text-sm text-foreground/70"
          />
          {profilePhotoPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profilePhotoPreview}
              alt="Profile preview"
              className="mt-3 h-20 w-20 rounded-full object-cover"
            />
          )}
          <p className="mt-1 text-xs text-foreground/50">
            {profilePhotoFile
              ? `Selected: ${profilePhotoFile.name} (upload wired on Day 8)`
              : "Not uploaded yet — Day 8 wires this to Firebase Storage"}
          </p>
        </div>

        {/* NIC document (filename only — Storage upload is Day 8) */}
        <div>
          <label htmlFor="nic" className="text-sm font-medium text-foreground">
            NIC document (for verification)
          </label>
          <input
            id="nic"
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setNicFile(e.target.files?.[0] ?? null)}
            className="mt-2 block w-full text-sm text-foreground/70"
          />
          <p className="mt-1 text-xs text-foreground/50">
            {nicFile
              ? `Selected: ${nicFile.name} (upload wired on Day 8)`
              : "Not uploaded yet — Day 8 wires this to Firebase Storage"}
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-6 font-semibold text-white shadow-lg shadow-brand/20 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </main>
  );
}

export default function EditProviderProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["provider"]}>
      <EditProviderProfileForm />
    </ProtectedRoute>
  );
}

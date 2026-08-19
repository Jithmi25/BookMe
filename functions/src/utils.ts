// @ts-nocheck
// Utility helpers used by Cloud Functions and unit tests

export function calculateCommission(amount: number, rate = 0.1) {
  if (amount < 0) throw new Error("amount must be >= 0");
  const commission = Math.round((amount * rate + Number.EPSILON) * 100) / 100;
  const providerEarning =
    Math.round((amount - commission + Number.EPSILON) * 100) / 100;
  return { commissionAmount: commission, providerEarning };
}

export function distanceBetweenCoordinates(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default { calculateCommission, distanceBetweenCoordinates };

import { describe, it, expect } from "vitest";
import { calculateCommission, distanceBetweenCoordinates } from "../src/utils";

describe("calculateCommission", () => {
  it("calculates commission and provider earning at 10%", () => {
    const { commissionAmount, providerEarning } = calculateCommission(100, 0.1);
    expect(commissionAmount).toBe(10);
    expect(providerEarning).toBe(90);
  });

  it("rounds to two decimals", () => {
    const { commissionAmount, providerEarning } = calculateCommission(
      99.99,
      0.123,
    );
    expect(typeof commissionAmount).toBe("number");
    expect(typeof providerEarning).toBe("number");
    expect(commissionAmount).toBeCloseTo(
      Math.round(99.99 * 0.123 * 100) / 100,
      2,
    );
  });

  it("throws on negative amount", () => {
    expect(() => calculateCommission(-1)).toThrow();
  });
});

describe("distanceBetweenCoordinates", () => {
  it("calculates zero distance for same coord", () => {
    const d = distanceBetweenCoordinates(0, 0, 0, 0);
    expect(d).toBeCloseTo(0, 6);
  });

  it("calculates known distance", () => {
    // approx distance between Colombo (6.9271,79.8612) and Kandy (7.2906,80.6337)
    const d = distanceBetweenCoordinates(6.9271, 79.8612, 7.2906, 80.6337);
    expect(d).toBeGreaterThan(60);
    expect(d).toBeLessThan(120);
  });
});

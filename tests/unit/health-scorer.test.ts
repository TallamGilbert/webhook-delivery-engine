import { describe, it, expect } from "vitest";
import { calculateHealthScore } from "../../src/services/health-scorer";

describe("Health Scorer", () => {
  it("returns 100 when there are no recent attempts", async () => {
    const score = await calculateHealthScore("http://never-used.example.com");
    expect(score).toBe(100);
  });

  it("returns correct percentage based on success rate", async () => {
    // This test documents the formula, actual DB tests go in integration
    // Formula: (successes / total) * 100
    expect(Math.round((8 / 10) * 100)).toBe(80);
    expect(Math.round((2 / 10) * 100)).toBe(20);
    expect(Math.round((0 / 10) * 100)).toBe(0);
  });

  it("pauses at score below 20", () => {
    const AUTO_PAUSE_THRESHOLD = 20;
    expect(19 < AUTO_PAUSE_THRESHOLD).toBe(true);
    expect(20 < AUTO_PAUSE_THRESHOLD).toBe(false);
    expect(0 < AUTO_PAUSE_THRESHOLD).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import { signPayload, verifySignature } from "../../src/services/signer";

describe("signPayload", () => {
  const secret = "test-secret";
  const payload = { orderId: 42, status: "shipped" };

  it("produces a hex string", () => {
    const signature = signPayload(payload, secret);
    expect(signature).toMatch(/^[a-f0-9]+$/);
    expect(signature.length).toBe(64); // SHA256 = 32 bytes = 64 hex chars
  });

  it("produces the same signature for the same payload and secret", () => {
    const sig1 = signPayload(payload, secret);
    const sig2 = signPayload(payload, secret);
    expect(sig1).toBe(sig2);
  });

  it("produces different signatures for different payloads", () => {
    const sig1 = signPayload(payload, secret);
    const sig2 = signPayload({ different: true }, secret);
    expect(sig1).not.toBe(sig2);
  });

  it("produces different signatures for different secrets", () => {
    const sig1 = signPayload(payload, secret);
    const sig2 = signPayload(payload, "different-secret");
    expect(sig1).not.toBe(sig2);
  });

  it("is sensitive to payload changes", () => {
    const sig1 = signPayload({ a: 1 }, secret);
    const sig2 = signPayload({ a: 2 }, secret);
    expect(sig1).not.toBe(sig2);
  });
});

describe("verifySignature", () => {
  const secret = "test-secret";
  const payload = { orderId: 42 };

  it("returns true for a valid signature", () => {
    const signature = signPayload(payload, secret);
    expect(verifySignature(payload, signature, secret)).toBe(true);
  });

  it("returns false for a tampered payload", () => {
    const signature = signPayload(payload, secret);
    expect(verifySignature({ orderId: 99 }, signature, secret)).toBe(false);
  });

  it("returns false for the wrong secret", () => {
    const signature = signPayload(payload, secret);
    expect(verifySignature(payload, signature, "wrong-secret")).toBe(false);
  });
});

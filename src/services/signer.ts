import { createHmac, timingSafeEqual } from "crypto";

export function signPayload(
  payload: Record<string, unknown>,
  secret: string,
): string {
  const payloadString = JSON.stringify(payload);
  return createHmac("sha256", secret).update(payloadString).digest("hex");
}

export function verifySignature(
  payload: Record<string, unknown>,
  signature: string,
  secret: string,
): boolean {
  const expected = signPayload(payload, secret);

  if (expected.length !== signature.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

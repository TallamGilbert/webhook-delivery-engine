import { config } from "../config";
import { signPayload } from "./signer";

export interface DeliveryResult {
  success: boolean;
  statusCode?: number;
  error?: string;
}

export async function deliver(
  payload: Record<string, unknown>,
  destination: string,
): Promise<DeliveryResult> {
  try {
    const signature = signPayload(payload, config.webhookSecret);

    const response = await fetch(destination, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });

    return {
      success: response.ok,
      statusCode: response.status,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

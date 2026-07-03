# Webhook Delivery Engine

## Payload Signing (and How Receivers Verify It)

Every outgoing webhook payload is signed using HMAC-SHA256 with a shared secret. The signature is sent in the `X-Webhook-Signature` header.

### How a receiver verifies the signature:

```javascript
const crypto = require("crypto");

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

// Usage in your webhook endpoint:
app.post("/webhook", (req, res) => {
  const signature = req.headers["x-webhook-signature"];
  const payload = req.body;

  if (!verifyWebhook(payload, signature, "your-shared-secret")) {
    return res.status(401).send("Invalid signature");
  }

  // Process the event...
  res.status(200).send("OK");
});
```

## Endpoint Health & Auto-Pause

### Health Score Calculation

Each destination endpoint receives a health score from 0 to 100, calculated as:
score = (successful_attempts_in_last_hour / total_attempts_in_last_hour) * 100

text

- If there are no recent attempts, the score defaults to 100 (assumed healthy).
- The score updates as new delivery outcomes are recorded.
- Only attempts from the last 1 hour are considered.

### Auto-Pause Threshold

An endpoint whose score drops below **20** is automatically paused:

- Paused endpoints receive no further delivery attempts.
- Existing pending deliveries to paused endpoints are skipped by the worker.
- Paused endpoints are flagged and viewable via API.

### Viewing Health Scores

````bash
# All endpoints
curl http://localhost:3000/health-scores

# Single endpoint (URL-encoded)
curl http://localhost:3000/health-scores/http%3A%2F%2Fapi.example.com

# Paused endpoints
curl http://localhost:3000/paused-endpoints

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
````

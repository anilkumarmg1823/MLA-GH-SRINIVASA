/**
 * Simulate a Meta WhatsApp webhook locally (no Meta account required).
 *
 * Usage:
 *   node scripts/simulateWhatsAppWebhook.js
 *   node scripts/simulateWhatsAppWebhook.js --from=919876543210 --text=hi
 *
 * Requires the API running on PORT (default 4000). WHATSAPP_ENABLED can be false;
 * this only hits the webhook HTTP layer. For full bot replies, enable WhatsApp
 * and set a valid token (outbound Graph calls need Meta).
 */
const PORT = process.env.PORT || 4000;
const base = `http://127.0.0.1:${PORT}`;

function arg(name, fallback = "") {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
}

const from = arg("from", "919999999999");
const text = arg("text", "hi");

const payload = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "WABA_TEST",
      changes: [
        {
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "15550000000",
              phone_number_id: "TEST_PHONE_ID",
            },
            contacts: [
              {
                profile: { name: "Test Citizen" },
                wa_id: from,
              },
            ],
            messages: [
              {
                from,
                id: `wamid.TEST_${Date.now()}`,
                timestamp: String(Math.floor(Date.now() / 1000)),
                type: "text",
                text: { body: text },
              },
            ],
          },
          field: "messages",
        },
      ],
    },
  ],
};

async function main() {
  const status = await fetch(`${base}/api/v1/whatsapp/status`).then((r) =>
    r.json()
  );
  console.log("WhatsApp status:", status);

  const verify = await fetch(
    `${base}/api/v1/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(
      process.env.WHATSAPP_VERIFY_TOKEN || "kudligi-wa-verify-change-me"
    )}&hub.challenge=12345`
  );
  console.log("Verify challenge HTTP", verify.status, await verify.text());

  const res = await fetch(`${base}/api/v1/whatsapp/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  console.log("Webhook POST", res.status, await res.json());
  console.log("Sent simulated inbound:", { from, text });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

# WhatsApp Complaint Bot — Meta Cloud API setup

This project uses **WhatsApp Cloud API** (not a personal WhatsApp number).

## Keys you need

| Env var | Where to get it |
|--------|------------------|
| `WHATSAPP_ENABLED=true` | Turn the bot on |
| `WHATSAPP_TOKEN` | Meta App → WhatsApp → API Setup → Temporary access token (later: System User permanent token) |
| `WHATSAPP_PHONE_NUMBER_ID` | API Setup → Phone number ID |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | API Setup → WhatsApp Business Account ID |
| `WHATSAPP_APP_SECRET` | App → Settings → Basic → App Secret |
| `WHATSAPP_VERIFY_TOKEN` | Invent any strong string, e.g. `kudligi-wa-verify-xxxx` |
| `WHATSAPP_API_VERSION` | Default `v21.0` |

Copy placeholders from [`.env.example`](../.env.example) into your local `backend/.env`.

## Meta checklist (you do this)

1. Open [developers.facebook.com](https://developers.facebook.com/) → your app → add **WhatsApp**.
2. In **WhatsApp → API Setup**, copy the token + Phone number ID + WABA ID.
3. Add your phone under **To** (test recipients).
4. After the API is running with ngrok, set webhook:
   - Callback URL: `https://<ngrok-host>/api/v1/whatsapp/webhook`
   - Verify token: same as `WHATSAPP_VERIFY_TOKEN`
   - Subscribe: `messages`
5. (Recommended) Create templates for replies outside the 24h window:
   - `complaint_registered_kn` / `complaint_registered_en` — body has `{{1}}` = ticket id
   - `complaint_reply_kn` / `complaint_reply_en` — body has `{{1}}` = officer reply text

## Local test with ngrok

```bash
# terminal 1 — backend
cd backend
npm run db:push
npm run dev

# terminal 2 — tunnel
ngrok http 4000
```

Paste the ngrok HTTPS URL + `/api/v1/whatsapp/webhook` into Meta.

Check config:

```bash
curl http://localhost:4000/api/v1/whatsapp/status
```

Then message the **Meta test number** from your allowed phone:

1. Say `hi` → pick Kannada / English  
2. Name → phone → Gram Panchayat → village → subject → message → photos  
3. Confirm → ticket appears in Admin → Complaints  
4. Officer types a reply → you receive WhatsApp message  

## Important limits

- Cannot bind the bot to a leader’s **personal** WhatsApp.
- Temporary tokens expire (~24h); use a System User token for staging/production.
- Outside the 24h customer-care window, free-form replies fail until message templates are approved.

---

## Production: use your own business number (leave test number)

Sandbox testing uses Meta’s **test number** (Phone number ID like `1262…`). For deployment, citizens should message **your** line (example: `+91 9187154357`).

### Before you start

1. The SIM must receive SMS/voice OTP.
2. If that number already has **personal WhatsApp** or **WhatsApp Business app**, delete/unlink that account first — one number can only be on Cloud API **or** the phone app, not both.
3. Prefer a Meta **System User** permanent token (not the temporary API Setup token).

### Meta steps (you do this in Business Manager)

1. Open [business.facebook.com](https://business.facebook.com/) → **WhatsApp Accounts** / **WhatsApp Manager**.
2. Select your WABA (or create one) linked to the same Meta app as this project.
3. **Phone numbers → Add phone number**.
4. Enter **+91 9187154357**, verify with the OTP Meta sends.
5. Complete **display name** (e.g. Kudligi MLA Office) — Meta must approve it for a professional sender identity.
6. In **developers.facebook.com** → your app → **WhatsApp → API Setup** (or WhatsApp Manager → API):
   - Copy the **new** **Phone number ID** for `+91 9187154357` (different from the test number ID).
   - Confirm **WhatsApp Business Account ID**.
7. Create a **System User** token with `whatsapp_business_messaging` + `whatsapp_business_management`, assign the WABA, generate a permanent token.
8. Set the **production webhook** (not ngrok):
   - Callback: `https://<your-api-host>/api/v1/whatsapp/webhook`
   - Verify token: same as `WHATSAPP_VERIFY_TOKEN` in `.env`
   - Subscribe: `messages`

### Update `backend/.env`

```env
WHATSAPP_ENABLED=true
WHATSAPP_TOKEN=<permanent System User token>
WHATSAPP_PHONE_NUMBER_ID=<NEW id for +91 9187154357 — not the test id>
WHATSAPP_BUSINESS_ACCOUNT_ID=<your WABA id>
WHATSAPP_APP_SECRET=<App → Settings → Basic → App Secret>
WHATSAPP_VERIFY_TOKEN=<same string configured in Meta webhook>
```

Restart the API after saving. Do **not** leave the old test Phone number ID in production.

### Smoke check

```bash
curl http://localhost:4000/api/v1/whatsapp/status
```

Then from any phone, WhatsApp **+91 9187154357** and send `hi` — bot should reply with language buttons.

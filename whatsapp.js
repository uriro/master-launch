// /api/whatsapp.js
export default async function handler(req, res) {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "master-secret-2025";
  const TOKEN = process.env.WHATSAPP_TOKEN;            // תגדיר ב-Vercel
  const PHONE_ID = process.env.WHATSAPP_PHONE_ID || "706781482526617";

  // אימות מול Meta (בעת חיבור ה-webhook)
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }

  // קבלת הודעות בפועל
  if (req.method === "POST") {
    try {
      const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if (!msg) return res.sendStatus(200);

      const from = msg.from;                       // מספר השולח
      const text = msg.text?.body || "";           // תוכן ההודעה (אם טקסט)

      // תשובת אקו בסיסית
      const reply = {
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: { body: `קיבלתי: ${text} 👍` }
      };

      await fetch(`https://graph.facebook.com/v20.0/${PHONE_ID}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(reply)
      });

      return res.sendStatus(200);
    } catch (e) {
      console.error("Webhook error:", e);
      return res.sendStatus(200);
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.sendStatus(405);
}

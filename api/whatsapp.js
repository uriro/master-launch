// api/whatsapp.js — Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // קלט: GET (לבדיקה מהירה) או POST (production)
  const to =
    (req.method === 'GET' ? req.query.to : req.body?.to) ||
    process.env.TEST_RECIPIENT; // אופציונלי
  const text =
    (req.method === 'GET' ? req.query.text : req.body?.text) ||
    'Hello from MasterRobotics!';

  if (!to) {
    return res.status(400).json({ error: 'Missing "to" phone number' });
  }

  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    return res
      .status(500)
      .json({ error: 'Missing env vars WHATSAPP_TOKEN / PHONE_NUMBER_ID' });
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json({ error: data });

    return res.status(200).json({ ok: true, data });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

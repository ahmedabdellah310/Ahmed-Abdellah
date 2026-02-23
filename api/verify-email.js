export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ ok: false, error: 'Method Not Allowed' });
      return;
    }

    const email = (req.query?.email || '').toString().trim();
    if (!email) {
      res.status(400).json({ ok: false, error: 'Missing email' });
      return;
    }

    const apiKey = process.env.ABSTRACT_API_KEY;
    if (!apiKey) {
      res.status(500).json({ ok: false, error: 'Server not configured' });
      return;
    }

    const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${encodeURIComponent(apiKey)}&email=${encodeURIComponent(email)}`;
    const r = await fetch(url);

    if (!r.ok) {
      res.status(502).json({ ok: false, error: 'Upstream error' });
      return;
    }

    const data = await r.json();

    const normalized = {
      ok: true,
      email,
      is_valid_format: Boolean(data?.is_valid_format?.value),
      is_mx_found: Boolean(data?.is_mx_found?.value),
      deliverability: (data?.deliverability || '').toString(),
      is_disposable_email: Boolean(data?.is_disposable_email?.value),
      quality_score: data?.quality_score
    };

    res.status(200).json(normalized);
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}

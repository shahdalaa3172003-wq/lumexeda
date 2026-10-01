export default async function handler(req, res) {
  const fileId = req.query.id;
  if (!fileId) {
    return res.status(400).send('Missing id parameter');
  }

  const primaryUrl = `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w800`;

  try {
    const response = await fetch(primaryUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (!response.ok) {
      return res.status(response.status).send(`Drive returned HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    return res.status(200).send(buffer);
  } catch (error) {
    return res.status(502).send('Image fetch failed: ' + error.message);
  }
}

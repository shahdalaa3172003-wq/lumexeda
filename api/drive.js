export default async function handler(req, res) {
  const API_KEY = process.env.GOOGLE_DRIVE_API_KEY;
  const FOLDER_ID = '1xPA2BPpMxkdV_t_3fJOke3bxpVu8gnLv';
  const EXCLUDED_FOLDERS = [
    '10UZX2IDNPay4kmi-9kQBOJLe55vW4KIc',
    '1ozF9RMTKYo7-arx8jgtX5xmfqexcos-J'
  ];
  const VALID_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!API_KEY) {
    return res.status(500).json({ error: 'Missing API key' });
  }

  try {
    const allImages = [];
    const foldersToProcess = [FOLDER_ID];

    while (foldersToProcess.length > 0) {
      const currentFolder = foldersToProcess.shift();
      if (EXCLUDED_FOLDERS.includes(currentFolder)) continue;

      let pageToken = null;
      do {
        let apiUrl = `https://www.googleapis.com/drive/v3/files?q='${currentFolder}'+in+parents+and+trashed=false&fields=nextPageToken,files(id,name,mimeType,parents)&pageSize=100&key=${API_KEY}`;
        if (pageToken) apiUrl += `&pageToken=${encodeURIComponent(pageToken)}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.error) {
          return res.status(500).json({ error: data.error.message });
        }

        const files = data.files || [];
        for (const f of files) {
          const isExcludedParent = f.parents && f.parents.some(p => EXCLUDED_FOLDERS.includes(p));
          if (EXCLUDED_FOLDERS.includes(f.id) || isExcludedParent) {
            continue;
          }

          if (f.mimeType === 'application/vnd.google-apps.folder') {
            foldersToProcess.push(f.id);
          } else if (VALID_MIMES.includes(f.mimeType)) {
            allImages.push(f);
          }
        }
        pageToken = data.nextPageToken;
      } while (pageToken);
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ images: allImages });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch from Drive: ' + error.message });
  }
}

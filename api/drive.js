export default async function handler(req, res) {
  const API_KEY = process.env.GOOGLE_DRIVE_API_KEY;
  const FOLDER_ID = '1xPA2BPpMxkdV_t_3fJOke3bxpVu8gnLv';
  const EXCLUDED_FOLDERS = [
    '10UZX2IDNPay4kmi-9kQBOJLe55vW4KIc',
    '1ozF9RMTKYo7-arx8jgtX5xmfqexcos-J'
  ];
  const VALID_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  // Helper: fetch files using official Google Drive API v3
  async function fetchWithApiKey(apiKey) {
    const allImages = [];
    const foldersToProcess = [FOLDER_ID];

    while (foldersToProcess.length > 0) {
      const currentFolder = foldersToProcess.shift();
      if (EXCLUDED_FOLDERS.includes(currentFolder)) continue;

      let pageToken = null;
      do {
        let apiUrl = `https://www.googleapis.com/drive/v3/files?q='${currentFolder}'+in+parents+and+trashed=false&fields=nextPageToken,files(id,name,mimeType,parents)&pageSize=100&key=${apiKey}`;
        if (pageToken) apiUrl += `&pageToken=${encodeURIComponent(pageToken)}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message || 'Drive API error');
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
    return allImages;
  }

  // Helper: fetch files via public folder scraping fallback
  async function fetchPublicFolderFallback() {
    const fetchFolderIds = async (folderId) => {
      try {
        const response = await fetch(`https://drive.google.com/drive/folders/${folderId}?usp=sharing`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
        const text = await response.text();
        const matches = text.match(/1[a-zA-Z0-9_\-]{32}/g) || [];
        return Array.from(new Set(matches));
      } catch (e) {
        return [];
      }
    };

    // Gather all IDs inside excluded folders
    const excludedSet = new Set(EXCLUDED_FOLDERS);
    for (const folderId of EXCLUDED_FOLDERS) {
      const ids = await fetchFolderIds(folderId);
      ids.forEach(id => excludedSet.add(id));
    }

    // Gather IDs in main folder
    const mainFolderIds = await fetchFolderIds(FOLDER_ID);
    const candidates = mainFolderIds.filter(id => !excludedSet.has(id));

    return candidates.map(id => ({ id, name: 'Portfolio Work' }));
  }

  try {
    let images = [];
    if (API_KEY) {
      try {
        images = await fetchWithApiKey(API_KEY);
      } catch (err) {
        console.warn('API key fetch failed, falling back to public drive parser:', err.message);
        images = await fetchPublicFolderFallback();
      }
    } else {
      images = await fetchPublicFolderFallback();
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ images });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch Drive images: ' + error.message });
  }
}

/**
 * Lumexeda Portfolio – Local Development Server
 *
 * Zero npm dependencies. Pure Node.js built-ins only.
 * Reads GOOGLE_DRIVE_API_KEY from a .env file.
 *
 * Usage:
 *   1. Copy .env.example → .env and add your API key
 *   2. node server.js
 *   3. Open http://localhost:3000
 */

'use strict';

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

// ── Load .env (no external deps) ────────────────────────────────────────────
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8')
    .split(/\r?\n/)
    .forEach(function(line) {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      var idx = line.indexOf('=');
      if (idx < 1) return;
      var key = line.slice(0, idx).trim();
      var val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !(key in process.env)) process.env[key] = val;
    });
} catch (e) {
  // .env file is optional
}

// ── Config ───────────────────────────────────────────────────────────────────
var PORT      = process.env.PORT || 3000;
var FOLDER_ID = '1xPA2BPpMxkdV_t_3fJOke3bxpVu8gnLv';
var API_KEY   = process.env.GOOGLE_DRIVE_API_KEY || '';
var VALID_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

var MIME_MAP = {
  '.html'  : 'text/html; charset=utf-8',
  '.css'   : 'text/css',
  '.js'    : 'application/javascript',
  '.json'  : 'application/json',
  '.png'   : 'image/png',
  '.jpg'   : 'image/jpeg',
  '.jpeg'  : 'image/jpeg',
  '.gif'   : 'image/gif',
  '.webp'  : 'image/webp',
  '.svg'   : 'image/svg+xml',
  '.ico'   : 'image/x-icon',
  '.woff'  : 'font/woff',
  '.woff2' : 'font/woff2',
  '.ttf'   : 'font/ttf',
};

// ── In-memory cache for Drive file list ─────────────────────────────────────
var driveCache = { data: null, ts: 0 };
var CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ── Disk cache for Drive images ──────────────────────────────────────────────
// Images are 1-3MB each and take 15-30s to download from Drive when concurrent.
// We cache them to disk on first download; subsequent requests serve instantly.
var IMG_CACHE_DIR = path.join(__dirname, '.img-cache');
var imgCacheReady = false;
var pendingRequests = {}; // fileId -> array of {res} waiting for same image

try {
  if (!fs.existsSync(IMG_CACHE_DIR)) fs.mkdirSync(IMG_CACHE_DIR);
  imgCacheReady = true;
  console.log('  💾  Image disk cache: ' + IMG_CACHE_DIR);
} catch(e) {
  console.warn('  ⚠️   Image disk cache unavailable:', e.message, '(will proxy directly)');
}

function cachePath(fileId) {
  // Sanitize fileId (Drive IDs are alphanumeric + _-)
  return path.join(IMG_CACHE_DIR, fileId.replace(/[^a-zA-Z0-9_\-]/g, '') + '.bin');
}

function cacheMetaPath(fileId) {
  return cachePath(fileId) + '.meta';
}

// ── Google Drive API helper ──────────────────────────────────────────────────
var EXCLUDED_FOLDERS = [
  '10UZX2IDNPay4kmi-9kQBOJLe55vW4KIc',
  '1ozF9RMTKYo7-arx8jgtX5xmfqexcos-J'
];

function driveRequest(folderId, pageToken, callback) {
  var q = encodeURIComponent("'" + folderId + "' in parents and trashed=false");
  var fields = encodeURIComponent('nextPageToken,files(id,name,mimeType,parents)');
  var apiUrl = 'https://www.googleapis.com/drive/v3/files'
    + '?q='         + q
    + '&fields='    + fields
    + '&pageSize=100'
    + '&key='       + encodeURIComponent(API_KEY);
  if (pageToken) apiUrl += '&pageToken=' + encodeURIComponent(pageToken);

  var req = https.get(apiUrl, function(res) {
    var body = '';
    res.on('data', function(c) { body += c; });
    res.on('end', function() {
      try { callback(null, JSON.parse(body)); }
      catch(e) { callback(new Error('Invalid JSON from Drive API')); }
    });
  });
  req.on('error', callback);
  req.setTimeout(10000, function() { req.abort(); callback(new Error('Drive API request timed out')); });
}

function fetchPublicFolderFallback(callback) {
  function fetchFolderIds(folderId, cb) {
    var req = https.get('https://drive.google.com/drive/folders/' + folderId, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, function(res) {
      var body = '';
      res.on('data', function(c) { body += c; });
      res.on('end', function() {
        var matches = body.match(/1[a-zA-Z0-9_\-]{32}/g) || [];
        var unique = Array.from(new Set(matches));
        cb(null, unique);
      });
    });
    req.on('error', function(e) { cb(e, []); });
  }

  var excludedSet = new Set(EXCLUDED_FOLDERS);
  var pending = EXCLUDED_FOLDERS.length;

  if (pending === 0) {
    getFolder();
  } else {
    EXCLUDED_FOLDERS.forEach(function(fId) {
      fetchFolderIds(fId, function(err, ids) {
        ids.forEach(function(id) { excludedSet.add(id); });
        pending--;
        if (pending === 0) getFolder();
      });
    });
  }

  function getFolder() {
    fetchFolderIds(FOLDER_ID, function(err, mainIds) {
      if (err) return callback(err);
      var validImages = [];
      mainIds.forEach(function(id) {
        if (!excludedSet.has(id)) {
          validImages.push({ id: id, name: 'Portfolio Work' });
        }
      });
      callback(null, validImages);
    });
  }
}

function fetchAllDriveFiles(callback) {
  // Return cached data if fresh
  if (driveCache.data && (Date.now() - driveCache.ts) < CACHE_TTL_MS) {
    return callback(null, driveCache.data);
  }

  if (!API_KEY) {
    fetchPublicFolderFallback(function(err, images) {
      if (!err && images) {
        driveCache.data = images;
        driveCache.ts = Date.now();
      }
      callback(err, images);
    });
    return;
  }

  var allImages = [];
  var foldersToProcess = [FOLDER_ID];
  var processing = 0;
  var hasError = null;

  function processNextFolder() {
    if (hasError) return;
    if (foldersToProcess.length === 0 && processing === 0) {
      // Store in cache
      driveCache.data = allImages;
      driveCache.ts   = Date.now();
      return callback(null, allImages);
    }
    if (foldersToProcess.length === 0) return;

    var currentFolder = foldersToProcess.shift();
    if (EXCLUDED_FOLDERS.indexOf(currentFolder) !== -1) {
      processNextFolder();
      return;
    }
    processing++;

    function fetchPage(token) {
      if (hasError) return;
      driveRequest(currentFolder, token, function(err, data) {
        if (hasError) {
          return;
        }
        if (err || (data && data.error)) {
          // Fallback to public folder scraper if API key fails
          fetchPublicFolderFallback(function(fallbackErr, fallbackImages) {
            if (!fallbackErr && fallbackImages) {
              driveCache.data = fallbackImages;
              driveCache.ts = Date.now();
              return callback(null, fallbackImages);
            }
            hasError = err || new Error(data.error.message);
            return callback(hasError);
          });
          return;
        }

        var files = data.files || [];
        for (var i = 0; i < files.length; i++) {
          var f = files[i];
          // Check if file itself or parent folder is excluded
          var isExcludedParent = f.parents && f.parents.some(function(p){ return EXCLUDED_FOLDERS.indexOf(p) !== -1; });
          if (EXCLUDED_FOLDERS.indexOf(f.id) !== -1 || isExcludedParent) {
            continue;
          }

          if (f.mimeType === 'application/vnd.google-apps.folder') {
            foldersToProcess.push(f.id);
          } else if (VALID_MIMES.indexOf(f.mimeType) !== -1) {
            allImages.push(f);
          }
        }

        if (data.nextPageToken) {
          fetchPage(data.nextPageToken);
        } else {
          processing--;
          processNextFolder();
        }
      });
    }
    fetchPage(null);
  }

  processNextFolder();
}

// ── HTTP Server ──────────────────────────────────────────────────────────────
var server = http.createServer(function(req, res) {
  var parsed  = url.parse(req.url);
  var reqPath = parsed.pathname;

  // ── /api/drive ─────────────────────────────────────────────────────────
  if (reqPath === '/api/drive') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');

    if (!API_KEY) {
      res.writeHead(500);
      res.end(JSON.stringify({
        error: 'GOOGLE_DRIVE_API_KEY is not set. Add it to your .env file.'
      }));
      return;
    }

    fetchAllDriveFiles(function(err, images) {
      if (err) {
        res.writeHead(502);
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
      res.writeHead(200);
      res.end(JSON.stringify({ images: images }));
    });
    return;
  }

  // ── /api/drive/thumb?id=FILE_ID ────────────────────────────────────────
  // Proxies the image through the server using the authenticated Drive API.
  // Caches on disk so repeated requests are served instantly.
  if (reqPath === '/api/showcase-images' || reqPath === '/api/studio-images' || reqPath === '/api/social-images') {
    let targetFolder = 'showcase';
    if (reqPath === '/api/studio-images') targetFolder = 'studio-images';
    if (reqPath === '/api/social-images') targetFolder = 'social-media-designs';

    const absPath = path.join(__dirname, targetFolder);
    function getFilesRecursively(dir) {
      let results = [];
      try {
        const list = fs.readdirSync(dir);
        list.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat && stat.isDirectory()) {
            results = results.concat(getFilesRecursively(filePath));
          } else {
            results.push(filePath);
          }
        });
      } catch (e) {}
      return results;
    }
    
    const allFiles = getFilesRecursively(absPath);
    const images = allFiles
      .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
      .map(f => '/' + targetFolder + '/' + path.relative(absPath, f).replace(/\\\\/g, '/'));
      
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ images }));
    return;
  }
  
  if (reqPath === '/api/drive/thumb') {
    var fileId = parsed.query && url.parse(req.url, true).query.id;
    if (!fileId) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing id parameter');
      return;
    }
    if (!API_KEY) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('API key not configured');
      return;
    }

    var cFile = cachePath(fileId);
    var cMeta = cacheMetaPath(fileId);

    // 1. Check disk cache
    if (imgCacheReady && fs.existsSync(cFile) && fs.existsSync(cMeta)) {
      try {
        var metaStr = fs.readFileSync(cMeta, 'utf8');
        var meta = JSON.parse(metaStr);
        res.writeHead(200, {
          'Content-Type': meta.contentType || 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
        });
        fs.createReadStream(cFile).pipe(res);
        return;
      } catch (e) {
        // Cache read failed, proceed to fetch
      }
    }

    // 2. Handle deduplication for concurrent requests for same fileId
    if (pendingRequests[fileId]) {
      pendingRequests[fileId].push(res);
      return;
    }
    pendingRequests[fileId] = [res];

    function respondAll(statusCode, headers, bufErr, dataBuf) {
      var queue = pendingRequests[fileId] || [];
      delete pendingRequests[fileId];
      queue.forEach(function(r) {
        if (bufErr) {
          r.writeHead(statusCode, { 'Content-Type': 'text/plain' });
          r.end(bufErr);
        } else {
          r.writeHead(statusCode, headers);
          r.end(dataBuf);
        }
      });
    }

    // Fetch from Google CDN (lh3) which is fast, supports resizing, and does not return 403 on shared files
    function fetchDriveContent(targetUrl, redirects) {
      if (redirects > 5) {
        respondAll(508, {}, 'Too many redirects', null);
        return;
      }
      var imgReq = https.get(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } },
        function(driveRes) {
          var status = driveRes.statusCode || 200;
          if (status >= 300 && status < 400 && driveRes.headers.location) {
            fetchDriveContent(driveRes.headers.location, redirects + 1);
            return;
          }
          var ct = driveRes.headers['content-type'] || 'image/jpeg';
          if (status !== 200) {
            respondAll(status, {}, 'Drive returned HTTP ' + status, null);
            return;
          }

          var chunks = [];
          driveRes.on('data', function(c) { chunks.push(c); });
          driveRes.on('end', function() {
            var buffer = Buffer.concat(chunks);
            // Write to disk cache
            if (imgCacheReady && buffer.length > 0) {
              try {
                fs.writeFileSync(cFile, buffer);
                fs.writeFileSync(cMeta, JSON.stringify({ contentType: ct }));
              } catch(e) {
                console.warn('[cache] write error for', fileId, e.message);
              }
            }
            respondAll(200, {
              'Content-Type': ct,
              'Cache-Control': 'public, max-age=86400',
            }, null, buffer);
          });
        }
      );
      imgReq.on('error', function(e) {
        respondAll(502, {}, 'Image fetch failed: ' + e.message, null);
      });
      imgReq.setTimeout(20000, function() {
        imgReq.abort();
        respondAll(504, {}, 'Image fetch timed out', null);
      });
    }

    var primaryUrl = 'https://lh3.googleusercontent.com/d/' + encodeURIComponent(fileId) + '=w800';
    fetchDriveContent(primaryUrl, 0);
    return;
  }


  // ── Static files ────────────────────────────────────────────────────────
  // Normalise path and prevent directory traversal
  // Fix for Windows: path.normalize('/') → '\' not '/', so check reqPath first
  var decodedReq = decodeURIComponent(reqPath);
  var cleanReq   = reqPath === '/' || reqPath === '' ? '/index.html' : decodedReq;
  var safePath   = path.normalize(cleanReq).replace(/^(\.\.[\/\\])+/, '');
  // Ensure we never resolve to a directory (fallback to index.html)
  if (!path.extname(safePath)) safePath = path.join(safePath, 'index.html');

  var filePath    = path.join(__dirname, safePath);
  var ext         = path.extname(filePath).toLowerCase();
  var contentType = MIME_MAP[ext] || 'application/octet-stream';

  fs.stat(filePath, function(statErr, stat) {
    if (statErr) {
      if (statErr.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        console.error('[static] stat error:', statErr.code, statErr.message);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Error: ' + statErr.message);
      }
      return;
    }
    res.writeHead(200, {
      'Content-Type'   : contentType,
      'Content-Length' : stat.size,
      'Cache-Control'  : ext === '.html' ? 'no-cache' : 'public, max-age=86400',
    });
    var stream = fs.createReadStream(filePath);
    stream.on('error', function(e) {
      console.error('[static] stream error:', e.message);
      try { res.destroy(); } catch(_) {}
    });
    stream.pipe(res);
  });
});

server.listen(PORT, function() {
  console.log('');
  console.log('  ✅  Lumexeda Portfolio → http://localhost:' + PORT);
  console.log('');
  if (API_KEY) {
    console.log('  🔑  Google Drive API key: found');
  } else {
    console.log('  ❌  Google Drive API key: NOT SET');
    console.log('      Create a .env file with:');
    console.log('      GOOGLE_DRIVE_API_KEY=your_key_here');
    console.log('');
    console.log('      See .env.example for instructions.');
  }
  console.log('');
});

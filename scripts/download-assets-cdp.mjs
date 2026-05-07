/**
 * Downloads Mario Party assets using Chrome DevTools Protocol (CDP).
 * Intercepts actual network responses — bypasses hotlink/bot detection.
 */
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { mkdirSync, existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

puppeteer.use(StealthPlugin());

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'images');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  args: ['--window-size=800,600', '--disable-web-security'],
});

const page = await browser.newPage();
const cdp = await page.createCDPSession();
await cdp.send('Network.enable');

// Warm up session
console.log('Warming up session...');
await page.goto('https://www.mariowiki.com/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1500));

async function downloadImageCDP(url, dest) {
  if (!url || url.startsWith('/')) return false;

  return new Promise(async (resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) { resolved = true; resolve(false); }
    }, 20000);

    const handler = async ({ requestId, response }) => {
      if (resolved) return;
      const mime = response.mimeType || '';
      if (!mime.includes('image')) {
        // Not an image response — skip
        return;
      }
      try {
        const { body, base64Encoded } = await cdp.send('Network.getResponseBody', { requestId });
        const buf = base64Encoded ? Buffer.from(body, 'base64') : Buffer.from(body);
        if (buf.length < 1000) {
          // Too small — probably an error page
          return;
        }
        await writeFile(dest, buf);
        clearTimeout(timer);
        resolved = true;
        cdp.off('Network.responseReceived', handler);
        resolve(true);
      } catch {}
    };

    cdp.on('Network.responseReceived', handler);

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 18000 });
    } catch {
      // Timeout is ok — CDP might have already captured it
    }

    // Give it 2 more seconds in case CDP fires after navigation
    await new Promise(r => setTimeout(r, 2000));
    if (!resolved) {
      clearTimeout(timer);
      resolved = true;
      cdp.off('Network.responseReceived', handler);
      resolve(false);
    }
  });
}

// Also try fetch from within browser context (avoids CORS for same-origin)
async function downloadViaEval(url, dest) {
  if (!url || url.startsWith('/')) return false;
  try {
    const result = await page.evaluate(async (u) => {
      try {
        const r = await fetch(u, { credentials: 'include' });
        if (!r.ok) return null;
        const ct = r.headers.get('content-type') || '';
        if (!ct.includes('image')) return null;
        const ab = await r.arrayBuffer();
        return Array.from(new Uint8Array(ab));
      } catch { return null; }
    }, url);

    if (!result || result.length < 1000) return false;
    await writeFile(dest, Buffer.from(result));
    return true;
  } catch {
    return false;
  }
}

async function fetchImage(url, dest) {
  // Try CDP first, fall back to eval
  const ok1 = await downloadImageCDP(url, dest);
  if (ok1) return true;
  const ok2 = await downloadViaEval(url, dest);
  return ok2;
}

// Convert thumbnail URL to direct URL as fallback
function directUrl(thumbUrl) {
  // https://mario.wiki.gallery/images/thumb/4/44/SMPJ_Character_Mario.png/120px-SMPJ_Character_Mario.png
  // → https://mario.wiki.gallery/images/4/44/SMPJ_Character_Mario.png
  return thumbUrl.replace('/images/thumb/', '/images/').replace(/\/\d+px-[^/]+$/, '');
}

async function tryUrls(urls, dest) {
  for (const url of urls) {
    process.stdout.write(`[${url.split('/').pop().slice(0, 20)}]`);
    const ok = await fetchImage(url, dest);
    if (ok) return true;
  }
  return false;
}

async function processChars() {
  const raw = await readFile(join(ROOT, 'src/data/smpj-characters.json'), 'utf8');
  const chars = JSON.parse(raw);

  console.log('\n--- Characters ---');
  for (const c of chars) {
    process.stdout.write(`\n${c.name}: `);

    const iconUrls = [c.icon_url, directUrl(c.icon_url)].filter(u => u && !u.startsWith('/'));
    const portraitUrls = [c.portrait_url, directUrl(c.portrait_url)].filter(u => u && !u.startsWith('/'));

    const ok1 = await tryUrls([...new Set(iconUrls)], join(OUT_DIR, `char_${c.id}_icon.png`));
    if (ok1) c.icon_url = `/images/char_${c.id}_icon.png`;

    const ok2 = await tryUrls([...new Set(portraitUrls)], join(OUT_DIR, `char_${c.id}_portrait.png`));
    if (ok2) c.portrait_url = `/images/char_${c.id}_portrait.png`;

    process.stdout.write(ok1 && ok2 ? ' ✓' : ' PARTIAL');
  }

  await writeFile(join(ROOT, 'src/data/smpj-characters.json'), JSON.stringify(chars, null, 2));
  console.log('\n');
}

async function processSpaces() {
  const raw = await readFile(join(ROOT, 'src/data/smpj-drinking-game-data.json'), 'utf8');
  const data = JSON.parse(raw);

  console.log('--- Spaces ---');
  for (const s of data.spaces) {
    if (!s.sprite_url && !s.icon_url) continue;
    process.stdout.write(`\n${s.name}: `);

    if (s.sprite_url && !s.sprite_url.startsWith('/')) {
      const urls = [s.sprite_url, directUrl(s.sprite_url)].filter(Boolean);
      const ok = await tryUrls([...new Set(urls)], join(OUT_DIR, `space_${s.id}_sprite.png`));
      if (ok) s.sprite_url = `/images/space_${s.id}_sprite.png`;
    }
    if (s.icon_url && !s.icon_url.startsWith('/')) {
      const urls = [s.icon_url];
      if (s.icon_url.includes('/thumb/')) urls.push(directUrl(s.icon_url));
      const ok = await tryUrls([...new Set(urls)], join(OUT_DIR, `space_${s.id}_icon.png`));
      if (ok) s.icon_url = `/images/space_${s.id}_icon.png`;
    }
    process.stdout.write(' ✓');
  }

  await writeFile(join(ROOT, 'src/data/smpj-drinking-game-data.json'), JSON.stringify(data, null, 2));
  console.log('\n');
}

console.log('=== Downloading Mario Party assets via CDP ===');
await processChars();
await processSpaces();
await browser.close();

const files = (await import('fs')).readdirSync(OUT_DIR);
console.log(`Done! ${files.length} files saved to public/images/`);

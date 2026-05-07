import puppeteer from 'puppeteer-core';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'images');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
await page.setExtraHTTPHeaders({ Referer: 'https://www.mariowiki.com/' });

async function fetchImage(url, dest) {
  if (!url || url.startsWith('/')) return null;
  try {
    const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
    const contentType = response.headers()['content-type'] || '';
    if (!contentType.includes('image')) {
      console.warn(`  ! Not an image (${contentType}): ${url}`);
      return null;
    }
    const buffer = await response.buffer();
    await writeFile(dest, buffer);
    return dest;
  } catch (e) {
    console.warn(`  ! Error: ${e.message}`);
    return null;
  }
}

async function processChars() {
  const raw = await readFile(join(ROOT, 'src/data/smpj-characters.json'), 'utf8');
  const chars = JSON.parse(raw);
  for (const c of chars) {
    process.stdout.write(`${c.name}...`);
    const iconFile = `char_${c.id}_icon.png`;
    const portraitFile = `char_${c.id}_portrait.png`;

    const iconSrc = c.icon_url.startsWith('/') ? null : c.icon_url;
    const portraitSrc = c.portrait_url.startsWith('/') ? null : c.portrait_url;

    if (iconSrc) {
      const r = await fetchImage(iconSrc, join(OUT_DIR, iconFile));
      if (r) c.icon_url = `/images/${iconFile}`;
    }
    if (portraitSrc) {
      const r = await fetchImage(portraitSrc, join(OUT_DIR, portraitFile));
      if (r) c.portrait_url = `/images/${portraitFile}`;
    }
    console.log(' ok');
  }
  await writeFile(join(ROOT, 'src/data/smpj-characters.json'), JSON.stringify(chars, null, 2));
}

async function processSpaces() {
  const raw = await readFile(join(ROOT, 'src/data/smpj-drinking-game-data.json'), 'utf8');
  const data = JSON.parse(raw);
  for (const s of data.spaces) {
    if (!s.sprite_url && !s.icon_url) continue;
    process.stdout.write(`${s.name}...`);
    if (s.sprite_url && !s.sprite_url.startsWith('/')) {
      const f = `space_${s.id}_sprite.png`;
      const r = await fetchImage(s.sprite_url, join(OUT_DIR, f));
      if (r) s.sprite_url = `/images/${f}`;
    }
    if (s.icon_url && !s.icon_url.startsWith('/')) {
      const f = `space_${s.id}_icon.png`;
      const r = await fetchImage(s.icon_url, join(OUT_DIR, f));
      if (r) s.icon_url = `/images/${f}`;
    }
    console.log(' ok');
  }
  await writeFile(join(ROOT, 'src/data/smpj-drinking-game-data.json'), JSON.stringify(data, null, 2));
}

console.log('=== Downloading assets via Chrome ===\n');
await processChars();
await processSpaces();
await browser.close();
console.log('\nDone!');

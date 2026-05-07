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
  headless: false, // visible so Cloudflare doesn't block
  args: ['--window-size=800,600'],
});

const page = await browser.newPage();

// Visit the wiki first to get a valid session cookie
console.log('Warming up session on mariowiki.com...');
await page.goto('https://www.mariowiki.com/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));

async function fetchImage(url, dest) {
  if (!url || url.startsWith('/')) return false;
  try {
    const res = await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    if (!res) return false;
    const ct = res.headers()['content-type'] || '';
    if (!ct.includes('image')) {
      console.warn(`  ! HTML response for: ${url}`);
      return false;
    }
    const buf = await res.buffer();
    await writeFile(dest, buf);
    return true;
  } catch (e) {
    console.warn(`  ! ${e.message.slice(0, 60)}`);
    return false;
  }
}

async function run() {
  const charsRaw = await readFile(join(ROOT, 'src/data/smpj-characters.json'), 'utf8');
  const chars = JSON.parse(charsRaw);

  console.log('\n--- Characters ---');
  for (const c of chars) {
    process.stdout.write(`${c.name}... `);
    const iconDest = join(OUT_DIR, `char_${c.id}_icon.png`);
    const portraitDest = join(OUT_DIR, `char_${c.id}_portrait.png`);

    const ok1 = await fetchImage(c.icon_url, iconDest);
    if (ok1) c.icon_url = `/images/char_${c.id}_icon.png`;

    const ok2 = await fetchImage(c.portrait_url, portraitDest);
    if (ok2) c.portrait_url = `/images/char_${c.id}_portrait.png`;

    console.log(ok1 && ok2 ? 'ok' : 'partial');
  }
  await writeFile(join(ROOT, 'src/data/smpj-characters.json'), JSON.stringify(chars, null, 2));

  const dataRaw = await readFile(join(ROOT, 'src/data/smpj-drinking-game-data.json'), 'utf8');
  const data = JSON.parse(dataRaw);

  console.log('\n--- Spaces ---');
  for (const s of data.spaces) {
    if (!s.sprite_url && !s.icon_url) continue;
    process.stdout.write(`${s.name}... `);

    if (s.sprite_url && !s.sprite_url.startsWith('/')) {
      const dest = join(OUT_DIR, `space_${s.id}_sprite.png`);
      const ok = await fetchImage(s.sprite_url, dest);
      if (ok) s.sprite_url = `/images/space_${s.id}_sprite.png`;
    }
    if (s.icon_url && !s.icon_url.startsWith('/')) {
      const dest = join(OUT_DIR, `space_${s.id}_icon.png`);
      const ok = await fetchImage(s.icon_url, dest);
      if (ok) s.icon_url = `/images/space_${s.id}_icon.png`;
    }
    console.log('ok');
  }
  await writeFile(join(ROOT, 'src/data/smpj-drinking-game-data.json'), JSON.stringify(data, null, 2));
}

await run();
await browser.close();
console.log('\nAll done!');

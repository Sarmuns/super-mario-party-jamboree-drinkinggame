/**
 * Restores original space URLs and downloads their images via CDP.
 */
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { mkdirSync, existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

puppeteer.use(StealthPlugin());

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'images');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// Original space data (sprite_url = the main game sprite)
const SPACES = [
  { id: 'blue',        sprite: 'https://mario.wiki.gallery/images/thumb/4/41/SMPJ_Blue_Space.png/120px-SMPJ_Blue_Space.png',             icon: 'https://mario.wiki.gallery/images/9/94/BlueSpace_Sticker.png' },
  { id: 'red',         sprite: 'https://mario.wiki.gallery/images/thumb/0/05/SMPJ_Red_Space.png/120px-SMPJ_Red_Space.png',               icon: 'https://mario.wiki.gallery/images/0/0c/RedSpace_Sticker.png' },
  { id: 'lucky',       sprite: 'https://mario.wiki.gallery/images/thumb/2/28/SMPJ_Lucky_Space.png/120px-SMPJ_Lucky_Space.png',           icon: 'https://mario.wiki.gallery/images/thumb/2/28/SMPJ_Lucky_Space.png/120px-SMPJ_Lucky_Space.png' },
  { id: 'unlucky',     sprite: 'https://mario.wiki.gallery/images/thumb/5/57/SMPJ_Unlucky_Space.png/120px-SMPJ_Unlucky_Space.png',       icon: 'https://mario.wiki.gallery/images/thumb/5/57/SMPJ_Unlucky_Space.png/120px-SMPJ_Unlucky_Space.png' },
  { id: 'event',       sprite: 'https://mario.wiki.gallery/images/thumb/d/d2/SMPJ_Event_Space.png/120px-SMPJ_Event_Space.png',           icon: 'https://mario.wiki.gallery/images/thumb/d/d2/SMPJ_Event_Space.png/120px-SMPJ_Event_Space.png' },
  { id: 'item',        sprite: 'https://mario.wiki.gallery/images/thumb/0/0c/SMPJ_Item_Space.png/120px-SMPJ_Item_Space.png',             icon: 'https://mario.wiki.gallery/images/thumb/0/0c/SMPJ_Item_Space.png/120px-SMPJ_Item_Space.png' },
  { id: 'bowser',      sprite: 'https://mario.wiki.gallery/images/thumb/a/a3/SMPJ_Bowser_Space.png/120px-SMPJ_Bowser_Space.png',         icon: 'https://mario.wiki.gallery/images/thumb/a/a3/SMPJ_Bowser_Space.png/120px-SMPJ_Bowser_Space.png' },
  { id: 'chance_time', sprite: 'https://mario.wiki.gallery/images/thumb/3/34/SMPJ_Chance_Time_Space.png/120px-SMPJ_Chance_Time_Space.png', icon: 'https://mario.wiki.gallery/images/thumb/3/34/SMPJ_Chance_Time_Space.png/120px-SMPJ_Chance_Time_Space.png' },
  { id: 'vs',          sprite: 'https://mario.wiki.gallery/images/thumb/3/3d/SMPJ_VS_Space.png/120px-SMPJ_VS_Space.png',                 icon: 'https://mario.wiki.gallery/images/thumb/3/3d/SMPJ_VS_Space.png/120px-SMPJ_VS_Space.png' },
];

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  args: ['--window-size=800,600'],
});

const page = await browser.newPage();
const cdp = await page.createCDPSession();
await cdp.send('Network.enable');

console.log('Warming up...');
await page.goto('https://www.mariowiki.com/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1500));

async function downloadCDP(url, dest) {
  return new Promise(async (resolve) => {
    let done = false;
    const timer = setTimeout(() => { if (!done) { done = true; resolve(false); } }, 15000);

    const handler = async ({ requestId, response }) => {
      if (done) return;
      if (!(response.mimeType || '').includes('image')) return;
      try {
        const { body, base64Encoded } = await cdp.send('Network.getResponseBody', { requestId });
        const buf = base64Encoded ? Buffer.from(body, 'base64') : Buffer.from(body);
        if (buf.length < 500) return;
        await writeFile(dest, buf);
        clearTimeout(timer);
        done = true;
        cdp.off('Network.responseReceived', handler);
        resolve(true);
      } catch {}
    };

    cdp.on('Network.responseReceived', handler);
    try { await page.goto(url, { waitUntil: 'networkidle2', timeout: 13000 }); } catch {}
    await new Promise(r => setTimeout(r, 2000));
    if (!done) { clearTimeout(timer); done = true; cdp.off('Network.responseReceived', handler); resolve(false); }
  });
}

function directUrl(u) {
  return u.replace('/images/thumb/', '/images/').replace(/\/\d+px-[^/]+$/, '');
}

// Update data JSON with correct local paths
import { readFile, writeFile as wf } from 'fs/promises';
const dataRaw = await readFile(join(ROOT, 'src/data/smpj-drinking-game-data.json'), 'utf8');
const data = JSON.parse(dataRaw);

console.log('\n--- Downloading space images ---');
for (const s of SPACES) {
  process.stdout.write(`${s.id}: `);

  // Download sprite
  const spriteDest = join(OUT_DIR, `space_${s.id}_sprite.png`);
  let spriteOk = await downloadCDP(s.sprite, spriteDest);
  if (!spriteOk) spriteOk = await downloadCDP(directUrl(s.sprite), spriteDest);

  // Download icon (might be same as sprite for some)
  const iconDest = join(OUT_DIR, `space_${s.id}_icon.png`);
  let iconOk = await downloadCDP(s.icon, iconDest);
  if (!iconOk) iconOk = await downloadCDP(directUrl(s.icon), iconDest);

  // Update JSON
  const space = data.spaces.find(sp => sp.id === s.id);
  if (space) {
    if (spriteOk) space.sprite_url = `/images/space_${s.id}_sprite.png`;
    else space.sprite_url = s.sprite; // restore original
    if (iconOk) space.icon_url = `/images/space_${s.id}_icon.png`;
    else space.icon_url = s.icon; // restore original
  }

  console.log(spriteOk && iconOk ? '✓' : `sprite=${spriteOk} icon=${iconOk}`);
}

await wf(join(ROOT, 'src/data/smpj-drinking-game-data.json'), JSON.stringify(data, null, 2));
await browser.close();

const { readdirSync } = await import('fs');
console.log(`\nDone! ${readdirSync(OUT_DIR).length} total files in public/images/`);

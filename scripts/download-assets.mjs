import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { get } from 'https';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'images');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (!url) return resolve(null);
    const file = createWriteStream(dest);
    const req = get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; asset-downloader/1.0)',
        'Referer': 'https://www.mariowiki.com/',
      },
    }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        console.warn(`  SKIP ${res.statusCode}: ${url}`);
        return resolve(null);
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(dest)));
    });
    req.on('error', err => { file.close(); reject(err); });
  });
}

async function processChars() {
  const raw = await readFile(join(ROOT, 'src/data/smpj-characters.json'), 'utf8');
  const chars = JSON.parse(raw);
  for (const c of chars) {
    process.stdout.write(`Downloading ${c.name}...`);

    const iconFile = `char_${c.id}_icon.png`;
    const portraitFile = `char_${c.id}_portrait.png`;

    await download(c.icon_url, join(OUT_DIR, iconFile));
    await download(c.portrait_url, join(OUT_DIR, portraitFile));

    c.icon_url = `/images/${iconFile}`;
    c.portrait_url = `/images/${portraitFile}`;
    console.log(' done');
  }
  await writeFile(join(ROOT, 'src/data/smpj-characters.json'), JSON.stringify(chars, null, 2));
  console.log('characters.json updated.\n');
}

async function processSpaces() {
  const raw = await readFile(join(ROOT, 'src/data/smpj-drinking-game-data.json'), 'utf8');
  const data = JSON.parse(raw);
  for (const s of data.spaces) {
    if (!s.sprite_url && !s.icon_url) continue;
    process.stdout.write(`Downloading ${s.name}...`);

    if (s.sprite_url) {
      const f = `space_${s.id}_sprite.png`;
      await download(s.sprite_url, join(OUT_DIR, f));
      s.sprite_url = `/images/${f}`;
    }
    if (s.icon_url) {
      const f = `space_${s.id}_icon.png`;
      await download(s.icon_url, join(OUT_DIR, f));
      s.icon_url = `/images/${f}`;
    }
    console.log(' done');
  }
  await writeFile(join(ROOT, 'src/data/smpj-drinking-game-data.json'), JSON.stringify(data, null, 2));
  console.log('drinking-game-data.json updated.\n');
}

console.log('=== Downloading Mario Party assets ===\n');
await processChars();
await processSpaces();
console.log('All done! Images saved to public/images/');

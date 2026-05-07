/**
 * download-assets.mjs
 * Baixa todos os sprites de casas e personagens do Mario Party Jamboree
 * 
 * Como usar:
 *   node download-assets.mjs
 * 
 * Pré-requisito: Node 18+ (fetch nativo)
 * Resultado: pasta public/assets/spaces/ e public/assets/characters/
 */

import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

const SPACES = [
  { id: 'blue',         url: 'https://mario.wiki.gallery/images/thumb/4/41/SMPJ_Blue_Space.png/120px-SMPJ_Blue_Space.png' },
  { id: 'red',          url: 'https://mario.wiki.gallery/images/thumb/0/05/SMPJ_Red_Space.png/120px-SMPJ_Red_Space.png' },
  { id: 'lucky',        url: 'https://mario.wiki.gallery/images/thumb/2/28/SMPJ_Lucky_Space.png/120px-SMPJ_Lucky_Space.png' },
  { id: 'unlucky',      url: 'https://mario.wiki.gallery/images/thumb/5/57/SMPJ_Unlucky_Space.png/120px-SMPJ_Unlucky_Space.png' },
  { id: 'event',        url: 'https://mario.wiki.gallery/images/thumb/d/d2/SMPJ_Event_Space.png/120px-SMPJ_Event_Space.png' },
  { id: 'item',         url: 'https://mario.wiki.gallery/images/thumb/0/0c/SMPJ_Item_Space.png/120px-SMPJ_Item_Space.png' },
  { id: 'bowser',       url: 'https://mario.wiki.gallery/images/thumb/a/a3/SMPJ_Bowser_Space.png/120px-SMPJ_Bowser_Space.png' },
  { id: 'chance_time',  url: 'https://mario.wiki.gallery/images/thumb/3/34/SMPJ_Chance_Time_Space.png/120px-SMPJ_Chance_Time_Space.png' },
  { id: 'vs',           url: 'https://mario.wiki.gallery/images/thumb/3/3d/SMPJ_VS_Space.png/120px-SMPJ_VS_Space.png' },
]

const CHARACTERS = [
  { id: 'mario',       portrait: 'https://mario.wiki.gallery/images/thumb/e/e5/SMPJ_Mario.png/200px-SMPJ_Mario.png',        icon: 'https://mario.wiki.gallery/images/thumb/4/44/SMPJ_Character_Mario.png/120px-SMPJ_Character_Mario.png' },
  { id: 'luigi',       portrait: 'https://mario.wiki.gallery/images/thumb/4/48/SMPJ_Luigi.png/200px-SMPJ_Luigi.png',        icon: 'https://mario.wiki.gallery/images/thumb/a/a7/SMPJ_Character_Luigi.png/120px-SMPJ_Character_Luigi.png' },
  { id: 'peach',       portrait: 'https://mario.wiki.gallery/images/thumb/a/a0/SMPJ_Peach.png/200px-SMPJ_Peach.png',        icon: 'https://mario.wiki.gallery/images/thumb/1/14/SMPJ_Character_Peach.png/120px-SMPJ_Character_Peach.png' },
  { id: 'daisy',       portrait: 'https://mario.wiki.gallery/images/thumb/5/53/SMPJ_Daisy.png/200px-SMPJ_Daisy.png',        icon: 'https://mario.wiki.gallery/images/thumb/b/be/SMPJ_Character_Daisy.png/120px-SMPJ_Character_Daisy.png' },
  { id: 'wario',       portrait: 'https://mario.wiki.gallery/images/thumb/c/c4/SMPJ_Wario.png/200px-SMPJ_Wario.png',        icon: 'https://mario.wiki.gallery/images/thumb/8/8b/SMPJ_Character_Wario.png/120px-SMPJ_Character_Wario.png' },
  { id: 'waluigi',     portrait: 'https://mario.wiki.gallery/images/thumb/5/5c/SMPJ_Waluigi.png/200px-SMPJ_Waluigi.png',    icon: 'https://mario.wiki.gallery/images/thumb/a/a2/SMPJ_Character_Waluigi.png/120px-SMPJ_Character_Waluigi.png' },
  { id: 'rosalina',    portrait: 'https://mario.wiki.gallery/images/thumb/4/48/SMPJ_Rosalina.png/200px-SMPJ_Rosalina.png',  icon: 'https://mario.wiki.gallery/images/thumb/c/cd/SMPJ_Character_Rosalina.png/120px-SMPJ_Character_Rosalina.png' },
  { id: 'yoshi',       portrait: 'https://mario.wiki.gallery/images/thumb/8/80/SMPJ_Yoshi.png/200px-SMPJ_Yoshi.png',        icon: 'https://mario.wiki.gallery/images/thumb/c/ce/SMPJ_Character_Yoshi.png/120px-SMPJ_Character_Yoshi.png' },
  { id: 'birdo',       portrait: 'https://mario.wiki.gallery/images/thumb/c/c7/SMPJ_Birdo.png/200px-SMPJ_Birdo.png',        icon: 'https://mario.wiki.gallery/images/thumb/c/cb/SMPJ_Character_Birdo.png/120px-SMPJ_Character_Birdo.png' },
  { id: 'bowser',      portrait: 'https://mario.wiki.gallery/images/thumb/c/c9/SMPJ_Bowser.png/200px-SMPJ_Bowser.png',      icon: 'https://mario.wiki.gallery/images/thumb/a/ae/SMPJ_Character_Bowser.png/120px-SMPJ_Character_Bowser.png' },
  { id: 'bowser_jr',   portrait: 'https://mario.wiki.gallery/images/thumb/c/c1/SMPJ_Bowser_Jr.png/200px-SMPJ_Bowser_Jr.png', icon: 'https://mario.wiki.gallery/images/thumb/3/37/SMPJ_Character_Bowser_Jr.png/120px-SMPJ_Character_Bowser_Jr.png' },
  { id: 'toad',        portrait: 'https://mario.wiki.gallery/images/thumb/7/7c/SMPJ_Toad.png/200px-SMPJ_Toad.png',          icon: 'https://mario.wiki.gallery/images/thumb/f/fb/SMPJ_Character_Toad.png/120px-SMPJ_Character_Toad.png' },
  { id: 'toadette',    portrait: 'https://mario.wiki.gallery/images/thumb/2/25/SMPJ_Toadette.png/200px-SMPJ_Toadette.png',  icon: 'https://mario.wiki.gallery/images/thumb/b/b7/SMPJ_Character_Toadette.png/120px-SMPJ_Character_Toadette.png' },
  { id: 'spike',       portrait: 'https://mario.wiki.gallery/images/thumb/e/e8/SMPJ_Spike.png/200px-SMPJ_Spike.png',        icon: 'https://mario.wiki.gallery/images/thumb/6/6c/SMPJ_Character_Spike.png/120px-SMPJ_Character_Spike.png' },
  { id: 'koopa',       portrait: 'https://mario.wiki.gallery/images/thumb/2/28/SMPJ_Koopa_Troopa.png/200px-SMPJ_Koopa_Troopa.png', icon: 'https://mario.wiki.gallery/images/thumb/3/3b/SMPJ_Character_Koopa_Troopa.png/120px-SMPJ_Character_Koopa_Troopa.png' },
  { id: 'goomba',      portrait: 'https://mario.wiki.gallery/images/thumb/c/ca/SMPJ_Goomba.png/200px-SMPJ_Goomba.png',      icon: 'https://mario.wiki.gallery/images/thumb/0/00/SMPJ_Character_Goomba.png/120px-SMPJ_Character_Goomba.png' },
  { id: 'shy_guy',     portrait: 'https://mario.wiki.gallery/images/thumb/c/cf/SMPJ_Shy_Guy.png/200px-SMPJ_Shy_Guy.png',    icon: 'https://mario.wiki.gallery/images/thumb/5/56/SMPJ_Character_Shy_Guy.png/120px-SMPJ_Character_Shy_Guy.png' },
  { id: 'boo',         portrait: 'https://mario.wiki.gallery/images/thumb/1/10/SMPJ_Boo.png/200px-SMPJ_Boo.png',            icon: 'https://mario.wiki.gallery/images/thumb/a/ab/SMPJ_Character_Boo.png/120px-SMPJ_Character_Boo.png' },
  { id: 'monty_mole',  portrait: 'https://mario.wiki.gallery/images/thumb/c/c2/SMPJ_Monty_Mole.png/200px-SMPJ_Monty_Mole.png', icon: 'https://mario.wiki.gallery/images/thumb/5/5c/SMPJ_Character_Monty_Mole.png/120px-SMPJ_Character_Monty_Mole.png' },
  { id: 'donkey_kong', portrait: 'https://mario.wiki.gallery/images/thumb/2/21/SMPJ_Donkey_Kong.png/200px-SMPJ_Donkey_Kong.png', icon: 'https://mario.wiki.gallery/images/thumb/4/47/SMPJ_Character_Donkey_Kong.png/120px-SMPJ_Character_Donkey_Kong.png' },
  { id: 'ninji',       portrait: 'https://mario.wiki.gallery/images/thumb/a/a3/SMPJ_Ninji.png/200px-SMPJ_Ninji.png',        icon: 'https://mario.wiki.gallery/images/thumb/c/cc/SMPJ_Character_Ninji.png/120px-SMPJ_Character_Ninji.png' },
  { id: 'pauline',     portrait: 'https://mario.wiki.gallery/images/thumb/a/a3/SMPJ_Pauline.png/200px-SMPJ_Pauline.png',    icon: 'https://mario.wiki.gallery/images/thumb/f/f7/SMPJ_Character_Pauline.png/120px-SMPJ_Character_Pauline.png' },
]

const DELAY_MS = 300 // respeitar rate limit do wiki

const delay = (ms) => new Promise(r => setTimeout(r, ms))

async function download(url, destPath) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SMPJ-DrinkingGame-App/1.0 (educational project)' }
    })
    if (!res.ok) {
      console.warn(`  ⚠️  HTTP ${res.status} — ${url}`)
      return false
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    await writeFile(destPath, buffer)
    return true
  } catch (e) {
    console.warn(`  ❌ Erro: ${e.message} — ${url}`)
    return false
  }
}

async function main() {
  const spacesDir   = 'public/assets/spaces'
  const charsDir    = 'public/assets/characters'
  const iconsDir    = 'public/assets/characters/icons'
  const portraitsDir = 'public/assets/characters/portraits'

  for (const dir of [spacesDir, charsDir, iconsDir, portraitsDir]) {
    await mkdir(dir, { recursive: true })
  }

  console.log('📦 Baixando sprites das casas...')
  for (const space of SPACES) {
    const ext = '.png'
    const dest = join(spacesDir, `${space.id}${ext}`)
    const ok = await download(space.url, dest)
    console.log(ok ? `  ✅ ${space.id}` : `  ❌ ${space.id}`)
    await delay(DELAY_MS)
  }

  console.log('\n👾 Baixando portraits dos personagens...')
  for (const char of CHARACTERS) {
    const portraitDest = join(portraitsDir, `${char.id}.png`)
    const ok = await download(char.portrait, portraitDest)
    console.log(ok ? `  ✅ ${char.id} (portrait)` : `  ❌ ${char.id} (portrait)`)
    await delay(DELAY_MS)
  }

  console.log('\n🎭 Baixando ícones dos personagens...')
  for (const char of CHARACTERS) {
    const iconDest = join(iconsDir, `${char.id}.png`)
    const ok = await download(char.icon, iconDest)
    console.log(ok ? `  ✅ ${char.id} (icon)` : `  ❌ ${char.id} (icon)`)
    await delay(DELAY_MS)
  }

  console.log('\n✅ Feito! Assets salvos em public/assets/')
  console.log('\n📝 Caminhos pra usar no código:')
  console.log('  Casas:     /assets/spaces/{id}.png')
  console.log('  Portraits: /assets/characters/portraits/{id}.png')
  console.log('  Ícones:    /assets/characters/icons/{id}.png')
  console.log('\n⚠️  Se algum arquivo falhou, o hash na URL pode estar errado.')
  console.log('   Confira manualmente em: https://www.mariowiki.com/Super_Mario_Party_Jamboree')
}

main()

# Mario Party Jamboree — Drinking Game Tracker

## Visão geral

App web mobile-first para acompanhar um drinking game baseado no Super Mario Party Jamboree. Cada jogador acessa no próprio celular, escolhe seu personagem e registra eventos do jogo (casas, dados, estrelas) — o app mostra a prenda correspondente.

**Stack:** React + TypeScript + Vite + TailwindCSS  
**Deploy:** estático (Vercel/Netlify/GitHub Pages)  
**Dados:** JSONs locais (sem backend)

---

## Fluxo do app

### Tela 1 — Seleção de personagem

- Grid responsivo com os 22 personagens (2 colunas mobile, 4 desktop)
- Cada card mostra o portrait do personagem + nome
- Tap seleciona → borda colorida com a cor do personagem
- Botão "Começar" leva pra tela de jogo
- Salvar seleção no localStorage pra não perder se recarregar

### Tela 2 — Game Tracker (tela única principal)

Tudo numa tela só, sem tabs. Scroll vertical.

**Header fixo:**
- Avatar do personagem escolhido (icon pequeno)
- Nome do personagem
- Contador de goles totais (número grande)
- Badge de escudo (se ativo) — botão clicável pra usar o escudo a qualquer momento
- Toggle "Últimos 5 turnos" (switch on/off)

**Corpo (scroll):**

#### Seção "Casas"
- Grid 3x3 com as 9 casas jogáveis (excluir Start Space e Star Exchange)
- Cada botão mostra o sprite da casa + nome curto
- Ao tocar → abre bottom sheet (mobile) ou modal (desktop) com:
  - Sprite grande da casa
  - Nome da casa
  - Efeito no jogo (texto pequeno, cor secundária)
  - **Regra do drinking game** (texto grande, destaque)
  - Quantidade de goles (considerando se "últimos 5 turnos" está ativo = dobra)
  - Botão "Beber! 🍺" → soma goles ao contador e fecha o modal
  - Se escudo ativo: botão alternativo "Usar escudo 🛡️" → consome escudo, não soma goles, fecha modal
  - Botão "Fechar" (X ou swipe down)

#### Seção "Dado"
- Dois botões lado a lado:
  - "Tirei 1 🛡️" → ativa escudo automaticamente (se já não tiver), mostra toast "Escudo ativado!"
  - "Tirei 10 🎰" → mostra toast "Imposto da sorte!", soma 1 dose ao contador (2 se homestretch)
- Indicador visual se escudo está ativo

#### Seção "Estrelas"
- 3 botões empilhados:
  - "Comprei estrela ⭐" → soma 2 goles ao contador
  - "Estrela roubada 💀" → soma 3 goles (6 em homestretch)
  - "Passei sem grana 😭" → soma 4 goles (8 em homestretch) — a maior humilhação

#### Seção "Regras" (apenas consulta, não registrável)
- Bloco colapsável (accordion) com as regras de mesa que não precisam de registro:
  - **Minigames:** "Todo mundo bebe 1 gole antes de cada minigame. Perdedor bebe +1."
  - **Formatos:** "FFA: último bebe +1 | 2v2: dupla perdedora +1 cada | 1v3: lado perdedor +1 cada"
  - **Lucky Space:** "Todos os outros bebem 1 gole"
  - **Chance Time:** "Todo mundo bebe 1 gole. Prejudicado +1"
  - **Jamboree Buddy:** "Ganhou buddy? Os outros bebem 1 gole"
  - **Bonus Star (final):** "Não ganhou nenhuma? 2 goles"

---

## Mecânica do escudo

- Estado booleano `hasShield`
- **Máximo de 1 escudo por vez** — se tirar 1 no dado tendo escudo, nada muda (mostra toast "Já tem escudo!")
- Ativação: automática ao registrar dado 1
- Uso: botão no header OU dentro do modal de prenda
- Quando usado dentro do modal: fecha modal, não soma goles, desativa escudo, mostra toast "Escudo usado! Dose pulada 🛡️"
- Quando usado pelo header: desativa escudo e o jogador comunica à mesa que pulou a dose
- Escudo serve pra qualquer prenda: própria (caiu em red space) ou coletiva (outro jogador caiu em lucky space e "todos bebem")

---

## Mecânica dos últimos 5 turnos

- Toggle switch no header
- Quando ativo: todas as punições de goles **dobram**
- Visual: badge "2x" aparece no header, tom vermelho sutil
- Afeta: casas, dado 10 (vira 2), estrela roubada (vira 6), passei sem grana (vira 8)
- Escudo continua bloqueando apenas 1 dose mesmo no 2x

---

## Design

### Mobile-first (360-430px)
- Grid de casas: 3 colunas
- Grid de personagens: 2 colunas
- Bottom sheet pra modais de casa
- Touch targets mínimo 44px
- Font mínima 14px

### Desktop (768px+)
- Grid de personagens: 4 colunas
- Modal centralizado ao invés de bottom sheet

### Tema
- **Escuro por padrão** (ideal pra jogar à noite/festa)
- Cor accent = cor do personagem selecionado (do campo `color` no JSON)
- Cards das casas usam as cores definidas no JSON de cada space como fundo sutil
- Texto claro sobre fundo escuro
- System font stack (sem fontes externas)

---

## Dados

Dois JSONs fornecidos, colocar em `src/data/`:

### `smpj-drinking-game-data.json`
Contém: `spaces[]` (com sprite_url, color, drinking_rule, drinks), `dice_rules`, `minigame_rules`, `star_rules`, `homestretch_rule`.

Campos relevantes de cada space:
```json
{
  "id": "bowser",
  "name": "Bowser Space",
  "name_pt": "Casa do Bowser",
  "color": "#D85A30",
  "sprite_url": "https://mario.wiki.gallery/images/thumb/a/a3/SMPJ_Bowser_Space.png/120px-SMPJ_Bowser_Space.png",
  "drinking_rule": "Bowser não perdoa. 3 goles. Perdeu estrela? Vira o copo.",
  "drinks": 3,
  "drinks_conditional": { "condition": "Perdeu estrela", "drinks": "vira o copo" }
}
```

**IMPORTANTE:** Os star_rules no JSON original estão desatualizados. As regras corretas de estrela são:
- Comprou estrela → 2 goles
- Estrela roubada (Boo, Bowser, etc.) → 3 goles
- Passou pela estrela sem 20 moedas → 4 goles

### `smpj-characters.json`
Array de 22 objetos:
```json
{
  "id": "mario",
  "name": "Mario",
  "color": "#E24B4A",
  "icon_url": "https://mario.wiki.gallery/images/thumb/.../120px-SMPJ_Character_Mario.png",
  "portrait_url": "https://mario.wiki.gallery/images/thumb/.../200px-SMPJ_Mario.png"
}
```

### Sobre as imagens
- Todas do `mario.wiki.gallery` (CC BY-SA)
- Trocar `120px` por `64px`, `80px` etc. pra redimensionar
- **Fallback obrigatório**: se imagem não carregar, mostrar círculo com a primeira letra do nome + cor de fundo do personagem/casa
- Lazy loading nas imagens

---

## Estado

```typescript
interface GameState {
  character: Character | null;
  totalDrinks: number;
  hasShield: boolean;
  isHomestretch: boolean;
}
```

Persistir tudo no localStorage. Ao abrir o app com estado salvo, ir direto pra tela de jogo.

Botão "Resetar jogo" escondido no footer ou atrás de long-press no avatar — pra não apertar sem querer.

---

## O que NÃO fazer

- Sem backend, banco de dados ou autenticação
- Sem sincronização entre jogadores (cada celular é independente)
- Sem animações complexas — transições CSS simples
- Sem bibliotecas pesadas de UI — Tailwind basta
- Sem PWA/service worker
- Sem testes por enquanto
- Sem seleção de mapa
- Minigames NÃO são registráveis no app — são regra de mesa (seção apenas de consulta)

---

## Prioridades de implementação

1. Seleção de personagem funcional
2. Grid de casas com modal/bottom sheet de prenda
3. Botões de dado (1 = escudo, 10 = imposto)
4. Mecânica de escudo (ativar, usar no header e no modal, máximo 1)
5. Seção de estrelas (comprou 2 / roubada 3 / sem grana 4)
6. Toggle de últimos 5 turnos com multiplicador 2x
7. Contador de goles no header
8. Seção de regras colapsável (consulta)
9. Persistência no localStorage
10. Botão de reset

# Planejamento — Modo Sala (Multiplayer)

## Visão geral

Adicionar um segundo modo ao app onde jogadores na mesma partida se conectam via código de sala. Cada celular continua sendo independente para os próprios eventos, mas eventos coletivos ("todos bebem") são transmitidos em tempo real para todos da sala.

O modo offline atual não muda — Sala é uma camada opcional em cima.

---

## Stack escolhida

**Firebase Realtime Database**

- Sem backend próprio — SDK roda no cliente
- Deploy continua 100% estático na Vercel
- Realtime nativo (WebSocket gerenciado pelo Firebase)
- Free tier folgado para o uso (grupos de amigos)
- Única dependência nova: `firebase` npm package

---

## Estrutura do banco (Firebase RTDB)

```
rooms/
  {ABCD}/                        ← código da sala (4 letras maiúsculas)
    meta/
      hostId: "player_xyz"
      createdAt: 1234567890
      status: "lobby" | "playing" | "ended"
    players/
      {playerId}/
        name: "Mario"
        characterId: "mario"
        characterColor: "#E24B4A"
        characterIcon: "/assets/..."
        totalDrinks: 12
        stars: 2
        hasShield: false
        turn: 4
        isConnected: true          ← controlado pelo onDisconnect()
        joinedAt: 1234567890
    events/
      {pushId}/
        type: "drinks_all" | "drinks_others" | "minigame_start"
        triggeredBy: "player_xyz"
        triggeredByName: "Mario"
        message: "Mario caiu na Casa da Sorte!"
        drinks: 1
        timestamp: 1234567890
        acked/                     ← quem já confirmou
          {playerId}: true
```

---

## Fluxo de telas

### Antes do jogo

```
Tela inicial
├── [Jogar Sozinho]  → fluxo offline atual (sem mudança)
└── [Jogar em Sala]
    ├── [Criar Sala]  → gera código → Lobby (host)
    └── [Entrar na Sala] → digita código → Lobby (guest)
```

### Lobby
- Exibe o código da sala em destaque (fácil de compartilhar)
- Lista de jogadores com personagem escolhido
- Cada jogador escolhe personagem na própria tela (igual ao offline)
- Botão "Começar Partida" visível só pro host
- Guests veem "Aguardando o host iniciar..."

### In-game
- Tudo funciona igual ao modo offline
- Header ganha um ícone de "sala" com contador de jogadores online
- Eventos coletivos disparam broadcast para a sala
- Modal de evento recebido aparece nos outros celulares

### Fim de jogo
- Host pode encerrar a sala
- Cada jogador vê sua própria tela de fim (com seu total)
- Futuramente: scoreboard coletivo

---

## Eventos que geram broadcast

| Evento | Quem bebe | Mensagem para os outros |
|---|---|---|
| Lucky Space | Todos os **outros** | "{Nome} caiu na Casa da Sorte — beba {n} gole(s)!" |
| Chance Time | **Todos** | "{Nome} caiu no Chance Time — todo mundo bebe {n}!" |
| Fim do turno (minigame) | **Todos** (1 antes) | "{Nome} encerrou o turno — minigame! Beba {n} antes de jogar." |
| VS Space | **Todos** | "{Nome} caiu no VS Space — minigame! Beba {n} antes." |
| Jamboree Buddy | Todos os **outros** | "{Nome} ganhou Jamboree Buddy — os outros bebem {n}!" |

Eventos pessoais (Red Space, Bowser, Dado 10, etc.) **não** geram broadcast — são só do jogador.

---

## Modal de evento recebido

Quando outro jogador dispara um evento coletivo, aparece nos outros celulares:

```
┌─────────────────────────────────┐
│  🍺 Casa da Sorte               │
│  Mario caiu na Casa da Sorte!   │
│                                 │
│  Você precisa beber:            │
│         1 gole                  │
│                                 │
│  [Usar escudo 🛡️]               │
│  [Bebi! ✓]                      │
└─────────────────────────────────┘
```

- "Bebi!" soma ao contador local e registra ack no Firebase
- "Usar escudo" consome o escudo local e registra ack
- O modal some depois do ack (ou timeout de 30s)

---

## Novas hooks

```
src/hooks/
  useRoom.ts          ← criar/entrar/sair de sala, status geral
  useRoomSync.ts      ← sync do estado próprio pro Firebase
  useRoomEvents.ts    ← subscribe a eventos, enviar broadcasts, ack
  usePlayers.ts       ← subscribe ao estado de todos os jogadores
```

---

## Novos componentes

```
src/components/
  ModeSelector.tsx          ← tela inicial: Sozinho vs Sala
  CreateRoom.tsx            ← gera código, cria sala
  JoinRoom.tsx              ← input de código, valida e entra
  Lobby.tsx                 ← sala de espera com lista de jogadores
  PlayerList.tsx            ← overlay/sidebar com todos os jogadores e drink counts
  IncomingEventModal.tsx    ← modal de "você precisa beber"
  RoomHeader.tsx            ← badge de sala no header (jogadores online)
```

---

## Edge cases a resolver

| Situação | Solução |
|---|---|
| Código já existe | Gerar novo automaticamente (retry) |
| Host desconecta | Firebase `onDisconnect()` marca offline; transfere host pro próximo jogador conectado |
| Player desconecta | Fica na lista como offline (ícone cinza), não recebe eventos |
| Player reconecta | Volta pra lista, recebe estado atual da sala |
| Entrar em jogo já iniciado | Permitir — estado do jogador começa zerado |
| Dois jogadores com mesmo personagem | Permitir (é jogo de bebida, não precisa ser rígido) |
| Sala sem uso por 6h | Cleanup automático via Firebase TTL / função agendada |
| Sem internet durante o jogo | App cai para modo offline silencioso, avisa quando reconectar |

---

## Regras de segurança Firebase (simplificadas)

```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['meta', 'players'])"
      }
    }
  }
}
```

Sem autenticação — o código da sala é o acesso. Suficiente para uso entre amigos.

---

## Fases de implementação

### Fase 1 — MVP funcional
- [ ] Tela de seleção de modo
- [ ] Criar sala (gera código, cria no Firebase)
- [ ] Entrar na sala (valida código, adiciona jogador)
- [ ] Lobby com lista de jogadores
- [ ] Sync do estado próprio ao Firebase (drinks, shield, stars)
- [ ] Broadcast de eventos coletivos
- [ ] Modal de evento recebido nos outros jogadores

### Fase 2 — Polimento
- [ ] Scoreboard ao vivo (ver drinks de todos)
- [ ] Transferência de host automática
- [ ] Indicador de jogador offline
- [ ] Timeout de sala (cleanup)
- [ ] Animação quando outro jogador bebe (contador muda ao vivo)

### Fase 3 — Extras
- [ ] Push notifications reais (requer PWA/service worker)
- [ ] Histórico de eventos da sala
- [ ] Modo espectador (entrar sem jogar)
- [ ] QR code pra compartilhar o código da sala

---

## O que NÃO muda

- Modo offline continua idêntico, sem dependência de Firebase
- Deploy continua estático na Vercel
- Sem autenticação obrigatória
- Sem banco de dados próprio

---

## Setup necessário antes de implementar

1. Criar projeto no [Firebase Console](https://console.firebase.google.com)
2. Ativar **Realtime Database** (não Firestore)
3. Copiar configuração do projeto (apiKey, databaseURL, etc.)
4. Adicionar como variáveis de ambiente no Vercel:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_DATABASE_URL=...
   VITE_FIREBASE_PROJECT_ID=...
   ```
5. `npm install firebase`

# 🍺 SMPJ Drinking Game

Um tracker de drinking game para o **Super Mario Party Jamboree**, feito pra jogar no celular enquanto joga no Nintendo Switch.

A ideia é simples: cada pessoa abre o app no próprio celular, escolhe seu personagem e vai registrando o que acontece na partida — o app rastreia quantos goles você tomou, suas estrelas, o turno atual e aplica multiplicadores automáticos no fim do jogo.

Funciona offline (modo solo) ou em **sala multiplayer** onde todo mundo se conecta e vê os eventos dos outros em tempo real.

---

## As Casas

Cada casa do tabuleiro tem um efeito diferente. No app, você toca na casa que caiu e ele já calcula os goles aplicando o multiplicador do momento.

| Casa | Ícone | Efeito no jogo | Regra de beber |
|------|-------|----------------|----------------|
| **Casa Azul** | ![Blue](public/assets/casas/64px-SMPJ_Blue_Space.png) | Ganha 3 moedas | Nada — você tá bem |
| **Casa Vermelha** | ![Red](public/assets/casas/64px-SMPJ_Red_Space.png) | Perde 3 moedas | 1 gole |
| **Casa da Sorte** | ![Lucky](public/assets/casas/64px-SMPJ_Lucky_Space.png) | Roleta com prêmios | Todos os outros bebem 1 |
| **Casa do Azar** | ![Unlucky](public/assets/casas/64px-SMPJ_Unlucky_Space.png) | Roleta com punições | 2 goles |
| **Casa de Evento** | ![Event](public/assets/casas/64px-SMPJ_Event_Space.png) | Evento exclusivo do tabuleiro | 1 gole — o caos tem preço |
| **Casa de Item** | ![Item](public/assets/casas/64px-SMPJ_Item_Space.png) | Minigame de item ou roleta | Só bebe se cair Loadstone (+1) |
| **Casa do Bowser** | ![Bowser](public/assets/casas/64px-SMPJ_Bowser_Space.png) | Impostor Bowser aparece e te pune | 3 goles. Perdeu estrela? Vira o copo |
| **Chance Time** | ![Chance Time](public/assets/casas/64px-SMPJ_Chance_Time_Space.png) | Roleta de troca de moedas/estrelas | Todos bebem 1. Quem saiu prejudicado bebe +1 |
| **Casa VS** | ![VS](public/assets/casas/64px-SMPJ_VS_Space.png) | Todos apostam moedas e jogam um minigame | Segue regra de minigame (beba 1 antes, perdedor +1) |

### Dado

- **Tirou 1** → ativa um escudo que bloqueia o próximo dano
- **Tirou 10** → imposto da sorte, bebe 1 gole

### Estrelas

- **Comprou estrela** → bebe 2 goles (+1⭐)
- **Estrela roubada** (Boo, Bowser, Chance Time...) → bebe 3 goles (-1⭐)
- **Passou sem grana** → bebe 4 goles, sem estrela mesmo

---

## Multiplicadores

O jogo vai ficando mais pesado conforme o fim se aproxima:

| Situação | Multiplicador |
|----------|--------------|
| Normal | 1× |
| Jamboree Buddy ativo | 2× |
| Últimos 5 turnos | 2× |
| Buddy + Últimos 5 turnos | 3× |

O header deixa claro quando algum multiplicador tá ativo.

---

## Minigames

Ao fim de cada turno, o host abre o painel de minigame. Todos bebem 1 gole antes de jogar. Depois:

| Formato | Regra |
|---------|-------|
| **FFA** | Último lugar bebe +1 |
| **2v2** | Dupla perdedora bebe +1 cada |
| **1v3** | Lado perdedor bebe +1 cada |

---

## Boo e Duelo

Além das casas do tabuleiro, tem dois eventos que podem acontecer a qualquer momento:

**👻 Boo** — você usou o Boo e roubou de alguém:
- Roubou estrela → você +1⭐, vítima -1⭐ e bebe 3 goles
- Roubou dinheiro → vítima bebe 1 gole

**⚔️ Duelo** — desafio 1v1:
- Ambos bebem 1 gole antes
- Perdedor bebe +2 goles
- Funciona contra outros jogadores ou contra CPU

---

## Modo Multiplayer

Crie uma sala e compartilhe o código (ou QR Code) com os outros jogadores. Cada um entra no próprio celular e escolhe um personagem — personagens já escolhidos ficam bloqueados.

O host controla o andamento da partida: é ele quem encerra o turno e abre o painel de minigame. Os outros jogadores recebem os eventos em tempo real (pré-bebida, formato, resultado).

Eventos como Chance Time, Roubou Estrela e Duelo afetam jogadores específicos automaticamente — quem recebe o evento vê um card pedindo pra beber.

---

## Como rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`. Para testar no celular, use o IP da máquina na mesma rede.

---

## Stack

React 19 + TypeScript · Vite 8 · Tailwind CSS v4 · Supabase Realtime · Deploy na Vercel

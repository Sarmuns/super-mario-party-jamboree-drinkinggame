# 🍺 Super Mario Party Jamboree — Drinking Game Tracker

App web **mobile-first** para acompanhar um drinking game baseado no **Super Mario Party Jamboree**. Cada jogador acessa no próprio celular, escolhe seu personagem e registra os eventos da partida — o app calcula e exibe quantos goles você deve tomar.

---

## Funcionalidades

### Seleção de personagem
- Grid com os 22 personagens jogáveis do SMPJ
- Tap seleciona o personagem com destaque visual na cor dele
- A UI inteira muda de cor de acordo com o personagem escolhido (contador, títulos, borda do avatar, etc.)
- Seleção salva no `localStorage` — recarregar a página volta direto pro jogo

### Tracker de partida
- **Casas**: grid 3×3 com as 9 casas jogáveis. Tap abre um modal com a regra, o número de goles e botões de ação
- **Dado**: botões para registrar tirou 1 (ativa escudo) ou tirou 10 (imposto da sorte)
- **Estrelas**: 3 eventos — comprou estrela, estrela roubada, passou sem grana
- **Regras de mesa**: accordion colapsável com as regras que não precisam de registro (minigames, Lucky Space, Chance Time, etc.)

### Mecânica do escudo
- Ativado automaticamente ao registrar dado 1
- Máximo de 1 escudo por vez
- Pode ser usado pelo botão no header ou dentro do modal de uma casa
- Consome o escudo sem somar goles

### Últimos 5 turnos (Homestretch)
- Toggle no header
- Quando ativo, **todas as punições dobram**
- Badge `2x` aparece no contador e o fundo do header fica avermelhado

### Contador de goles
- Número grande sempre visível no header
- Animação com bounce + flash verde ao somar goles
- Vibração tátil no celular a cada dose registrada

### Undo
- Botão "↩ Undo" sempre visível no header
- Desfaz a última ação (goles, escudo ativado ou usado)
- Fica opaco quando não há nada para desfazer

### Fim de partida
- Botão "🏁 Fim de Partida" no final da página
- Modal com o portrait do personagem, total de goles e uma mensagem baseada no seu desempenho
- Opção de jogar de novo (reseta tudo) ou fechar e continuar

### Reset
- Botão de setas (↺) discreto no header — pede confirmação antes de resetar
- Long press no avatar também reseta

---

## Stack

| | |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Estilo | Tailwind CSS v4 |
| Dados | JSONs locais (`src/data/`) |
| Persistência | `localStorage` |
| Deploy | Vercel (estático) |

---

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173` no navegador ou no celular (mesma rede local, usando o IP da máquina).

```bash
npm run build   # build de produção
```

---

## Estrutura

```
src/
  components/
    CharacterSelect.tsx   # tela de seleção de personagem
    GameTracker.tsx       # tela principal do jogo
    Header.tsx            # header fixo com contador e controles
    SpacesSection.tsx     # grid de casas
    SpaceModal.tsx        # modal/bottom sheet de cada casa
    DiceSection.tsx       # botões de dado
    StarsSection.tsx      # eventos de estrela
    RulesSection.tsx      # regras de mesa (accordion)
    EndGameModal.tsx      # tela de fim de partida
    ImageWithFallback.tsx # imagem com fallback de letra colorida
    Toast.tsx             # notificações temporárias
  hooks/
    useGameState.ts       # estado global + localStorage + undo
    useToast.ts           # sistema de toasts
  data/
    smpj-characters.json       # 22 personagens com cores e imagens
    smpj-drinking-game-data.json  # casas, dados, estrelas e regras
  types.ts
```

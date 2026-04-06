# 8Bit Legends

Projeto de jogo web com React (Vite) e Phaser.js.

## Requisitos implementados

- Estrutura organizada em `src/game`
- Cena principal `MainScene`
- Personagem pixel art animado renderizado no centro da tela
- Movimentacao por teclado com setas e WASD
- Movimento limitado aos limites da tela
- Codigo separado em arquivos com responsabilidades claras
- Sprites organizados em `public/assets/sprites`
- Tileset organizado em `public/assets/tiles`
- Animacoes de `idle` e `walking` para 4 direcoes
- Mapa top-down com tiles e paredes com colisao
- Camera centralizada no player
- Preparado para deploy na Vercel (`vercel.json`)
- Layout responsivo e leve
- `.gitignore` configurado

## Estrutura

```txt
public/
  assets/
    sprites/
      player_sheet.png
    tiles/
      rpg_tileset.png
src/
  game/
    animations/
      playerAnimations.js
    maps/
      definitions/
        starterFieldMap.js
      loadMap.js
      mapConstants.js
      mapRegistry.js
    config.js
    createGame.js
    entities/
      createPlayer.js
    scenes/
      MainScene.js
  App.jsx
  main.jsx
  styles.css
```

## Como rodar

```bash
npm install
npm run dev
```

## Build de producao

```bash
npm run build
npm run preview
```

## Deploy na Vercel

1. Conecte este repositorio na Vercel.
2. Framework preset: Vite.
3. Build command: `npm run build`.
4. Output directory: `dist`.

O arquivo `vercel.json` ja contempla rewrite para SPA.

## Evolucao para multiplos mapas

- Defina novos mapas em `src/game/maps/definitions`.
- Registre o mapa em `src/game/maps/mapRegistry.js`.
- Carregue pelo `mapId` na cena usando `loadMap`.

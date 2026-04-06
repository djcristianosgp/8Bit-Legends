---
name: revisar-performance-8bit-legends
description: 'Revisa o desempenho do jogo 8Bit Legends. Use quando precisar investigar FPS, lag, travamentos, gargalos no update(), efeitos pesados, performance mobile, uso de CPU em background, tamanho do build e oportunidades de otimização em React + Vite + Phaser.'
argument-hint: 'Ex.: revisar FPS no mobile e encontrar gargalos de renderização e update()'
user-invocable: true
---

# Revisar performance do 8Bit Legends

## Objetivo
Analisar o desempenho do jogo `8Bit Legends` e produzir uma revisão prática com:
- gargalos prováveis,
- causa raiz mais provável,
- prioridades de otimização,
- validação com evidências reais,
- cuidado para não quebrar a experiência desktop/mobile.

## Quando usar
Use esta skill quando o pedido envolver:
- “revisar o desempenho do game”
- “investigar FPS baixo”
- “achar gargalos de performance”
- “otimizar o jogo para mobile”
- “reduzir travamentos/lag”
- “avaliar peso do build e carregamento”

## Princípios obrigatórios
1. **Não adivinhar**: investigar antes de propor correções.
2. **Buscar causa raiz**: identificar se o problema é CPU, render, física, áudio, assets, bundle ou background.
3. **Fazer mudanças pequenas e verificáveis**: evitar várias correções de uma vez sem confirmação.
4. **Validar com evidência**: usar build, erros, medições simples e arquivos reais do projeto antes de concluir.
5. **Não quebrar o desktop** e manter boa compatibilidade mobile.

## Arquivos prioritários para inspeção
Sempre começar revisando estes pontos do projeto:
- `src/game/config.js`
- `src/game/scenes/MainScene.js`
- `src/game/systems/VisualEffectsSystem.js`
- `src/game/systems/WeatherSystem.js`
- `src/game/systems/AudioSystem.js`
- `src/game/systems/PauseSystem.js`
- `src/App.jsx`
- `src/styles.css`
- `vite.config.js`
- `public/assets/`

## Fluxo de revisão

### 1. Identificar o tipo de problema
Primeiro classificar o pedido em uma destas categorias:
- **FPS / runtime**: lag durante gameplay, combate, chuva, boss, efeitos.
- **Mobile**: queda de performance em celular/tablet, touch pesado, aquecimento.
- **Background / bateria**: jogo consumindo CPU quando a aba está inativa.
- **Carregamento / build**: bundle muito grande, startup lento, assets pesados.

### 2. Inspecionar os hotspots reais
Procurar por:
- loops frequentes no `update()`;
- cálculos repetidos desnecessários;
- excesso de `tweens`, partículas, sombras e overlays;
- chuva/clima/redesenho caro por frame;
- colisões ou overlaps demais;
- áudio e animações ativos em segundo plano;
- canvas/resolução altos demais no mobile;
- chunks grandes no build do Vite.

### 3. Ramificação por causa provável

#### Se o gargalo for de runtime/FPS
Focar em:
- `MainScene.update()`
- frequência de IA/inimigos
- quantidade de efeitos visuais
- custo de clima, minimapa, sombras, partículas e tweens
- física/overlaps por frame

#### Se o gargalo for mobile
Focar em:
- resolução e zoom dinâmico
- `targetFps`
- `reducedEffects`
- canvas responsivo
- quantidade de efeitos e redraw por frame
- conforto dos controles touch sem sobrecarga extra

#### Se o gargalo for background
Focar em:
- `visibilitychange`
- pausa automática
- economia de áudio, tweens, física e loop

#### Se o gargalo for carregamento/build
Focar em:
- `vite.config.js`
- code splitting/manual chunks
- imagens e sons muito grandes
- assets pouco otimizados ou carregados cedo demais

## Estratégia padrão de análise
1. Ler os arquivos centrais de renderização, cena e config.
2. Procurar código executado a cada frame ou em alta frequência.
3. Comparar o custo visual com o ganho real de UX.
4. Priorizar primeiro o que dá maior ganho com menor risco.
5. Se houver correção, aplicar **uma melhoria por vez**.
6. Validar depois de cada melhoria relevante.

## O que priorizar nas recomendações
Ordenar os achados por impacto:

### Alta prioridade
- lógica pesada dentro de `update()`;
- redesenho visual excessivo por frame;
- alta resolução ou zoom custoso no mobile;
- efeitos ativos mesmo quando invisíveis ou em background;
- chunks/builds muito grandes para o jogo.

### Média prioridade
- layout/UI touch grande demais ou com repaints evitáveis;
- excesso de feedback visual simultâneo;
- assets que podem ser compactados ou adiados.

### Baixa prioridade
- micro-otimizações sem impacto perceptível;
- refactors cosméticos que não mudam FPS, loading ou bateria.

## Checklist de conclusão
Antes de encerrar a revisão, confirmar:
- [ ] O problema foi classificado corretamente.
- [ ] Os arquivos críticos foram revisados.
- [ ] A causa raiz mais provável foi identificada.
- [ ] As recomendações foram priorizadas por impacto.
- [ ] Houve validação com evidência quando mudanças foram feitas.
- [ ] `npm run build` foi usado se houve alteração de código/config.
- [ ] A resposta deixa claro o que é observação, hipótese e evidência.

## Formato esperado da resposta
Ao concluir a revisão, responder com:
1. **Resumo executivo** do estado da performance
2. **Principais gargalos encontrados**
3. **Causa raiz provável** de cada um
4. **Ações recomendadas em ordem de impacto**
5. **Arquivos envolvidos**
6. **Validação executada** (ex.: `npm run build`)

## Exemplos de uso
- `/revisar-performance-8bit-legends revisar desempenho geral do game`
- `/revisar-performance-8bit-legends investigar FPS baixo no mobile`
- `/revisar-performance-8bit-legends analisar gargalos em MainScene e efeitos visuais`
- `/revisar-performance-8bit-legends revisar peso do build e carregamento inicial`

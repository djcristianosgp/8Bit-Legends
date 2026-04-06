---
name: revisar-ux-visual-8bit-legends
description: 'Revisa quebras no visual e melhora a experiência do usuário no 8Bit Legends. Use para investigar UI quebrada, HUD desalinhada, responsividade, problemas mobile, contraste, legibilidade, feedback visual, fluxo do jogador e usabilidade geral em React + Phaser.'
argument-hint: 'Ex.: revisar quebras visuais no mobile e melhorar HUD, botões e feedback do jogador'
user-invocable: true
---

# Revisar UX e quebras visuais do 8Bit Legends

## Objetivo
Analisar e melhorar a experiência do usuário do `8Bit Legends`, com foco em:
- quebras visuais,
- HUD/UI desalinhada,
- problemas de responsividade,
- legibilidade e contraste,
- clareza dos controles e feedbacks,
- conforto de uso em desktop e mobile.

## Quando usar
Use esta skill quando o pedido envolver:
- “revisar quebras no visual do game”
- “melhorar a experiência do usuário”
- “corrigir UI quebrada”
- “ajustar HUD/mobile/responsividade”
- “melhorar usabilidade do jogo”
- “deixar a interface mais clara e confortável”

## Princípios obrigatórios
1. **Investigar primeiro, corrigir depois**.
2. **Não quebrar a identidade visual pixel art** do jogo.
3. **Preservar a versão desktop** enquanto melhora a experiência mobile.
4. **Priorizar clareza e feedback** antes de enfeites visuais.
5. **Validar com evidência real**: revisar layout, estilos, fluxo de uso e build quando houver mudanças.

## Áreas prioritárias para inspeção
Sempre começar revisando:
- `src/App.jsx`
- `src/styles.css`
- `src/game/scenes/OverlayScene.js`
- `src/game/scenes/MainScene.js`
- `src/game/systems/PauseSystem.js`
- `src/game/systems/MinimapSystem.js`
- `src/game/systems/HealthBars.js` ou HUD relacionada
- `index.html`

## Tipos de problema a classificar
Antes de agir, classificar o problema principal:

### 1. Quebra visual/layout
Exemplos:
- elementos cortados,
- HUD sobreposta,
- botões fora da tela,
- canvas mal dimensionado,
- componentes desalinhados.

### 2. Problema de responsividade/mobile
Exemplos:
- interface pequena demais no celular,
- controles touch desconfortáveis,
- textos espremidos,
- áreas clicáveis ruins.

### 3. Problema de legibilidade/clareza
Exemplos:
- contraste ruim,
- excesso de informação na HUD,
- status difíceis de entender,
- feedback fraco ao pressionar ou ao sofrer dano.

### 4. Problema de fluxo/UX
Exemplos:
- jogador não entende o próximo passo,
- início do jogo confuso,
- feedback insuficiente ao salvar, pausar, atacar ou usar skill,
- telas e overlays pouco intuitivos.

## Fluxo recomendado de revisão

### 1. Diagnóstico visual
Inspecionar a interface e listar:
- o que quebra,
- onde quebra,
- em qual contexto (desktop/mobile/start screen/HUD/pause/overlay),
- impacto para o jogador.

### 2. Identificar a causa raiz
Checar se o problema vem de:
- CSS rígido ou pouco responsivo;
- falta de `flex-wrap`, `gap`, `min/max width`, `clamp`, `aspect-ratio`;
- excesso de informação na tela;
- hierarquia visual fraca;
- falta de feedback de interação;
- conflito entre UI React e canvas Phaser.

### 3. Priorizar por impacto de UX
Corrigir primeiro o que mais atrapalha o jogador:
1. problemas que impedem jogar ou entender a tela;
2. problemas de toque, leitura e navegação;
3. problemas de estética e refinamento.

### 4. Aplicar melhorias pequenas e consistentes
Preferir mudanças como:
- reorganizar HUD;
- melhorar espaçamento;
- reforçar contraste;
- ampliar botões touch;
- padronizar feedback visual;
- reduzir ruído visual;
- melhorar textos de apoio e estados do jogo.

## Checklist de UX visual
Antes de encerrar, revisar:
- [ ] O HUD está legível e não quebra em telas menores.
- [ ] O canvas está bem encaixado no layout.
- [ ] Botões e controles touch são grandes o suficiente.
- [ ] O contraste entre fundo e texto é adequado.
- [ ] Feedbacks de pausa, save, dano, skills e ações estão claros.
- [ ] A navegação inicial do jogador é fácil de entender.
- [ ] Desktop continua funcional.
- [ ] Mobile ficou mais confortável.

## Heurísticas de melhoria
Ao propor melhorias, priorizar estas heurísticas:
- **Clareza**: o jogador entende rapidamente o que está vendo?
- **Hierarquia**: o mais importante está mais visível?
- **Consistência**: botões, cores e labels seguem um padrão?
- **Toque**: os controles são confortáveis no dedo?
- **Feedback**: toda ação importante dá resposta visual clara?
- **Foco**: há excesso de informação competindo com a gameplay?

## Formato esperado da resposta
Ao concluir a revisão, responder com:
1. resumo dos problemas visuais/UX encontrados,
2. impacto real no jogador,
3. correções recomendadas em ordem de prioridade,
4. arquivos afetados,
5. validação executada (`npm run build`, se houve mudanças).

## Exemplos de uso
- `/revisar-ux-visual-8bit-legends revisar quebras no visual do game`
- `/revisar-ux-visual-8bit-legends melhorar a experiência do usuário no mobile`
- `/revisar-ux-visual-8bit-legends analisar HUD, pause menu e fluxo inicial`
- `/revisar-ux-visual-8bit-legends corrigir UI quebrada e deixar controles mais intuitivos`

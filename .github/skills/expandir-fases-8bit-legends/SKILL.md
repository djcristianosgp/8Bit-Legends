---
name: expandir-fases-8bit-legends
description: 'Cria e expande fases do jogo 8Bit Legends. Use quando precisar adicionar fases novas, aumentar dificuldade, criar novos biomas, layouts, inimigos e progressão de fase sempre em blocos de 5 (ex.: fases 11-15, 16-20, 21-25).'
argument-hint: 'Ex.: criar fases 11-15 com bioma deserto, armadilhas e boss final'
user-invocable: true
---

# Expandir fases do 8Bit Legends

## Objetivo
Adicionar **novos pacotes de 5 fases** ao jogo `8Bit Legends`, sempre com:
- mais variedade visual e mecânica,
- aumento real de dificuldade,
- progressão coerente com o bloco anterior,
- compatibilidade com o sistema atual de mapa, save, HUD e transições.

## Quando usar
Use esta skill quando o pedido envolver:
- “criar novas fases”
- “adicionar fases 11-15 / 16-20 / 21-25”
- “aumentar a dificuldade do jogo”
- “criar um novo bioma com mais desafios”
- “expandir o conteúdo do RPG sem quebrar o balanceamento atual”

## Regras obrigatórias
1. **Nunca criar uma fase isolada**. Sempre criar ou planejar **5 fases por vez**.
2. Cada bloco novo deve ter:
   - um tema/bioma dominante,
   - progressão de desafio do início ao fim do bloco,
   - mais elementos no cenário (obstáculos, rotas, variações de spawn, arenas, corredores, perigos),
   - uma fase final do bloco claramente mais intensa.
3. Não quebrar compatibilidade com a base atual do projeto:
   - desktop e mobile continuam funcionando,
   - sistema de save continua válido,
   - transição entre fases continua estável,
   - a dificuldade aumenta sem picos injustos.
4. Antes de editar, revisar como a progressão atual está implementada em:
   - `src/game/phases/phaseConfig.js`
   - `src/game/maps/biomeConfig.js`
   - `src/game/maps/mapRegistry.js`
   - `src/game/maps/definitions/generatePhaseMap.js`
   - `src/game/scenes/MainScene.js`

## Fluxo recomendado

### 1. Identificar o próximo bloco
Descobrir qual é o próximo pacote de fases a ser criado.

Exemplos:
- se o jogo vai até a fase 10, o próximo bloco é **11-15**;
- depois, **16-20**;
- depois, **21-25**.

### 2. Definir a proposta do bloco
Criar uma mini-matriz para as 5 fases contendo:
- número da fase,
- bioma/tema,
- tipo de layout,
- quantidade de inimigos,
- elemento novo da fase,
- nível de dificuldade,
- presença de elite/boss/clímax.

### 3. Escalar dificuldade de forma progressiva
Ao desenhar o bloco, seguir esta lógica:
- **Fase 1 do bloco**: introdução do novo tema e aumento leve de pressão.
- **Fase 2 do bloco**: mais inimigos ou layout mais fechado.
- **Fase 3 do bloco**: mistura de pressão + nova mecânica/obstáculo.
- **Fase 4 do bloco**: quase pico de dificuldade.
- **Fase 5 do bloco**: clímax, arena especial, elite ou boss mais forte.

Evitar aumento injusto. A dificuldade deve subir de forma perceptível, mas jogável.

## Estratégias padrão para “mais elementos”
Quando o pedido disser para deixar as fases “mais ricas” ou “mais complexas”, priorizar:
- novos layouts com corredores, arenas, divisórias e rotas alternativas;
- mais pontos de spawn e melhor distribuição espacial;
- combinação de inimigos em vez de apenas aumentar quantidade;
- obstáculos que forcem movimento e posicionamento;
- uso temático do bioma para alterar leitura e ritmo da fase.

Se não houver novos assets, ainda assim criar variedade usando layout, ritmo e composição dos encontros.

## Implementação no código
Ao executar a expansão, normalmente será necessário:

1. **Atualizar `TOTAL_PHASES`** em `src/game/phases/phaseConfig.js`.
2. **Adicionar 5 novas entradas** em `PHASE_LIST`.
3. Ajustar a progressão de dificuldade mantendo coerência com `getDifficultyFactor`.
4. Atualizar `BIOME_CONFIG` em `src/game/maps/biomeConfig.js` para mapear as novas fases.
5. Garantir que `mapRegistry.js` continue cobrindo as fases novas.
6. Expandir `generatePhaseMap.js` com novos layouts, arenas, spawns ou variações.
7. Se o novo bioma depender de assets inéditos:
   - adicionar o arquivo em `public/assets/tiles/` ou pasta apropriada,
   - registrar preload se necessário.
8. Validar que a fase mais forte do bloco tenha identidade própria.

## Decisões padrão
- Se o usuário **não especificar um bioma**, propor um novo tema coerente com a progressão atual.
- Se o usuário **não especificar boss**, transformar a **5ª fase do bloco** no clímax natural.
- Se não houver asset novo disponível, priorizar mecânicas e layout em vez de bloquear a entrega.
- Se a progressão existente tiver boss em fases pares, preservar a lógica atual **ou** justificar claramente a mudança ao propor o novo bloco.

## Checklist de conclusão
Antes de finalizar, confirmar:
- [ ] Foram criadas **exatamente 5 fases novas**.
- [ ] O bloco ficou mais difícil que o anterior.
- [ ] Há mais variedade de cenário e encontro.
- [ ] `phaseConfig.js` foi atualizado corretamente.
- [ ] `biomeConfig.js` e geração de mapa refletem o novo bloco.
- [ ] Save/transição continuam funcionando.
- [ ] `npm run build` executa com sucesso.

## Formato esperado da resposta
Ao concluir a tarefa, responder com:
1. resumo das fases adicionadas,
2. principais novas mecânicas/elementos,
3. como a dificuldade evolui ao longo das 5 fases,
4. arquivos alterados,
5. evidência de validação (`npm run build`).

## Exemplos de uso
- `/expandir-fases-8bit-legends criar fases 11-15 com bioma deserto e boss final`
- `/expandir-fases-8bit-legends adicionar mais 5 fases com armadilhas e dificuldade maior`
- `/expandir-fases-8bit-legends expandir o endgame com fases 16-20 mais difíceis`

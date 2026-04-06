---
name: melhorar-fisica-8bit-legends
description: 'Revisa e melhora a física do jogo 8Bit Legends. Use para ajustar movimento, colisões, hitboxes, knockback, resposta dos ataques, peso dos personagens, bugs de travamento, escorregamento e sensação de gameplay em Phaser Arcade Physics.'
argument-hint: 'Ex.: melhorar colisões, knockback e sensação de movimento do player e inimigos'
user-invocable: true
---

# Melhorar a física do 8Bit Legends

## Objetivo
Analisar e melhorar a física do `8Bit Legends` para deixar a gameplay mais estável, justa e agradável, com foco em:
- movimento do player,
- colisões com mapa e inimigos,
- resposta de ataques e contato,
- knockback e sensação de impacto,
- hitboxes coerentes,
- fluidez geral da movimentação.

## Quando usar
Use esta skill quando o pedido envolver:
- “melhorar a física do game”
- “ajustar colisão”
- “melhorar movimentação do player”
- “corrigir travamentos em paredes ou cantos”
- “deixar combate mais responsivo”
- “ajustar knockback, hitbox ou peso dos inimigos”
- “melhorar a sensação do gameplay”

## Princípios obrigatórios
1. **Priorizar sensação arcade e responsiva**, não realismo pesado.
2. **Investigar a causa raiz antes de alterar valores**.
3. **Fazer ajustes pequenos e testáveis** para não quebrar o balanceamento.
4. **Preservar controle preciso no desktop e no mobile**.
5. **Validar no jogo real e com build** quando houver mudanças importantes.

## Arquivos prioritários para inspeção
Sempre começar revisando:
- `src/game/config.js`
- `src/game/scenes/MainScene.js`
- `src/game/entities/createPlayer.js`
- `src/game/entities/createEnemy.js`
- `src/game/entities/createBoss.js`
- `src/game/combat/combatSystem.js`
- `src/game/combat/stats.js`
- `src/game/ai/enemyBehavior.js`
- `src/game/ai/bossBehavior.js`
- `src/game/systems/ShieldSystem.js`
- `src/game/systems/WeaponSystem.js`

## Classificar o problema primeiro
Antes de mudar qualquer coisa, identificar qual é a categoria principal:

### 1. Movimento
Exemplos:
- player lento ou “duro” demais,
- mudança de direção ruim,
- velocidade injusta,
- sensação de escorregar.

### 2. Colisão
Exemplos:
- prender em canto ou parede,
- atravessar obstáculos,
- colisão inconsistente com inimigos,
- hitbox desalinhada.

### 3. Combate físico
Exemplos:
- contato tira dano de forma estranha,
- knockback fraco ou exagerado,
- alcance confuso,
- ataque sem impacto perceptível.

### 4. IA e pressão física
Exemplos:
- inimigos empurram demais,
- encurralam de forma injusta,
- boss ocupa espaço de forma ruim,
- sobreposição excessiva de corpos.

## Fluxo recomendado

### 1. Diagnóstico
Ler os arquivos centrais e localizar:
- onde a velocidade é definida,
- onde a colisão é registrada,
- onde o dano por contato acontece,
- onde o knockback ou reação visual/física é aplicado.

### 2. Identificar causa raiz
Checar se o problema vem de:
- valores exagerados de velocidade/aceleração;
- corpo físico muito grande ou pequeno;
- colisões/overlaps mal configurados;
- lógica de dano de contato agressiva demais;
- muitos inimigos ocupando a mesma área;
- falta de feedback ou reação física após o impacto.

### 3. Escolher a direção do ajuste

#### Se o problema for movimentação
Priorizar:
- velocidade base,
- leitura do input,
- suavidade sem perder precisão,
- resposta imediata ao soltar/apertar direção.

#### Se o problema for colisão
Priorizar:
- tamanho e offset de hitbox,
- colisões com paredes e grupos,
- evitar travamento em cantos,
- consistência entre sprite visual e corpo físico.

#### Se o problema for combate
Priorizar:
- alcance justo,
- resposta ao dano,
- pequena sensação de impacto,
- cooldown de contato equilibrado,
- clareza entre erro do jogador e injustiça da física.

#### Se o problema for pressão dos inimigos
Priorizar:
- distribuição de spawn,
- empilhamento de corpos,
- separação entre inimigos,
- espaço mínimo para reposicionamento do jogador.

## Regras de ajuste
Ao melhorar a física, preferir:
- mudanças graduais em vez de radicais;
- valores fáceis de entender e manter;
- física consistente com o estilo top-down do jogo;
- sensação “rápida e justa” em vez de simulação realista.

Evitar:
- adicionar inércia excessiva;
- deixar o player “pesado” demais;
- aumentar colisões a ponto de frustrar o movimento;
- alterar muitas variáveis ao mesmo tempo sem validação.

## Checklist de conclusão
Antes de finalizar, confirmar:
- [ ] O problema físico foi classificado corretamente.
- [ ] A causa raiz mais provável foi identificada.
- [ ] Movimento e colisões ficaram mais claros e consistentes.
- [ ] O combate ficou mais justo e responsivo.
- [ ] Desktop não foi quebrado.
- [ ] Mobile continua jogável.
- [ ] `npm run build` foi executado se houve mudanças.

## Formato esperado da resposta
Ao concluir uma revisão ou ajuste, responder com:
1. resumo do problema de física encontrado,
2. causa raiz provável,
3. melhorias aplicadas ou recomendadas,
4. arquivos alterados,
5. impacto esperado na gameplay,
6. validação realizada.

## Exemplos de uso
- `/melhorar-fisica-8bit-legends melhorar a movimentação do player`
- `/melhorar-fisica-8bit-legends corrigir colisões estranhas com paredes e inimigos`
- `/melhorar-fisica-8bit-legends deixar o combate mais responsivo e com melhor knockback`
- `/melhorar-fisica-8bit-legends revisar sensação física geral da gameplay`

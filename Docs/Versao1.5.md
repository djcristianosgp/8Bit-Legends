Você está evoluindo o jogo web "8Bit Legends", um RPG 2D pixel art (top-down) desenvolvido com React + Vite + Phaser.js.

O jogo já possui:
- Player com movimentação
- Inimigos
- Sistema de fases
- Combate básico
- Flechas automáticas
- Sistema de escudo

Sua tarefa é implementar a VERSÃO 1.5 com foco em profundidade de RPG:

1) Sistema de Skills (magias estilo MU Online)
2) Sistema de armas
3) Sistema de raridade de itens

----------------------------------------
✨ 1. SISTEMA DE SKILLS (MAGIAS)
----------------------------------------

Requisitos:
- Criar um sistema modular chamado SkillSystem
- Player pode usar habilidades ativas
- Cada skill possui:
  - Nome
  - Dano
  - Cooldown
  - Tipo (ex: área, projétil, buff)

Implementar pelo menos 3 skills iniciais:

1. Fireball
- Dispara um projétil em linha reta
- Causa dano ao colidir

2. Lightning
- Ataca instantaneamente o inimigo mais próximo
- Alto dano
- Cooldown maior

3. Aura (buff)
- Aumenta dano ou velocidade por alguns segundos

Controles:
- Teclas:
  - Q → Fireball
  - W → Lightning
  - E → Aura

Regras:
- Mostrar cooldown visual (mesmo que simples)
- Não permitir uso durante cooldown

Extras:
- Animações simples (efeitos visuais)
- Sistema preparado para adicionar novas skills facilmente

Estrutura:
- /systems/SkillSystem.js
- /data/skills.js

----------------------------------------
⚔️ 2. SISTEMA DE ARMAS
----------------------------------------

Requisitos:
- Criar sistema de equipamentos para o player
- Player pode ter 1 arma equipada

Cada arma deve alterar atributos:
- Dano base
- Velocidade de ataque
- Tipo de ataque (ex: melee, ranged, mágico)

Tipos iniciais de armas:
- Sword (equilíbrio)
- Bow (melhora flechas)
- Staff (melhora skills)

Comportamento:
- Armas influenciam:
  - dano das flechas
  - dano das skills
  - velocidade de ataque

Extras:
- Sistema fácil para adicionar novas armas
- Mostrar arma equipada (HUD simples ou console)

Estrutura:
- /systems/WeaponSystem.js
- /data/weapons.js

----------------------------------------
💎 3. SISTEMA DE RARIDADE DE ITENS
----------------------------------------

Requisitos:
- Todo item deve ter uma raridade

Raridades:
- Common (branco)
- Rare (azul)
- Epic (roxo)
- Legendary (laranja)

Cada raridade influencia:
- Atributos do item (ex: mais dano, mais bônus)
- Chance de drop

Exemplo:
- Common → base
- Rare → +20%
- Epic → +50%
- Legendary → +100%

Drops:
- Inimigos devem dropar itens com raridade aleatória
- Boss tem maior chance de raridade alta

Visual:
- Cor do nome do item
- Brilho ou destaque (opcional)

Extras:
- Sistema preparado para futuro inventário avançado

Estrutura:
- /systems/LootSystem.js (ou expandir o existente)
- /data/rarities.js

----------------------------------------
🔗 INTEGRAÇÃO ENTRE SISTEMAS
----------------------------------------

Regras importantes:

- WeaponSystem influencia:
  - ArrowSystem
  - SkillSystem

- SkillSystem usa atributos do player + arma

- LootSystem gera:
  - armas
  - itens com raridade

----------------------------------------
🎨 FEEDBACK VISUAL
----------------------------------------

Adicionar feedback para:

- Uso de skill (efeito visual simples)
- Drop de item (exibir nome com cor)
- Troca de arma
- Buff ativo (Aura)

----------------------------------------
📦 BOAS PRÁTICAS (OBRIGATÓRIO)
----------------------------------------

- Código modular
- Separar lógica em systems
- Separar dados em /data
- Evitar lógica pesada dentro da Scene
- Preparar para expansão futura (multiplayer)

----------------------------------------
🎯 RESULTADO ESPERADO
----------------------------------------

O jogo deve ter:

✔ Sistema de habilidades ativo (Q, W, E)  
✔ Armas que mudam gameplay  
✔ Itens com raridade e impacto real  
✔ Progressão mais profunda  
✔ Base sólida para RPG completo  

----------------------------------------
⚠️ IMPORTANTE
----------------------------------------

- NÃO quebrar sistemas existentes
- NÃO remover funcionalidades
- Apenas evoluir o jogo
- Garantir que tudo funcione integrado

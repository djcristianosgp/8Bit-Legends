Você está evoluindo o jogo "8Bit Legends", um RPG 2D pixel art (top-down) feito com React + Vite + Phaser.js.

O jogo já possui:
- Combate
- Skills
- Sistema de itens
- UI completa
- Clima, som e animações

Sua tarefa agora é tornar o jogo:
✔ 100% funcional offline  
✔ Compatível com dispositivos móveis (Android/iOS)

----------------------------------------
🌐 1. SUPORTE OFFLINE (PWA)
----------------------------------------

Transformar o jogo em um PWA (Progressive Web App):

Requisitos:
- Criar service worker
- Cachear:
  - HTML
  - JS
  - CSS
  - Assets (sprites, sons, mapas)
- Garantir que o jogo rode sem internet após primeiro acesso

Extras:
- Atualização automática de cache (versão nova do jogo)
- Estratégia:
  - Cache-first para assets
  - Network fallback

Arquivos:
- manifest.json
- service-worker.js

Configurações:
- Nome: "8Bit Legends"
- Ícone do app
- Tema (cores)

----------------------------------------
📱 2. RESPONSIVIDADE MOBILE
----------------------------------------

Requisitos:
- O jogo deve funcionar bem em:
  - celulares
  - tablets
- Ajustar canvas automaticamente:
  - largura 100%
  - altura proporcional

Extras:
- Detectar tamanho da tela
- Ajustar zoom/câmera dinamicamente

----------------------------------------
🎮 3. CONTROLES TOUCH
----------------------------------------

Adicionar controles mobile:

Joystick virtual:
- Movimento do player (lado esquerdo)

Botões:
- Ataque
- Skills (1, 2, 3)
- Escudo

Requisitos:
- Interface intuitiva
- Botões grandes (touch-friendly)
- Feedback visual ao pressionar

Extras:
- Opção de esconder controles (desktop)

----------------------------------------
⚙️ 4. PERFORMANCE MOBILE
----------------------------------------

Otimizar o jogo:

- Reduzir quantidade de partículas
- Limitar efeitos pesados
- Usar spritesheets otimizados
- Evitar cálculos desnecessários no update()

Extras:
- FPS estável (30-60)
- Configuração automática de qualidade:
  - Alto (desktop)
  - Médio/baixo (mobile)

----------------------------------------
🔋 5. GERENCIAMENTO DE RECURSOS
----------------------------------------

Requisitos:
- Pausar o jogo quando aba estiver inativa
- Reduzir uso de CPU em background

Extras:
- Detectar visibilidade da página

----------------------------------------
📦 6. ARMAZENAMENTO LOCAL
----------------------------------------

Garantir persistência offline:

- Usar localStorage ou IndexedDB
- Salvar:
  - progresso
  - itens
  - fase
  - configurações

Extras:
- Auto-save frequente
- Evitar perda de dados

----------------------------------------
🎨 7. UX MOBILE
----------------------------------------

Melhorias:

- Botões maiores
- UI adaptada para toque
- Evitar elementos pequenos

Extras:
- Vibração leve (se suportado)
- Feedback visual claro

----------------------------------------
📲 8. INSTALAÇÃO COMO APP
----------------------------------------

Permitir instalação:

- "Adicionar à tela inicial"
- Tela splash
- Rodar fullscreen

Extras:
- Experiência de app nativo

----------------------------------------
🎯 RESULTADO ESPERADO
----------------------------------------

O jogo deve:

✔ Rodar completamente offline  
✔ Ser instalável como app (PWA)  
✔ Funcionar perfeitamente no celular  
✔ Ter controles touch intuitivos  
✔ Manter boa performance  
✔ Preservar progresso do jogador  

----------------------------------------
⚠️ IMPORTANTE
----------------------------------------

- NÃO quebrar versão desktop
- NÃO remover controles de teclado
- Garantir compatibilidade cross-platform
- Manter o jogo leve

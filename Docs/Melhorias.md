Você está evoluindo o jogo "8Bit Legends", um RPG 2D pixel art (top-down) feito com React + Vite + Phaser.js.

O jogo já possui:
- Sistema de combate
- Skills
- Flechas automáticas
- Escudo
- Itens, armas e raridade
- Visual refinado com animações

Sua tarefa agora é implementar melhorias de EXPERIÊNCIA DO USUÁRIO (UX), HUD e imersão audiovisual.

----------------------------------------
⏸️ 1. SISTEMA DE PAUSA
----------------------------------------

Requisitos:
- Criar botão de pausa (tecla ESC e botão na tela)
- Quando pausado:
  - Parar movimento do player
  - Parar inimigos
  - Parar física
  - Pausar animações

UI de pausa:
- Exibir menu com:
  - "Continuar"
  - "Reiniciar Fase"
  - "Reiniciar Jogo"

Extras:
- Fundo escurecido (overlay)
- Transição suave (fade in/out)

----------------------------------------
🔄 2. REINICIAR FASE E JOGO
----------------------------------------

Reiniciar Fase:
- Resetar:
  - Player posição
  - Vida
  - Inimigos
  - Itens da fase
- Manter progresso geral

Reiniciar Jogo:
- Reset completo:
  - Level
  - Itens
  - Armas
  - Skills
- Limpar localStorage

Extras:
- Confirmação antes de reset total

----------------------------------------
📦 3. FINALIZAÇÃO DE FASE (LOOT INTELIGENTE)
----------------------------------------

Ao concluir uma fase:

Opção 1 (automática):
- Coletar todos os itens automaticamente

OU

Opção 2 (mais interessante):
- Iniciar um timer (ex: 5 segundos)
- Mostrar contagem regressiva
- Player pode coletar manualmente
- Após o tempo → próxima fase

Extras:
- Efeito visual de "fase concluída"
- Feedback sonoro

----------------------------------------
🗺️ 4. MINI MAPA
----------------------------------------

Requisitos:
- Mostrar mini mapa no canto da tela
- Representar:
  - Player
  - Inimigos
  - Limites do mapa

Características:
- Versão simplificada do mapa
- Atualização em tempo real

Extras:
- Ícones simples (cores diferentes)
- Fundo semi-transparente

----------------------------------------
👾 5. CONTADOR DE INIMIGOS
----------------------------------------

Requisitos:
- Mostrar quantidade de inimigos vivos

Formato:
- Exemplo: "4 / 15"

Atualização:
- Atualizar em tempo real conforme inimigos morrem

Extras:
- Destaque quando restar poucos inimigos
- Animação leve ao mudar valor

----------------------------------------
🎨 6. DIREÇÃO DE ARTE (PADRÃO 16BIT GOURMET)
----------------------------------------

Padronizar TODOS os assets:

- Estilo 16bit com shading
- Paleta consistente (mesmas cores base)
- Iluminação uniforme (mesma direção de luz)

Regras:
- Evitar mistura de estilos
- Ajustar sprites antigos para combinar

Extras:
- Leve outline nos personagens
- Sombras suaves no chão

----------------------------------------
🌧️ 7. SISTEMA DE CLIMA
----------------------------------------

Implementar sistema dinâmico:

Tipos:
- Dia (padrão)
- Noite (overlay escuro)
- Chuva

Chuva:
- Partículas caindo
- Som ambiente

Noite:
- Redução de luminosidade
- Possível vinheta

Extras:
- Alternância entre climas por fase
- Transição suave entre estados

----------------------------------------
🔊 8. SONS AMBIENTES
----------------------------------------

Adicionar áudio ambiente:

Tipos:
- Floresta (vento, pássaros)
- Água (rios)
- Cidade (leve ambiente)

Requisitos:
- Loop contínuo
- Volume baixo (não intrusivo)

Extras:
- Ajustar volume por configuração

----------------------------------------
🎵 9. TRILHA SONORA DINÂMICA
----------------------------------------

Sistema de música:

Estados:
- Exploração
- Combate
- Boss

Comportamento:
- Trocar música conforme situação
- Transição suave (fade)

Extras:
- Música mais intensa em boss
- Loop contínuo

----------------------------------------
🧠 10. ORGANIZAÇÃO DO CÓDIGO
----------------------------------------

Criar sistemas separados:

- /systems/PauseSystem.js
- /systems/AudioSystem.js
- /systems/WeatherSystem.js
- /systems/MinimapSystem.js

Regras:
- Evitar lógica na Scene
- Código modular e reutilizável

----------------------------------------
🎯 RESULTADO ESPERADO
----------------------------------------

O jogo deve ter:

✔ Sistema de pausa completo  
✔ Reinício de fase e jogo  
✔ Fluxo de fase mais inteligente  
✔ Mini mapa funcional  
✔ Contador de inimigos em tempo real  
✔ Visual consistente estilo 16bit  
✔ Clima dinâmico (chuva/noite)  
✔ Sons ambientes  
✔ Trilha sonora dinâmica  

----------------------------------------
⚠️ IMPORTANTE
----------------------------------------

- NÃO quebrar sistemas existentes
- NÃO remover funcionalidades
- Garantir performance (jogo leve)
- Garantir compatibilidade com navegador

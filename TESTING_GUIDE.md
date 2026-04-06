# 🧪 Guia de Teste - 8Bit Legends

## ⚡ Teste Rápido (5 minutos)

### 1. **Inicie o servidor**
```bash
npm run dev
```
Acesse: http://localhost:5173

### 2. **Tela Inicial**
- [ ] Digite seu nome do herói
- [ ] Clique "Começar"

### 3. **Sistema de Flechas** 🏹
```
Experimente:
- [ ] Aguarde 1-2 segundos → flechas começam a disparar
- [ ] Mova o player → flechas seguem inimigos
- [ ] Veja flechas perseguindo o inimigo mais próximo
- [ ] Quando flecha atinge: inimigo sofre dano
- [ ] Se inimigo morre: drops aparecem
```

**O que você deve ver:**
- Pequenas setas douradas (8×8) saindo do player
- Setas rotacionando na direção do inimigo
- Efeito de flash amarelo ao atingir

---

### 4. **Sistema de Escudo** 🛡️
```
Experimente:
- [ ] Pressione SHIFT → círculo azul aparece
- [ ] Texto "ESCUDO!" sobe
- [ ] Escudo pulsa (anima)
- [ ] Tome dano de inimigo → vê valor reduzido
- [ ] Aguarde 10 segundos → escudo desativa
- [ ] Texto "Escudo Desativado" aparece
- [ ] Pressione SHIFT logo → "Cooldown: 14s"
- [ ] Aguarde 15 segundos → SHIFT reativável
```

**O que você deve ver:**
- Círculo azul ao redor do player
- Animação de pulsação contínua
- Dano significativamente reduzido enquanto escudo ativo
- Feedback de texto para cada estado

---

### 5. **Biomas Temáticos** 🎨
```
Teste atravessando fases:
- [ ] Fase 1: Campo verde/amarelo (base)
- [ ] Fase 3: Floresta (verde escuro + madeira)
- [ ] Fase 5: Ruínas (cinza + pedra)
- [ ] Fase 7: Vulcão (vermelho/laranja)
- [ ] Fase 9: Caverna Cristalina (azul/ciano)
```

**O que você deve ver:**
- Tiles mudam de cor e textura cada fase
- Câmera segue o player suavamente
- Colisões funcionam normalmente

---

## 🎯 Teste de Balanceamento

### **Dano de Flechas**
```javascript
// Base: 8 + (fase × 2)

Fase 1  → 10 dano
Fase 5  → 18 dano  ← 80% do dano do player
Fase 10 → 28 dano  ← Similar ao dano do player
```

**Teste:**
- Veja inimigos sendo eliminados pelas flechas
- Em fases altas, flechas devem ser significativas
- Boss deve resistir mais que inimigos normais

---

### **Escudo - Redução de Dano**
```
Redução: 80%
Exemplo: Se você normalmente toma 10 dano
         → Com escudo: apenas 2 dano
```

**Teste:**
- Fique perto de inimigos SEM escudo → veja dano
- Ative SHIFT → entre novamente → veja dano reduzido
- Diferença deve ser notável

---

## 🐛 Checklist de Bugs Conhecidos

| Bug | Status | Impacto |
|-----|--------|---------|
| `arrow.setBody not a function` | ✅ CORRIGIDO | Resolvido |
| Favicon 404 | ⚠️ COSMÉTICO | Sem impacto |
| WebSocket offline | ✅ ESPERADO | Multiplayer desativado |

---

## 📊 Teste de Performance

```bash
# Abra DevTools (F12)
# Guia: Performance
# Clique Record e jogue por 10 segundos

Esperado:
- 60 FPS (ou próximo)
- Sem picos de lag
- Memória estável

Máximo de flechas simultâneas: 20
```

---

## 🎮 Teste de Integração

```javascript
// Todas as features existentes devem funcionar:

✅ Player movimento (WASD / Setas)
✅ Ataque melee (Space / Mobile)
✅ Inimigos perseguem
✅ Boss AI funciona
✅ Items dropam e coletam
✅ HUD atualiza (vida, itens, fase)
✅ Phaseclear (próxima fase)
✅ Save/Load
✅ Mobile D-pad
```

---

## 📱 Teste Mobile

```
Use DevTools (F12) → Toggle Device Toolbar

Deve funcionar:
- [ ] D-pad aparece embaixo
- [ ] Botão Attack funciona
- [ ] SHIFT (escudo) disponível? **Não** (mobile)
   → Alternativa: Toque 2x? (opcional)
- [ ] Layout reposiciona para 47vh
```

---

## 🔄 Teste de Regressão

Abra o console (F12 → Console) e não deve ter:

```
❌ Uncaught TypeError
❌ Uncaught ReferenceError
❌ 404 (except favicon.ico)
```

Esperado:
```
✅ Clean console
✅ WebSocket connection failed (ignorar)
✅ Phaser v3.90.0 iniciado
```

---

## 📝 Resultado esperado por fase

| Fase | Bioma | Inimigos | Boss | Flechas Efetivas? | Escudo Necessário? |
|------|-------|----------|------|------------------|--------------------|
| 1 | Campo | 5 | Não | Sim (10 DMG) | Não |
| 2 | Campo | 5 | Sim | Sim (12 DMG) | Mais fácil |
| 3 | Floresta | 6 | Não | Sim (14 DMG) | Não |
| 5 | Ruínas | 8 | Sim | Sim (18 DMG) | Recomendado |
| 9 | Cristal | 10 | Sim | Sim (26 DMG) | Essencial |

---

## ✅ Checklist Final de Aceitação

- [ ] Flechas disparando e perseguindo
- [ ] Escudo reduzindo 80% de dano
- [ ] Biomas mudando por fase
- [ ] Sem console errors
- [ ] Build passa (`npm run build`)
- [ ] Features antigas funcionando
- [ ] Performance aceitável (60 FPS)
- [ ] Mobile funciona

---

## 🎓 Teclas de Debug (Opcional)

```javascript
// Disponível no console:
// Não implementado, mas pode-se adicionar:

game.scene.scenes[0].arrowSystem.setActive(false)  // Desativa flechas
game.scene.scenes[0].shieldSystem.destroy()        // Reseta escudo
game.scene.scenes[0].player.stats.health = 1      // Testa derrota

// Próxima fase:
game.scene.restart({ phase: 5 })
```

---

## 📞 Suporte

Se encontrar problemas:

1. **Console errors?**
   - Verifique DevTools (F12 → Console)
   - Cole o erro aqui

2. **Assets não carregam?**
   - Verifique: `public/assets/sprites/` e `public/assets/tiles/`
   - Tente: `npm run build` novamente

3. **Performance ruim?**
   - Verifique FPS em DevTools (Performance tab)
   - Máximo de flechas é 20, pode reduzir se necessário

---

**Divirta-se testando! 🎮**

---

## 📊 Template para Feedback

```
Teste realizado em: [DATA/HORA]
Sistema Operacional: [Windows/Mac/Linux]
Browser: [Chrome/Firefox/Safari]

✅ Passou:
- [ ] Feature 1
- [ ] Feature 2

❌ Falhou:
- [ ] Feature X (Detalhes: ...)

📊 Performance:
- FPS: [60/50/30?]
- Memory: [Estável?]

🎮 Gameplay Feel:
- Flechas: [Rápidas/Lerdas?]
- Escudo: [OP/Fraco?]
- Dificuldade: [Fácil/Normal/Difícil?]
```

---

Bom teste! 🚀

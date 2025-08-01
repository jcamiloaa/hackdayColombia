# Solución de Problemas - Modo Interactivo

## 🐛 Problema: "No me está funcionando el cerrar el modo asistente"

### Diagnóstico Rápido

Abre la consola del navegador (F12) y ejecuta:
```javascript
virtualAssistant.debugContextClick();
```

### Posibles Causas y Soluciones

#### 1. **Elementos HTML no encontrados**
**Síntomas**: El botón toggle no responde o no cambia de estado.

**Verificación**:
```javascript
console.log('Button exists:', !!document.getElementById('toggle-context-click'));
console.log('Icon exists:', !!document.getElementById('context-click-icon'));
console.log('Text exists:', !!document.getElementById('context-click-text'));
```

**Solución**: Verificar que el template `base.html` tenga la estructura correcta del botón toggle.

#### 2. **Event Listeners no configurados**
**Síntomas**: El botón no ejecuta la función al hacer clic.

**Verificación**: Buscar en la consola el mensaje: `"Toggle context click button event listener added"`

**Solución**: 
- Refrescar la página
- Verificar que no hay errores JavaScript que impidan la inicialización

#### 3. **Estado inconsistente**
**Síntomas**: El indicador superior no desaparece o el botón muestra un estado incorrecto.

**Verificación**:
```javascript
// Verificar estado
console.log('Current state:', virtualAssistant.contextClickEnabled);

// Forzar sincronización
virtualAssistant.updateContextClickButton();
```

**Solución**: 
```javascript
// Reset completo del modo interactivo
virtualAssistant.disableContextClick(false);
virtualAssistant.updateContextClickButton();
```

#### 4. **Conflictos con otros event listeners**
**Síntomas**: Los clics no se capturan o se comportan de manera extraña.

**Verificación**:
```javascript
// Verificar si el handler existe
console.log('Handler exists:', !!virtualAssistant.contextClickHandler);
```

**Solución**:
```javascript
// Reinicializar el modo interactivo
virtualAssistant.disableContextClick(false);
setTimeout(() => {
  virtualAssistant.enableContextClick(false);
}, 100);
```

### Comandos de Debug Útiles

```javascript
// Ver estado completo
virtualAssistant.debugContextClick();

// Forzar deshabilitación
virtualAssistant.disableContextClick(true);

// Forzar habilitación
virtualAssistant.enableContextClick(true);

// Actualizar botón manualmente
virtualAssistant.updateContextClickButton();

// Verificar modo actual
console.log('Current mode:', virtualAssistant.currentMode);

// Verificar si el asistente está abierto
console.log('Assistant is open:', virtualAssistant.isOpen);
```

### Pasos de Solución

1. **Abre el asistente virtual** (botón azul flotante)
2. **Abre la consola del navegador** (F12)
3. **Ejecuta el diagnóstico**:
   ```javascript
   virtualAssistant.debugContextClick();
   ```
4. **Si el botón no existe**:
   - Verifica que estés en el modo "Chat de Texto"
   - Refresca la página y vuelve a intentar

5. **Si el botón existe pero no funciona**:
   ```javascript
   // Reset manual
   virtualAssistant.disableContextClick(false);
   virtualAssistant.updateContextClickButton();
   ```

6. **Si el indicador superior no desaparece**:
   ```javascript
   virtualAssistant.hideContextClickIndicator();
   ```

### Problemas Conocidos y Soluciones

#### Problema: El indicador superior permanece visible
```javascript
// Solución temporal
const indicator = document.getElementById('context-click-indicator');
if (indicator) {
  indicator.style.display = 'none';
}
```

#### Problema: El botón toggle no cambia visualmente
```javascript
// Forzar actualización visual
const button = document.getElementById('toggle-context-click');
const icon = document.getElementById('context-click-icon');
const text = document.getElementById('context-click-text');

if (button && icon && text) {
  button.className = 'btn btn-outline-secondary btn-sm me-2';
  icon.className = 'bi bi-cursor';
  text.textContent = 'Modo Interactivo: OFF';
}
```

#### Problema: Los clics siguen siendo capturados después de deshabilitar
```javascript
// Remover todos los listeners relacionados
virtualAssistant.contextClickEnabled = false;
if (virtualAssistant.contextClickHandler) {
  document.removeEventListener('click', virtualAssistant.contextClickHandler, true);
  virtualAssistant.contextClickHandler = null;
}
```

### Verificación Final

Después de aplicar cualquier solución, verifica que todo funcione:

1. **Modo OFF**: Haz clic en elementos de la página - no debería pasar nada
2. **Modo ON**: Haz clic en elementos - debería aparecer contexto en el chat
3. **Toggle**: El botón debería cambiar entre ON (verde) y OFF (gris)
4. **Indicador**: Debería aparecer/desaparecer según el estado

### Contacto de Soporte

Si el problema persiste:
1. Ejecuta `virtualAssistant.debugContextClick()` 
2. Copia y pega la salida completa
3. Incluye pasos específicos que reproduce el problema
4. Menciona el navegador y versión que estás usando

---

**Nota**: Estos comandos de debug se pueden remover en producción quitando los `console.log` del código JavaScript.

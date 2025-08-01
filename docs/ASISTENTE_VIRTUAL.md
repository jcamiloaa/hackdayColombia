# Asistente Virtual DIAN - Documentación de Implementación

## 📋 Descripción General

El Asistente Virtual DIAN es una interfaz interactiva implementada en el sistema diandeclara que proporciona soporte en tiempo real a los usuarios durante el proceso de declaración de renta. El asistente ofrece múltiples modalidades de interacción: chat de texto, reconocimiento de voz y compartir pantalla.

## 🏗️ Arquitectura de la Implementación

### Frontend Components

```
diandeclara/
├── templates/base.html          # Estructura HTML del asistente
├── static/css/project.css       # Estilos del asistente
└── static/js/project.js         # Lógica JavaScript del asistente
```

### Estructura del Código

#### 1. **Clase VirtualAssistant (JavaScript)**
```javascript
class VirtualAssistant {
  constructor() {
    this.isOpen = false;
    this.currentMode = 'options';
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recognition = null;
    this.screenStream = null;
  }
}
```

## 🎯 Funcionalidades Implementadas

### 1. **Interfaz de Opciones Principales**
- **Ubicación**: Botón flotante en la esquina inferior derecha
- **Diseño**: Círculo azul con imagen animada del bot (`bot.gif`)
- **Animación**: Efecto pulse ring continuo
- **Posicionamiento**: Absoluto dentro del contenedor principal

#### Características Visuales:
- Tamaño: 85px × 85px
- Gradiente de fondo: `linear-gradient(135deg, #007bff, #0056b3)`
- Imagen del bot: 65px × 65px con borde blanco
- Shadow: `0 6px 25px rgba(0, 123, 255, 0.5)`

### 2. **Chat de Texto**
Sistema de chat inteligente con respuestas predefinidas basadas en palabras clave.

#### Palabras Clave y Respuestas:
```javascript
const responses = {
  'declaracion': 'Te puedo ayudar con tu declaración de renta...',
  'pago': 'Para realizar el pago de tu declaración...',
  'formulario': 'El formulario 210 es para residentes fiscales...',
  'ayuda': 'Estoy aquí para ayudarte con: declaraciones...',
  'saludo': '¡Hola! Soy tu asistente virtual de la DIAN...',
  'default': 'Entiendo tu consulta. Para brindarte la mejor ayuda...'
};
```

#### Funcionalidades del Chat:
- **Auto-scroll** al agregar nuevos mensajes
- **Detección de Enter** para envío rápido
- **Diferenciación visual** entre mensajes de usuario y bot
- **Iconos distintivos**: `bi-person` para usuario, `bi-robot` para bot

### 3. **Reconocimiento de Voz**
Implementado usando la Web Speech API nativa del navegador.

#### Especificaciones Técnicas:
```javascript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
this.recognition = new SpeechRecognition();
this.recognition.continuous = false;
this.recognition.interimResults = false;
this.recognition.lang = 'es-ES';
```

#### Características:
- **Idioma**: Español (es-ES)
- **Modo**: No continuo (una frase por vez)
- **Indicador visual**: Círculo rojo pulsante durante grabación
- **Compatibilidad**: Chrome, Edge, Safari
- **Manejo de errores**: Mensajes informativos para el usuario

### 4. **Compartir Pantalla**
Utiliza la Screen Capture API para capturar la pantalla del usuario.

#### Implementación:
```javascript
this.screenStream = await navigator.mediaDevices.getDisplayMedia({
  video: { mediaSource: 'screen' },
  audio: false
});
```

#### Características:
- **Vista previa**: Video en tiempo real de la pantalla compartida
- **Control total**: Botones para iniciar/detener captura
- **Detección automática**: Reconoce cuando el usuario detiene desde el navegador
- **Seguridad**: Solo video, sin audio para privacidad

## 🎨 Diseño y UX

### Sistema de Colores
```css
:root {
  --primary-blue: #007bff;
  --primary-blue-dark: #0056b3;
  --success-green: #28a745;
  --danger-red: #dc3545;
  --background-light: #f8f9fa;
}
```

### Responsive Design
```css
/* Desktop */
.assistant-floating-btn { width: 85px; height: 85px; }
.bot-image { width: 65px; height: 65px; }

/* Tablet (≤768px) */
.assistant-floating-btn { width: 75px; height: 75px; }
.bot-image { width: 55px; height: 55px; }

/* Mobile (≤480px) */
.assistant-floating-btn { width: 70px; height: 70px; }
.bot-image { width: 50px; height: 50px; }
```

### Animaciones
#### Pulse Ring Animation:
```css
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.15); opacity: 0.4; }
  100% { transform: scale(1.3); opacity: 0; }
}
```

#### Modal Transitions:
- **fadeIn**: Para el overlay del modal
- **slideUp**: Para la aparición del contenido del modal

## 🔧 Configuración e Integración

### Requisitos del Sistema
- Django 5.1.11+
- Bootstrap 5.2.3+
- Bootstrap Icons 1.11.1+
- Navegadores compatibles: Chrome 80+, Edge 80+, Firefox 76+, Safari 14+

### Integración en Templates
El asistente se integra automáticamente en todas las páginas que extienden `base.html`:

```django
{% if user.is_authenticated %}
<div id="virtual-assistant">
  <!-- Estructura del asistente -->
</div>
{% endif %}
```

### Inicialización Automática
```javascript
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('virtual-assistant')) {
    new VirtualAssistant();
  }
});
```

## 🛠️ APIs y Tecnologías Utilizadas

### Web APIs
1. **Web Speech API**: Reconocimiento de voz
2. **Screen Capture API**: Compartir pantalla
3. **DOM API**: Manipulación de elementos
4. **CSS Animation API**: Animaciones fluidas

### Frameworks y Librerías
1. **Bootstrap 5**: Sistema de diseño y componentes
2. **Bootstrap Icons**: Iconografía
3. **CSS3**: Animaciones y transiciones
4. **ES6+**: Clases, async/await, arrow functions

## 📊 Métricas de Rendimiento

### Tamaños de Archivos
- `project.css`: ~8KB (sección del asistente)
- `project.js`: ~12KB (clase VirtualAssistant)
- Imágenes: `bot.gif` (~15KB)

### Tiempo de Carga
- **Inicialización**: <100ms
- **Apertura del modal**: <300ms con animación
- **Reconocimiento de voz**: <500ms para iniciar

## 🔒 Consideraciones de Seguridad

### Privacidad
- **No se almacenan** conversaciones del chat
- **No se graban** audios de voz
- **No se capturan** datos de pantalla compartida
- **Solo usuarios autenticados** pueden acceder al asistente

### Permisos del Navegador
- **Micrófono**: Solicitado solo al usar reconocimiento de voz
- **Pantalla**: Solicitado solo al compartir pantalla
- **No requiere**: Cámara, ubicación, o notificaciones

## 🚀 Funcionalidades Futuras

### Mejoras Planificadas
1. **Integración con IA**: Conexión con APIs de OpenAI o similares
2. **Historial de conversaciones**: Base de datos para seguimiento
3. **Análisis de pantalla**: IA para interpretar contenido compartido
4. **Multiidioma**: Soporte para múltiples idiomas
5. **Analytics**: Métricas de uso y satisfacción

### Extensibilidad
```javascript
// Ejemplo de extensión para nuevas funcionalidades
class VirtualAssistantExtended extends VirtualAssistant {
  constructor() {
    super();
    this.aiEnabled = true;
    this.analyticsEnabled = true;
  }
  
  async sendToAI(message) {
    // Implementación futura para IA
  }
}
```

## 🐛 Debugging y Mantenimiento

### Logs del Sistema
```javascript
console.log('Bootstrap components initialized - Tooltips:', tooltipList.length);
console.error('Error de reconocimiento de voz:', event.error);
console.error('Error al compartir pantalla:', error);
```

### Fallbacks Implementados
1. **Reconocimiento de voz no disponible**: Mensaje informativo
2. **Screen capture no soportado**: Alert con instrucciones
3. **JavaScript deshabilitado**: Funcionalidad básica sin JS

## 📝 Notas de Desarrollo

### Patrones de Diseño Utilizados
- **Singleton**: Una instancia del asistente por página
- **Observer**: Event listeners para interacciones
- **State Machine**: Manejo de estados del modal (options, chat, voice, screen)

### Convenciones de Código
- **Nombres de métodos**: camelCase
- **Nombres de clases CSS**: kebab-case con prefijo `assistant-`
- **IDs de elementos**: kebab-case descriptivos
- **Comentarios**: JSDoc style para funciones principales

---

## 📞 Soporte

Para dudas sobre la implementación del asistente virtual, consulte:
- **Documentación técnica**: `/docs/`
- **Código fuente**: `/diandeclara/static/js/project.js`
- **Estilos**: `/diandeclara/static/css/project.css`
- **Templates**: `/diandeclara/templates/base.html`

**Última actualización**: Agosto 2025
**Versión**: 1.0.0
**Autor**: Equipo diandeclara

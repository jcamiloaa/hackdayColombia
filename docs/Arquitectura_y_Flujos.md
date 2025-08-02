# Arquitectura y Flujos Clave del Sistema ColombIAdeclara

## 1. Visión General

ColombIAdeclara es un asistente virtual cognitivo multimodal para facilitar el proceso de declaración de renta en Colombia. La solución implementa una interfaz interactiva que proporciona orientación en tiempo real a los usuarios mientras navegan por el sistema de declaración tributaria.

## 2. Arquitectura General

### 2.1 Componentes Principales

La arquitectura del sistema está compuesta por los siguientes componentes clave:

```
ColombIAdeclara/
├── Frontend (Django Templates + JavaScript)
│   ├── Interfaz de Usuario
│   ├── Asistente Virtual Multimodal
│   └── Formularios de Declaración
├── Backend (Django + Channels)
│   ├── API REST
│   ├── WebSockets
│   ├── Modelos de Datos
│   └── Autenticación y Autorización
└── Servicios Externos
    ├── OpenAI Assistants API
    └── API de Síntesis de Voz
```

### 2.2 Tecnologías Utilizadas

- **Frontend**:
  - HTML5, CSS3, JavaScript (ES6+)
  - Bootstrap 5 para el diseño responsivo
  - Web Speech API para reconocimiento y síntesis de voz
  - DOM API para manipulación dinámica de elementos

- **Backend**:
  - Django (Framework web de Python)
  - Django Channels para comunicación bidireccional (WebSockets)
  - SQLite/PostgreSQL para almacenamiento de datos
  - Integración con OpenAI Assistants API

- **DevOps**:
  - Docker para contenedorización
  - GitHub para control de versiones
  - Despliegue con Docker Compose

## 3. Flujos Clave del Sistema

### 3.1 Flujo de Asistencia Multimodal

El asistente virtual ofrece tres modos principales de interacción:

1. **Chat de Texto**:
   - El usuario abre el asistente y selecciona el modo de chat
   - Introduce preguntas específicas sobre el proceso de declaración
   - El sistema responde con información contextual y guía paso a paso

2. **Reconocimiento de Voz**:
   - El usuario activa la función de voz del asistente
   - Realiza consultas mediante comandos hablados
   - El sistema procesa la consulta y responde con texto y voz

3. **Modo Interactivo (Contexto por Clic)**:
   - El usuario activa el modo interactivo del asistente
   - Hace clic en cualquier elemento de la interfaz (campos, botones, textos)
   - El sistema identifica el elemento y proporciona explicación contextual
   - La respuesta se presenta en texto y se lee automáticamente

### 3.2 Flujo de Declaración de Renta

El proceso de declaración está estructurado en las siguientes etapas:

1. **Verificación de Residencia Fiscal**:
   - Cuestionario inicial para determinar la condición de residencia
   - Ayuda contextual disponible para cada pregunta

2. **Formulario 210 (Declaración de Renta)**:
   - Datos personales y de identificación
   - Ingresos (laborales, capital, no laborales, pensiones)
   - Deducciones y rentas exentas
   - Cálculo automático de impuesto

3. **Firma Electrónica**:
   - Validación de identidad
   - Firma digital del documento

4. **Presentación**:
   - Generación del documento final
   - Confirmación de presentación

5. **Pago**:
   - Selección de método de pago
   - Procesamiento de la transacción

### 3.3 Flujo de Integración con IA

El sistema utiliza integración con IA para mejorar la experiencia del usuario:

1. **Análisis de Consultas**:
   - Procesamiento de lenguaje natural para entender consultas de texto/voz
   - Identificación de intenciones y entidades en las preguntas

2. **Generación de Respuestas Contextuales**:
   - Respuestas específicas según la sección del formulario
   - Explicaciones adaptadas al nivel de conocimiento del usuario

3. **Asistencia Proactiva**:
   - Detección de patrones de uso problemáticos
   - Sugerencias automáticas en puntos críticos del proceso

## 4. Componentes Específicos del Asistente Virtual

### 4.1 Clase VirtualAssistant (Frontend)

Implementada en JavaScript, esta clase maneja toda la lógica del asistente:

```javascript
class VirtualAssistant {
  constructor() {
    this.isOpen = false;
    this.currentMode = 'options';
    // Configuración inicial
  }

  // Métodos principales
  init() {...}
  setupEventListeners() {...}
  toggleModal() {...}
  
  // Interfaces de usuario
  showOptionsInterface() {...}
  showChatInterface() {...}
  showVoiceInterface() {...}
  showScreenShareInterface() {...}
  
  // Modo interactivo (contexto por clic)
  enableContextClick() {...}
  handleContextClick(event) {...}
  generateElementContext(element) {...}
  generateContextualResponse(context, element) {...}
  
  // Procesamiento de consultas
  processQuery(message) {...}
  processVoiceQuery(transcript) {...}
  processScreenQuery(message) {...}
}
```

### 4.2 WebSocket Consumer (Backend)

Maneja la comunicación en tiempo real entre el frontend y el backend:

```python
class AssistantConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.thread_id = None
        
        if self.user.is_authenticated:
            await self.accept()
            # Inicializar thread para el usuario
            
    async def disconnect(self, close_code):
        # Limpiar recursos
        
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data["message"]
        
        # Procesar mensaje con OpenAI Assistant
        response = await self.get_assistant_response(message)
        
        # Enviar respuesta al cliente
        await self.send(text_data=json.dumps({
            "message": response,
            "sender": "bot"
        }))
```

## 5. Aspectos de Seguridad

El sistema implementa las siguientes medidas de seguridad:

- **Autenticación**: Uso de Django Authentication System para proteger acceso
- **CSRF Protection**: Implementación de tokens CSRF en formularios
- **Sanitización**: Limpieza de entradas del usuario para prevenir XSS
- **Rate Limiting**: Limitación de solicitudes para prevenir abusos
- **Permisos**: Control de acceso basado en roles de usuario

## 6. Métricas y Rendimiento

El sistema está optimizado para ofrecer:

- **Tiempos de Respuesta**:
  - Carga inicial: < 2 segundos
  - Interacción con asistente: < 500ms
  - Procesamiento de voz: < 1 segundo
  - Análisis de contexto por clic: < 100ms

- **Uso de Recursos**:
  - Memoria: Optimización para evitar fugas
  - CPU: Procesamiento eficiente con cache cuando es posible
  - Red: Carga bajo demanda de recursos

## 7. Extensibilidad y Desarrollo Futuro

La arquitectura permite futuras extensiones como:

- Integración con modelos de IA más avanzados
- Soporte para procesamiento de documentos e imágenes
- Análisis predictivo para asistencia proactiva
- Personalización basada en el perfil del usuario
- Expansión a otros tipos de trámites tributarios

---

*Documento creado para el reto HackDay2025 IAMinds - Agosto 2025*

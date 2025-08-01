# Asistente Virtual DIAN - Backend WebSocket

## Configuración del Asistente Virtual

Este proyecto incluye un asistente virtual que funciona con OpenAI Assistants API y WebSockets para brindar soporte en tiempo real para declaraciones de renta.

### Características

- **Chat de Texto**: Comunicación escrita con el asistente
- **Chat por Voz**: Reconocimiento de voz del navegador + respuesta del asistente
- **Compartir Pantalla**: Modo dummy para demostración (no conectado al backend)
- **WebSocket**: Comunicación en tiempo real sin Redis (solo Python en memoria)
- **Thread Único**: Mantiene contexto de conversación por usuario

### Configuración

1. **Variables de Entorno**
   Crea un archivo `.env` basado en `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. **OpenAI Assistant**
   - Crea una cuenta en [OpenAI](https://platform.openai.com/)
   - Crea un Assistant en el [Playground](https://platform.openai.com/playground?mode=assistant)
   - Configura el Assistant con instrucciones como:
     ```
     Eres un asistente virtual de la DIAN (Dirección de Impuestos y Aduanas Nacionales de Colombia). 
     Tu función es ayudar a los ciudadanos con sus declaraciones de renta, proporcionando información 
     clara y precisa sobre formularios, procesos de pago, fechas límite y resolución de dudas tributarias.
     Siempre mantén un tono profesional pero amigable.
     ```
   - Copia el API Key y Assistant ID al archivo `.env`

3. **Instalación de Dependencias**
   ```bash
   pip install -r requirements/local.txt
   ```

4. **Ejecutar el Proyecto**
   ```bash
   python manage.py runserver
   ```

### Estructura del Backend

- **WebSocket Consumer**: `diandeclara/users/api/assistant_consumer.py`
- **Configuración WebSocket**: `config/websocket.py`
- **Variables de Entorno**: Definidas en `config/settings/base.py`

### Funcionamiento

1. **Conexión**: Al abrir el asistente, se establece conexión WebSocket en `/ws/assistant/`
2. **Mensajes**: Los mensajes se envían al OpenAI Assistant y se mantiene un thread por usuario
3. **Respuestas**: Las respuestas se reciben en tiempo real via WebSocket
4. **Reinicio**: Al cerrar el chat, se reinicia la conversación (nuevo thread)

### Limitaciones Actuales

- Proyecto ilustrativo para un solo usuario concurrente
- Sin persistencia de conversaciones (solo en memoria)
- Sin Redis (usa InMemoryChannelLayer)
- Modo "Compartir Pantalla" es dummy (no funcional)

### API del WebSocket

Mensajes que acepta el WebSocket:

```javascript
// Enviar mensaje de texto/voz
{
  "type": "message",
  "message": "¿Cómo lleno el formulario 210?"
}

// Reiniciar conversación
{
  "type": "reset"
}
```

Respuestas del WebSocket:

```javascript
// Conexión establecida
{
  "type": "connection",
  "message": "Conectado al asistente virtual DIAN"
}

// Respuesta del asistente
{
  "type": "response", 
  "message": "Para llenar el formulario 210..."
}

// Error
{
  "type": "error",
  "message": "Descripción del error"
}

// Conversación reiniciada
{
  "type": "reset",
  "message": "Conversación reiniciada"
}
```

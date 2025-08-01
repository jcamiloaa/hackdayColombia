/* Project specific Javascript goes here. */

// Asistente Virtual
class VirtualAssistant {
  constructor() {
    this.isOpen = false;
    this.currentMode = 'options';
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recognition = null;
    this.screenStream = null;
    
    this.init();
  }

  init() {
    // Elementos del DOM
    this.assistantBtn = document.getElementById('assistant-btn');
    this.assistantModal = document.getElementById('assistant-modal');
    this.closeBtn = document.getElementById('close-assistant');
    
    // Interfaces
    this.optionsInterface = document.getElementById('assistant-options');
    this.chatInterface = document.getElementById('chat-interface');
    this.voiceInterface = document.getElementById('voice-interface');
    this.screenShareInterface = document.getElementById('screen-share-interface');
    
    // Eventos
    this.setupEventListeners();
    this.setupSpeechRecognition();
  }

  setupEventListeners() {
    // Botón principal
    this.assistantBtn.addEventListener('click', () => this.toggleModal());
    this.closeBtn.addEventListener('click', () => this.closeModal());
    
    // Cerrar al hacer click fuera del modal
    this.assistantModal.addEventListener('click', (e) => {
      if (e.target === this.assistantModal) {
        this.closeModal();
      }
    });

    // Botones de opciones
    document.getElementById('chat-btn').addEventListener('click', () => this.showChatInterface());
    document.getElementById('voice-btn').addEventListener('click', () => this.showVoiceInterface());
    document.getElementById('screen-share-btn').addEventListener('click', () => this.showScreenShareInterface());

    // Botones de regreso
    document.getElementById('back-to-options').addEventListener('click', () => this.showOptionsInterface());
    document.getElementById('back-to-options-voice').addEventListener('click', () => this.showOptionsInterface());
    document.getElementById('back-to-options-screen').addEventListener('click', () => this.showOptionsInterface());

    // Chat
    document.getElementById('send-message').addEventListener('click', () => this.sendMessage());
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Voz
    document.getElementById('start-recording').addEventListener('click', () => this.startVoiceRecording());
    document.getElementById('stop-recording').addEventListener('click', () => this.stopVoiceRecording());

    // Compartir pantalla
    document.getElementById('start-screen-share').addEventListener('click', () => this.startScreenShare());
    document.getElementById('stop-screen-share').addEventListener('click', () => this.stopScreenShare());

    // Screen Chat
    document.getElementById('send-screen-message').addEventListener('click', () => this.sendScreenMessage());
    document.getElementById('screen-chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendScreenMessage();
    });
  }

  toggleModal() {
    if (this.isOpen) {
      this.closeModal();
    } else {
      this.openModal();
    }
  }

  openModal() {
    this.assistantModal.style.display = 'block';
    this.isOpen = true;
    this.showOptionsInterface();
  }

  closeModal() {
    this.assistantModal.style.display = 'none';
    this.isOpen = false;
    
    // Limpiar cualquier recurso activo
    this.stopVoiceRecording();
    this.stopScreenShare();
  }

  showOptionsInterface() {
    this.hideAllInterfaces();
    this.optionsInterface.style.display = 'block';
    this.currentMode = 'options';
  }

  showChatInterface() {
    this.hideAllInterfaces();
    this.chatInterface.style.display = 'block';
    this.currentMode = 'chat';
    document.getElementById('chat-input').focus();
  }

  showVoiceInterface() {
    this.hideAllInterfaces();
    this.voiceInterface.style.display = 'block';
    this.currentMode = 'voice';
  }

  showScreenShareInterface() {
    this.hideAllInterfaces();
    this.screenShareInterface.style.display = 'block';
    this.currentMode = 'screen';
  }

  hideAllInterfaces() {
    this.optionsInterface.style.display = 'none';
    this.chatInterface.style.display = 'none';
    this.voiceInterface.style.display = 'none';
    this.screenShareInterface.style.display = 'none';
  }

  // Chat functionality
  sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;

    // Agregar mensaje del usuario
    this.addChatMessage(message, 'user');
    input.value = '';

    // Simular respuesta del bot (aquí conectarías con tu API)
    setTimeout(() => {
      const response = this.generateBotResponse(message);
      this.addChatMessage(response, 'bot');
    }, 1000);
  }

  addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
    
    const icon = sender === 'user' ? 'bi-person' : 'bi-robot';
    messageDiv.innerHTML = `
      <i class="bi ${icon}"></i>
      <span>${message}</span>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  generateBotResponse(message) {
    // Respuestas predefinidas simples
    const responses = {
      'declaracion': 'Te puedo ayudar con tu declaración de renta. ¿Necesitas ayuda con el formulario 210 o tienes preguntas específicas sobre algún campo?',
      'pago': 'Para realizar el pago de tu declaración, puedes usar PSE o tarjeta de crédito. El proceso es seguro y recibirás confirmación inmediata.',
      'formulario': 'El formulario 210 es para residentes fiscales. Te guío paso a paso: primero necesitamos validar tu residencia fiscal.',
      'ayuda': 'Estoy aquí para ayudarte con: declaraciones de renta, pagos, formularios, consultas sobre el proceso, y resolver dudas específicas.',
      'saludo': '¡Hola! Soy tu asistente virtual de la DIAN. Estoy aquí para ayudarte con tu declaración de renta y resolver todas tus dudas.',
      'default': 'Entiendo tu consulta. Para brindarte la mejor ayuda, ¿podrías ser más específico sobre qué aspecto de la declaración de renta necesitas?'
    };

    const lowerMessage = message.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key) || (key === 'saludo' && (lowerMessage.includes('hola') || lowerMessage.includes('buenas')))) {
        return response;
      }
    }
    
    return responses.default;
  }

  // Voice functionality
  setupSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'es-ES';

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.addVoiceMessage(transcript, 'user');
        
        // Generar respuesta
        setTimeout(() => {
          const response = this.generateBotResponse(transcript);
          this.addVoiceMessage(response, 'bot');
        }, 1000);
      };

      this.recognition.onerror = (event) => {
        console.error('Error de reconocimiento de voz:', event.error);
        this.stopVoiceRecording();
        this.addVoiceMessage('Lo siento, no pude escucharte bien. Intenta de nuevo.', 'bot');
      };

      this.recognition.onend = () => {
        this.stopVoiceRecording();
      };
    }
  }

  startVoiceRecording() {
    if (!this.recognition) {
      alert('Tu navegador no soporta reconocimiento de voz. Intenta con Chrome o Edge.');
      return;
    }

    const startBtn = document.getElementById('start-recording');
    const stopBtn = document.getElementById('stop-recording');
    const indicator = document.getElementById('voice-indicator');
    const statusText = document.getElementById('voice-status-text');

    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    indicator.classList.add('recording');
    indicator.innerHTML = '<i class="bi bi-mic"></i>';
    statusText.textContent = 'Escuchando... Habla ahora';

    this.recognition.start();
  }

  stopVoiceRecording() {
    if (this.recognition) {
      this.recognition.stop();
    }

    const startBtn = document.getElementById('start-recording');
    const stopBtn = document.getElementById('stop-recording');
    const indicator = document.getElementById('voice-indicator');
    const statusText = document.getElementById('voice-status-text');

    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    indicator.classList.remove('recording');
    indicator.innerHTML = '<i class="bi bi-mic-mute"></i>';
    statusText.textContent = 'Presiona el botón para hablar';
  }

  addVoiceMessage(message, sender) {
    const messagesContainer = document.getElementById('voice-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
    
    const icon = sender === 'user' ? 'bi-person' : 'bi-robot';
    messageDiv.innerHTML = `
      <i class="bi ${icon}"></i>
      <span>${message}</span>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Screen sharing functionality
  async startScreenShare() {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: false
      });

      const video = document.getElementById('screen-video');
      const preview = document.getElementById('screen-preview');
      const startBtn = document.getElementById('start-screen-share');
      const stopBtn = document.getElementById('stop-screen-share');
      const screenChat = document.getElementById('screen-chat');

      video.srcObject = this.screenStream;
      preview.style.display = 'block';
      startBtn.style.display = 'none';
      stopBtn.style.display = 'inline-block';
      screenChat.style.display = 'block';

      // Inicializar chat de pantalla
      this.initScreenChat();

      // Detectar cuando el usuario detiene la compartición
      this.screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stopScreenShare();
      });

    } catch (error) {
      console.error('Error al compartir pantalla:', error);
      alert('No se pudo acceder a la pantalla. Asegúrate de permitir el acceso.');
    }
  }

  stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    const video = document.getElementById('screen-video');
    const preview = document.getElementById('screen-preview');
    const startBtn = document.getElementById('start-screen-share');
    const stopBtn = document.getElementById('stop-screen-share');
    const screenChat = document.getElementById('screen-chat');

    video.srcObject = null;
    preview.style.display = 'none';
    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    screenChat.style.display = 'none';

    // Limpiar chat de pantalla
    this.clearScreenChat();
  }

  // Screen Chat functionality
  initScreenChat() {
    const messagesContainer = document.getElementById('screen-chat-messages');
    messagesContainer.innerHTML = '';
    
    // Mensaje inicial del asistente
    this.addScreenChatMessage('Asistente', '¡Ahora puedo ver tu pantalla! Pregúntame sobre lo que estás viendo o necesites ayuda con tu declaración.', false);
  }

  sendScreenMessage() {
    const input = document.getElementById('screen-chat-input');
    const message = input.value.trim();
    
    if (message) {
      this.addScreenChatMessage('Tú', message, true);
      input.value = '';
      
      // Simular análisis de pantalla y respuesta contextual
      setTimeout(() => {
        this.processScreenQuery(message);
      }, 500);
    }
  }

  addScreenChatMessage(sender, message, isUser) {
    const messagesContainer = document.getElementById('screen-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `screen-chat-message ${isUser ? 'user-message' : 'assistant-message'}`;
    
    messageDiv.innerHTML = `
      <div class="message-sender">${sender}</div>
      <div class="message-content">${message}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  processScreenQuery(message) {
    let response = '';
    const lowerMessage = message.toLowerCase();
    
    // Análisis contextual basado en la página actual
    const currentUrl = window.location.pathname;
    
    if (currentUrl.includes('formulario_210')) {
      if (lowerMessage.includes('campo') || lowerMessage.includes('llenar') || lowerMessage.includes('completar')) {
        response = 'Veo que estás en el formulario 210. Te ayudo con los campos: primero completa los datos básicos como nombres y NIT, luego continúa con los ingresos y deducciones. ¿Qué campo específico necesitas ayuda?';
      } else if (lowerMessage.includes('error') || lowerMessage.includes('problema')) {
        response = 'Puedo ayudarte con errores en el formulario. Los errores más comunes son: campos obligatorios vacíos, formato incorrecto de fechas, o valores negativos donde no se permiten. ¿Qué error específico estás viendo?';
      } else {
        response = 'Estás en el formulario de declaración de renta 210. Puedo ayudarte con el llenado de campos, cálculos, o resolución de errores. ¿Qué necesitas?';
      }
    } else if (currentUrl.includes('lista_declaraciones')) {
      response = 'Veo tu lista de declaraciones. Puedes crear una nueva declaración, editar borradores existentes, o descargar declaraciones ya presentadas. ¿Qué acción quieres realizar?';
    } else if (currentUrl.includes('menu_principal')) {
      response = 'Estás en el menú principal. Desde aquí puedes: crear nueva declaración, ver declaraciones anteriores, o consultar ayuda. ¿Qué opción te interesa?';
    } else {
      // Respuestas generales basadas en palabras clave
      if (lowerMessage.includes('ayuda') || lowerMessage.includes('cómo')) {
        response = 'Estoy viendo tu pantalla y puedo ayudarte con cualquier aspecto de la declaración de renta. ¿Qué específicamente necesitas saber?';
      } else if (lowerMessage.includes('calcular') || lowerMessage.includes('cálculo')) {
        response = 'Te ayudo con cálculos. Puedo explicarte cómo se calculan los impuestos, deducciones, o cualquier operación matemática en tu declaración.';
      } else if (lowerMessage.includes('guardar') || lowerMessage.includes('enviar')) {
        response = 'Para guardar tu declaración como borrador usa el botón "Guardar Borrador". Para enviarla definitivamente usa "Presentar Declaración". ¿Cuál prefieres?';
      } else {
        response = `Entiendo tu consulta: "${message}". Basándome en lo que veo en tu pantalla, te recomiendo revisar la información actual y me puedes preguntar sobre cualquier elemento específico que veas.`;
      }
    }
    
    this.addScreenChatMessage('Asistente', response, false);
  }

  clearScreenChat() {
    const messagesContainer = document.getElementById('screen-chat-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
    }
  }
}

// Inicializar el asistente cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('virtual-assistant')) {
    new VirtualAssistant();
  }
});

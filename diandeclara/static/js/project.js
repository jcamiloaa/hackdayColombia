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
    this.contextClickEnabled = false;
    this.contextClickHandler = null;
    
    // WebSocket para comunicación con el backend
    this.websocket = null;
    this.isConnected = false;
    
    this.init();
  }

  init() {
    // Elementos del DOM
    this.assistantBtn = document.getElementById('assistant-btn');
    this.assistantModal = document.getElementById('assistant-modal');
    this.closeBtn = document.getElementById('close-assistant');
    
    // Verificar elementos críticos
    console.log('Assistant elements found:', {
      assistantBtn: !!this.assistantBtn,
      assistantModal: !!this.assistantModal,
      closeBtn: !!this.closeBtn
    });
    
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
    this.closeBtn.addEventListener('click', () => {
      console.log('Close button clicked');
      this.closeModal();
    });
    
    // Cerrar al hacer click fuera del modal
    this.assistantModal.addEventListener('click', (e) => {
      if (e.target === this.assistantModal) {
        console.log('Click outside modal detected');
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

    // Toggle Context Click
    const toggleButton = document.getElementById('toggle-context-click');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => this.toggleContextClick());
      console.log('Toggle context click button event listener added');
    } else {
      console.warn('Toggle context click button not found during setup');
    }

    // Atajo de teclado de emergencia para cerrar el asistente (Escape)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        console.log('Escape key pressed - closing assistant');
        this.closeModal();
      }
    });
    console.log('Emergency escape key listener added');
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
    this.connectWebSocket();
  }

  closeModal() {
    console.log('closeModal called');
    this.assistantModal.style.display = 'none';
    this.isOpen = false;
    
    // Limpiar cualquier recurso activo
    this.stopVoiceRecording();
    this.stopScreenShare();
    this.disableContextClick(false); // Deshabilitar modo interactivo al cerrar (sin mensaje)
    this.disconnectWebSocket();
    console.log('Modal closed successfully');
  }

  showOptionsInterface() {
    this.hideAllInterfaces();
    this.optionsInterface.style.display = 'block';
    this.currentMode = 'options';
    this.disableContextClick(false); // Deshabilitar modo interactivo al regresar al menú (sin mensaje)
  }

  showChatInterface() {
    this.hideAllInterfaces();
    this.chatInterface.style.display = 'block';
    this.currentMode = 'chat';
    document.getElementById('chat-input').focus();
    
    // Habilitar automáticamente el modo interactivo cuando se abre el chat
    setTimeout(() => {
      this.enableContextClick(false); // No mostrar mensaje automático
      this.updateContextClickButton();
    }, 500);
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

  // Context Click Functionality - Captura de contexto por clic
  enableContextClick(showMessage = true) {
    console.log('enableContextClick called, current state:', this.contextClickEnabled);
    if (this.contextClickEnabled) return;
    
    this.contextClickEnabled = true;
    this.contextClickHandler = (event) => this.handleContextClick(event);
    
    // Agregar listener global para clics
    document.addEventListener('click', this.contextClickHandler, true);
    console.log('Context click listener added');
    
    // Mostrar indicador visual
    this.showContextClickIndicator();
    
    // Actualizar botón de toggle si estamos en modo chat
    if (this.currentMode === 'chat') {
      this.updateContextClickButton();
      
      // Enviar mensaje al chat informando que está habilitado
      if (showMessage) {
        this.addChatMessage('🎯 Modo interactivo habilitado: Haz clic en cualquier elemento de la página para que te explique su función.', 'bot');
      }
    }
  }

  disableContextClick(showMessage = true) {
    console.log('disableContextClick called, current state:', this.contextClickEnabled);
    if (!this.contextClickEnabled) return;
    
    this.contextClickEnabled = false;
    
    // Remover listener global
    if (this.contextClickHandler) {
      document.removeEventListener('click', this.contextClickHandler, true);
      this.contextClickHandler = null;
      console.log('Context click listener removed');
    }
    
    // Ocultar indicador visual
    this.hideContextClickIndicator();
    
    // Actualizar botón de toggle si estamos en modo chat
    if (this.currentMode === 'chat') {
      this.updateContextClickButton();
      
      // Enviar mensaje al chat informando que está deshabilitado
      if (showMessage) {
        this.addChatMessage('❌ Modo interactivo deshabilitado.', 'bot');
      }
    }
  }

  handleContextClick(event) {
    const clickedElement = event.target;
    
    // Ignorar clics en el propio asistente virtual
    if (clickedElement.closest('#virtual-assistant')) {
      console.log('Click ignored - inside assistant virtual');
      return; // Permitir que el evento normal continúe
    }
    
    // Solo ahora prevenir la acción por defecto para otros elementos
    event.preventDefault();
    event.stopPropagation();
    console.log('Context click handled for:', clickedElement.tagName);
    
    // Generar contexto del elemento
    const context = this.generateElementContext(clickedElement);
    
    // Enviar contexto al chat según el modo activo
    if (this.currentMode === 'chat') {
      this.addChatMessage(`📍 Elemento seleccionado: ${context}`, 'user');
      setTimeout(() => {
        const response = this.generateContextualResponse(context, clickedElement);
        this.addChatMessage(response, 'bot');
      }, 500);
    } else if (this.currentMode === 'screen') {
      this.addScreenChatMessage('Tú', `📍 Elemento seleccionado: ${context}`, true);
      setTimeout(() => {
        const response = this.generateContextualResponse(context, clickedElement);
        this.addScreenChatMessage('Asistente', response, false);
      }, 500);
    }
    
    // Resaltar temporalmente el elemento seleccionado
    this.highlightElement(clickedElement);
  }

  generateElementContext(element) {
    let context = '';
    const tagName = element.tagName.toLowerCase();
    const text = element.textContent?.trim() || '';
    const id = element.id;
    const classes = element.className;
    const type = element.type;
    const placeholder = element.placeholder;
    const href = element.href;
    const src = element.src;
    const alt = element.alt;
    
    // Identificar el tipo de elemento y generar descripción contextual
    if (tagName === 'button') {
      context = `Botón "${text || id || 'sin texto'}"`;
      if (element.disabled) context += ' (deshabilitado)';
    } else if (tagName === 'input') {
      if (type === 'text') {
        context = `Campo de texto "${placeholder || id || 'sin etiqueta'}"`;
      } else if (type === 'number') {
        context = `Campo numérico "${placeholder || id || 'sin etiqueta'}"`;
      } else if (type === 'email') {
        context = `Campo de correo electrónico "${placeholder || id || 'sin etiqueta'}"`;
      } else if (type === 'password') {
        context = `Campo de contraseña`;
      } else if (type === 'checkbox') {
        context = `Casilla de verificación "${text || id || 'sin etiqueta'}"`;
        context += element.checked ? ' (marcada)' : ' (sin marcar)';
      } else if (type === 'radio') {
        context = `Opción de selección "${text || id || 'sin etiqueta'}"`;
        context += element.checked ? ' (seleccionada)' : ' (no seleccionada)';
      } else if (type === 'submit') {
        context = `Botón de envío "${element.value || text || 'Enviar'}"`;
      } else {
        context = `Campo de entrada tipo "${type}"`;
      }
    } else if (tagName === 'select') {
      context = `Lista desplegable "${id || 'sin nombre'}"`;
      const selectedOption = element.selectedOptions[0];
      if (selectedOption) {
        context += ` (seleccionado: "${selectedOption.text}")`;
      }
    } else if (tagName === 'textarea') {
      context = `Área de texto "${placeholder || id || 'sin etiqueta'}"`;
    } else if (tagName === 'a') {
      context = `Enlace "${text || href || 'sin texto'}"`;
      if (href) context += ` (lleva a: ${href})`;
    } else if (tagName === 'img') {
      context = `Imagen "${alt || src || 'sin descripción'}"`;
    } else if (tagName === 'form') {
      context = `Formulario "${id || 'sin nombre'}"`;
    } else if (tagName === 'table') {
      context = `Tabla con ${element.rows?.length || 0} filas`;
    } else if (tagName === 'div') {
      if (classes.includes('card')) {
        context = `Tarjeta: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;
      } else if (classes.includes('modal')) {
        context = `Ventana modal`;
      } else if (classes.includes('alert')) {
        context = `Alerta: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;
      } else {
        context = `Sección: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;
      }
    } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      context = `Título ${tagName.toUpperCase()}: "${text}"`;
    } else if (tagName === 'p') {
      context = `Párrafo: "${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`;
    } else if (tagName === 'span') {
      context = `Texto: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;
    } else if (tagName === 'label') {
      context = `Etiqueta: "${text}"`;
    } else if (['ul', 'ol'].includes(tagName)) {
      context = `Lista con ${element.children.length} elementos`;
    } else if (tagName === 'li') {
      context = `Elemento de lista: "${text}"`;
    } else {
      context = `Elemento ${tagName}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;
    }
    
    // Agregar información de ubicación si es relevante
    const section = element.closest('section, main, nav, header, footer, aside');
    if (section) {
      const sectionId = section.id || section.className;
      if (sectionId) {
        context += ` (en sección: ${sectionId})`;
      }
    }
    
    return context;
  }

  generateContextualResponse(context, element) {
    const tagName = element.tagName.toLowerCase();
    const text = element.textContent?.trim() || '';
    const currentUrl = window.location.pathname;
    
    // Respuestas contextuales basadas en el tipo de elemento y la página actual
    if (currentUrl.includes('formulario_210')) {
      if (tagName === 'input' || tagName === 'select' || tagName === 'textarea') {
        if (element.id.includes('cedula') || element.name.includes('cedula')) {
          return `Este campo es para tu número de cédula de ciudadanía. Debe ser un número válido registrado ante la Registraduría Nacional. Es obligatorio para identificarte en el sistema.`;
        } else if (element.id.includes('nombre') || element.name.includes('nombre')) {
          return `Aquí debes ingresar tu nombre completo tal como aparece en tu documento de identidad. Asegúrate de que coincida exactamente.`;
        } else if (element.id.includes('ingresos')) {
          return `En este campo registra tus ingresos totales del período gravable. Incluye salarios, honorarios, rentas de capital, y cualquier otro ingreso gravable.`;
        } else if (element.id.includes('deducciones')) {
          return `Las deducciones son gastos que puedes restar de tus ingresos para reducir el impuesto a pagar. Incluye pagos por salud, educación, intereses de vivienda, etc.`;
        } else if (element.id.includes('retencion')) {
          return `Aquí registras las retenciones que te hicieron durante el año. Estas aparecen en tus certificados de ingresos y retenciones.`;
        } else {
          return `Este campo "${context}" es parte del formulario 210. Te ayudo a completarlo correctamente. ¿Qué información específica necesitas sobre este campo?`;
        }
      } else if (tagName === 'button') {
        if (text.toLowerCase().includes('calcular')) {
          return `Este botón calcula automáticamente los valores basándose en la información que has ingresado. Te recomiendo usarlo después de completar los campos principales.`;
        } else if (text.toLowerCase().includes('guardar')) {
          return `Este botón guarda tu declaración como borrador. Puedes continuar editándola más tarde. Te recomiendo guardar frecuentemente tu progreso.`;
        } else if (text.toLowerCase().includes('presentar') || text.toLowerCase().includes('enviar')) {
          return `⚠️ Este botón presenta definitivamente tu declaración ante la DIAN. Una vez presentada no podrás modificarla. Asegúrate de revisar toda la información antes de continuar.`;
        } else {
          return `Este botón "${text}" te permite ${text.toLowerCase()}. ¿Necesitas ayuda específica con esta acción?`;
        }
      }
    } else if (currentUrl.includes('menu_principal')) {
      if (tagName === 'button' || tagName === 'a') {
        if (text.toLowerCase().includes('nueva declaración')) {
          return `Este botón te permite crear una nueva declaración de renta. Te guiará paso a paso por el proceso completo.`;
        } else if (text.toLowerCase().includes('declaraciones anteriores')) {
          return `Aquí puedes ver el historial de tus declaraciones anteriores, incluyendo borradores y declaraciones ya presentadas.`;
        } else if (text.toLowerCase().includes('ayuda')) {
          return `Esta sección contiene guías detalladas y preguntas frecuentes sobre el proceso de declaración de renta.`;
        } else if (text.toLowerCase().includes('pago')) {
          return `Aquí puedes realizar el pago de tu declaración usando PSE o tarjeta de crédito de forma segura.`;
        }
      }
    }
    
    // Respuestas genéricas por tipo de elemento
    if (tagName === 'input') {
      if (element.type === 'number') {
        return `Este campo numérico "${context}" debe contener solo números. Verifica que el formato sea correcto.`;
      } else if (element.required) {
        return `Este campo "${context}" es obligatorio. Debes completarlo para continuar.`;
      } else {
        return `Este campo "${context}" es opcional. Puedes completarlo si la información está disponible.`;
      }
    } else if (tagName === 'button') {
      return `Este botón "${text}" ejecuta la acción: ${text.toLowerCase()}. ¿Necesitas ayuda con esta función específica?`;
    } else if (tagName === 'a') {
      return `Este enlace "${text}" te llevará a otra sección. ¿Necesitas información sobre el destino?`;
    } else if (tagName === 'select') {
      return `Esta lista desplegable "${context}" te permite seleccionar una opción. Revisa todas las opciones disponibles antes de elegir.`;
    } else {
      return `Has seleccionado: ${context}. Este elemento forma parte de la interfaz de la aplicación. ¿En qué puedo ayudarte específicamente con este elemento?`;
    }
  }

  highlightElement(element) {
    // Agregar clase de resaltado temporal
    element.style.outline = '3px solid #007bff';
    element.style.outlineOffset = '2px';
    element.style.transition = 'outline 0.3s ease';
    
    // Remover resaltado después de 2 segundos
    setTimeout(() => {
      element.style.outline = '';
      element.style.outlineOffset = '';
    }, 2000);
  }

  showContextClickIndicator() {
    // Crear o mostrar indicador visual
    let indicator = document.getElementById('context-click-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'context-click-indicator';
      indicator.innerHTML = `
        <div class="context-indicator-content">
          <i class="bi bi-cursor-fill"></i>
          <span>Modo interactivo activo</span>
          <button onclick="virtualAssistant.toggleContextClick();" class="btn btn-sm btn-outline-light">
            <i class="bi bi-x"></i>
          </button>
        </div>
      `;
      indicator.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: white;
        padding: 8px 16px;
        border-radius: 25px;
        box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
        z-index: 1001;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: slideDownFade 0.3s ease-out;
      `;
      
      // Agregar estilos de animación
      if (!document.getElementById('context-indicator-styles')) {
        const styles = document.createElement('style');
        styles.id = 'context-indicator-styles';
        styles.textContent = `
          @keyframes slideDownFade {
            from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
          .context-indicator-content {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .context-indicator-content button {
            border: 1px solid rgba(255,255,255,0.3);
            background: rgba(255,255,255,0.1);
            color: white;
            padding: 2px 6px;
            border-radius: 50%;
          }
          .context-indicator-content button:hover {
            background: rgba(255,255,255,0.2);
          }
        `;
        document.head.appendChild(styles);
      }
      
      document.body.appendChild(indicator);
    } else {
      indicator.style.display = 'flex';
    }
  }

  hideContextClickIndicator() {
    const indicator = document.getElementById('context-click-indicator');
    if (indicator) {
      indicator.style.display = 'none';
      console.log('Context indicator hidden');
    } else {
      console.log('Context indicator not found');
    }
  }

  // Debug function
  debugContextClick() {
    console.log('=== Context Click Debug Info ===');
    console.log('contextClickEnabled:', this.contextClickEnabled);
    console.log('currentMode:', this.currentMode);
    console.log('contextClickHandler:', !!this.contextClickHandler);
    
    const button = document.getElementById('toggle-context-click');
    const icon = document.getElementById('context-click-icon');
    const text = document.getElementById('context-click-text');
    const indicator = document.getElementById('context-click-indicator');
    
    console.log('Button elements found:');
    console.log('  toggle-context-click:', !!button);
    console.log('  context-click-icon:', !!icon);
    console.log('  context-click-text:', !!text);
    console.log('  context-click-indicator:', !!indicator);
    
    if (button) {
      console.log('  button className:', button.className);
    }
    if (text) {
      console.log('  text content:', text.textContent);
    }
    if (indicator) {
      console.log('  indicator display:', indicator.style.display);
    }
    console.log('==============================');
  }

  // Emergency close function
  forceCloseAssistant() {
    console.log('Force closing assistant...');
    
    // Deshabilitar modo interactivo
    this.disableContextClick(false);
    
    // Cerrar modal
    if (this.assistantModal) {
      this.assistantModal.style.display = 'none';
    }
    
    // Limpiar estado
    this.isOpen = false;
    this.currentMode = 'options';
    
    // Detener recursos activos
    this.stopVoiceRecording();
    this.stopScreenShare();
    
    // Ocultar indicadores
    this.hideContextClickIndicator();
    
    console.log('Assistant force-closed successfully');
  }

  toggleContextClick() {
    console.log('toggleContextClick called, current state:', this.contextClickEnabled);
    if (this.contextClickEnabled) {
      this.disableContextClick(true); // Mostrar mensaje
    } else {
      this.enableContextClick(true); // Mostrar mensaje
    }
    this.updateContextClickButton();
  }

  updateContextClickButton() {
    console.log('updateContextClickButton called, state:', this.contextClickEnabled);
    const button = document.getElementById('toggle-context-click');
    const icon = document.getElementById('context-click-icon');
    const text = document.getElementById('context-click-text');
    
    console.log('Elements found:', { button: !!button, icon: !!icon, text: !!text });
    
    if (button && icon && text) {
      if (this.contextClickEnabled) {
        button.className = 'btn btn-success btn-sm me-2';
        icon.className = 'bi bi-cursor-fill';
        text.textContent = 'Modo Interactivo: ON';
      } else {
        button.className = 'btn btn-outline-secondary btn-sm me-2';
        icon.className = 'bi bi-cursor';
        text.textContent = 'Modo Interactivo: OFF';
      }
      console.log('Button updated successfully');
    } else {
      console.warn('Could not find toggle button elements');
    }
  }

  // Chat functionality
  sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;

    // Agregar mensaje del usuario
    this.addChatMessage(message, 'user');
    input.value = '';

    // Enviar mensaje al asistente via WebSocket
    if (this.isConnected) {
      this.websocket.send(JSON.stringify({
        type: 'message',
        message: message
      }));
    } else {
      // Fallback si no hay conexión
      this.addChatMessage('❌ Sin conexión con el asistente. Reintentando...', 'bot');
      this.connectWebSocket();
    }
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

  // WebSocket functionality
  connectWebSocket() {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      return; // Ya conectado
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/assistant/`;
    
    this.websocket = new WebSocket(wsUrl);
    
    this.websocket.onopen = (event) => {
      console.log('WebSocket conectado');
      this.isConnected = true;
    };
    
    this.websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleWebSocketMessage(data);
    };
    
    this.websocket.onclose = (event) => {
      console.log('WebSocket desconectado');
      this.isConnected = false;
    };
    
    this.websocket.onerror = (error) => {
      console.error('Error WebSocket:', error);
      this.isConnected = false;
    };
  }

  disconnectWebSocket() {
    if (this.websocket) {
      // Reiniciar conversación al cerrar
      if (this.isConnected) {
        this.websocket.send(JSON.stringify({
          type: 'reset'
        }));
      }
      this.websocket.close();
      this.websocket = null;
      this.isConnected = false;
    }
  }

  handleWebSocketMessage(data) {
    switch (data.type) {
      case 'connection':
        console.log('Conectado:', data.message);
        break;
      case 'response':
        if (this.currentMode === 'chat') {
          this.addChatMessage(data.message, 'bot');
        } else if (this.currentMode === 'voice') {
          this.addVoiceMessage(data.message, 'bot');
        }
        break;
      case 'error':
        const errorMsg = `❌ Error: ${data.message}`;
        if (this.currentMode === 'chat') {
          this.addChatMessage(errorMsg, 'bot');
        } else if (this.currentMode === 'voice') {
          this.addVoiceMessage(errorMsg, 'bot');
        }
        break;
      case 'reset':
        console.log('Conversación reiniciada');
        break;
      default:
        console.log('Mensaje desconocido:', data);
    }
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
        
        // Enviar mensaje de voz transcrito al asistente via WebSocket
        if (this.isConnected) {
          this.websocket.send(JSON.stringify({
            type: 'message',
            message: transcript
          }));
        } else {
          this.addVoiceMessage('❌ Sin conexión con el asistente', 'bot');
        }
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
    // Deshabilitar modo interactivo al detener pantalla compartida
    this.disableContextClick(false); // Sin mensaje
  }

  // Screen Chat functionality
  initScreenChat() {
    const messagesContainer = document.getElementById('screen-chat-messages');
    messagesContainer.innerHTML = '';
    
    // Mensaje inicial del asistente
    this.addScreenChatMessage('Asistente', '¡Ahora puedo ver tu pantalla! Pregúntame sobre lo que estás viendo o necesites ayuda con tu declaración.', false);
    
    // Habilitar modo interactivo para pantalla compartida
    setTimeout(() => {
      this.enableContextClick(false); // No mostrar mensaje automático
      this.addScreenChatMessage('Asistente', '🎯 Modo interactivo habilitado: También puedes hacer clic en cualquier elemento de la página para que te explique su función.', false);
    }, 1000);
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

// Variable global para acceso desde otras funciones
let virtualAssistant = null;

// Inicializar el asistente cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('virtual-assistant')) {
    virtualAssistant = new VirtualAssistant();
  }
});

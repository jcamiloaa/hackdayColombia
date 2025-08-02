# dIAndeclara - Asistente Virtual para Declaración de Renta

Un asistente cognitivo multimodal para facilitar el proceso de declaración de renta en Colombia, ofreciendo orientación en tiempo real mediante interfaces de chat, voz y contexto interactivo.

[![Built with Cookiecutter Django](https://img.shields.io/badge/built%20with-Cookiecutter%20Django-ff69b4.svg?logo=cookiecutter)](https://github.com/cookiecutter/cookiecutter-django/)
[![Ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)

## 🚀 Características Principales

- **Asistente Virtual Multimodal**: Interfaz de chat, reconocimiento de voz y modo interactivo
- **Orientación Contextual**: Ayuda específica según la sección del formulario donde se encuentra el usuario
- **Formulario Inteligente**: Validaciones en tiempo real y cálculos automáticos
- **Síntesis de Voz**: Lectura automática de respuestas para mejorar la accesibilidad
- **Diseño Responsivo**: Adaptable a dispositivos móviles y de escritorio

## 📋 Requisitos del Sistema

- Python 3.10+
- Docker y Docker Compose
- Node.js 18+ (para desarrollo)
- Conexión a Internet (para APIs externas)

## ⚙️ Guía de Despliegue

### Opción 1: Despliegue Local con Docker (Recomendado)

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/jcamiloaa/hackdayColombia.git
   cd hackdayColombia
   ```

2. **Configurar variables de entorno:**
   - Copia el archivo `.env.example` a `.env`
   - Edita `.env` con tus claves API y configuraciones

3. **Construir y ejecutar con Docker Compose:**
   ```bash
   docker-compose -f docker-compose.local.yml up --build
   ```

4. **Acceder a la aplicación:**
   - Abre tu navegador en [http://localhost:8000](http://localhost:8000)
   - Usuario predeterminado: `admin@example.com`
   - Contraseña predeterminada: `admin123`

### Opción 2: Despliegue Local sin Docker

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/jcamiloaa/hackdayColombia.git
   cd hackdayColombia
   ```

2. **Crear y activar entorno virtual:**
   ```bash
   python -m venv venv
   # En Windows:
   venv\Scripts\activate
   # En Linux/Mac:
   source venv/bin/activate
   ```

3. **Instalar dependencias:**
   ```bash
   pip install -r requirements/local.txt
   ```

4. **Configurar variables de entorno:**
   - Copia el archivo `.env.example` a `.env`
   - Edita `.env` con tus claves API y configuraciones

5. **Aplicar migraciones y crear superusuario:**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Ejecutar servidor de desarrollo:**
   ```bash
   python manage.py runserver
   ```

7. **Acceder a la aplicación:**
   - Abre tu navegador en [http://localhost:8000](http://localhost:8000)

### Opción 3: Despliegue en Producción

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/jcamiloaa/hackdayColombia.git
   cd hackdayColombia
   ```

2. **Configurar variables de entorno para producción:**
   - Copia el archivo `.env.example` a `.env.production`
   - Edita `.env.production` con tus claves API y configuraciones de producción
   - Asegúrate de configurar `DJANGO_SETTINGS_MODULE=config.settings.production`

3. **Construir y ejecutar con Docker Compose para producción:**
   ```bash
   docker-compose -f docker-compose.production.yml up -d --build
   ```

4. **Configurar Nginx y Certificados SSL (opcional):**
   - El archivo `compose/production/nginx/default.conf` contiene la configuración base
   - Personaliza según tu dominio y necesidades

## 🧪 Pruebas

Para ejecutar las pruebas automatizadas:

```bash
# Con Docker:
docker-compose -f docker-compose.local.yml run --rm django python manage.py test

# Sin Docker:
python manage.py test
```

## 📚 Estructura del Código Fuente

La aplicación está organizada de la siguiente manera:

```
dIAndeclara/
├── config/                   # Configuración de Django
├── compose/                  # Archivos Docker para desarrollo y producción
├── diandeclara/              # Aplicación principal
│   ├── contrib/              # Código de terceros
│   ├── renta/                # Módulo de declaración de renta
│   ├── static/               # Archivos estáticos (CSS, JS)
│   │   ├── css/
│   │   ├── fonts/
│   │   ├── images/
│   │   └── js/project.js     # Implementación del asistente virtual
│   ├── templates/            # Plantillas HTML
│   └── users/                # Gestión de usuarios
├── docs/                     # Documentación
│   ├── ASISTENTE_VIRTUAL.md  # Detalles de implementación del asistente
│   ├── MODO_INTERACTIVO.md   # Documentación del modo interactivo
│   └── Arquitectura_y_Flujos.md # Arquitectura general del sistema
└── requirements/             # Dependencias por entorno
```

## 🔌 Integración con OpenAI Assistants API

El asistente virtual utiliza la API de OpenAI Assistants para procesar consultas:

1. **Configuración inicial:**
   - Obtén una clave API de OpenAI
   - Configura la variable `OPENAI_API_KEY` en el archivo `.env`

2. **Personalización del asistente:**
   - Puedes modificar el prompt base en `create_assistant.py`
   - Ajusta el comportamiento del asistente según tus necesidades

3. **Limitaciones:**
   - El sistema actual está optimizado para un solo usuario concurrente
   - Sin persistencia de conversaciones (solo en memoria)

## 📝 Documentación Adicional

- **Arquitectura y Flujos**: [docs/Arquitectura_y_Flujos.md](docs/Arquitectura_y_Flujos.md)
- **Asistente Virtual**: [docs/ASISTENTE_VIRTUAL.md](docs/ASISTENTE_VIRTUAL.md)
- **Modo Interactivo**: [docs/MODO_INTERACTIVO.md](docs/MODO_INTERACTIVO.md)

## 🛠️ Comandos Útiles

```bash
# Ver logs de contenedores Docker
docker-compose -f docker-compose.local.yml logs -f

# Ejecutar shell de Django
docker-compose -f docker-compose.local.yml run --rm django python manage.py shell

# Crear migraciones
docker-compose -f docker-compose.local.yml run --rm django python manage.py makemigrations

# Verificar tipos con mypy
docker-compose -f docker-compose.local.yml run --rm django mypy diandeclara
```

## 📄 Licencia

Este proyecto fue desarrollado para el reto HackDay2025 IAMinds y está disponible bajo la licencia MIT.

## 👥 Equipo

Desarrollado por el equipo dIAndeclara para el HackDay2025 IAMinds - Agosto 2025.

---

*Repositorio para el reto HackDay2025 IAMinds - Agosto 2025*

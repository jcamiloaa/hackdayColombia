# Reto de Hackathon de IA

Este documento describe el reto de desarrollar un asistente cognitivo multimodal. El objetivo
principal es la creación de una aplicación web que sirva como un asistente inteligente, capaz de
guiar a Los usuarios a través de procesos de navegación y compra complejos de manera interactiva
y contextual.

## Descripción del Reto

El desafío consiste en construir un asistente web que monitorea la pantalla del usuario para ofrecer
orientación experta en tiempo real. La solución debe mejorar la experiencia del usuario en sitios
web explicando, comparar productos o entendiendo información técnica.

Los objetivos fundamentales del proyecto son:

* Asesoría en tiempo real: Crear un asistente que ofrezca recomendaciones de productos y
responda preguntas sobre coberturas, condiciones y costos mientras el usuario navega.

e Simulación de compra: Emular el flujo completo de adquisición de un producto o servicio,
desde la selección inicial hasta el cierre, proporcionando guías paso a paso.

* Experiencia interactiva: Implementar una interfaz que utilice texto, voz y elementos visuales
(como tooltips o resaltados) para resolver dudas y acompañar al usuario.

Aunque el escenario de ejemplo se centra en seguros, la solución puede ser adaptable a otros
dominios como:

* Educación: Asistencia en el registro de cursos u orientación vocacional.

* Salud: Guía para agendar citas o interpretar resultados clínicos.

* Bancayfinanzas: Ayuda en la comparación y adquisición de productos financieros.
* Gobierno digital: Navegación asistida en trámites y servicios públicos.

* Empleabilidad: asistente para completar un perfil, postularse o armar CVs con
recomendaciones

* E-commerce: Recomendador de productos y guía de compra inteligente.

* Creatividad ibre: Se alienta a las soluciones fuera de lo común: gamificación, micrositios
temáticos, integraciones con chatbots y APIs de voz.

Ejemplo de Interacción Esperada (Caso de Uso en Seguros)
A continuación, se describe la interacción ideal que el asistente debe facilitar:

1. Activación por Voz: El usuario inicia la interacción y autoriza verbalmente al asistente para
que observe su pantalla.

2. Análisis Multimodal: El sistema interpreta el contenido de la pantalla y la voz del usuario
para identificar el producto de interés (ej. seguro de auto) y la etapa del proceso en la que se
encuentra.

3. Asistencia Contextual: A medida que el usuario navega, el asistente puede:
". Sugerir coberturas personalizadas. Ejemplo: "
Veo que estás revisando seguros de hogar. ¿Quieres que te muestre coberturas contra incendios?".
" Responder preguntas técnicas por voz, como "

¿Qué es el deducible?".

". Comparar productos. Ejemplo: "

La póliza B tiene mejor cobertura contra accidentes por solo $20000 más al mes. ¿Quieres que te
lea los beneficios?".

= Resaltar elementos visuales en la interfaz a través de comandos como "
Resalta las pólizas con asistencia en carretera".

4. Guía en Formularios: El asistente guía al usuario para completar formularios paso a paso
mediante comandos de voz ("Dime tu nombre completo"), validando Los campos en tiempo
real.

## Funcionalidades Principales Requeridas
La solución final debe incluir las siguientes funcionalidades:

* Detección de Ul y flujo: Reconocimiento automático de las secciones de producto,
formularios y etapas del proceso de compra.

* Asesoría contextual: El sistema debe proveer sugerencias inteligentes en texto y voz sin ser
intrusivo.

* Simulación de cotización: Capacidad de calcular precios de forma dinámica basándose en
las variables proporcionadas por el cliente.

* Interacción gráfica: Modificación del DOM para resaltar elementos, mostrar tooltips o pop-
ups a través de WebSockets o inyección directa.

## Tecnologías Recomendadas
Se sugiere el siguiente stack tecnológico como punto de partida:
* Frontend: React o Next. js (su uso no es obligatorio).
* Backend: Node. js, Python (Flask/FastAPI) o una arquitectura serverless.
* Comunicación: WebSockets o Server-Sent Events para asegurar una baja latencia.

* ¡AMultimodal: Se recomienda el uso de la API de Gemini multimodal (para texto, imagen y
voz), OpenAl GPT (opcional)

* Lenguajes: Python, JavasScript

e GitHub - heiko-hotz/gemini-multimodal-Live-dev-quide: A developer quide for Gemini's

Multimodal Live API

## Entregables

Los equipos deberán presentar los siguientes elementos para su evaluación el sábado 2 de agosto a
las 6:00 p. m. como plazo máximo al mail: hackdayregion Qindracompany. com

* Aplicación web pública desplegada en un servicio de hosting como GitHub Pages o Vercel.
* Video demo (5-7 minutos) que muestre el uso completo de la aplicación.

* Repositorio GitHub público con el código fuente y guías de despliegue.

* Documentación breve explicando la arquitectura y Los flujos clave del sistema.

* Video de máximo 5 minutos.
Tomen una pausa de 4 segundos antes de iniciar a hablar y después de finalizar; para la
edición.
Eviten cualquier clase de ruido de fondo.

Al tomar con celular deben estar en sentido vertical y las personas en plano medio.

Elijan un lugar donde no haya contra luz o que la ubicación sea detrás de una ventana.

En las tomas intenten estar solos para evitar intervenciones no deseadas de terceros
(familia o mascotas).

Si quieren apoyarse en uso de micrófono o del aro de luz será ideal.

No usen música de fondo.

El video debe explicar la solución, incluyendo la historia de cómo llegaron a esta, los
objetivos y conclusiones (puede tener imágenes, entrevistas, tomas de pantalla, voz en off,
entre otras).

## Criterios de Evaluación

Las propuestas serán evaluadas según los siguientes criterios:

Asesoría Inteligente: Precisión y utilidad de las recomendaciones ofrecidas al usuario.

Fluidez de Interacción: Capacidad del sistema para responder y guiar sin latencia
perceptible.

Simulación de Compra: Calidad y claridad del flujo de compra, incluyendo la validación de
datos y el cálculo de precios.

Creatividad y UX/UI: Innovación en la presentación de la interfaz y la experiencia de usuario.

Despliegue Público: Funcionamiento correcto de la aplicación en el entorno público y
facilidad de acceso.

## Propuestas extra (Opcionales)


Dashboard analítico
Consola simple con analítica: puntos de abandono, preguntas frecuentes, métricas de
navegación.

Gamificación ligera
Barra de progreso, mensajes motivacionales, recompensas visuales simples (checkmarks,
fuegos artificiales, etc. ).

Asistente humano con IA generativa
Usar un modelo GenAl para explicar conceptos técnicos con analogías sencillas y generar
un resumen personalizado al final de la compra.

* Cadaequipo puede estar conformado por 3 integrantes como mínimo y 5 integrantes
como máximo.

e El líder y los miembros de equipos solo podrán formar parte de un único equipo.

* Losintegrantes del equipo son responsables por la veracidad de toda la información
proporcionada. Si la información proporcionada total o parcialmente resulta ser
incompleta y/o falsa, los organizadores se reservan el derecho de excluir la
participación del equipo en el concurso.

* Nopodrán modificarse Los miembros del equipo una vez iniciada el Hackathon.

* Todoel equipo debe participar durante el desarrollo del Hackathon.

* Respetaralos participantes, mentores, miembros del jurado y personas en general que
formen parte del Hackathon.

* El líder de cada equipo podrá comunicarse vía whatsapp con el mentor para las
inquietudes diarias que se presenten. Atenderemos el canal de comunicación de whatsapp de lunes a viernes en horario de 8:00 a. m. a 6:00 p. m. y teniendo en cuenta
normas de protección de datos aceptadas al momento de la inscripción.

## Consultas y resolución de dudas

* Escribir a la siguiente dirección electrónica: hackdayregion Gindracompany. com Colocar
como asunto: HACKDAY2025 IAMinds - Nombre del grupo

* Canal de comunicación de un designado por mentor, vía whatsapp (Teniendo en cuenta
normas de protección de datos aceptadas al momento de la inscripción)

Comunicación y Premiación
Se realizará la semana del 4 de agosto previa convocatoria de los participantes.



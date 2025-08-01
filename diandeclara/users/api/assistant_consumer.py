import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from openai import OpenAI

# Mantener un thread por usuario en memoria (simple para proyecto ilustrativo)
user_threads = {}

class AssistantConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()
            return
            
        self.user_id = str(self.user.id)
        await self.accept()
        
        # Reiniciar thread al conectar
        user_threads[self.user_id] = None
        
        await self.send(text_data=json.dumps({
            'type': 'connection',
            'message': 'Conectado al asistente virtual DIAN'
        }))

    async def disconnect(self, close_code):
        # Reiniciar thread al desconectar
        if hasattr(self, 'user_id'):
            user_threads[self.user_id] = None

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            return
            
        try:
            data = json.loads(text_data)
            message_type = data.get("type", "message")
            
            if message_type == "reset":
                # Reiniciar conversación
                user_threads[self.user_id] = None
                await self.send(text_data=json.dumps({
                    'type': 'reset',
                    'message': 'Conversación reiniciada'
                }))
                return
                
            message = data.get("message", "")
            if not message:
                await self.send(text_data=json.dumps({
                    "type": "error",
                    "message": "No se recibió mensaje"
                }))
                return

            # Procesar mensaje con OpenAI Assistant
            response = await self.process_with_assistant(message)
            
            await self.send(text_data=json.dumps({
                'type': 'response',
                'message': response
            }))
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": "Formato de mensaje inválido"
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                "type": "error", 
                "message": f"Error del servidor: {str(e)}"
            }))

    async def process_with_assistant(self, message):
        """Procesar mensaje con OpenAI Assistant API"""
        try:
            # Configuración OpenAI
            api_key = settings.API_OPENAI_KEY
            assistant_id = settings.ASSITANT_ID
            
            if not api_key or not assistant_id:
                return "Error: Configuración de OpenAI no encontrada"
            
            client = OpenAI(api_key=api_key)
            
            # Obtener o crear thread para el usuario
            thread = user_threads.get(self.user_id)
            if not thread:
                thread = await asyncio.to_thread(client.beta.threads.create)
                user_threads[self.user_id] = thread
            
            # Añadir mensaje del usuario al thread
            await asyncio.to_thread(
                client.beta.threads.messages.create,
                thread_id=thread.id,
                role="user",
                content=message
            )
            
            # Ejecutar el assistant
            run = await asyncio.to_thread(
                client.beta.threads.runs.create_and_poll,
                thread_id=thread.id,
                assistant_id=assistant_id
            )
            
            # Obtener respuesta
            if run.status == "completed":
                messages = await asyncio.to_thread(
                    client.beta.threads.messages.list,
                    thread_id=thread.id
                )
                
                # Buscar la última respuesta del asistente
                for msg in messages.data:
                    if msg.role == "assistant":
                        content = msg.content[0].text.value if msg.content else ""
                        return content
                
                return "No se recibió respuesta del asistente"
            else:
                return f"Error en el procesamiento: {run.status}"
                
        except Exception as e:
            return f"Error procesando con OpenAI: {str(e)}"

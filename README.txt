NEXUS AI 4.0 — CHAT + CODE + IMAGE + LINK ACCESS
================================================

NOVEDADES
- Selector de modos: Chat (5), Code Pro (20), Imágenes (60), Buscar web (10).
- Saldo inicial de 900 tokens por perfil/nombre en el backend.
- Recarga automática de 100 tokens cada 24 horas, hasta 900.
- Perfil local sencillo para entrar.
- Historial guardado en el navegador.
- Dictado por voz con SpeechRecognition si el navegador lo soporta.
- Generación real de imágenes mediante OpenAI Images API cuando se configura API y el modelo/permiso están disponibles.
- Análisis de archivos de texto y flujo inicial de imagen.
- NEXUS LINK ACCESS: analiza páginas públicas HTTP/HTTPS, extrae texto y genera un resumen con IA si la API está configurada.
- Botón para abrir el enlace original en el navegador o app compatible del dispositivo.
- Validación de dominios/IP, bloqueo de destinos privados, límite de tamaño y redirecciones controladas.
- API de chat y programación mediante Responses API.

COSTOS PROPUESTOS (EDITABLES EN server.js)
chat 5 | code 20 | image 60 | web 10 | file 15
Saldo inicial 900 | recarga 100 cada 24 h | máximo 900.
El usuario debe esperar a la siguiente recarga si no tiene tokens suficientes.
Puedes cambiar REFILL_MS a 48*60*60*1000 para recarga cada 2 días.
IMPORTANTE: Link Access no es un navegador universal. No puede iniciar sesión por ti, saltarse paywalls ni leer contenido privado. Sitios con protecciones anti-bot, contenido dinámico dentro de apps, videos privados o formatos no admitidos pueden fallar. El modo Buscar web del chat todavía no consulta un buscador externo.

INSTALACIÓN / PUBLICACIÓN DESDE ANDROID
Necesitas un hosting que ejecute Node.js (no basta hosting estático).
1. Descarga y extrae este ZIP.
2. Sube los archivos a un repositorio GitHub (idealmente privado).
3. Crea un servicio web Node en tu hosting desde ese repositorio.
4. Build command: npm install && npm run build
5. Start command: npm start
6. Variables de entorno: OPENAI_API_KEY, OPENAI_MODEL, OPENAI_IMAGE_MODEL.
7. Abre la URL HTTPS del servicio.

API KEY
La clave va únicamente en las variables secretas del servidor. Nunca la pongas en app.js ni la publiques.
La API puede generar costos por uso; revisa tarifas y configura límites presupuestarios. Si eres menor, pide a un adulto responsable que gestione la cuenta y los pagos.

LIMITACIONES Y SEGURIDAD — PROTOTIPO
- El perfil se identifica por nombre, no es autenticación real.
- El saldo está guardado en un archivo JSON del servidor y puede perderse en hostings con disco efímero o varias instancias.
- No uses este sistema para vender suscripciones ni confiar en que los tokens no se pueden manipular: antes de producción hace falta autenticación real, base de datos persistente, transacciones atómicas, rate limits, validación server-side y protección contra abuso.
- Premium y Code Pro siguen siendo tarjetas visuales; todavía no hay checkout ni permisos reales.
- El historial se guarda localmente en el navegador, no se sincroniza entre dispositivos.
- Análisis de PDF/documentos, voz conversacional completa, memoria de largo plazo y búsqueda web real requieren integraciones adicionales.
- La app puede instalarse como PWA. APK requiere Android Studio/compilación en PC.

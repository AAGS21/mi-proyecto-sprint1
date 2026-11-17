# Mi Proyecto SaaS — Gestión de Usuarios y Tickets IT

Aplicación SaaS con arquitectura estricta por capas (Sprints 1 y 2).

**Aplicación desplegada en:** https://mi-proyecto-sprint1.onrender.com

---

## Tecnologías y justificación

- **Node.js + Express**: backend ligero, mismo lenguaje cliente/servidor y API REST sencilla.
- **SQLite (sqlite3)**: base de datos relacional real embebida; persiste en disco sin servidor externo.
- **bcrypt**: función de hash segura e irreversible para contraseñas (nunca en texto plano).
- **express-session + connect-sqlite3**: sesiones con cookie `httpOnly` firmada y persistidas en SQLite.
- **Passport (local + Google OAuth 2.0)**: autenticación local y delegada con proveedor externo.
- **Nodemailer**: envío transaccional del enlace de confirmación de cuenta por correo.
- **Vitest + supertest**: ejecución automatizada de pruebas unitarias sobre la capa de lógica.
- **Render (free tier) + GitHub Actions**: integración continua (CI) y despliegue continuo (CD) desde GitHub.

---

## Arquitectura por capas

```text
src/
├── api/                  → Capa API (rutas, middlewares y traducción HTTP ↔ lógica)
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── ticketRoutes.js
│   └── middleware.js
├── logic/                → Capa de lógica de negocio (reglas y permisos, sin HTTP ni SQL)
│   ├── userLogic.js
│   ├── ticketLogic.js
│   ├── passport.js
│   └── emailService.js
├── data/                 → Capa de acceso a datos (consultas SQLite, sin reglas de negocio)
│   ├── userRepo.js
│   └── ticketRepo.js
└── server.js             → Servidor Express y composición de capas

public/                   → Capa de presentación (frontend servido desde el mismo origen)
├── index.html            → Interfaz gráfica (GUI por vistas)
├── ui.js                 → Manipulación del DOM y eventos
└── app.js                → Cliente HTTP (fetch centralizado hacia la API)

tests/                    → Pruebas unitarias automatizadas de la capa de lógica
├── userLogic.test.js
└── ticketLogic.test.js

Frontera entre capas:

src/api/ no contiene reglas de negocio: valida sesión (401) y traduce entre HTTP y src/logic/.

src/logic/ no conoce req/res ni SQL: aplica validaciones de dominio, hashes y permisos (403).

src/data/ solo ejecuta consultas parametrizadas contra SQLite.

public/ui.js nunca se comunica directamente con la base de datos ni ejecuta lógica de negocio; usa public/app.js para hablar exclusivamente con la API.

Ejecución en local y pruebas
Requisitos
Node.js 20 o superior

Pasos para arrancar el proyecto
Bash
# 1. Clonar el repositorio
git clone [https://github.com/AAGS21/mi-proyecto-sprint1.git](https://github.com/AAGS21/mi-proyecto-sprint1.git)
cd mi-proyecto-sprint1

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores locales

# 4. Arrancar el servidor en modo desarrollo
npm run dev
Cómo ejecutar las pruebas automatizadas
Todas las pruebas unitarias de la capa de lógica (usuarios y tickets, incluyendo casos de error) se ejecutan sobre SQLite en memoria con un único comando:

Bash
npm test
Variables de entorno necesarias
Definidas en .env.example (sin valores secretos en el repositorio):

PORT: Puerto del servidor Express (por defecto 3000).

NODE_ENV: Entorno de ejecución (development / production).

APP_URL: URL base de la aplicación para enlaces de confirmación y callback OAuth.

DB_PATH: Ruta del archivo SQLite (/tmp/data.sqlite en producción o :memory: en tests).

SESSION_SECRET: Clave secreta para firmar la cookie de sesión.

GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET: Credenciales OAuth 2.0 de Google Cloud.

SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM: Configuración SMTP para Nodemailer.

ADMIN_EMAIL y ADMIN_PASSWORD: Credenciales para crear y promover al administrador inicial al arrancar.

Notas sobre el despliegue y acceso de administrador
Desplegado automáticamente en Render (free tier) al integrar cambios en main.

El servicio gratuito se suspende tras ~15 min de inactividad; la primera petición puede tardar 30-50 s.

El administrador inicial se crea automáticamente al iniciar el servidor a partir de las variables de entorno ADMIN_EMAIL y ADMIN_PASSWORD. Las credenciales de prueba se adjuntan en la entrega privada, nunca en el repositorio.
---

**2. Cierre con GitHub Flow (1 minuto)**

Guarda ambos archivos y ejecuta estos comandos para que todo quede integrado limpiamente en `main` mediante Pull Request:

```bash
npm test
git add .env.example README.md src/ public/ tests/
git commit -m "feat(sprint2): añade módulo de tickets IT, mejora UI y actualiza documentación"
git push -u origin feature/sprint2-tickets
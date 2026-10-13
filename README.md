# Mi Proyecto Sprint 1

Aplicación SaaS base con arquitectura por capas.

**Aplicación desplegada en:** https://mi-proyecto-sprint1.onrender.com

---

## Tecnologías y justificación

- **Node.js + Express**: backend ligero, mismo lenguaje cliente/servidor y API REST sencilla.
- **SQLite (sqlite3)**: base de datos real embebida; persiste sin servidor externo.
- **bcrypt**: hash seguro de contraseñas (nunca en texto plano).
- **express-session + connect-sqlite3**: sesiones con cookie firmada y persistidas.
- **Passport (local + Google OAuth 2.0)**: autenticación local y con proveedor externo.
- **Nodemailer**: envío del correo de confirmación.
- **Vitest + supertest**: tests automatizados de la capa de lógica y de API.
- **Render (free tier)**: despliegue continuo desde GitHub.

---

## Arquitectura (capas)
src/
├── api/ → Capa API (rutas y controladores HTTP)
│ ├── authRoutes.js
│ ├── userRoutes.js
│ └── middleware.js
├── logic/ → Capa de lógica de negocio (reglas, sin HTTP ni BD)
│ ├── userLogic.js
│ ├── passport.js
│ └── emailService.js
├── data/ → Capa de acceso a datos (SQLite)
│ └── userRepo.js
└── server.js → Servidor Express y composición de capas

public/ → Capa de presentación (frontend)
├── index.html → Interfaz (GUI)
├── ui.js → Manipulación del DOM
└── app.js → Cliente HTTP (comunicación con la API)

tests/ → Pruebas unitarias de la capa de lógica
└── userLogic.test.js


**Frontera entre capas:**
- `api/` no tiene reglas de negocio, solo traduce HTTP ↔ lógica.
- `logic/` no conoce HTTP ni la base de datos, solo reglas.
- `data/` solo sabe leer/escribir en SQLite, sin reglas.
- El frontend nunca ejecuta lógica: todo pasa por la API.

---

## Ejecución en local

### Requisitos

- Node.js 20 o superior

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/AAGS21/mi-proyecto-sprint1.git
cd mi-proyecto-sprint1

# 2. Instalar dependencias
npm install

# 3. Copiar el archivo de variables de entorno
cp .env.example .env
# Editar .env con tus valores (ver sección Variables de entorno)

# 4. Arrancar en modo desarrollo
npm run dev

## Notas sobre el despliegue

- Desplegado en **Render (free tier)**.
- El servicio se suspende tras ~15 min de inactividad; la primera petición
  puede tardar 30-50s en responder.
- `DB_PATH` apunta a `/tmp/data.sqlite` porque el disco del plan gratuito es
  efímero: los datos persisten entre reinicios del mismo contenedor, pero se
  reinician tras cada redeploy.
- El administrador inicial se crea al arrancar usando `ADMIN_EMAIL` y
  `ADMIN_PASSWORD`. Las credenciales de prueba se envían con la entrega, no
  se publican en el repositorio.
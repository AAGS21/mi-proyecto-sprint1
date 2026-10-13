# Mi Proyecto Sprint 1

Aplicación SaaS base con arquitectura por capas.

## Tecnologías y justificación

- **Node.js + Express**: backend ligero, mismo lenguaje cliente/servidor y API REST sencilla.
- **SQLite (sqlite3)**: base de datos real embebida; persiste sin servidor externo.
- **bcrypt**: hash seguro de contraseñas (nunca en texto plano).
- **express-session + connect-sqlite3**: sesiones con cookie firmada y persistidas.
- **Passport (local + Google OAuth 2.0)**: autenticación local y con proveedor externo.
- **Nodemailer**: envío del correo de confirmación.
- **Vitest + supertest**: tests automatizados de la capa de lógica y de API.
- **Render (free tier)**: despliegue continuo desde GitHub.

## Arquitectura (capas)

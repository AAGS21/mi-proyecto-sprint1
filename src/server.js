import express from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import passport from 'passport';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupPassport } from './logic/passport.js';
import * as repo from './data/userRepo.js';
import authRoutes from './api/authRoutes.js';
import userRoutes from './api/userRoutes.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQLiteStore = connectSqlite3(session);

const app = express();

// Log de actividad
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: '.' }),
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 },
}));

setupPassport();
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await repo.findById(id);
  done(null, user);
});

// Frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

// Error handler global
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno' });
});

const PORT = process.env.PORT || 3000;

await repo.init();

// Crear admin inicial si no existe
if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  try {
    const logic = await import('./logic/userLogic.js');
    const existing = await repo.findByEmail(process.env.ADMIN_EMAIL);
    if (!existing) {
      await logic.registerUser({
        email: process.env.ADMIN_EMAIL,
        name: 'Admin',
        password: process.env.ADMIN_PASSWORD,
      });
      await logic.promoteToAdmin(process.env.ADMIN_EMAIL);
      console.log('✅ Admin inicial creado');
    }
  } catch (e) { console.error('Error creando admin:', e.message); }
}

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
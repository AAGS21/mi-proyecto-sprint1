// Capa de presentación (manipulación del DOM).
import { api } from './app.js';

const $ = (s) => document.querySelector(s);
const msg = (t) => { $('#msg').textContent = t; };

$('#form-register').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    await api.post('/api/auth/register', data);
    msg('Registrado. Revisa tu correo para confirmar.');
  } catch (err) { msg(err.message); }
});

$('#form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    const u = await api.post('/api/auth/login', data);
    msg('Bienvenido ' + u.email);
    refreshSession();
  } catch (err) { msg(err.message); }
});

$('#btn-logout').addEventListener('click', async () => {
  await api.post('/api/auth/logout');
  msg('Sesión cerrada');
  refreshSession();
});

$('#btn-me').addEventListener('click', refreshSession);

$('#btn-users').addEventListener('click', async () => {
  try {
    const users = await api.get('/api/users');
    $('#users-list').innerHTML = users.map(u =>
      `<li>${u.email} — ${u.role} — ${u.confirmed ? 'activo' : 'pendiente'}</li>`
    ).join('');
  } catch (err) { msg(err.message); }
});

async function refreshSession() {
  try {
    const me = await api.get('/api/auth/me');
    $('#session-info').textContent = `ID ${me.id} — Rol ${me.role}`;
  } catch {
    $('#session-info').textContent = 'No autenticado';
  }
}

refreshSession();
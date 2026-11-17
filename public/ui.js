// Capa de presentación (manipulación del DOM y feedback visual).
import { api } from './app.js';

const $ = (s) => document.querySelector(s);
let currentUser = null;
let toastTimer = null;

// Feedback visual claro mediante notificación flotante (Toast)
function msg(text, type = 'info') {
  const toast = $('#toast');
  toast.textContent = text;
  toast.className = `toast-${type}`;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 4000);
}

// Navegación entre pestañas de Login / Registro (Vista Invitado)
document.querySelectorAll('[data-auth-tab]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-auth-tab]').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const isLogin = btn.dataset.authTab === 'login';
    $('#panel-login').classList.toggle('hidden', !isLogin);
    $('#panel-register').classList.toggle('hidden', isLogin);
  });
});

// Navegación entre pestañas de Tickets / Admin (Vista Aplicación)
document.querySelectorAll('[data-app-tab]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-app-tab]').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const isTickets = btn.dataset.appTab === 'tickets';
    $('#panel-tickets').classList.toggle('hidden', !isTickets);
    $('#panel-admin').classList.toggle('hidden', isTickets);
  });
});

// --- AUTENTICACIÓN Y USUARIOS (SPRINT 1) ---

$('#form-register').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    await api.post('/api/auth/register', data);
    e.target.reset();
    msg('✅ Registrado correctamente. Revisa tu correo (o la consola del servidor) para confirmar.', 'success');
    document.querySelector('[data-auth-tab="login"]').click();
  } catch (err) {
    msg(`❌ ${err.message}`, 'error');
  }
});

$('#form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    const u = await api.post('/api/auth/login', data);
    e.target.reset();
    msg(`👋 Bienvenido, ${u.email}`, 'success');
    await refreshSession();
  } catch (err) {
    msg(`❌ ${err.message}`, 'error');
  }
});

$('#btn-logout').addEventListener('click', async () => {
  await api.post('/api/auth/logout');
  msg('Sesión cerrada correctamente', 'info');
  await refreshSession();
});

$('#btn-me').addEventListener('click', async () => {
  await refreshSession();
  msg(currentUser ? `Sesión activa: ID ${currentUser.id} (${currentUser.role})` : 'Sin sesión activa', 'info');
});

$('#btn-delete-self').addEventListener('click', async () => {
  if (!currentUser) return;
  try {
    await api.del(`/api/users/${currentUser.id}`);
    await api.post('/api/auth/logout');
    msg('Tu cuenta ha sido eliminada', 'info');
    await refreshSession();
  } catch (err) {
    msg(`❌ ${err.message}`, 'error');
  }
});

$('#btn-users').addEventListener('click', loadUsers);

async function loadUsers() {
  try {
    const users = await api.get('/api/users');
    $('#users-list').innerHTML = users.map((u) => `
      <li class="item-row">
        <div>
          <strong>#${u.id} — ${u.email}</strong> (${u.name})
          <span class="badge badge-${u.role}">${u.role}</span>
          <span class="badge ${u.confirmed ? 'badge-abierto' : 'badge-media'}">
            ${u.confirmed ? 'Confirmado' : 'Pendiente'}
          </span>
        </div>
        <div class="item-actions">
          <button class="btn-secondary btn-sm" data-check-active="${u.id}">¿Está activo?</button>
          <button class="btn-danger btn-sm" data-delete-user="${u.id}">Eliminar</button>
        </div>
      </li>
    `).join('');
  } catch (err) {
    msg(`❌ ${err.message}`, 'error');
  }
}

$('#users-list').addEventListener('click', async (e) => {
  const checkId = e.target.dataset.checkActive;
  const delUserId = e.target.dataset.deleteUser;
  try {
    if (checkId) {
      const res = await api.get(`/api/users/${checkId}/active`);
      msg(`Usuario #${checkId}: ${res.active ? '✅ ACTIVO' : '⚠️ INACTIVO (pendiente o eliminado)'}`, 'info');
    } else if (delUserId) {
      await api.del(`/api/users/${delUserId}`);
      msg(`✅ Usuario #${delUserId} eliminado`, 'success');
      loadUsers();
    }
  } catch (err) {
    msg(`❌ ${err.message}`, 'error');
  }
});

// --- GESTIÓN DE TICKETS IT (SPRINT 2) ---

$('#form-ticket').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    await api.post('/api/tickets', data);
    e.target.reset();
    msg('✅ Ticket creado correctamente', 'success');
    loadTickets();
  } catch (err) {
    msg(`❌ ${err.message}`, 'error');
  }
});

$('#btn-tickets').addEventListener('click', () => {
  loadTickets();
  msg('Lista de tickets actualizada', 'info');
});

async function loadTickets() {
  try {
    const tickets = await api.get('/api/tickets');
    if (tickets.length === 0) {
      $('#tickets-list').innerHTML = `<li style="color:var(--muted); text-align:center; padding:1rem;">No hay tickets registrados todavía.</li>`;
      return;
    }
    $('#tickets-list').innerHTML = tickets.map((t) => `
      <li class="item-row">
        <div>
          <span class="badge badge-${t.priority}">${t.priority}</span>
          <span class="badge badge-${t.status}">${t.status}</span>
          <strong>#${t.id} ${t.title}</strong>
          <div style="color:var(--muted); font-size:0.88rem; margin-top:0.25rem;">
            ${t.description || 'Sin descripción'} · <small>Autor ID: ${t.user_id}</small>
          </div>
        </div>
        <div class="item-actions">
          ${t.status !== 'resuelto' ? `<button class="btn-success btn-sm" data-resolve="${t.id}">✓ Resolver</button>` : ''}
          <button class="btn-danger btn-sm" data-delete="${t.id}">🗑 Eliminar</button>
        </div>
      </li>
    `).join('');
  } catch (err) {
    msg(`❌ ${err.message}`, 'error');
  }
}

$('#tickets-list').addEventListener('click', async (e) => {
  const resolveId = e.target.dataset.resolve;
  const deleteId = e.target.dataset.delete;
  try {
    if (resolveId) {
      await api.patch(`/api/tickets/${resolveId}/resolve`);
      msg(`✅ Ticket #${resolveId} marcado como resuelto`, 'success');
      loadTickets();
    } else if (deleteId) {
      await api.del(`/api/tickets/${deleteId}`);
      msg(`🗑 Ticket #${deleteId} eliminado`, 'info');
      loadTickets();
    }
  } catch (err) {
    msg(`❌ ${err.message}`, 'error');
  }
});

// Control de cambio de vista según estado de sesión
async function refreshSession() {
  try {
    const me = await api.get('/api/auth/me');
    currentUser = me;
    const badge = $('#session-info');
    badge.textContent = `Usuario #${me.id} · Rol: ${me.role}`;
    badge.className = `badge badge-${me.role}`;

    // Mostrar pantalla de la app y ocultar login/registro
    $('#view-guest').classList.add('hidden');
    $('#view-app').classList.remove('hidden');
    $('#btn-logout').classList.remove('hidden');
    $('#btn-delete-self').classList.remove('hidden');

    loadTickets();
  } catch {
    currentUser = null;
    const badge = $('#session-info');
    badge.textContent = 'No autenticado';
    badge.className = 'badge badge-guest';

    // Mostrar pantalla de login/registro y ocultar app
    $('#view-guest').classList.remove('hidden');
    $('#view-app').classList.add('hidden');
    $('#btn-logout').classList.add('hidden');
    $('#btn-delete-self').classList.add('hidden');
    $('#tickets-list').innerHTML = '';
    $('#users-list').innerHTML = '';
  }
}

refreshSession();
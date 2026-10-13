// Capa LOGIC — Reglas de negocio. No conoce HTTP.
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import * as repo from '../data/userRepo.js';

const SALT_ROUNDS = 10;

export const registerUser = async ({ email, name, password }) => {
  if (!email || !name || !password) throw new Error('Email, nombre y contraseña son obligatorios');
  if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
  const exists = await repo.findByEmail(email);
  if (exists) throw new Error('Ya existe un usuario con ese email');
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const confirmToken = crypto.randomBytes(32).toString('hex');
  const user = await repo.create({ email, name, passwordHash, confirmToken });
  return { user, confirmToken };
};

export const loginUser = async ({ email, password }) => {
  const user = await repo.findByEmail(email);
  if (!user) throw new Error('Credenciales inválidas');
  if (user.deleted) throw new Error('Cuenta eliminada');
  if (!user.confirmed) throw new Error('Cuenta pendiente de confirmación');
  const ok = await bcrypt.compare(password, user.password_hash || '');
  if (!ok) throw new Error('Credenciales inválidas');
  return user;
};

export const confirmAccount = async (token) => {
  const all = await repo.findAllRaw();
  const user = all.find(u => u.confirm_token === token);
  if (!user) throw new Error('Token de confirmación inválido');
  await repo.update(user.id, { confirmed: 1, confirm_token: null });
  return true;
};

export const listUsers = async () => repo.findAll();

export const isUserActive = async (id) => {
  const user = await repo.findById(id);
  if (!user) throw new Error('Usuario no encontrado');
  return user.confirmed === 1 && user.deleted === 0;
};

export const deleteUser = async ({ requester, targetId }) => {
  if (!requester) throw new Error('Sesión requerida');
  const target = await repo.findById(targetId);
  if (!target) throw new Error('Usuario objetivo no encontrado');
  const isAdmin = requester.role === 'admin';
  const isSelf = requester.id === targetId;
  if (!isAdmin && !isSelf) throw new Error('No tienes permiso para eliminar a este usuario');
  await repo.remove(targetId);
  return true;
};

export const promoteToAdmin = async (email) => {
  const user = await repo.findByEmail(email);
  if (!user) throw new Error('Usuario no encontrado para promover');
  await repo.update(user.id, { role: 'admin', confirmed: 1 });
  return true;
};

export const upsertOAuthUser = async ({ email, name, provider }) => {
  let user = await repo.findByEmail(email);
  if (user) return user;
  return repo.create({ email, name, provider, confirmed: true });
};
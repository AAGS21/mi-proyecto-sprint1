// src/logic/ticketLogic.js
// Capa LOGIC — Reglas de negocio de Tickets IT. No conoce HTTP ni SQL.
import * as ticketRepo from '../data/ticketRepo.js';

const VALID_PRIORITIES = ['baja', 'media', 'alta'];

export const createTicket = async ({ requester, title, description = '', priority = 'media' }) => {
  if (!requester) throw new Error('Sesión requerida');
  if (!title || !title.trim()) throw new Error('El título del ticket es obligatorio');
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new Error('Prioridad inválida (debe ser baja, media o alta)');
  }
  return ticketRepo.create({
    userId: requester.id,
    title: title.trim(),
    description: description.trim(),
    priority,
  });
};

export const listTickets = async ({ requester }) => {
  if (!requester) throw new Error('Sesión requerida');
  if (requester.role === 'admin') {
    return ticketRepo.findAll();
  }
  return ticketRepo.findByUserId(requester.id);
};

export const resolveTicket = async ({ requester, ticketId }) => {
  if (!requester) throw new Error('Sesión requerida');
  if (requester.role !== 'admin') {
    throw new Error('No tienes permiso: solo un administrador puede resolver tickets');
  }
  const ticket = await ticketRepo.findById(ticketId);
  if (!ticket) throw new Error('Ticket no encontrado');
  return ticketRepo.updateStatus(ticketId, 'resuelto');
};

export const deleteTicket = async ({ requester, ticketId }) => {
  if (!requester) throw new Error('Sesión requerida');
  const ticket = await ticketRepo.findById(ticketId);
  if (!ticket) throw new Error('Ticket no encontrado');
  const isAdmin = requester.role === 'admin';
  const isOwner = ticket.user_id === requester.id;
  if (!isAdmin && !isOwner) {
    throw new Error('No tienes permiso para eliminar este ticket');
  }
  await ticketRepo.remove(ticketId);
  return true;
};
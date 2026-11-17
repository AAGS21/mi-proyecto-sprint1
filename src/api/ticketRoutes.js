// src/api/ticketRoutes.js
// Capa API — Traduce HTTP ↔ lógica de tickets. Sin reglas de negocio.
import { Router } from 'express';
import * as ticketLogic from '../logic/ticketLogic.js';
import { requireAuth } from './middleware.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const tickets = await ticketLogic.listTickets({ requester: req.user });
    res.json(tickets);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const ticket = await ticketLogic.createTicket({
      requester: req.user,
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
    });
    res.status(201).json(ticket);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.patch('/:id/resolve', requireAuth, async (req, res) => {
  try {
    const updated = await ticketLogic.resolveTicket({
      requester: req.user,
      ticketId: Number(req.params.id),
    });
    res.json(updated);
  } catch (e) {
    res.status(403).json({ error: e.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await ticketLogic.deleteTicket({
      requester: req.user,
      ticketId: Number(req.params.id),
    });
    res.status(204).end();
  } catch (e) {
    res.status(403).json({ error: e.message });
  }
});

export default router;
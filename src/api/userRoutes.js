// Capa API — Traduce HTTP ↔ lógica. No tiene reglas de negocio.
import { Router } from 'express';
import * as logic from '../logic/userLogic.js';
import { requireAuth, requireAdmin } from './middleware.js';

const router = Router();

router.get('/', requireAdmin, async (req, res) => {
  res.json(await logic.listUsers());
});

router.post('/', async (req, res) => {
  try {
    const { user, confirmToken } = await logic.registerUser(req.body);
    res.status(201).json({ id: user.id, email: user.email, confirmToken });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/:id/active', requireAdmin, async (req, res) => {
  try {
    res.json({ active: await logic.isUserActive(Number(req.params.id)) });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await logic.deleteUser({ requester: req.user, targetId: Number(req.params.id) });
    res.status(204).end();
  } catch (e) {
    res.status(403).json({ error: e.message });
  }
});

export default router;
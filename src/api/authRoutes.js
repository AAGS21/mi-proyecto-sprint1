// Rutas de autenticación (registro, login, logout, OAuth, confirmación).
import { Router } from 'express';
import passport from 'passport';
import * as logic from '../logic/userLogic.js';
import { sendConfirmationEmail } from '../logic/emailService.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { user, confirmToken } = await logic.registerUser(req.body);
    await sendConfirmationEmail(user.email, confirmToken);
    res.status(201).json({ id: user.id, email: user.email });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: info?.message || 'Credenciales inválidas' });
    req.session.userId = user.id;
    req.session.role = user.role;
    res.json({ id: user.id, email: user.email, role: user.role });
  })(req, res, next);
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.status(204).end());
});

router.get('/me', (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'No autenticado' });
  res.json({ id: req.session.userId, role: req.session.role });
});

router.get('/confirm/:token', async (req, res) => {
  try {
    await logic.confirmAccount(req.params.token);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// OAuth con Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/?error=oauth' }),
  (req, res) => {
    req.session.userId = req.user.id;
    req.session.role = req.user.role;
    res.redirect('/');
  });

export default router;
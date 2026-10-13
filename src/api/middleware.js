// Middlewares de autenticación y autorización (capa API).
export const requireAuth = (req, res, next) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'No autenticado' });
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'No autenticado' });
  if (req.session.role !== 'admin') return res.status(403).json({ error: 'Requiere rol admin' });
  next();
};
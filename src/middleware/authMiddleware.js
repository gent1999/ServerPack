import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export async function requireAuth(req, res, next) {
  const header = req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true },
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.admin = admin;
    next();
  } catch {
    res.status(503).json({ error: 'Service temporarily unavailable' });
  }
}

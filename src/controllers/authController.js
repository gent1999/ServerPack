import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const GENERIC_LOGIN_ERROR = 'Invalid email or password';
// Bcrypt hash of a value nobody will ever type, used to keep the timing of
// "email not found" the same as "email found, password wrong" -- otherwise
// a fast-fail on unknown emails lets an attacker enumerate valid accounts.
const DUMMY_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8fJz2Qbe2xz.fN8ldTGyF.wZ3lVsPu';

export async function login(req, res) {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const admin = await prisma.admin.findUnique({ where: { email: email.trim().toLowerCase() } });

  const isMatch = await bcrypt.compare(password, admin ? admin.passwordHash : DUMMY_HASH);

  if (!admin || !isMatch) {
    return res.status(401).json({ error: GENERIC_LOGIN_ERROR });
  }

  const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.json({
    token,
    admin: { id: admin.id, email: admin.email },
  });
}

export async function me(req, res) {
  res.json({ admin: req.admin });
}

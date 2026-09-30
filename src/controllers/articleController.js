import prisma from '../lib/prisma.js';
import { generateUniqueSlug } from '../utils/slugify.js';

const VALID_STATUSES = ['DRAFT', 'PUBLISHED'];

function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateArticleBody(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  if (!partial || body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      errors.push('title is required');
    } else {
      data.title = body.title.trim();
    }
  }

  if (!partial || body.content !== undefined) {
    if (typeof body.content !== 'string' || !body.content.trim()) {
      errors.push('content is required');
    } else {
      data.content = body.content;
    }
  }

  if (body.excerpt !== undefined) {
    if (body.excerpt !== null && typeof body.excerpt !== 'string') {
      errors.push('excerpt must be a string');
    } else {
      data.excerpt = body.excerpt;
    }
  }

  if (body.authorName !== undefined) {
    if (typeof body.authorName !== 'string' || !body.authorName.trim()) {
      errors.push('authorName must be a non-empty string');
    } else {
      data.authorName = body.authorName.trim();
    }
  }

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      errors.push('status must be DRAFT or PUBLISHED');
    } else {
      data.status = body.status;
    }
  }

  return { errors, data };
}

// ---------- Admin ----------

export async function listAdmin(req, res) {
  const articles = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ articles });
}

export async function getAdminOne(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid article id' });

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return res.status(404).json({ error: 'Article not found' });

  res.json({ article });
}

export async function create(req, res) {
  const { errors, data } = validateArticleBody(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });

  const slug = await generateUniqueSlug(prisma, data.title);
  const status = data.status || 'DRAFT';

  const article = await prisma.article.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt ?? null,
      content: data.content,
      authorName: data.authorName || 'Wolfpack.fm',
      status,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    },
  });

  res.status(201).json({ article });
}

export async function update(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid article id' });

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Article not found' });

  const { errors, data } = validateArticleBody(req.body || {}, { partial: true });
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });

  const updateData = { ...data };

  if (data.status && data.status !== existing.status) {
    if (data.status === 'PUBLISHED' && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }

  const article = await prisma.article.update({ where: { id }, data: updateData });
  res.json({ article });
}

export async function remove(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid article id' });

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Article not found' });

  await prisma.article.delete({ where: { id } });
  res.json({ success: true });
}

export async function patchStatus(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid article id' });

  const { status } = req.body || {};
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'status must be DRAFT or PUBLISHED' });
  }

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Article not found' });

  const data = { status };
  if (status === 'PUBLISHED' && !existing.publishedAt) {
    data.publishedAt = new Date();
  }

  const article = await prisma.article.update({ where: { id }, data });
  res.json({ article });
}

// ---------- Public ----------

export async function listPublished(req, res) {
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
  });
  res.json({ articles });
}

export async function getPublishedBySlug(req, res) {
  const article = await prisma.article.findUnique({ where: { slug: req.params.slug } });

  if (!article || article.status !== 'PUBLISHED') {
    return res.status(404).json({ error: 'Article not found' });
  }

  res.json({ article });
}

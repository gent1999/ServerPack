import prisma from '../lib/prisma.js';
import { generateUniqueSlug } from '../utils/slugify.js';

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

  if (!partial || body.tag !== undefined) {
    if (typeof body.tag !== 'string' || !body.tag.trim()) {
      errors.push('tag is required');
    } else {
      data.tag = body.tag.trim();
    }
  }

  if (!partial || body.content !== undefined) {
    if (typeof body.content !== 'string' || !body.content.trim()) {
      errors.push('content is required');
    } else {
      data.content = body.content;
    }
  }

  if (body.authorName !== undefined) {
    if (typeof body.authorName !== 'string' || !body.authorName.trim()) {
      errors.push('authorName must be a non-empty string');
    } else {
      data.authorName = body.authorName.trim();
    }
  }

  for (const field of ['imageUrl', 'spotifyUrl', 'soundcloudUrl', 'youtubeUrl']) {
    if (body[field] === undefined) continue;

    if (body[field] === null || body[field] === '') {
      data[field] = null;
    } else if (typeof body[field] !== 'string') {
      errors.push(`${field} must be a string`);
    } else {
      data[field] = body[field].trim();
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

// Articles are published the moment they're created -- there is no draft
// state. publishedAt defaults at the database level (see schema.prisma).
export async function create(req, res) {
  const { errors, data } = validateArticleBody(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });

  const slug = await generateUniqueSlug(prisma, data.title);

  const article = await prisma.article.create({
    data: {
      title: data.title,
      slug,
      tag: data.tag,
      content: data.content,
      authorName: data.authorName || 'Wolfpack.fm',
      imageUrl: data.imageUrl ?? null,
      spotifyUrl: data.spotifyUrl ?? null,
      soundcloudUrl: data.soundcloudUrl ?? null,
      youtubeUrl: data.youtubeUrl ?? null,
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

  const article = await prisma.article.update({ where: { id }, data });
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

// ---------- Public ----------
// Every article is published by definition -- no draft filtering needed.

export async function listPublished(req, res) {
  const articles = await prisma.article.findMany({ orderBy: { publishedAt: 'desc' } });
  res.json({ articles });
}

export async function getPublishedBySlug(req, res) {
  const article = await prisma.article.findUnique({ where: { slug: req.params.slug } });

  if (!article) return res.status(404).json({ error: 'Article not found' });

  res.json({ article });
}

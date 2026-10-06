import prisma from '../lib/prisma.js';
import { generateUniqueSlug } from '../utils/slugify.js';

const URL_FIELDS = ['imageUrl', 'spotifyUrl', 'soundcloudUrl', 'youtubeUrl', 'geniusUrl', 'appleMusicUrl'];

function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateArtistBody(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  if (!partial || body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      errors.push('name is required');
    } else {
      data.name = body.name.trim();
    }
  }

  if (body.bio !== undefined) {
    if (body.bio !== null && typeof body.bio !== 'string') {
      errors.push('bio must be a string');
    } else {
      data.bio = body.bio || null;
    }
  }

  if (body.featured !== undefined) {
    if (typeof body.featured !== 'boolean') {
      errors.push('featured must be a boolean');
    } else {
      data.featured = body.featured;
    }
  }

  for (const field of URL_FIELDS) {
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
  const artists = await prisma.artist.findMany({ orderBy: [{ featured: 'desc' }, { name: 'asc' }] });
  res.json({ artists });
}

export async function getAdminOne(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid artist id' });

  const artist = await prisma.artist.findUnique({ where: { id } });
  if (!artist) return res.status(404).json({ error: 'Artist not found' });

  res.json({ artist });
}

export async function create(req, res) {
  const { errors, data } = validateArtistBody(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });

  const slug = await generateUniqueSlug(prisma.artist, data.name);

  const artist = await prisma.artist.create({
    data: {
      name: data.name,
      slug,
      featured: data.featured ?? false,
      bio: data.bio ?? null,
      imageUrl: data.imageUrl ?? null,
      spotifyUrl: data.spotifyUrl ?? null,
      soundcloudUrl: data.soundcloudUrl ?? null,
      youtubeUrl: data.youtubeUrl ?? null,
      geniusUrl: data.geniusUrl ?? null,
      appleMusicUrl: data.appleMusicUrl ?? null,
    },
  });

  res.status(201).json({ artist });
}

export async function update(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid artist id' });

  const existing = await prisma.artist.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Artist not found' });

  const { errors, data } = validateArtistBody(req.body || {}, { partial: true });
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });

  const artist = await prisma.artist.update({ where: { id }, data });
  res.json({ artist });
}

export async function remove(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid artist id' });

  const existing = await prisma.artist.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Artist not found' });

  await prisma.artist.delete({ where: { id } });
  res.json({ success: true });
}

// ---------- Public ----------

export async function listPublic(req, res) {
  const artists = await prisma.artist.findMany({ orderBy: [{ featured: 'desc' }, { name: 'asc' }] });
  res.json({ artists });
}

export async function getPublicBySlug(req, res) {
  const artist = await prisma.artist.findUnique({ where: { slug: req.params.slug } });

  if (!artist) return res.status(404).json({ error: 'Artist not found' });

  res.json({ artist });
}

import prisma from '../lib/prisma.js';

function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateRadioTrackBody(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  if (!partial || body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      errors.push('title is required');
    } else {
      data.title = body.title.trim();
    }
  }

  if (!partial || body.artist !== undefined) {
    if (typeof body.artist !== 'string' || !body.artist.trim()) {
      errors.push('artist is required');
    } else {
      data.artist = body.artist.trim();
    }
  }

  if (body.spotifyTrackId !== undefined) {
    if (body.spotifyTrackId === null || body.spotifyTrackId === '') {
      data.spotifyTrackId = null;
    } else if (typeof body.spotifyTrackId !== 'string') {
      errors.push('spotifyTrackId must be a string');
    } else {
      data.spotifyTrackId = body.spotifyTrackId.trim();
    }
  }

  if (body.blurb !== undefined) {
    if (body.blurb === null || body.blurb === '') {
      data.blurb = null;
    } else if (typeof body.blurb !== 'string') {
      errors.push('blurb must be a string');
    } else {
      data.blurb = body.blurb.trim();
    }
  }

  if (body.featured !== undefined) {
    if (typeof body.featured !== 'boolean') {
      errors.push('featured must be a boolean');
    } else {
      data.featured = body.featured;
    }
  }

  if (body.position !== undefined && body.position !== null && body.position !== '') {
    const position = Number(body.position);
    if (!Number.isInteger(position)) {
      errors.push('position must be an integer');
    } else {
      data.position = position;
    }
  }

  return { errors, data };
}

// ---------- Admin ----------

export async function listAdmin(req, res) {
  const tracks = await prisma.radioTrack.findMany({ orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] });
  res.json({ tracks });
}

export async function getAdminOne(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid track id' });

  const track = await prisma.radioTrack.findUnique({ where: { id } });
  if (!track) return res.status(404).json({ error: 'Track not found' });

  res.json({ track });
}

export async function create(req, res) {
  const { errors, data } = validateRadioTrackBody(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });

  // Default to the end of the list when no position is given.
  if (data.position === undefined) {
    const last = await prisma.radioTrack.findFirst({ orderBy: { position: 'desc' } });
    data.position = last ? last.position + 1 : 0;
  }

  const track = await prisma.radioTrack.create({
    data: {
      title: data.title,
      artist: data.artist,
      spotifyTrackId: data.spotifyTrackId ?? null,
      blurb: data.blurb ?? null,
      featured: data.featured ?? false,
      position: data.position,
    },
  });

  res.status(201).json({ track });
}

export async function update(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid track id' });

  const existing = await prisma.radioTrack.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Track not found' });

  const { errors, data } = validateRadioTrackBody(req.body || {}, { partial: true });
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });

  const track = await prisma.radioTrack.update({ where: { id }, data });
  res.json({ track });
}

export async function remove(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid track id' });

  const existing = await prisma.radioTrack.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Track not found' });

  await prisma.radioTrack.delete({ where: { id } });
  res.json({ success: true });
}

// ---------- Public ----------

export async function listPublic(req, res) {
  const tracks = await prisma.radioTrack.findMany({ orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] });
  res.json({ tracks });
}

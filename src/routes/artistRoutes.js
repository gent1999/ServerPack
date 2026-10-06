import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { listAdmin, getAdminOne, create, update, remove, listPublic, getPublicBySlug } from '../controllers/artistController.js';

export const adminArtistRoutes = Router();

adminArtistRoutes.use(requireAuth);
adminArtistRoutes.get('/', listAdmin);
adminArtistRoutes.get('/:id', getAdminOne);
adminArtistRoutes.post('/', create);
adminArtistRoutes.put('/:id', update);
adminArtistRoutes.delete('/:id', remove);

export const publicArtistRoutes = Router();

publicArtistRoutes.get('/', listPublic);
publicArtistRoutes.get('/:slug', getPublicBySlug);

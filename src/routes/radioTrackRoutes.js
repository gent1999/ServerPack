import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { listAdmin, getAdminOne, create, update, remove, listPublic } from '../controllers/radioTrackController.js';

export const adminRadioTrackRoutes = Router();

adminRadioTrackRoutes.use(requireAuth);
adminRadioTrackRoutes.get('/', listAdmin);
adminRadioTrackRoutes.get('/:id', getAdminOne);
adminRadioTrackRoutes.post('/', create);
adminRadioTrackRoutes.put('/:id', update);
adminRadioTrackRoutes.delete('/:id', remove);

export const publicRadioTrackRoutes = Router();

publicRadioTrackRoutes.get('/', listPublic);

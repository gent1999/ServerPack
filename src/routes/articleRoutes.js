import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  listAdmin,
  getAdminOne,
  create,
  update,
  remove,
  listPublished,
  getPublishedBySlug,
} from '../controllers/articleController.js';

export const adminArticleRoutes = Router();

adminArticleRoutes.use(requireAuth);
adminArticleRoutes.get('/', listAdmin);
adminArticleRoutes.get('/:id', getAdminOne);
adminArticleRoutes.post('/', create);
adminArticleRoutes.put('/:id', update);
adminArticleRoutes.delete('/:id', remove);

export const publicArticleRoutes = Router();

publicArticleRoutes.get('/', listPublished);
publicArticleRoutes.get('/:slug', getPublishedBySlug);

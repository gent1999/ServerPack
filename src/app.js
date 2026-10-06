import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import { adminArticleRoutes, publicArticleRoutes } from './routes/articleRoutes.js';
import { adminArtistRoutes, publicArtistRoutes } from './routes/artistRoutes.js';
import { adminRadioTrackRoutes, publicRadioTrackRoutes } from './routes/radioTrackRoutes.js';

const app = express();

const allowedOrigins = ['http://localhost:5173', process.env.FRONTEND_URL].filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin/non-browser requests (no Origin header) and any
      // configured frontend origin; reject everything else.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin/articles', adminArticleRoutes);
app.use('/api/articles', publicArticleRoutes);
app.use('/api/admin/artists', adminArtistRoutes);
app.use('/api/artists', publicArtistRoutes);
app.use('/api/admin/radio-tracks', adminRadioTrackRoutes);
app.use('/api/radio-tracks', publicRadioTrackRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler -- must be declared last, with 4 args, for
// Express to recognize it as an error middleware.
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Not allowed by CORS' });
  }

  console.error(err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({ error: isProd ? 'Internal server error' : err.message });
});

export default app;

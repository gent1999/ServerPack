import 'dotenv/config';
import app from './app.js';

const REQUIRED_ENV_VARS = ['DATABASE_URL', 'JWT_SECRET'];
const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ServerPack running on port ${PORT}`);
});

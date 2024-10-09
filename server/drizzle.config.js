import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './config/migrations',
  schema: './models/userModel.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});

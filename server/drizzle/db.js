import { drizzle } from 'drizzle-orm/connect';

const db = await drizzle('postgres-js', process.env.DATABASE_URL);

export default db;

import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import userRoutes from './routes/userRoutes';
import jwt from '@fastify/jwt';

export const app: FastifyInstance = fastify({ logger: true });

await app.register(cors);

app.register(jwt, {
  secret: process.env.JWT_SECRET!,
});

app.register(userRoutes, { prefix: '/api/user' });

try {
  await app.listen({ port: 3000 });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

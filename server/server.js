import fastify from 'fastify';
import userRoutes from './routes/userRoutes.js';
import jwt from '@fastify/jwt';

const app = fastify({ logger: true });

app.register(jwt, {
  secret: process.env.JWT_SECRET,
});

app.register(userRoutes, { prefix: '/api/user' });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

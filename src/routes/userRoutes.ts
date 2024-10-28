import { FastifyInstance } from 'fastify';
import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  getUser,
} from '../controllers/userController';
import { protect } from '../middlewares/userMiddleware';

async function userRoutes(app: FastifyInstance) {
  app.post('/sign-up', registerUser);
  app.post('/sign-in', loginUser);
  app.post('/forgot-password', requestPasswordReset);
  app.post('/reset-password', { preValidation: [protect] }, resetPassword);
  app.get('/', { preValidation: [protect] }, getUser);
}

export default userRoutes;

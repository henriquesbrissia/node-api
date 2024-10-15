import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
} from '../controllers/userController.js';
import { protect } from '../middlewares/userMiddleware.js';

async function userRoutes(app, options) {
  app.post('/sign-up', registerUser);
  app.post('/sign-in', { preValidation: [protect] }, loginUser);
  app.post('/forgot-password', requestPasswordReset);
  app.post('/reset-password', { preValidation: [protect] }, resetPassword);
}

export default userRoutes;

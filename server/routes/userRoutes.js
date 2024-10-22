import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  getUser,
} from '../controllers/userController.js';
import { protect } from '../middlewares/userMiddleware.js';

async function userRoutes(app, options) {
  app.post('/sign-up', registerUser);
  app.post('/sign-in', loginUser);
  app.post('/forgot-password', requestPasswordReset);
  app.post('/reset-password', { preValidation: [protect] }, resetPassword);
  app.get('/dashboard', getUser);
}

export default userRoutes;

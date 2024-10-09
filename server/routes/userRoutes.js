import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
} from '../controllers/userController.js';

async function userRoutes(app, options) {
  app.post('/register', registerUser);
  app.post('/login', loginUser);
  app.post('/reset-password-request', requestPasswordReset);
  app.post('/reset-password', resetPassword);
}

export default userRoutes;

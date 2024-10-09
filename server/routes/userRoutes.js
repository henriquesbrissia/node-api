import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
} from '../controllers/userController.js';

async function userRoutes(app, options) {
  app.post('/register', registerUser);
  app.post('/login', { preValidation: [protect] }, loginUser);
  app.post(
    '/reset-password-request',
    { preValidation: [protect] },
    requestPasswordReset
  );
  app.post('/reset-password', { preValidation: [protect] }, resetPassword);
}

export default userRoutes;

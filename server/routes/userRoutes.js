import express from 'express';
import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
} from '../controllers/userController.js';

const router = express.Router();

// Rota para registro de usuário
router.post('/register', registerUser);

// Rota para login de usuário
router.post('/login', loginUser);

// Rota para solicitar reset de senha
router.post('/reset-password-request', requestPasswordReset);

// Rota para redefinir a senha
router.post('/reset-password', resetPassword);

export default router;

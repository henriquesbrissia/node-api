import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../models/userModel.js';

// Registro de usuário
export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar se o usuário já existe
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Encriptar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o novo usuário
    const newUser = await createUser(email, hashedPassword);

    // Retornar sucesso
    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login de usuário
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar se o usuário existe
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verificar se a senha está correta
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Gerar um token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    );

    // Retornar o token
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Função para solicitar reset de senha
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // Verificar se o usuário existe
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Gerar token JWT para reset de senha
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: '15m',
      }
    );

    // Aqui seria o momento de enviar o token via email mas vou retornar ele na resposta por enquanto pra facilitar
    res.status(200).json({ resetToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Função para redefinir senha
export const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    // Verificar o token JWT
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    // Encriptar a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar a senha do usuário no banco de dados
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [
      hashedPassword,
      decoded.id,
    ]);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

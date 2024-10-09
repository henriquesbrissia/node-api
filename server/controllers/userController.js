import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/drizzle.js';
import { users } from '../models/userModel.js';

export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(users.email.eq(email))
      .limit(1);
    if (existingUser.lenght > 0) {
      return res.status(400).send({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
      })
      .returning();

    res.status(201).send(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login de usuário
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db
      .select()
      .from(users)
      .where(user.email.eq(email))
      .limit(1);
    if (user.lenght === 0) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (!isPasswordValid) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user[0].id, email: user[0].email },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    );

    res.status(200).send({ token });
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
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

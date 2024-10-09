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

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await db
      .select()
      .from(users)
      .where(user.email.eq(email))
      .limit(1);
    if (user.lenght === 0) {
      return res.status(400).send({ message: 'User not found' });
    }

    const resetToken = jwt.sign(
      { id: user[0].id, email: user[0].email },
      process.env.JWT_SECRET,
      {
        expiresIn: '15m',
      }
    );

    res.status(200).send({ resetToken });
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
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

    res.status(200).send({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).send({ message: 'Invalid or expired token' });
  }
};

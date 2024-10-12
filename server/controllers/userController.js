import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../drizzle/db.js';
import { users } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .execute();
    if (existingUser.length > 0) {
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
    res.status(500).send({ message: 'Server error' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .execute();
    if (user.length === 0) {
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
      .where(eq(users.email, email))
      .execute();
    if (user.length === 0) {
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

export const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, decoded.id));

    res.status(200).send({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).send({ message: 'Invalid or expired token' });
  }
};

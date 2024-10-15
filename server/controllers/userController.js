import bcrypt from 'bcrypt';
import { signToken, verifyToken } from '../utils/jwt.js';
import db from '../drizzle/db.js';
import { users } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password are required' });
  }

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
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
    console.error(error);
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password are required' });
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!user) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }

    const token = signToken({ id: user.id, email: user.email }, '1h');

    res.status(200).send({ token });
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
    console.error(error);
  }
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ message: 'Email is required' });
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }

    const resetToken = signToken({ id: user.id, email: user.email }, '15m');

    res.status(200).send({ resetToken });
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
    console.error(error);
  }
};

export const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).send({ message: 'New passsword is required' });
  }

  try {
    const decoded = verifyToken(resetToken);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, decoded.id));

    res.status(200).send({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).send({ message: 'Invalid or expired token' });
    console.error(error);
  }
};

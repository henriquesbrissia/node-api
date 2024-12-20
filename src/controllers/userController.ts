import bcrypt from 'bcrypt';
import { signToken, verifyToken } from '../utils/jwt';
import db from '../drizzle/db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { FastifyRequest, FastifyReply } from 'fastify';

type UserReqBody = {
  email: string
  password: string
}

type ResetPasswordRequest = {
  resetToken: string;
  newPassword: string;
}

export const registerUser = async (
  req: FastifyRequest<{ Body: UserReqBody }>, 
  res: FastifyReply) => {
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

export const loginUser = async (
  req: FastifyRequest<{ Body: UserReqBody }>, 
  res: FastifyReply) => {
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

export const requestPasswordReset = async (
  req: FastifyRequest<{ Body: {email: string} }>, 
  res: FastifyReply) => {
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

export const resetPassword = async (
  req: FastifyRequest, 
  res: FastifyReply
) => {
  const { resetToken, newPassword } = req.body as ResetPasswordRequest;

  if (!newPassword) {
    return res.status(400).send({ message: 'New password is required' });
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

export const getUser = async (
  req: FastifyRequest, 
  res: FastifyReply) => {
  const user = req.user as { id: string }
  const userId = user.id;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        email: true,
        id: true,
      },
    });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    return res.status(200).send(user);
  } catch (error) {
    req.log.error(error);
    res.status(500).send({ message: 'Server error' });
  }
};

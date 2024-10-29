import { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "src/utils/jwt";

export const protect = async (
  req: FastifyRequest, 
  res: FastifyReply) => {
  let token: string;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = verifyToken(token);

      req.user = decoded;
    } catch (error) {
      return res.status(401).send({ message: 'Not authorized, invalid token' });
    }
  } else {
    return res.status(401).send({ message: 'Not authorized, absent token' });
  }
};

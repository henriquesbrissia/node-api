import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';

type TokenPayload = {
  id: string
  email: string
}

export const signToken = (payload: TokenPayload, expiresIn: string | number): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn } as SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
};

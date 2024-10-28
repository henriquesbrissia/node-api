import { app } from "src/server";

type TokenPayload = {
  id: string
  email: string
}

export const signToken = (payload: TokenPayload, expiresIn: string | number): string => {
  return app.jwt.sign(payload, { expiresIn });
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return app.jwt.verify(token) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

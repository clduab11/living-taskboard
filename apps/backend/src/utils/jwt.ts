import jwt from 'jsonwebtoken';
import { config } from '../config/env';

interface TokenPayload {
  id: string;
  email: string;
  subscriptionTier: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.auth.jwtSecret) as TokenPayload;
};

import jwt from 'jsonwebtoken';

export function signAccessToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
}

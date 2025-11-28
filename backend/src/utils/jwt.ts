// import jwt from 'jsonwebtoken';

// export function signAccessToken(userId: string) {
//   return jwt.sign({ userId }, process.env.JWT_SECRET!, {
//     expiresIn: process.env.JWT_EXPIRE || '7d'
//   });
// }


import jwt, { Secret, SignOptions, JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export function signAccessToken(userId: string): string {
  const payload: JwtPayload = { userId };

  const options: SignOptions = {
    expiresIn: JWT_EXPIRE
  };

  return jwt.sign(payload, JWT_SECRET as Secret, options);
}

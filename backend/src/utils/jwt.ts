import jwt, { Secret, JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

// Use seconds for expiry (TypeScript expects number | StringValue)
const DEFAULT_EXPIRE_SECONDS = 7 * 24 * 60 * 60; // 7 days

// If JWT_EXPIRE is set in env, interpret it as seconds (e.g. "604800")
const JWT_EXPIRE_SECONDS =
  process.env.JWT_EXPIRE !== undefined
    ? Number(process.env.JWT_EXPIRE)
    : DEFAULT_EXPIRE_SECONDS;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export function signAccessToken(userId: string): string {
  const payload: JwtPayload = { userId };

  return jwt.sign(payload, JWT_SECRET as Secret, {
    expiresIn: JWT_EXPIRE_SECONDS // number -> satisfies TS type
  });
}

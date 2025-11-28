import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleIdToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) throw new Error('Invalid Google token');

  return {
    email: payload.email,
    emailVerified: payload.email_verified,
    name: payload.name || '',
    picture: payload.picture || ''
  };
}

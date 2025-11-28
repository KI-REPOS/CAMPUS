export const allowedDomains: string[] = (process.env.ALLOWED_EMAIL_DOMAINS || '')
  .split(',')
  .map(d => d.trim())
  .filter(Boolean);

export function isAllowedDomain(email: string): boolean {
  const domain = email.split('@')[1] || '';
  return allowedDomains.includes(domain);
}

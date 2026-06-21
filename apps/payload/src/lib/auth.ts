// Stub auth — Payload CMS имеет собственную auth систему
export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  return null;
}
export function signToken(payload: any): string {
  return '';
}
export async function hashPassword(password: string): Promise<string> {
  return password;
}
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return password === hash;
}

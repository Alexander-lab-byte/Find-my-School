/**
 * Validates a post-login `?next=` path. Only same-site paths are allowed,
 * so the login page can't be used to bounce people to another domain
 * ("//evil.com" and "/\evil.com" are both treated as external by browsers).
 */
export function safeNextPath(value: string | string[] | undefined) {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return "/";
  }
  return path;
}

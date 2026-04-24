export function joinURL(baseURL: string, path: string): string {
  return `${baseURL.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

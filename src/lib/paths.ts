export function publicPath(pathname: string | undefined): string | undefined {
  if (!pathname) return pathname;
  if (/^(https?:)?\/\//.test(pathname) || pathname.startsWith('data:')) return pathname;
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${pathname.replace(/^\//, '')}`;
}

export function pagePath(pathname: string): string {
  if (pathname.startsWith('#')) return pathname;
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${pathname.replace(/^\//, '')}`;
}

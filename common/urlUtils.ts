export function getOwnPath(url: string): string {
  const path: string[] = url.split('/');
  let dropCount: number = 1;
  if (path[path.length - 1] == '') {
    dropCount++;
  }
  return path.slice(0, -dropCount).join('/');
}

export function getAPIPath(): string {
  const baseURL: string = window.$nuxt.$axios.defaults.baseURL!;
  return baseURL
    .split('/')
    .slice(0, baseURL!.endsWith('/') ? -2 : -1)
    .join('/');
}

export function isSuperuser(): boolean {
  return window.$nuxt.$auth.user.is_superuser;
}

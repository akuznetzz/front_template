// borrowed from https://github.com/nuxt-community/auth-module/pull/361#issuecomment-628677554
export default function ({$axios, $auth, app}) {
  // set language
  $axios.interceptors.request.use((config) => {
    config.headers['Accept-Language'] = app.i18n.locale || 'ru-RU';
    return config;
  });

  $axios.onError(async (error) => {
    const config = error.config;
    // Don't intercept retry request
    // Only intercept requests with status 401
    // Don't intercept refresh token requests
    // And check if user is logged in and tokens are available
    if (
      config.__isRetryRequest ||
      error.response.status !== 401 ||
      config.url === $auth.strategy.options.endpoints.refresh.url ||
      !$auth.check()
    ) {
      return Promise.resolve(error.response);
    }

    // Refresh tokens before retrying current request
    await $auth.refreshTokens().catch((error) => {
      // Tokens couldn't be refreshed. Force reset.
      $auth.reset();
      throw error;
    });

    // Set `isRetryRequest` flag to true
    config.__isRetryRequest = true;

    // Update Authorization header
    config.headers[$auth.strategy.options.token.name] = $auth.token.get();

    // Retry original request
    return $axios.request(config);
  });
}

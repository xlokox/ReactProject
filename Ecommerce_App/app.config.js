import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  name: config.name || 'EasyShop Mobile App',
  slug: config.slug || 'easyshop-mobile-app',
  extra: {
    // Prefer API_BASE_URL, fallback to legacy API_URL
    apiUrl: (process.env.API_BASE_URL || process.env.API_URL || 'http://localhost:5001')
      .replace(/\/$/, '') + (/(api)$/.test(process.env.API_BASE_URL || process.env.API_URL || '') ? '' : '/api'),
    socketUrl: (process.env.SOCKET_URL || 'http://localhost:5001').replace(/\/$/, ''),
  },
  web: {
    bundler: 'metro',
  },
});


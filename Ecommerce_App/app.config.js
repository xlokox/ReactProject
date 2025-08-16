import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  name: config.name || 'EasyShop Mobile App',
  slug: config.slug || 'easyshop-mobile-app',
  extra: {
    // Values are injected from .env at build/dev time
    apiUrl: process.env.API_URL || 'http://localhost:5001/api',
    socketUrl: process.env.SOCKET_URL || 'http://localhost:5001',
  },
  web: {
    bundler: 'metro',
  },
});


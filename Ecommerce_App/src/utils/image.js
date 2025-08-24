// Shared product image utility for React Native
// Returns an Image "source" object compatible with <Image source={...} />
// Uses local placeholder asset for offline reliability

// Dedicated placeholder asset for offline reliability
// Local PNG placeholder that fits UI cards; using logo.png until dedicated placeholder is finalized
const PLACEHOLDER = require('../Images/logo.png');

export const getProductImageSource = (item) => {
  try {
    const url = Array.isArray(item?.images) && item.images[0] ? item.images[0] : null;
    if (typeof url === 'string' && url.trim().length > 0) {
      return { uri: url };
    }
  } catch (_) {}
  return PLACEHOLDER;
};

export default getProductImageSource;


// Products
export const saveProducts = (products) => {
  localStorage.setItem('tj-products', JSON.stringify(products));
};

export const loadProducts = () => {
  const saved = localStorage.getItem('tj-products');
  return saved ? JSON.parse(saved) : null;
};

export const clearProducts = () => {
  localStorage.removeItem('tj-products');
};

// Favorites
export const saveFavorites = (favorites) => {
  localStorage.setItem('tj-favorites', JSON.stringify(favorites));
};

export const getFavorites = () => {
  const saved = localStorage.getItem('tj-favorites');
  return saved ? JSON.parse(saved) : [];
};

export const clearFavorites = () => {
  localStorage.removeItem('tj-favorites');
};

// Cart
export const saveCart = (cart) => {
  localStorage.setItem('tj-cart', JSON.stringify(cart));
};

export const getCart = () => {
  const saved = localStorage.getItem('tj-cart');
  return saved ? JSON.parse(saved) : [];
};

export const clearCart = () => {
  localStorage.removeItem('tj-cart');
};

// Clear all data
export const clearAllData = () => {
  clearProducts();
  clearFavorites();
  clearCart();
};
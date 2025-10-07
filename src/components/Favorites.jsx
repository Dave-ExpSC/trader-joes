import React from 'react';

function Favorites({ favorites, products }) {
  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  return (
    <div className="favorites-section">
      <h2>My Favorites</h2>
      {favoriteProducts.length === 0 ? (
        <p>No favorites yet!</p>
      ) : (
        <div className="product-list">
          {favoriteProducts.map(product => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p className="price">${product.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
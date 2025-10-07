import React from 'react';
import { products } from '../data/sampleData';

function ProductList({ searchQuery, activeTab, favorites, toggleFavorite, addToCart }) {
  const getFilteredProducts = () => {
    let filteredProducts = products;

    if (searchQuery) {
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeTab === 'favorites') {
      filteredProducts = filteredProducts.filter(p =>
        favorites.includes(p.id)
      );
    }

    return filteredProducts;
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="products-grid">
      {filteredProducts.map(product => (
        <div key={product.id} className="card bg-base-200 shadow-sm">
          <div className="card-body p-3">
            <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
            <div className="text-xl font-bold mb-1 product-price">
              ${product.price.toFixed(2)}
            </div>
            <div className="text-xs opacity-70 mb-2">{product.category}</div>
            <div className="flex gap-2">
              <button
                className="btn btn-xs bg-base-300 border-0 text-2xl favorite-btn"
                style={{ color: favorites.includes(product.id) ? '#ff5252' : '#666' }}
                onClick={() => toggleFavorite(product.id)}
              >
                ♥
              </button>
              <button
                className="btn btn-xs btn-primary"
                onClick={() => addToCart(product)}
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
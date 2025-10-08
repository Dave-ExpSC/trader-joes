import React from 'react';

function ProductList({ products, searchQuery, activeTab, favorites, toggleFavorite, addToCart, deleteProduct, cart }) {
  const isInCart = (productId) => {
    return cart.some(item => item.id === productId);
  };

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
      {filteredProducts.length === 0 ? (
        <div style={{ 
          gridColumn: '1 / -1', 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#999' 
        }}>
          {activeTab === 'favorites' 
            ? 'No favorites yet. Click the ❤️ button on products to add them!'
            : searchQuery 
              ? `No products found matching "${searchQuery}"`
              : 'No products available'}
        </div>
      ) : (
        filteredProducts.map(product => (
          <div key={product.id} className="card bg-base-200 shadow-sm">
            <button
              className="delete-product-btn"
              onClick={() => deleteProduct(product.id)}
              title="Delete product"
            >
              ✕
            </button>
            <div className="card-body">
              <h3>{product.name}</h3>
              <div className="product-price">
                ${product.price.toFixed(2)}
              </div>
              <div className="text-xs">{product.category}</div>
              <div className="flex gap-2">
                <button
                  className="btn btn-xs bg-base-300 border-0 text-2xl favorite-btn"
                  style={{ color: favorites.includes(product.id) ? '#ff5252' : '#666' }}
                  onClick={() => toggleFavorite(product.id)}
                  title={favorites.includes(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favorites.includes(product.id) ? '❤️' : '🤍'}
                </button>
                <button
                  className={`btn btn-xs ${isInCart(product.id) ? 'btn-in-cart' : 'btn-primary'}`}
                  onClick={() => addToCart(product)}
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ProductList;
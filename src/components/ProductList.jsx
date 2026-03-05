import React from 'react';

function ProductList({ products, searchQuery, activeTab, favorites, toggleFavorite, addToCart, deleteProduct, editProduct, cart, selectedCategory, categories }) {
  const isInCart = (productId) => {
    return cart.some(item => item.id === productId);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Frozen': '❄️',
      'Pantry': '🥫',
      'Snacks': '🍿',
      'Produce': '🥬',
      'Fresh Prep': '🥗',
      'Dairy': '🧀'
    };
    return icons[category] || '📦';
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

    if (selectedCategory && selectedCategory !== 'All') {
      filteredProducts = filteredProducts.filter(p =>
        p.category === selectedCategory
      );
    }

    // Sort by category order matching the top nav, then by name
    const categoryOrder = (categories || []).filter(c => c !== 'All');
    filteredProducts.sort((a, b) => {
      const categoryDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      if (categoryDiff !== 0) return categoryDiff;
      return a.name.localeCompare(b.name);
    });

    return filteredProducts;
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="products-grid">
      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            {activeTab === 'favorites' ? '💝' : '🔍'}
          </div>
          <div className="empty-text">
            {activeTab === 'favorites'
              ? 'No favorites yet'
              : searchQuery
                ? `No products found for "${searchQuery}"`
                : 'No products available'}
          </div>
          <div className="empty-hint">
            {activeTab === 'favorites'
              ? 'Click the ❤️ button on products to add them!'
              : 'Try adjusting your search or filters'}
          </div>
        </div>
      ) : (
        filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            {editProduct && (
              <button
                className="edit-product-btn"
                onClick={() => editProduct(product)}
                title="Edit product"
              >
                ✏️
              </button>
            )}
            {deleteProduct && (
              <button
                className="delete-product-btn"
                onClick={() => deleteProduct(product.id)}
                title="Delete product"
              >
                ✕
              </button>
            )}
            <div className={`category-badge category-${product.category.toLowerCase().replace(/\s+/g, '-')}`}>
              <span className="category-icon">{getCategoryIcon(product.category)}</span>
              {product.category}
            </div>
            {product.imageUrl && (
              <div className="product-image-container">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="product-image"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
            <div className="card-body">
              <h3 className="product-name">{product.name}</h3>
              <div className="product-price">
                ${product.price.toFixed(2)}
              </div>
              <div className="card-actions">
                <button
                  className={`favorite-btn ${favorites.includes(product.id) ? 'active' : ''}`}
                  onClick={() => toggleFavorite(product.id)}
                  title={favorites.includes(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favorites.includes(product.id) ? '❤️' : '🤍'}
                </button>
                <button
                  className={`add-btn ${isInCart(product.id) ? 'in-cart' : ''}`}
                  onClick={() => addToCart(product)}
                >
                  {isInCart(product.id) ? '✓ Added' : '+ Add'}
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
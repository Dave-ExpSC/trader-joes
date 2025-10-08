import React, { useState, useEffect } from 'react';
import './App.css';
import ProductList from './components/ProductList';
import ShoppingList from './components/ShoppingList';
import { loadProducts, saveProducts } from './utils/localStorage';
import { products as sampleProducts } from './data/sampleData';

function App() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'Frozen'
  });

  // Load data on mount
  useEffect(() => {
    const savedProducts = loadProducts();
    if (savedProducts && savedProducts.length > 0) {
      setProducts(savedProducts);
    } else {
      setProducts(sampleProducts);
      saveProducts(sampleProducts);
    }

    const savedFavorites = JSON.parse(localStorage.getItem('tj-favorites') || '[]');
    const savedCart = JSON.parse(localStorage.getItem('tj-cart') || '[]');
    
    setFavorites(savedFavorites);
    setCart(savedCart);
  }, []);

  // Save products when they change
  useEffect(() => {
    if (products.length > 0) {
      saveProducts(products);
    }
  }, [products]);

  // Save favorites when they change
  useEffect(() => {
    localStorage.setItem('tj-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save cart when it changes
  useEffect(() => {
    localStorage.setItem('tj-cart', JSON.stringify(cart));
  }, [cart]);

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleSearch = () => {
    setActiveTab('all');
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price) {
      const product = {
        id: Date.now(),
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category
      };
      setProducts(prev => [...prev, product]);
      setNewProduct({ name: '', price: '', category: 'Frozen' });
      setShowAddProduct(false);
    }
  };

  const deleteProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product && window.confirm(`Delete "${product.name}"?\n\nThis will remove it from your product list.`)) {
      // Remove from products
      setProducts(prev => prev.filter(p => p.id !== productId));
      // Remove from favorites if it's there
      setFavorites(prev => prev.filter(id => id !== productId));
      // Remove from cart if it's there
      setCart(prev => prev.filter(item => item.id !== productId));
    }
  };

  return (
    <div className="app-container">
      <div className="main-section">
        <div className="header">
          <span className="header-icon">🛒</span>
          <h1 className="header-title">Trader Joe's Products</h1>
        </div>

        <div className="search-bar">
          <div className="tabs tabs-boxed bg-base-200">
            <button 
              className={`tab ${activeTab === 'all' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Products
            </button>
            <button 
              className={`tab ${activeTab === 'favorites' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              ⭐ Favorites
            </button>
          </div>
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search products..."
              className="input input-bordered flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            {searchQuery && (
              <button 
                className="clear-search-btn"
                onClick={clearSearch}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleSearch}
          >
            Search
          </button>
          <button 
            className="btn btn-success"
            onClick={() => setShowAddProduct(!showAddProduct)}
          >
            + Add Product
          </button>
        </div>

        {showAddProduct && (
          <div className="add-product-form">
            <input
              type="text"
              placeholder="Product name"
              className="input input-bordered"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              className="input input-bordered"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            />
            <select
              className="select select-bordered"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            >
              <option>Frozen</option>
              <option>Pantry</option>
              <option>Snacks</option>
              <option>Produce</option>
              <option>Dairy</option>
            </select>
            <button 
              className="btn btn-success"
              onClick={handleAddProduct}
            >
              Add
            </button>
            <button 
              className="btn btn-ghost"
              onClick={() => setShowAddProduct(false)}
            >
              Cancel
            </button>
          </div>
        )}

        <ProductList
          products={products}
          searchQuery={searchQuery}
          activeTab={activeTab}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          addToCart={addToCart}
          deleteProduct={deleteProduct}
          cart={cart}
        />
      </div>

      <ShoppingList
        cart={cart}
        removeFromCart={removeFromCart}
      />
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import './App.css';
import ProductList from './components/ProductList';
import ShoppingList from './components/ShoppingList';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);

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
          <input
            type="text"
            placeholder="Search products..."
            className="input input-bordered flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            className="btn btn-primary"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        <ProductList
          searchQuery={searchQuery}
          activeTab={activeTab}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          addToCart={addToCart}
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

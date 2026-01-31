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

  const clearCart = () => {
    setCart([]);
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

  const exportProducts = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trader-joes-products.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importProducts = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedProducts = JSON.parse(e.target.result);
        if (!Array.isArray(importedProducts)) {
          alert('Invalid file format. Expected an array of products.');
          return;
        }

        // Merge: add products that don't already exist (by name)
        setProducts(prev => {
          const existingNames = prev.map(p => p.name.toLowerCase());
          const newProducts = importedProducts.filter(
            p => !existingNames.includes(p.name.toLowerCase())
          );

          // Assign new IDs to avoid conflicts
          const productsWithNewIds = newProducts.map(p => ({
            ...p,
            id: Date.now() + Math.random()
          }));

          if (newProducts.length === 0) {
            alert('No new products to import. All products already exist.');
            return prev;
          }

          alert(`Imported ${newProducts.length} new product(s).`);
          return [...prev, ...productsWithNewIds];
        });
      } catch (error) {
        alert('Error reading file. Please make sure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be imported again
    event.target.value = '';
  };

  const resetToDefaults = () => {
    if (window.confirm('Reset to default products?\n\nThis will remove all custom products and restore the original 12 items.')) {
      setProducts(sampleProducts);
      setFavorites([]);
      setCart([]);
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
          <button
            className="btn btn-outline"
            onClick={exportProducts}
            title="Download products as JSON file"
          >
            ↓ Export
          </button>
          <label
            className="btn btn-outline"
            title="Import products from JSON file"
          >
            ↑ Import
            <input
              type="file"
              accept=".json"
              onChange={importProducts}
              style={{ display: 'none' }}
            />
          </label>
          <button
            className="btn btn-outline btn-warning"
            onClick={resetToDefaults}
            title="Reset to default products"
          >
            ↺ Reset
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
        clearCart={clearCart}
      />
    </div>
  );
}

export default App;
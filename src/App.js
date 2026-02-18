import React, { useState, useEffect } from 'react';
import './App.css';
import ProductList from './components/ProductList';
import ShoppingList from './components/ShoppingList';
import Login from './components/Login';
import { useAuth } from './context/AuthContext';
import { loadProducts, saveProducts } from './utils/localStorage';
import { products as sampleProducts } from './data/sampleData';
import {
  saveProductsToFirebase,
  saveFavoritesToFirebase,
  saveCartToFirebase,
  loadDataFromFirebase,
  subscribeToFirebaseUpdates
} from './firebase/firebaseService';

function App() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'Frozen',
    imageUrl: ''
  });
  const [selectedCategory, setSelectedCategory] = useState('All');
  // Flag to prevent save effects from firing when data comes in from Firebase
  const isFirebaseUpdate = React.useRef(false);

  const categories = ['All', 'Produce', 'Pantry', 'Snacks', 'Frozen', 'Dairy'];

  // Load data when user changes
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        // Try to load from Firebase first
        const firebaseData = await loadDataFromFirebase(user.uid);

        if (firebaseData) {
          // Load from Firebase
          if (firebaseData.products && firebaseData.products.length > 0) {
            setProducts(firebaseData.products);
            saveProducts(firebaseData.products); // Sync to localStorage
          }
          if (firebaseData.favorites) {
            setFavorites(firebaseData.favorites);
            localStorage.setItem('tj-favorites', JSON.stringify(firebaseData.favorites));
          }
          if (firebaseData.cart) {
            setCart(firebaseData.cart);
            localStorage.setItem('tj-cart', JSON.stringify(firebaseData.cart));
          }
        } else {
          // New user - load sample products
          setProducts(sampleProducts);
          saveProducts(sampleProducts);
          saveProductsToFirebase(user.uid, sampleProducts);
          setFavorites([]);
          setCart([]);
        }
      } catch (error) {
        console.error('Error loading from Firebase, using localStorage:', error);
        // Fallback to localStorage if Firebase fails
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
      }
    };

    loadData();

    // Subscribe to real-time Firebase updates
    const unsubscribe = subscribeToFirebaseUpdates(user.uid, (data) => {
      // Set flag so save effects don't write back to Firebase
      isFirebaseUpdate.current = true;
      if (data.products) {
        setProducts(data.products);
        saveProducts(data.products);
      }
      if (data.favorites) {
        setFavorites(data.favorites);
        localStorage.setItem('tj-favorites', JSON.stringify(data.favorites));
      }
      if (data.cart) {
        setCart(data.cart);
        localStorage.setItem('tj-cart', JSON.stringify(data.cart));
      }
      // Reset flag after state updates are queued
      setTimeout(() => { isFirebaseUpdate.current = false; }, 500);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  // Save products when they change (skip if update came from Firebase)
  useEffect(() => {
    if (user && products.length > 0 && !isFirebaseUpdate.current) {
      saveProducts(products);
      saveProductsToFirebase(user.uid, products);
    }
  }, [products, user]);

  // Save favorites when they change (skip if update came from Firebase)
  useEffect(() => {
    if (user && !isFirebaseUpdate.current) {
      localStorage.setItem('tj-favorites', JSON.stringify(favorites));
      saveFavoritesToFirebase(user.uid, favorites);
    }
  }, [favorites, user]);

  // Save cart when it changes (skip if update came from Firebase)
  useEffect(() => {
    if (user && !isFirebaseUpdate.current) {
      localStorage.setItem('tj-cart', JSON.stringify(cart));
      saveCartToFirebase(user.uid, cart);
    }
  }, [cart, user]);

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
      if (editingProduct) {
        // Update existing product
        setProducts(prev => prev.map(p =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: newProduct.name,
                price: parseFloat(newProduct.price),
                category: newProduct.category,
                imageUrl: newProduct.imageUrl || ''
              }
            : p
        ));
        setEditingProduct(null);
      } else {
        // Add new product
        const product = {
          id: Date.now(),
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          imageUrl: newProduct.imageUrl || ''
        };
        setProducts(prev => [...prev, product]);
      }
      setNewProduct({ name: '', price: '', category: 'Frozen', imageUrl: '' });
      setShowAddProduct(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      imageUrl: product.imageUrl || ''
    });
    setShowAddProduct(true);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setNewProduct({ name: '', price: '', category: 'Frozen', imageUrl: '' });
    setShowAddProduct(false);
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

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <div className="main-section">
        <div className="header">
          <span className="header-icon">🛒</span>
          <h1 className="header-title">Trader Joe's Products</h1>
          <div className="header-user">
            {user.photoURL && <img src={user.photoURL} alt="avatar" className="user-avatar" />}
            <span className="user-name">{user.displayName || user.email}</span>
            <button className="btn-signout" onClick={logout}>Sign out</button>
          </div>
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

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-chip ${selectedCategory === category ? 'active' : ''} category-${category.toLowerCase()}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
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
            <input
              type="text"
              placeholder="Image URL (optional)"
              className="input input-bordered image-url-input"
              value={newProduct.imageUrl}
              onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
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
              {editingProduct ? 'Save' : 'Add'}
            </button>
            <button
              className="btn btn-ghost"
              onClick={handleCancelEdit}
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
          editProduct={handleEditProduct}
          cart={cart}
          selectedCategory={selectedCategory}
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
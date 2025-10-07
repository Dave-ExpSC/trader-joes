import React, { useState, useEffect } from 'react';
import { getProducts } from '../data/productData';
import { getFavorites, saveFavorites } from '../utils/localStorage';

export default function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setProducts(getProducts());
    setFavorites(getFavorites());
  }, []);

  const handleSearch = () => {
    let filtered = getProducts();
    
    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setProducts(filtered);
  };

  const toggleFavorite = (product) => {
    const isFavorited = favorites.some(f => f.id === product.id);
    
    let newFavorites;
    if (isFavorited) {
      newFavorites = favorites.filter(f => f.id !== product.id);
    } else {
      newFavorites = [...favorites, product];
    }
    
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const isFavorited = (productId) => {
    return favorites.some(f => f.id === productId);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-2">
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="select select-bordered select-sm"
        >
          <option value="all">All Categories</option>
          <option value="snacks">Snacks</option>
          <option value="beverages">Beverages</option>
          <option value="bakery">Bakery</option>
          <option value="frozen">Frozen</option>
          <option value="dairy">Dairy & Cheese</option>
          <option value="pantry">Pantry Staples</option>
        </select>
        
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search products..."
          className="input input-bordered input-sm flex-1"
        />
        
        <button 
          onClick={handleSearch}
          className="btn btn-primary btn-sm"
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {products.map(product => (
          <div key={product.id} className="card card-compact bg-base-200">
            <div className="card-body">
              <div className="text-2xl">{product.emoji}</div>
              <h3 className="font-semibold text-sm">{product.name}</h3>
              <p className="text-xs opacity-70">
                ${product.price} • {product.categoryLabel}
              </p>
              <div className="card-actions justify-end">
                <button 
                  onClick={() => toggleFavorite(product)}
                  className={`btn btn-ghost btn-xs ${
                    isFavorited(product.id) ? 'text-warning' : ''
                  }`}
                >
                  {isFavorited(product.id) ? '★' : '⭐'} 
                  {isFavorited(product.id) ? 'Favorited' : 'Favorite'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="divider"></div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold">My Favorites</h3>
          <div className="badge badge-primary badge-sm">
            {favorites.length}
          </div>
        </div>
        
        {favorites.length === 0 ? (
          <div className="text-sm opacity-70">
            No favorites yet. Click ⭐ to add products!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {favorites.map(fav => (
              <div 
                key={fav.id}
                className="flex items-center justify-between p-2 bg-base-300 rounded"
              >
                <div className="flex items-center gap-2">
                  <span>{fav.emoji}</span>
                  <div>
                    <div className="text-sm font-semibold">{fav.name}</div>
                    <div className="text-xs opacity-70">${fav.price}</div>
                  </div>
                </div>
                <button 
                  onClick={() => toggleFavorite(fav)}
                  className="btn btn-ghost btn-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductSearch;
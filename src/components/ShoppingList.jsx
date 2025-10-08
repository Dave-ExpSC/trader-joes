import React from 'react';

function ShoppingList({ cart, removeFromCart }) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = () => {
    if (cart.length > 0) {
      alert(`Checkout - Total: $${total.toFixed(2)}\n\nItems:\n${cart.map(item => `${item.name} - $${item.price.toFixed(2)}`).join('\n')}`);
    }
  };

  return (
    <div className="shopping-list-panel">
      <h2 className="text-lg font-bold">Shopping List</h2>
      <div className="list-items">
        {cart.length === 0 ? (
          <div className="text-sm opacity-50 text-center py-8">
            No items yet. Click "+ Add" to add products!
          </div>
        ) : (
          cart.map((item, index) => (
            <div key={index} className="cart-item">
              <div className="flex-1">
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="text-xs opacity-70">${item.price.toFixed(2)}</div>
              </div>
              <button
                className="btn btn-xs btn-ghost"
                onClick={() => removeFromCart(index)}
                title="Remove from cart"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-base-300 pt-3">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Total:</span>
          <span className="total-price">
            ${total.toFixed(2)}
          </span>
        </div>
        <button 
          className="btn btn-primary w-full" 
          disabled={cart.length === 0}
          onClick={handleCheckout}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}

export default ShoppingList;
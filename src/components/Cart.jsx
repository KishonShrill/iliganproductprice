import React, { forwardRef } from "react";

const Cart = React.memo(forwardRef(({cart, setCart}, ref) => {
  const total = Object.values(cart).reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="cart-summary">
      <h2>Shopping Cart</h2>
      <div className="cart-items" id="cartItems" ref={ref}>
        {Object.keys(cart).length === 0 ? (
          <p className="cart-item">Cart is empty</p>
        ) : (
          Object.entries(cart).map(([productId, item]) => (
            <p 
              key={productId} 
              className="cart-item" 
              data-product-id={productId}
              onClick={() => {
                setCart(prev => {
                  const updated = { ...prev };
                  if (updated[productId].quantity > 1) {
                    updated[productId].quantity -= 1;
                  } else {
                    delete updated[productId];
                  }
                  return updated;
                });
              }}
            >
              {item.name} x{item.quantity} <span className="item-price">₱{item.price.toFixed(2)}</span>
            </p>
          ))
        )}
      </div>
      <div className="cart-total">Total: ₱{total.toFixed(2)}</div>
    </div>
  );
}));

export default Cart;
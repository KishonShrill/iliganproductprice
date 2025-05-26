import React, { useEffect, useState } from 'react';
import '../styles/receipt.scss';

function ReceiptPage() {
  const [cart, setCart] = useState({});

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  const total = Object.values(cart).reduce(
    (acc, item) => acc + item.price * item.quantity, 0
  );

  return (
    <div className="receipt-container">
      <h2>🧾 Receipt</h2>
      {Object.keys(cart).length === 0 ? (
        <div className="empty-receipt">
          <p>Your receipt is empty.</p>
          <a href="/groceries" className="start-shopping-btn">Start Adding Items</a>
        </div>
      ) : (
        <>
          <div className="receipt-items">
            {Object.entries(cart).map(([productId, item]) => (
              <div key={productId} className="receipt-item">
                <span className="item-name">{item.name}</span>
                <span className="item-qty">x{item.quantity}</span>
                <span className="item-price">₱{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="receipt-total">Total: ₱{total.toFixed(2)}</div>
        </>
      )}
    </div>
  );
}
export default React.memo(ReceiptPage)
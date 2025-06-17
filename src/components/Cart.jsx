import React, { forwardRef } from "react";
import PropTypes from "prop-types";

const Cart = React.memo(forwardRef(({storage, onRemove, reciept}, ref) => {
  const cartItemQuantity = Object.keys(storage.cart).length;
  const groupedEntries = Object.entries(storage.cart).reduce((acc, [id, item]) => {
    // console.log(id)
    if (!acc[item.location]) acc[item.location] = []
    acc[item.location].push({...item, id})
    return acc;
  }, {});
  const cartItemEntries = Object.entries(groupedEntries);
  const total = Object.values(storage.cart).reduce((acc, item) => acc + item.price * item.quantity, 0);

  // console.log(cartItemEntries);

  return (
    <div className="cart-summary" style={{left: reciept}}>
      <h2>🛒 Shopping Cart</h2>
      <div className="cart-items" id="cartItems" ref={ref}>
        {cartItemQuantity === 0 
          ? (
          <p className="cart-item">Cart is empty</p>
        ) : (
        
          // cartItemEntries.map(([productId, item]) => {
          //   if (!item || typeof item.price !== 'number') {
          //     console.warn("Invalid cart item:", item);
          //     return null; // skip this item
          //   }
          //   console.log(productId)
          //   return (
          //     <p 
          //       key={productId} 
          //       className="cart-item" 
          //       data-product-id={productId}
          //       onClick={() => {onRemove(productId);}}
          //     >
          //       {item.name} x{item.quantity} <span className="item-price">₱{item.price.toFixed(2)}</span>
          //     </p>
          //   )  
          // })

          cartItemEntries.map(([category, items]) => {
            return (
              <div key={category} className="cart-category-group">
                <p className="cart-category">{category}</p>
                <ul>
                  {items.map((item) => {
                    // console.log(item)
                    return (
                      <li 
                        key={item.id}
                        className="cart-item" 
                        data-product-id={item.id}
                        onClick={() => onRemove(item.id)}
                      >
                        <p>
                          {item.name} &nbsp;
                          <span className="cart-item-quantity">x{item.quantity}</span>
                        </p>
                        <span className="item-price">₱{item.price.toFixed(2)}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })

        )}
      </div>
      <div className="cart-total">Total: ₱{total.toFixed(2)}</div>
    </div>
  );
}));

// 👇 Give the component a name for debugging purposes
Cart.displayName = "Cart";

// 👇 Define PropTypes
Cart.propTypes = {
  storage: PropTypes.shape({
    cart: PropTypes.objectOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
        price: PropTypes.number.isRequired,
      })
    ).isRequired
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  reciept: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default Cart;
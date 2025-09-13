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
    <div className="cart-summary dark:bg-gray-500" style={{left: reciept}}>
      <h2 className="dark:border-b-gray-600 dark:text-gray-200">🛒 Shopping Cart</h2>
      <div className="cart-items" id="cartItems" ref={ref}>
        {cartItemQuantity === 0 
          ? (
          <p className="cart-item dark:text-gray-200">Cart is empty</p>
        ) : (
          cartItemEntries.map(([category, items]) => {
            return (
              <div key={category} className="cart-category-group">
                <p className="cart-category dark:text-orange-500 font-bold">{category}</p>
                <ul>
                  {items.map((item) => {
                    // console.log(item)
                    return (
                      <li 
                        key={item.id}
                        className="cart-item dark:border-gray-600" 
                        data-product-id={item.id}
                        onClick={() => onRemove(item.id)}
                      >
                        <p className="dark:text-gray-200">
                          {item.name} &nbsp;
                          <span className="cart-item-quantity">x{item.quantity}</span>
                        </p>
                        <span className="item-price dark:text-gray-200">₱{item.price.toFixed(2)}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })
        )}
      </div>
      <div className="cart-total dark:border-t-gray-600 dark:text-gray-200">Total: ₱{total.toFixed(2)}</div>
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

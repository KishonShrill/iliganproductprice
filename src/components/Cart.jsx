export default function Cart() {
  return (
    <div className="cart-summary">
      <h2>Shopping Cart</h2>
      <div className="cart-items" id="cartItems">
        <p className="cart-item">Cart is empty</p>
      </div>
      <div className="cart-total">Total: ₱<span id="cartTotal">0.00</span></div>
    </div>
  );
}
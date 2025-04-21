import React from "react";

const ProductCard = React.memo(({ item, onAdd }) => (
  <div className="product-card" 
    data-product-id={item._id}
    data-product-name={item.product_name}
    data-product-price={item.updated_price}
  >
    <div className="product-image-placeholder" style={{ backgroundColor: "#ffccaa" }}></div>
    <div className="product-details">
      <div className="product-name">{item.product_name}</div>
      <div className="product-info">{item.product_id} | {item.date_updated}</div>
      <div className="product-price">₱{item.updated_price}</div>
      <button
        className="add-to-cart-btn"
        data-product-id={item._id}
        data-product-name={item.product_name}
        data-product-price={item.updated_price}
        onClick={onAdd}>
        Add to Cart
      </button>
    </div>
  </div>
));

export default ProductCard;
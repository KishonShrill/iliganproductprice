import React from "react";
import PropTypes from "prop-types";

const ProductCard = ({ item, onAdd }) => (
  <div className="product-card" 
    data-product-id={item._id}
    data-product-name={item.product_name}
    data-product-price={item.updated_price}
  >
    {item.imageUrl ? (
      <div className="relative">
        <img className="product-image" src={item.imageUrl} alt={`${item.product_id} Photo`} />
        <div className="product-info-inline absolute">{`🌏 ${item.location_info.location_name}`}</div>
      </div>
    ) : (
      <div className="relative">
        <div className="product-image-placeholder" style={{ backgroundColor: "#ffccaa" }}></div>
        <div className="product-info-inline absolute">{`🌏 ${item.location_info.location_name}`}</div>
      </div>
    )}
    <div className="product-details">
      <div className="product-name">{item.product_name}</div>
      <div className="product-info">{`⏰ ${item.date_updated}`}</div>
      { item?.category_info?.category_catalog
        ? <div className="product-info">{`🌏 ${item?.category_info?.category_catalog}`}</div>
        : <div className="product-info">{`🌏 NULL`}</div>
      }
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
);

ProductCard.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string,
    product_id: PropTypes.string,
    product_name: PropTypes.string,
    updated_price: PropTypes.number,
    imageUrl: PropTypes.string,
    date_updated: PropTypes.string,
    location_info: PropTypes.shape({
      location_name: PropTypes.string,
    }),
    category_info: PropTypes.shape({
      category_catalog: PropTypes.string,
    }),
  }).isRequired,
  onAdd: PropTypes.func.isRequired,
};


export default React.memo(ProductCard);
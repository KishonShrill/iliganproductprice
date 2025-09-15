import React from "react";
import PropTypes from "prop-types";
import { Package } from "lucide-react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { mongoDateToText } from "../helpers/date";

const ProductCard = ({ item, onAdd, settings }) => {
    return (
  <div className="product-card" 
    data-product-id={item._id}
    data-product-name={item.product.product_name}
    data-product-price={item.updated_price}
  >
    { !settings.hidePhotos && (
      item.product.imageUrl ? (
        <div className="relative h-full">
          <LazyLoadImage className="product-image" src={item.product.imageUrl} alt={`${item.product.product_id} Photo`} />
          <div className="product-info-inline absolute">{`🌏 ${item.location.name}`}</div>
        </div>
      ) : (
        <div className="relative h-full">
          <div className="product-image-placeholder" style={{ backgroundColor: "#ffccaa" }}>
              <Package className="w-16 h-16 text-gray-400" />
          </div>
          <div className="product-info-inline absolute">{`🌏 ${item.location.name}`}</div>
        </div>
    ))}
    <div className={`product-details dark:bg-gray-700 ${settings.hidePhotos ? 'col-span-2' : ''}`}>
      <div className="product-name dark:text-gray-200">{item.product.product_name}</div>
      <div className="product-info dark:text-white">{`⏰ ${mongoDateToText(item.date_updated)}`}</div>
      { item?.category?.catalog
        ? <div className="product-info dark:text-white">{`🌏 ${item?.category?.catalog}`}</div>
        : <div className="product-info dark:text-white">{`🌏 n/a`}</div>
      }
      <div className="product-price">₱{item.updated_price}</div>
      <button
        className="add-to-cart-btn"
        data-product-id={item._id}
        data-product-name={item.product.product_name}
        data-product-price={item.updated_price}
        data-product-location={item.location.name}
        data-product-image={item.product.imageUrl}
        onClick={onAdd}>
        Add to Cart
      </button>
    </div>
  </div>
)};

ProductCard.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string,
    product: PropTypes.shape({
        product_id: PropTypes.string,
        product_name: PropTypes.string,
        imageUrl: PropTypes.string,
    }),
    updated_price: PropTypes.number,
    date_updated: PropTypes.string,
    location: PropTypes.shape({
      name: PropTypes.string,
    }),
    category: PropTypes.shape({
      catalog: PropTypes.string,
    }),
  }).isRequired,
  onAdd: PropTypes.func.isRequired,
};


export default React.memo(ProductCard);

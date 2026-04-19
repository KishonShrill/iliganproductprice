import React from "react";
import PropTypes from "prop-types";
import {
    Package,
    MapPin,
    Clock,
    Tag,
    Plus
} from "lucide-react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { mongoDateToText } from "../helpers/date";
import useSettings from "@/hooks/useSettings";

const ProductCard = ({ item, onAdd }) => {
    const { settings } = useSettings();
    return (
        <div className={`product-card ${!settings.hidePhotos && 'grid-cols-2'} group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-lg`}
            data-product-id={item._id}
            data-product-name={item.product.product_name}
            data-product-price={item.updated_price}
        >
            {!settings.hidePhotos && (
                <div className="relative h-full aspect-square w-full overflow-hidden rounded-xl bg-gray-50">
                    {item.product.imageUrl ? (
                        <LazyLoadImage
                            src={item.product.imageUrl}
                            alt={item.product.product_name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="relative h-full">
                            <div className="product-image-placeholder" style={{ backgroundColor: "#ffccaa" }}>
                                <Package className="w-16 h-16 text-gray-400" />
                            </div>
                        </div>
                    )}

                    {/* Floating Location Tag */}
                    <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                        <MapPin size={10} className="text-orange-400" />
                        <span className="max-w-[100px] truncate">{item.location.name.split(' - ')[0]}</span>
                    </div>

                </div>
            )}

            <div className="sm:mt-4 flex flex-1 flex-col">
                <h3 className="line-clamp-2 text-sm font-bold leading-tight text-gray-800">
                    {item.product.product_name}
                </h3>

                <div className="my-2 flex flex-wrap gap-x-2 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                        <Clock size={12} /> {mongoDateToText(item.date_updated)}
                    </span>
                    <span className="flex items-center gap-1 text-blue-500">
                        <Tag size={12} /> {item?.category?.catalog}
                    </span>
                </div>

                <div className="mt-auto flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Price</span>
                        <span className="text-lg font-black text-orange-500">
                            ₱{item.updated_price.toFixed(2)}
                        </span>
                    </div>

                    {onAdd && (
                        <button
                            data-product-id={item._id}
                            data-product-name={item.product.product_name}
                            data-product-price={item.updated_price}
                            data-product-location={item.location.name}
                            data-product-image={item.product.imageUrl}
                            onClick={onAdd}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition-transform hover:scale-110 hover:bg-orange-600 active:scale-95"
                            aria-label="Add to cart"
                        >
                            <Plus size={20} strokeWidth={3} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
};

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
    onAdd: PropTypes.func,
};


export default React.memo(ProductCard);

"use client";

import React from "react";
import Image from "next/image";
import { Package, MapPin, Clock, Tag, Plus } from "lucide-react";
import { mongoDateToText } from "@/helpers/date";
import useSettings from "@/hooks/useSettings";

// 1. Define the exact shape of your data based on your old PropTypes
export interface ProductItem {
    _id: string;
    product: {
        product_id?: string;
        product_name: string;
        imageUrl?: string;
    };
    updated_price: number;
    date_updated: string;
    location: {
        name: string;
    };
    category?: {
        catalog: string;
    };
}

interface ProductCardProps {
    item: ProductItem;
    // Update the onAdd type. Depending on how you use it, 
    // it might need to accept the MouseEvent or the item itself.
    onAdd?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ProductCard = ({ item, onAdd }: ProductCardProps) => {
    const { settings } = useSettings();

    return (
        <div
            className={`product-card ${!settings.hidePhotos ? 'grid-cols-2' : ''} group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-lg`}
            data-product-id={item._id}
            data-product-name={item.product.product_name}
            data-product-price={item.updated_price}
        >
            {!settings.hidePhotos && (
                <div className="relative h-full aspect-square w-full overflow-hidden rounded-xl bg-gray-50">
                    {item.product.imageUrl ? (
                        /* Next.js Image Component Replaces LazyLoadImage */
                        <Image
                            src={item.product.imageUrl}
                            alt={item.product.product_name}
                            fill /* 'fill' allows the image to expand to the parent div's size */
                            sizes="(max-width: 768px) 50vw, 33vw" /* Helps Next.js optimize image sizes */
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="relative h-full">
                            <div className="flex h-full items-center justify-center" style={{ backgroundColor: "#ffccaa" }}>
                                <Package className="w-16 h-16 text-gray-400" />
                            </div>
                        </div>
                    )}

                    {/* Floating Location Tag */}
                    <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                        <MapPin size={10} className="text-orange-400" />
                        <span className="max-w-25 truncate">{item.location.name.split(' - ')[0]}</span>
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
                    {item.category && (
                        <span className="flex items-center gap-1 text-blue-500">
                            <Tag size={12} /> {item.category.catalog}
                        </span>
                    )}
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
    );
};

export default React.memo(ProductCard);

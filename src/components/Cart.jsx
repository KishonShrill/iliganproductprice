import React, { forwardRef, useState } from "react";
import PropTypes from "prop-types";
import {
    ShoppingCart,
    TrendingUp,
    Trash2,
    Package,
    AlertTriangle
} from "lucide-react";

const Cart = React.memo(forwardRef(({ storage, onRemove, onRemoveLocation, reciept }, ref) => {
    const [locationToClear, setLocationToClear] = useState(null);

    const cartItemQuantity = Object.keys(storage.cart).length;
    console.log(cartItemQuantity)
    const groupedEntries = Object.entries(storage.cart).reduce((acc, [id, item]) => {
        // console.log(id)
        if (!acc[item.location]) acc[item.location] = []
        acc[item.location].push({ ...item, id })
        return acc;
    }, {});

    const cartItemEntries = Object.entries(groupedEntries);
    const total = Object.values(storage.cart).reduce((acc, item) => acc + item.price * item.quantity, 0);

    const confirmClearLocation = () => {
        if (locationToClear && onRemoveLocation) {
            onRemoveLocation(locationToClear);
        }
        setLocationToClear(null);
    };

    return (
        <>
            <div ref={ref} className="cart-summary dark:bg-gray-500 z-10" style={{ left: reciept }}>
                <div className="flex h-full flex-col">
                    {/* Cart Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="text-orange-500" />
                            <h2 className="text-lg font-bold text-gray-800">Shopping Cart</h2>
                        </div>
                        <button className="rounded-full p-2 text-gray-400 hover:bg-gray-100 lg:hidden">
                            <TrendingUp size={20} />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto max-md:p-4">
                        {cartItemQuantity === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-gray-400">
                                <ShoppingCart size={48} className="mb-4 opacity-20" />
                                <p>Your cart is empty.</p>
                                <p className="text-sm">Start adding some items!</p>
                            </div>
                        ) : (
                            cartItemEntries.map(([category, items]) => (
                                <div key={category} className="last:mb-0">
                                    {/* Group Header with Clear Button */}
                                    <div className="flex items-center justify-center border-b border-gray-100 py-4">
                                        <button
                                            onClick={() => setLocationToClear(category)}
                                        >
                                            <p className="p-2 cart-category text-sm hover:bg-red-500 text-gray-800 hover:text-white dark:text-orange-500 font-bold rounded-lg">
                                                {category}
                                            </p>
                                        </button>
                                    </div>

                                    {/* Item List */}
                                    <ul key={category} className="max-md:space-y-4 space-y-2">
                                        {items.map((item) => (
                                            <li key={item.id} className="flex items-center gap-3 rounded-xl border border-gray-50 bg-white p-2 shadow-sm">
                                                {item.image ? (
                                                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="h-12 w-12 relative">
                                                        <div className="product-image-placeholder" style={{ backgroundColor: "#ffccaa" }}>
                                                            <Package className="w-8 h-8 text-gray-400" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="truncate text-sm font-semibold text-gray-800">{item.name}</h4>
                                                    <p className="text-xs text-gray-500">₱{item.price.toFixed(2)} <span className="text-orange-500 font-bold">x{item.quantity}</span></p>
                                                </div>
                                                <button
                                                    onClick={() => onRemove(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul >
                                </div>))

                        )}
                    </div>

                    {/* Cart Footer / Total */}
                    <div className="border-t border-gray-100 bg-gray-50 max-lg:px-6">
                        <div className="flex items-center justify-between my-4">
                            <span className="text-gray-600 font-medium">Estimated Total</span>
                            <span className="max-lg:text-2xl text-xl font-black text-gray-900">₱{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div >

            {locationToClear && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-4 text-red-600">
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Clear Location?</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed text-center">
                            Are you sure you want to remove all items from <span className="font-bold text-gray-900">{locationToClear}</span>? This cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setLocationToClear(null)}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmClearLocation}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
                            >
                                Yes, Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
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
    onRemoveLocation: PropTypes.func.isRequired,
    reciept: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default Cart;

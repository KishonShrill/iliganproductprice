import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import {
    ShoppingCart,
    TrendingUp,
    Trash2,
    Package
} from "lucide-react";

const Cart = React.memo(forwardRef(({ storage, onRemove, reciept }, ref) => {
    const cartItemQuantity = Object.keys(storage.cart).length;
    const groupedEntries = Object.entries(storage.cart).reduce((acc, [id, item]) => {
        // console.log(id)
        if (!acc[item.location]) acc[item.location] = []
        acc[item.location].push({ ...item, id })
        return acc;
    }, {});
    const cartItemEntries = Object.entries(groupedEntries);
    const total = Object.values(storage.cart).reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
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
                <div className="flex-1 overflow-y-auto p-4">
                    {cartItemQuantity.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-gray-400">
                            <ShoppingCart size={48} className="mb-4 opacity-20" />
                            <p>Your cart is empty.</p>
                            <p className="text-sm">Start adding some items!</p>
                        </div>
                    ) : (

                        cartItemEntries.map(([category, items]) => (<>
                            <p className="cart-category dark:text-orange-500 font-bold">{category}</p>
                            <ul key={category} className="space-y-4">
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
                        </>))

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

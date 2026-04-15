import { ADD, REMOVE, UPDATE_QUANTITY, CLEAR_LOCATION, CLEAR_ALL } from "../actions/cartActions";

const initialState = (() => {
    try {
        const storedCart = localStorage.getItem('cart');
        return storedCart ? JSON.parse(storedCart) : {};
    } catch (e) {
        console.log(e)
        return {};
    }
})();

const cartReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD:
            return {
                ...state,
                [action.payload.product_id]: state[action.payload.product_id]
                    ? {
                        ...state[action.payload.product_id],
                        quantity: state[action.payload.product_id].quantity + 1,
                    }
                    : {
                        name: action.payload.product_name,
                        price: action.payload.product_price,
                        quantity: 1,
                        location: action.payload.product_location,
                        image: action.payload.product_image,
                    }
            };

        case REMOVE: {
            if (!state[action.payload.product_id]) return state;

            if (state[action.payload.product_id].quantity > 1) {
                return {
                    ...state,
                    [action.payload.product_id]: {
                        ...state[action.payload.product_id],
                        quantity: state[action.payload.product_id].quantity - 1,
                    }
                };
            }

            const { [action.payload.product_id]: _, ...rest } = state
            return rest;
        }

        case UPDATE_QUANTITY: {
            if (!state[action.payload.product_id]) return state;

            // If user sets quantity to 0 in the modal, completely remove the item
            if (action.payload.quantity === 0) {
                const { [action.payload.product_id]: _, ...rest } = state;
                return rest;
            }

            return {
                ...state,
                [action.payload.product_id]: {
                    ...state[action.payload.product_id],
                    quantity: action.payload.quantity,
                }
            };
        }

        case CLEAR_LOCATION: {
            const newState = { ...state };
            const locationToClear = action.payload;
            console.log(locationToClear)

            // Loop through all items and delete keys matching the location
            for (const key in newState) {
                if (newState[key].location === locationToClear) {
                    delete newState[key];
                }
            }
            return newState;
        }

        case CLEAR_ALL:
            return {}

        default:
            return state;
    }
};

export default cartReducer;

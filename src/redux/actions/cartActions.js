export const ADD = 'ADD';
export const REMOVE = 'REMOVE';
export const UPDATE_QUANTITY = "UPDATE_QUANTITY";
export const CLEAR_LOCATION = "CLEAR_LOCATION";
export const CLEAR_ALL = "CLEAR_ALL";

export const addToCart = (id, name, price, location, image) => {
    return {
        type: ADD,
        payload: {
            product_id: id,
            product_name: name,
            product_price: price,
            product_location: location,
            product_image: image
        }
    }
}

export const removeFromCart = (id) => {
    return {
        type: REMOVE,
        payload: {
            product_id: id,
        }
    }
}

export const updateQuantityFromCart = (id, newQuantity) => ({
    type: UPDATE_QUANTITY,
    payload: {
        product_id: id,
        quantity: newQuantity
    }
});

export const clearLocationCart = (locationName) => ({
    type: CLEAR_LOCATION,
    payload: locationName
});

export const clearAllCart = () => ({
    type: CLEAR_ALL
});

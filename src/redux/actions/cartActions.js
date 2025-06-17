export const ADD = 'ADD';
export const REMOVE = 'REMOVE';

export const addToCart = (id, name, price, location) => {
    return {
        type: ADD,
        payload: {
            product_id: id,
            product_name: name,
            product_price: price,
            product_location: location,
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
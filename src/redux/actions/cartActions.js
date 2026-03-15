export const ADD = 'ADD';
export const REMOVE = 'REMOVE';

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

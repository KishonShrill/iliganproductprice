import { combineReducers } from "redux";
import cartReducer from "../reducers/cartReducers";

const rootReducer = combineReducers({
    cart: cartReducer
});

export default rootReducer;
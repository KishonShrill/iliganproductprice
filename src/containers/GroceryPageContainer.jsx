import { connect } from "react-redux";
import GroceryPage from "../pages/GroceryPage";
import { addToCart, clearAllCart, clearLocationCart, removeFromCart } from "../redux/actions/cartActions";

const mapStateToProps = (state) => ({
    cartItems: state,
});

const mapDispatchToProps = (dispatch) => ({
    addNewCartItem: (id, name, price, location, image) => dispatch(addToCart(id, name, price, location, image)),
    removeCartItem: (id) => dispatch(removeFromCart(id)),
    removeCartLocation: (location) => dispatch(clearLocationCart(location)),
    removeCartAll: () => dispatch(clearAllCart())
});

export default connect(mapStateToProps, mapDispatchToProps)(GroceryPage);

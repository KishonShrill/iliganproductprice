import { connect } from "react-redux";
import GroceryPage from "../pages/GroceryPage";
import { addToCart, removeFromCart } from "../redux/actions/cartActions";

const mapStateToProps = (state) => ({
    cartItems: state,
});

const mapDispatchToProps = (dispatch) => ({
    addNewCartItem: (id, name, price, location) => dispatch(addToCart(id, name, price, location)),
    removeCartItem: (id) => dispatch(removeFromCart(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(GroceryPage);
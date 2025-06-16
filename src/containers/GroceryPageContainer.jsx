import { connect } from "react-redux";
import GroceryPage from "../pages/GroceryPage";
import { addToCart, removeFromCart } from "../redux/actions/cartActions";

const mapStateToProps = (state) => ({
    cartItems: state,
});

const mapDispatchToProps = (dispatch) => ({
    addNewCartItem: (id, name, price) => dispatch(addToCart(id, name, price)),
    removeCartItem: (id) => dispatch(removeFromCart(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(GroceryPage);
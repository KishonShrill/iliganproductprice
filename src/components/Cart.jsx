import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";

export default function Cart({ cartItems, setCartItems }) {
  const [budget, setBudget] = useState(3000); // Example budget
  const [totalCost, setTotalCost] = useState(0);
  const [change, setChange] = useState(0);

  // Calculate total cost whenever cartItems change
  useEffect(() => {
    const cost = cartItems.reduce((total, item) => total + item.updated_price, 0);
    setTotalCost(cost); // Round to three decimal places

    // Update change and budget
    const remainingBudget = budget - cost;
    setChange(remainingBudget);
  }, [cartItems, budget]);

  // Function to handle deletion of items
  const deleteItem = (index) => {
    const newCartItems = [...cartItems];
    newCartItems.splice(index, 1); // Remove item at index
    setCartItems(newCartItems); // Update cartItems state
  };

  useEffect(() => {
    if (change < 0) {
      alert("You've exceeded your budget!");
    }
  }, [change]);

  return (
    <div className="cartside">
      <div className="cartside__header">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="cartside__icon"
          viewBox="0 0 32 32" id="cart"><path d="M30,6.943H6.928V4.292a1,1,0,0,0-1-1H2a1,1,0,0,0,0,2H4.928V7.943a.931.931,0,0,0,.023.116c0,.031-.008.062,0,.093L7.31,19.2a2.673,2.673,0,0,0,.3,5.329h.45A3.587,3.587,0,0,0,8,25.083a3.625,3.625,0,0,0,7.25,0,3.587,3.587,0,0,0-.057-.559h3.872a3.587,3.587,0,0,0-.057.559,3.625,3.625,0,1,0,7.249,0,3.587,3.587,0,0,0-.057-.559h1.075a1,1,0,0,0,0-2H25.2a3.617,3.617,0,0,0-5.129,0H14.19a3.618,3.618,0,0,0-5.13,0H7.606a.68.68,0,1,1,0-1.359h.906c.01,0,.018,0,.028,0H30a1,1,0,0,0,1-1V7.943A1,1,0,0,0,30,6.943Zm-5.742,18.14a1.625,1.625,0,1,1-1.624-1.625A1.626,1.626,0,0,1,24.258,25.083Zm-11.008,0a1.625,1.625,0,1,1-1.625-1.625A1.626,1.626,0,0,1,13.25,25.083Zm-4.325-7.9h2.02V19.17H9.35Zm-.427-2-.483-2.26h2.93v2.26Zm4.447-2.26h4.019v2.26H12.945Zm6.019,0h4.018v2.26H18.964Zm6.018,0H29v2.26H24.981Zm4.019-2H24.981V8.943H29Zm-6.019,0H18.964V8.943h4.018Zm-6.018,0H12.945V8.943h4.019ZM10.945,8.943v1.981H7.588L7.164,8.943Zm2,8.241h4.019V19.17H12.945Zm6.019,0h4.018V19.17H18.964Zm6.018,1.985V17.185H29V19.17Z" data-name="Layer 2"></path></svg>
        <h1>
          Cart
        </h1>
      </div>
      <div className="cartside__content" id="itemCart">
        <ul className="cartside__list" >
          {cartItems.map((item, index) => (
            <li key={index} onClick={() => deleteItem(index)}>
              <p className="item btn">
                <span className="item-name btn">{item.product_name}</span><span className="btn">₱{item.updated_price}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
      <div className="cartside__footer">
        <div className="footer__item">
          <p>Budget:</p>
          <p>${budget.toFixed(2)}</p>
        </div>
        <div className="footer__item">
          <p>Cost:</p>
          <p>${totalCost.toFixed(2)}</p>
        </div>
        <hr />
        <div className="footer__item">
          <p>Money Left:</p>
          <p>${change.toFixed(2)}</p>
        </div>
      </div>
      <Button className="btn">Print Budget</Button>
    </div>
  );
}
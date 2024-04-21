import { Button } from "react-bootstrap";

import '../styles/grocery.scss'
import useProductsData from '../hooks/useProductsData';
import Cart from "../components/Cart";

export default function GroceryPage({ addToCart, cartItems, setCartItems  }) {
  const { isLoading, data, isError, error, isFetching } = useProductsData()
  console.log({ isLoading, isFetching })
  
  if (isLoading || isFetching) {return(
    <main className='errorDisplay'>
      <h2>Loading...</h2>
    </main>
  )}
  if (isError) {return(
    <main className='errorDisplay'>
      <h2>Error: {error.message}</h2>
    </main>
  )}

  return (
    <section className="grocery">
      <Cart cartItems={cartItems} setCartItems={setCartItems} />
      <main className='grocery'>

        {data
        ? data?.data.map((item) => (
          <div key={item._id} className="product__card">
            <div className='product__info1'>
              <img className="product__image" src="" alt="Otherwise I am empty without a soul" />
            </div>
            <div className='product__info2'>
              <header>
                <h1 className='product__name'>{item.product_name}</h1>
                <p className='product__price'>₱{item.updated_price}</p>
                <p>{item.date_updated}</p>

              </header>
              <Button className="btn" onClick={() => addToCart(item)}>Click Me</Button>
            </div>

          </div>))
        : <h2>No products found...</h2>
        }

      </main>
    </section>
  );
}
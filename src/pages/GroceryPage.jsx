import '../styles/grocery.scss'
import useProductsData from '../hooks/useProductsData';
import Cart from "../components/Cart";

export default function GroceryPage() {
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
      <main className='product-container' id="productContainer">
        {data
        ? data?.data.map((item) => (
          <div className="product-card" 
            key={item._id} 
            data-product-id={item._id} 
            data-product-name={item.product_name}
            data-product-price={item.updated_price}
          >
            <div className="product-image-placeholder" style={{backgroundColor: "#ffccaa"}}></div>
            <div className="product-details">
              <div className="product-name">{item.product_name}</div>
              <div className="product-info">{item.product_id} | {item.date_updated}</div>
              <div className="product-price">₱{item.updated_price}</div>
              <button className="add-to-cart-btn">Add to Cart</button>
            </div>
          </div>
        ))
        : <h2>No products found...</h2>
        }
      </main>
      <Cart />
    </section>
  );
}
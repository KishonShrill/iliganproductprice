import { Button } from "react-bootstrap";

import '../styles/grocery.scss'
import useProductsData from '../hooks/useProductsData';

export default function GroceryPage({ addToCart }) {
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
    <>
      <main className='grocery'>
        {data
        ? data?.data.map((item) => (
          <div key={item._id} className="product__card">
            <div className='product__info1'>
              <img className="product__image" src="https://fakeimg.pl/141x218" alt="" />
            </div>
            <div className='product__info2'>
              <header>
                <h1 className='product__name'>{item.product_name}</h1>
                <p className='product__price'>₱{item.updated_price}</p>
                <p>{item.date_updated}</p>

              </header>
              <Button className="btn" onClick={() => addToCart(item)}>Click Me</Button>
            </div>

            
            {/* <p className="data__name">{student.name}</p>
            <p className="data__id">{student.id}</p>
            <p className="data__yearLvl">{student.year_level}</p>
            <p className="data__gender">{student.gender}</p>
            <p className="data__course">{student.course}</p>
            <div className="data__actions">
              <button className='btn'>Edit</button>
              <button className='btn' onClick={() => handleDeleteStudent(student._id)}>Delete</button>
              <Link className='btn' to={`/groceries/${student.id}`}>More</Link>
            </div> */}
          </div>))
        : <h2>No products found...</h2>
        }
      </main>
    </>
  );
}
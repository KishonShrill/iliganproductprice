import { Suspense } from "react";
import useFetchLocations from '../hooks/useFetchLocations';
import LocationCard from "../components/LocationCard";
import '../styles/grocery.scss'
import '../styles/locations.scss'
import '../styles/utils.scss'


export default function LocationPage() {
  document.title = "Locations - Budget Buddy"

  const { isLoading, data, isError, error, isFetching } = useFetchLocations()
  console.log({ isLoading, isFetching })

  // Display when fetched elements are empty or is loading...
  if (isLoading || isFetching) {return(
    <main className='errorDisplay'>
      <h2>Loading<span className="animated-dots"></span></h2>
    </main>
  )}
  if (isError) {return(
    <main className='errorDisplay'>
      <h2>Error: {error.message}</h2>
    </main>
  )}

  console.log("Data:" + data.data)

  return (
    <section className="grocery">
      <main className='product-container' id="productContainer">
        <Suspense fallback={<h2>Loading...</h2>}>
          {data
          ? data?.data.map((item) => (
            <LocationCard 
              key={item._id} 
              item={item} 
            />
          ))
          : <h2>No locations found...</h2>
          }
        </Suspense>
      </main>
    </section>
  );
}
import { Suspense } from "react";
import useFetchLocations from '../hooks/useFetchLocations';
import LocationCard from "../components/LocationCard";
import '../styles/locations.scss'
import BottomNavigation from "../components/BottomNavigation";

export default function LocationPage() {
  document.title = "Locations - Budget Buddy"

  const { isLoading, data, isError, error, isFetching } = useFetchLocations();

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

  return (
    <section className="locations bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className='product-container' id="productContainer">
        <Suspense fallback={(
          <main className='errorDisplay'>
            <h2>Loading<span className="animated-dots"></span></h2>
          </main>
        )}>
          {data
          ? data?.map((item) => (
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

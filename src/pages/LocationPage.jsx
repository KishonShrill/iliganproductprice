import { Suspense } from "react";
import useFetchLocations from '../hooks/useFetchLocations';
import LocationCard from "../components/LocationCard";
import '../styles/locations.scss'

export default function LocationPage() {
    document.title = "Locations - Budget Buddy"

    const { isLoading, data: locations, isError, error, isFetching } = useFetchLocations();

    // Display when fetched elements are empty or is loading...
    if (isLoading || isFetching) {
        return (
            <main className='errorDisplay'>
                <h2>Loading<span className="animated-dots"></span></h2>
            </main>
        )
    }
    if (isError) {
        return (
            <main className='errorDisplay'>
                <h2>Error: {error.message}</h2>
            </main>
        )
    }

    return (
        <section className="mx-auto max-w-6xl p-6 lg:p-10">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-gray-50 md:text-5xl">
                    Select a <span className="text-orange-500">Store</span>
                </h1>
                <p className="mt-3 text-gray-500">Choose a location to start building your budget.</p>
            </div>

            <main className='mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' id="productContainer">
                <Suspense fallback={(
                    <main className='errorDisplay'>
                        <h2>Loading<span className="animated-dots"></span></h2>
                    </main>
                )}>
                    {locations
                        ? locations?.map((item) => (
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

import { Suspense } from "react";
import useFetchLocations from '../hooks/useFetchLocations';
import LocationCard from "../components/LocationCard";
import '../styles/locations.scss'
import SEO from "../components/SEO";

export default function LocationPage() {
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
            <SEO
                title={"Locations - Budget Buddy"}
                specificUrl="locations"
                description={"Browse through all the locations budget buddy has collected from the community. Track your expenses and never overspend in Iligan City."}
                twitterImage={"https://res.cloudinary.com/dlmabgte3/image/upload/v1774841736/a0d74607-3a7c-4528-9170-b4a6ac7f31c0.png"}
            />
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

import { Suspense } from "react";
import { Link } from "react-router-dom";
import { ServerCrash, AlertCircle } from "lucide-react";
import useFetchLocations from '../hooks/useFetchLocations';
import LocationCard from "../components/LocationCard";
import '../styles/locations.scss'

import { Button } from "@/components/ui/button";
import SimpleFooter from "@/components/SimpleFooter";
import SEO from "../components/SEO";
import PropTypes from "prop-types";

export default function LocationPage() {
    const { isLoading, data: locations, isError, isFetching, refetch } = useFetchLocations();

    // Display when fetched elements are empty or is loading...
    if (isLoading || isFetching) {
        return (
            <main className='errorDisplay'>
                <h2>Loading<span className="animated-dots"></span></h2>
            </main>
        )
    }

    return (
        <div className="overflow-y-auto">
            <div className="min-h-[calc(100vh-117px-62px-0.75rem)]">
                <section className="mx-auto max-w-6xl py-6 px-4 lg:p-10">
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

                    <main className='grid max-md:gap-2 gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4' id="productContainer">
                        <Suspense fallback={(
                            <main className='errorDisplay'>
                                <h2>Loading<span className="animated-dots"></span></h2>
                            </main>
                        )}>
                            {isError || locations.length === 0 ? (
                                <LocationFallback
                                    isError={isError}
                                    onRetry={() => refetch()} // Pass refetch so they can try again!
                                />
                            ) : (
                                locations.map((item) => (
                                    <LocationCard key={item._id} item={item} />
                                ))
                            )}
                        </Suspense>
                    </main>

                    <div className="mt-8 flex flex-wrap justify-center gap-x-1">
                        <p className="text-center">Don&apos;t see your nearest location?</p>
                        <Link to="/report" className="text-orange-500 hover:font-bold">Report it to us</Link>
                        <p>now!</p>
                    </div>
                </section>
            </div>
            <SimpleFooter className={"max-md:mb-[4.5rem] bg-gray-900"} />
        </div>
    );
}

const LocationFallback = ({ isError, onRetry }) => {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isError ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}>
                {isError ? (
                    <ServerCrash className="w-10 h-10 text-red-500 dark:text-red-400" />
                ) : (
                    <AlertCircle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                )}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {isError ? "Connection Error" : "No Locations Found"}
            </h2>

            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
                {isError
                    ? "We couldn't connect to the database. It might be offline or undergoing maintenance. Please try again in a few moments."
                    : "There are currently no locations available to display."}
            </p>

            {isError && onRetry && (
                <Button
                    onClick={onRetry}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 shadow-sm transition-colors"
                >
                    Try Again
                </Button>
            )}
        </div>
    );
};

LocationFallback.propTypes = {
    isError: PropTypes.bool.isRequired,
    onRetry: PropTypes.func.isRequired
}

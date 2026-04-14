import { useQuery } from 'react-query'
import axios from 'axios'
import { ResultAsync } from 'neverthrow';

const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const LOCALHOST = import.meta.env.VITE_LOCALHOST;
const API_VERSION = import.meta.env.VITE_API_VERSION;

const useFetchListingsByLocation = (location) => {
    const DATBASE_URL = DEVELOPMENT
        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/locations/${location}`
        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/locations/${location}`;

    const fetchURL = async () => {
        const result = await ResultAsync.fromPromise(
            axios.get(DATBASE_URL),
            (error) => new Error(error.response?.data?.message || "Failed to fetch data.")
        );

        // React Query needs an actual thrown error to trigger `isError`
        if (result.isErr()) {
            throw result.error;
        }

        // Return just the data payload to keep your components clean
        return result.value.data;
    };

    return useQuery(
        ['fetchedProductsByLocation', location],
        fetchURL,
        {
            cacheTime: 1000 * 60 * 5,// int - keeps the data longer
            staleTime: 1000 * 60 * 2, // staleTime: int - default is 0 sec
            // refetchOnMount: boolean or 'always' - data updater
            refetchOnWindowFocus: false,//boolean or 'always' - self explanatory
            // refetshInterval: int millisec
            enabled: !!location, // 🟢 Only run if location exists
        }
    )
}
export default useFetchListingsByLocation;

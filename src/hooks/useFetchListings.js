import { useQuery } from 'react-query'
import axios from 'axios'

const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const LOCALHOST = import.meta.env.VITE_LOCALHOST;
const API_VERSION = import.meta.env.VITE_API_VERSION;

const useFetchListings = (token, totalItems = 0) => {
    const DATABASE_URL = DEVELOPMENT
        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/listings`
        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/listings`;

    const fetchURL = () => {
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        if (totalItems && totalItems > 0) {
            config.params = { limit: totalItems };
        }

        return axios.get(DATABASE_URL, config);
    }

    return useQuery(
        ['fetchedListings_Admin', totalItems],
        fetchURL,
        {
            cacheTime: 1000 * 60 * 5,
            staleTime: 1000 * 60 * 2,
            refetchOnWindowFocus: false,
            select: (res) => res.data
        }
    )
}
export default useFetchListings;


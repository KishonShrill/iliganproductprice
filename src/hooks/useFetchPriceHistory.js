// src/hooks/useFetchPriceHistory.js
import { useQuery } from 'react-query';
import axios from 'axios';

const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const LOCALHOST = import.meta.env.VITE_LOCALHOST;
const API_VERSION = import.meta.env.VITE_API_VERSION;

const fetchPriceHistory = async (listingId) => {
    const url = DEVELOPMENT
        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/listings/${listingId}`
        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/listings/${listingId}`;

    const { data } = await axios.get(url);
    return data.data || []; // Returns the nested data array
};

export default function useFetchPriceHistory(listingId) {
    return useQuery(
        ['priceHistory', listingId],
        () => fetchPriceHistory(listingId),
        {
            // Only execute the query if we have a listingId 
            // (prevents fetching when modal is closed/null)
            enabled: !!listingId,
            // Cache the data for 5 minutes (adjust as needed)
            staleTime: 5 * 60 * 1000,
            retry: 1
        }
    );
}

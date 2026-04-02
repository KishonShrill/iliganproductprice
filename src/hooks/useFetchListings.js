import { useQuery } from 'react-query'
import axios from 'axios'

const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const LOCALHOST = import.meta.env.VITE_LOCALHOST;
const API_VERSION = import.meta.env.VITE_API_VERSION;

const useFetchListings = () => {
    const DATBASE_URL = DEVELOPMENT
        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/listings`
        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/listings`;

    const fetchURL = () => {
        return axios.get(DATBASE_URL);
    }

    return useQuery(
        ['fetchedListings_Admin'],
        fetchURL,
        {
            cacheTime: 1000 * 60 * 5,// int - keeps the data longer
            staleTime: 1000 * 60 * 2, // staleTime: int - default is 0 sec
            // refetchOnMount: boolean or 'always' - data updater
            refetchOnWindowFocus: false,//boolean or 'always' - self explanatory
            // refetshInterval: int millisec
            select: (res) => res.data
        }
    )
}
export default useFetchListings;


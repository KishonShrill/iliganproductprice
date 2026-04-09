import { useQuery } from 'react-query';
import axios from 'axios';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const LOCALHOST = import.meta.env.VITE_LOCALHOST;
const API_VERSION = import.meta.env.VITE_API_VERSION;

const useFetchPendingContributions = () => {
    const DATABASE_URL = DEVELOPMENT
        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/contributions/pending`
        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/contributions/pending`;

    const fetchURL = async () => {
        const response = await axios.get(DATABASE_URL, {
            headers: { Authorization: `Bearer ${cookies.get("budgetbuddy_token")}` }
        });
        return response.data;
    };

    return useQuery(
        ['pending_contributions'],
        fetchURL,
        {
            cacheTime: 1000 * 60 * 5, // int - keeps the data longer (5 mins)
            staleTime: 1000 * 60 * 2, // staleTime: int - default is 0 sec (2 mins)
            refetchOnWindowFocus: false, // boolean or 'always'
        }
    );
};

export default useFetchPendingContributions;

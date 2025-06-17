import { useQuery } from 'react-query'
import axios from 'axios'

const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const LOCALHOST = import.meta.env.VITE_LOCALHOST;

const useFetchProducts = () => {
  const DATBASE_URL = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/products`
    : "https://iliganproductprice-mauve.vercel.app/api/products";

  const fetchURL = () => {
    return axios.get(DATBASE_URL);
  }

  return useQuery(
    'fetchedProducts_Admin',
    fetchURL,
    {
      cacheTime: 1000 * 60 * 5,// int - keeps the data longer
      staleTime: 30000, // staleTime: int - default is 0 sec
      // refetchOnMount: boolean or 'always' - data updater
      refetchOnWindowFocus: false,//boolean or 'always' - self explanatory
      // refetshInterval: int millisec
      enabled: true, // - will control for automatic fetch
      // select: (data) => {
      //   const student
      //   return student
      // }
    }
  )
}
export default useFetchProducts

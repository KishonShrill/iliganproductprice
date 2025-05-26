import { useQuery } from 'react-query'
import axios from 'axios'

const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";

const useFetchProduct = (productId) => {
    const DATBASE_URL = `https://iliganproductprice-mauve.vercel.app/api/products/${productId}`;
    // const DATBASE_URL = `http://localhost:5000/api/products/${productId}`;
    const fetshProduct = () => {
        return axios.get(DATBASE_URL);
    }

    return useQuery(
        'fetshedItemForEdit',
        fetshProduct,
        {
            // cacheTime: 3000,// int - keeps the data longer
            staleTime: 30000, // staleTime: int - default is 0 sec
            // refetchOnMount: boolean or 'always' - data updater
            refetshOnWindowFocus: false, //boolean or 'always' - self explanatory
            // refetshInterval: int millisec
            enabled: true, // - will control for automatic fetch
            // select: (data) => {
            //   const student
            //   return student
            // }
        }
    )
}
export default useFetchProduct

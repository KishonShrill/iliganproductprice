import { useQuery } from 'react-query'
import axios from 'axios'

const DATBASE_URL = "https://iliganproductprice-mauve.vercel.app/api/database";
const fetshProducts = () => {
  return axios.get(DATBASE_URL);
}

const useProductsData = () => {
  return useQuery(
    'fetshedProducts', 
    fetshProducts,
    {
      // cacheTime: 3000,// int - keeps the data longer
      staleTime: 30000, // staleTime: int - default is 0 sec
      // refetchOnMount: boolean or 'always' - data updater
      // refetshOnWindowFocus: boolean or 'always' - self explanatory
      // refetshInterval: int millisec
      enabled: true, // - will control for automatic fetch
      // select: (data) => {
      //   const student
      //   return student
      // }
    }
  )
}
export default useProductsData

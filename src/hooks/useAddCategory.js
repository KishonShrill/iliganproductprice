import { useMutation, useQueryClient } from "react-query";
import axios from "axios";

const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const LOCALHOST = import.meta.env.VITE_LOCALHOST;

const BASE_URL = DEVELOPMENT
  ? `http://${LOCALHOST}:5000/api/v1/products`
  : `https://iliganproductprice-mauve.vercel.app/api/v1/products`;

const postCategory = async (newCategory) => {
  const res = await axios.post(BASE_URL, newCategory);
  return res.data;
};

export const useAddCategory = () => {
  const queryClient = useQueryClient();

  return useMutation(postCategory, {
    // ✅ After posting, refetch your categories query so UI updates
    onSuccess: () => {
      queryClient.invalidateQueries("fetchedCategories_Admin");
    },
  });
};


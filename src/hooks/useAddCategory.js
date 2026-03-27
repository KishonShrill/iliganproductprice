import { useMutation, useQueryClient } from "react-query";
import axios from "axios";

const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const LOCALHOST = import.meta.env.VITE_LOCALHOST;
const API_VERSION = import.meta.env.VITE_API_VERSION;

const BASE_URL = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/${API_VERSION}/products`
    : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/products`;

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


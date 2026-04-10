import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const LOCALHOST = import.meta.env.VITE_LOCALHOST;
const API_VERSION = import.meta.env.VITE_API_VERSION;

const URL = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/${API_VERSION}/contributions`
    : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/contributions`;

const useVoteContribution = (notify) => {
    const queryClient = useQueryClient();

    return useMutation(
        ({ id, voteType }) => axios.post(`${URL}/${id}/vote`,
            { voteType },
            { headers: { Authorization: `Bearer ${cookies.get("budgetbuddy_token")}` } }
        ),
        {
            onSuccess: () => {
                // Instantly refresh the lists across the entire app
                queryClient.invalidateQueries('pending_contributions');
            },
            onError: (error) => {
                // You could also replace this alert with your toast notification system!
                notify("Vote Error", error.response?.data?.message || "Failed to submit vote");
            }
        }
    );
};

export default useVoteContribution;

import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { ResultAsync } from 'neverthrow';

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
        ({ id, voteType }) =>
            ResultAsync.fromPromise(
                axios.post(
                    `${URL}/${id}/vote`,
                    { voteType },
                    { headers: { Authorization: `Bearer ${cookies.get("budgetbuddy_token")}` } }
                ),
                (error) => error
            ),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('pendingContributions_User');
            }
        }
    );
};

export default useVoteContribution;

import { useNavigate, useOutletContext } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useQueryClient } from 'react-query';
import Header from '../components/console/Header';
import DataTable from '../components/DataTable';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import useFetchPendingContributions from '@/hooks/useFetchPendingContributions';

// Custom columns adapted for Pending Contributions
const columns = [
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'price', label: 'Reported Price', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'votes', label: 'Votes (Up/Down)' },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: "Actions" }
];

const cookies = new Cookies();

export default function PendingListings({ debugMode }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { addToast } = useOutletContext();
    const token = cookies.get("budgetbuddy_token");
    const decodedUser = token ? jwtDecode(token) : null;

    const { data = { pending: [], votesToday: 0, submissionsToday: 0 }, isLoading } = useFetchPendingContributions(token);
    const contributions = data.pending;

    // Normalizing the pending document data for the DataTable
    const normalizedData = contributions?.map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        category: item.category.catalog,
        location: item.location.name,
        votes: `👍 ${item.upvotes} | 👎 ${item.downvotes}`,
        status: item.status,
    }));

    const logout = () => {
        cookies.remove("budgetbuddy_token", { path: "/" });
        navigate("/");
    };

    // Instead of adding a product, an admin might want to manually refresh the queue
    function refresh_queue() {
        queryClient.invalidateQueries(['fetchedPendingListings_Admin']);
        addToast("Refreshed", "Pending queue updated.");
    }

    // Edit allows admin to step in and fix typos before approving
    //function edit_pending(pendingId) {
    //    let location = debugMode
    //        ? `http://localhost:5173/dev-mode/pending/edit?pendingId=${pendingId}`
    //        : `https://productprice-iligan.vercel.app/dev-mode/pending/edit?pendingId=${pendingId}&type=edit`;
    //    navigate(location, { state: { populated: true } });
    //}

    //const delete_pending = async (item) => {
    //    if (!window.confirm("Are you sure you want to permanently delete this pending submission?")) {
    //        return;
    //    }

    //    const deleteUrl = DEVELOPMENT
    //        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/contributions/${item._id}`
    //        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/contributions/${item._id}`;

    //    await ResultAsync
    //        .fromPromise(
    //            axios.delete(deleteUrl, {
    //                headers: {
    //                    Authorization: `Bearer ${cookies.get("budgetbuddy_token")}`
    //                }
    //            }),
    //            (error) => error.response?.data?.message || "Failed to delete pending submission."
    //        )
    //        .match(
    //            () => {
    //                queryClient.setQueryData(["fetchedPendingListings_Admin"], (oldData) => {
    //                    if (!oldData) return [];
    //                    // Ensure we filter exactly how your oldData is structured
    //                    const dataArray = Array.isArray(oldData) ? oldData : (oldData.data || oldData.pending);
    //                    return dataArray.filter(pending => pending._id !== item._id);
    //                });
    //                addToast("Deleted", `Submission for ${item.productName} removed.`);
    //            },
    //            (errorMessage) => {
    //                console.error("Delete failed:", errorMessage);
    //                addToast("Error", errorMessage, "destructive");
    //            }
    //        );
    //    };

    return (
        <>
            <title>BB:Console - Pending Contributions</title>
            <div className="flex-1 overflow-auto bg-gray-50">
                <Header
                    title="Pending Contributions"
                    actionLabel="Refresh Queue"
                    onAction={refresh_queue}
                    onLogout={logout}
                    user={decodedUser}
                />
                <div className="p-4 sm:p-8 h-[calc(100vh-120px)] overflow-y-auto">
                    {isLoading
                        ? <div className='errorDisplay'>
                            <h2 className="text-lg">Loading submissions...<span className="animated-dots"></span></h2>
                        </div>
                        : <DataTable
                            fetched={"pending"}
                            data={normalizedData}
                            columns={columns}
                            // Allows admins to quickly filter by approved, pending, rejected, or category
                            filterableColumns={['category', 'status', 'location']}
                        //onEdit={edit_pending}
                        //onDelete={delete_pending}
                        />
                    }
                </div>
            </div>
        </>
    );
}

PendingListings.propTypes = {
    debugMode: PropTypes.bool
};

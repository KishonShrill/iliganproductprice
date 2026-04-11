import { useNavigate, useOutletContext } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { ResultAsync } from 'neverthrow';
import { useQueryClient } from 'react-query';
import Header from '../components/console/Header';
import DataTable from '../components/DataTable';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import useFetchProducts from '../hooks/useFetchProducts';
import axios from 'axios';

const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const LOCALHOST = import.meta.env.VITE_LOCALHOST;
const API_VERSION = import.meta.env.VITE_API_VERSION;

const columns = [
    { key: 'product_id', label: 'Item ID', sortable: true },
    { key: 'product_name', label: 'Product Name', sortable: true },
    { key: 'category_name', label: 'Category', sortable: true },
    { key: 'category_list', label: 'Section', sortable: true },
    { key: 'has_image', label: 'Image' },
    { key: 'actions', label: "Actions" }
];

const cookies = new Cookies();

export default function Products({ debugMode }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const token = cookies.get("budgetbuddy_token");
    const { addToast } = useOutletContext();
    const { isLoading, data } = useFetchProducts(token)

    const decodedUser = token ? jwtDecode(token) : null;

    const normalizedData = data?.map(item => ({
        _id: item._id,
        product_id: item.product_id,
        product_name: item.product_name,
        has_image: item.imageUrl ? "yes" : "no",
        category_list: item.category.list,
        category_name: item.category.name
    }))

    const logout = () => {
        cookies.remove("budgetbuddy_token", { path: "/" });
        queryClient.invalidateQueries('pendingContributions_User');
        navigate("/");
    };

    function add_product() {
        navigate('/dev-mode/products/new', { state: { populated: true } });
    }

    function edit_product(productId) {
        let location = debugMode
            ? `http://localhost:5173/dev-mode/products/edit?productId=${productId}`
            : `https://productprice-iligan.vercel.app/dev-mode/products/edit?productId=${productId}&type=edit`;
        navigate(location, { state: { populated: true } });
    }

    const delete_product = async (item) => {
        console.log(item)
        if (!window.confirm("Are you sure you want to permanently delete this product?")) {
            return;
        }

        const deleteUrl = DEVELOPMENT
            ? `http://${LOCALHOST}:5000/api/${API_VERSION}/products/${item._id}`
            : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/products/${item._id}`;

        await ResultAsync
            .fromPromise(
                axios.delete(deleteUrl, {
                    headers: {
                        Authorization: `Bearer ${cookies.get("budgetbuddy_token")}`
                    }
                }),
                (error) => error.response?.data?.message || "Failed to delete product."
            )
            .match(
                (response) => {
                    queryClient.setQueryData(["fetchedProducts_Admin"], (oldData) => {
                        if (!oldData) return [];
                        return {
                            ...oldData,
                            data: oldData.data.filter(product => product._id !== item._id) // Overwrite just the array
                        };
                    });
                    addToast("Deleted", `Product ${item.product_name} removed.`)
                },
                (errorMessage) => {
                    console.error("Delete failed:", errorMessage);
                    addToast("Error", errorMessage)
                }
            );
    };

    return (
        <>
            <title>BB:Console - Products</title>
            <div className="flex-1 overflow-auto bg-gray-50">
                <Header
                    title="Products"
                    actionLabel="Add Product"
                    onAction={add_product}
                    onLogout={logout}
                    user={decodedUser}
                />
                <div className="p-4 sm:p-8 h-[calc(100vh-120px)] overflow-y-auto">
                    {isLoading
                        ? <h1>Loading...</h1>
                        : <DataTable
                            fetched={"products"}
                            data={normalizedData}
                            columns={columns}
                            filterableColumns={['category_name', 'category_list', 'status']}
                            onEdit={edit_product}
                            onDelete={delete_product}
                        />
                    }
                </div>
            </div>
        </>
    );
}

Products.propTypes = {
    debugMode: PropTypes.bool
}

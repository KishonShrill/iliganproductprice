import { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useQueryClient } from 'react-query';
import { Search, Package, ChevronRight, Loader2 } from 'lucide-react';
import { ResultAsync } from 'neverthrow';
import Cookies from 'universal-cookie';
import axios from 'axios';

import Header from '../components/console/Header';
import DataTable from '../components/DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import useFetchListings from '@/hooks/useFetchListings';
import useFetchProducts from '@/hooks/useFetchProducts';

const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const LOCALHOST = import.meta.env.VITE_LOCALHOST;
const API_VERSION = import.meta.env.VITE_API_VERSION;

const columns = [
    { key: 'date', label: 'Updated', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'has_image', label: 'Image', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions' },
];

const cookies = new Cookies();


export default function Listings() {
    const navigate = useNavigate();
    const { addToast } = useOutletContext();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { isLoading, data } = useFetchListings()
    const { data: productsData, isLoading: productsLoading } = useFetchProducts();

    const token = cookies.get("budgetbuddy_token");
    const decodedUser = token ? jwtDecode(token) : null;

    const normalizedData = data?.map(item => ({
        _id: item._id,
        date: item.date_updated,
        name: item.product.product_name,
        category: `${item.category.list}`,
        location: item.location.name,
        price: item.updated_price,
        has_image: item.imageUrl ? "yes" : "no",
        status: item.shelf,
    }) || [])

    const logout = () => {
        cookies.remove("budgetbuddy_token", { path: "/" });
        navigate("/");
    };

    const delete_listing = async (item) => {
        console.log(item)
        if (!window.confirm("Are you sure you want to permanently delete this product?")) {
            return;
        }

        const deleteUrl = DEVELOPMENT
            ? `http://${LOCALHOST}:5000/api/${API_VERSION}/listings/${item._id}`
            : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/listings/${item._id}`;

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
                    console.log("Success:", response.data.message);

                    queryClient.setQueryData(["fetchedListings_Admin"], (oldData) => {
                        if (!oldData) return [];
                        return {
                            ...oldData,
                            data: oldData.data.filter(product => product._id !== item._id) // Overwrite just the array
                        };
                    });
                    addToast("Deleted", `Listings ${item.product_product_name} from ${item.location.name} removed.`)
                },
                (errorMessage) => {
                    console.error("Delete failed:", errorMessage);
                    addToast({ title: "Error", description: errorMessage, variant: "destructive" })
                }
            );
    };

    // Filter products based on search bar inside the modal
    const filteredProducts = useMemo(() => {
        // Handle both standard arrays and axios { data: [] } structures
        const rawProducts = Array.isArray(productsData) ? productsData : productsData?.data || [];

        if (!searchTerm) return rawProducts;

        return rawProducts.filter(p =>
            p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.product_id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [productsData, searchTerm]);

    const handleSelectProduct = (selectedProduct) => {
        setIsModalOpen(false);
        // Use Router State to pass the product invisibly as discussed!
        navigate('/dev-mode/listings/new', {
            state: { baseProduct: selectedProduct }
        });
    };

    return (
        <>
            <title>BB:Console - Listings</title>
            <div className="flex-1 overflow-auto bg-gray-50">
                <Header
                    title="Listings"
                    actionLabel="Add Listing"
                    onAction={() => setIsModalOpen(true)}
                    onLogout={logout}
                    user={decodedUser}
                />
                <div className="p-4 sm:p-8 h-[calc(100vh-120px)] overflow-y-auto">
                    {isLoading
                        ? <h1>Loading...</h1>
                        : <DataTable
                            data={normalizedData}
                            columns={columns}
                            filterableColumns={['category', 'location', 'status', 'has_image']}
                            onDelete={delete_listing}
                        />
                    }
                </div>
            </div>

            {/* --- PRODUCT SELECTION MODAL --- */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                {/* max-h-[85vh] ensures it doesn't break off the screen on mobile */}
                <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-y-0 overflow-hidden bg-white">

                    <div className="px-6 pt-6 pb-4 border-b">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Select a Product</DialogTitle>
                            <DialogDescription>
                                Choose the base product you want to create a listing for.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Sticky Search Bar */}
                        <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-gray-50 border-gray-200"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Scrollable Product List */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                        {productsLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                                <p>Loading inventory...</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No products found matching &ldquo;{searchTerm}&rdquo;</p>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product._id}
                                        onClick={() => handleSelectProduct(product)}
                                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all group"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            {/* Thumbnail Placeholder (if image exists) */}
                                            <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center shrink-0 overflow-hidden border">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt={product.product_name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <Package className="h-6 w-6 text-gray-400" />
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-gray-900 truncate">
                                                    {product.product_name}
                                                </h4>
                                                <p className="text-xs text-gray-500 flex gap-2 mt-1">
                                                    <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                        {product.product_id}
                                                    </span>
                                                    <span className="truncate">
                                                        {product.category?.name || "Uncategorized"}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

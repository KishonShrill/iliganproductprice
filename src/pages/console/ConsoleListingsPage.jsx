import { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useQueryClient } from 'react-query';
import { Search, Package, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { ResultAsync } from 'neverthrow';
import Cookies from 'universal-cookie';
import axios from 'axios';

import Header from '@/components/console/Header';
import DataTable from '@/components/DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
    const queryClient = useQueryClient();
    const token = cookies.get("budgetbuddy_token");
    const { addToast } = useOutletContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const { isLoading, data } = useFetchListings(token)
    const { data: productsData, isLoading: productsLoading } = useFetchProducts(token);

    const decodedUser = token ? jwtDecode(token) : null;

    const normalizedData = data?.map(item => ({
        _id: item._id,
        date: item.date_updated.split('T')[0],
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

    const edit_listing = (item) => {
        // 1. Find the full, un-normalized listing from the original fetched data
        const originalListing = data.find(l => l._id === item);
        console.log(originalListing)

        if (!originalListing) {
            addToast("Error", "Could not find listing details.", "destructive");
            return;
        }

        // 2. Reconstruct the "baseProduct" to match what the form expects from the Products collection
        const baseProduct = {
            _id: originalListing.product.product_id, // We use product_id as the dictionary key in the form
            product_id: originalListing.product.product_id,
            product_name: originalListing.product.product_name,
            imageUrl: originalListing.product.imageUrl,
            category: originalListing.category
        };

        // 3. Navigate with the specific edit state
        navigate('/dev-mode/listings/new', {
            state: {
                baseProducts: [baseProduct],
                populated: true,
                isEdit: true,
                isBulk: false,
                listingId: originalListing._id,
                // Pass these so the form can pre-fill!
                existingPrice: originalListing.updated_price,
                existingLocationId: originalListing.location.id
            }
        });
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
        if (isBulkMode) {
            // Toggle selection
            setSelectedProducts(prev => {
                const isSelected = prev.find(p => p._id === selectedProduct._id);
                if (isSelected) return prev.filter(p => p._id !== selectedProduct._id);
                return [...prev, selectedProduct];
            });
        } else {
            // Original single-select behavior
            setIsModalOpen(false);
            navigate('/dev-mode/listings/new', {
                state: { baseProducts: [selectedProduct], populated: true, isBulk: false }
            });
        }
    };

    const handleProceedBulk = () => {
        setIsModalOpen(false);
        navigate('/dev-mode/listings/new', {
            state: { baseProducts: selectedProducts, populated: true, isBulk: true }
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
                            onEdit={edit_listing}
                        />
                    }
                </div>
            </div>

            {/* --- PRODUCT SELECTION MODAL --- */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                {/* max-h-[85vh] ensures it doesn't break off the screen on mobile */}
                <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-y-0 overflow-hidden bg-white">

                    {/* Header Controls */}
                    <div className="px-6 pt-6 pb-4 border-b flex justify-between items-center">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Select Product(s)</DialogTitle>
                            <DialogDescription>
                                {isBulkMode ? "Select multiple products to price at once." : "Choose the base product you want to create a listing for."}
                            </DialogDescription>
                        </DialogHeader>
                        <Button
                            className={`bg-green-500 ${isBulkMode && 'bg-green-700'} text-white`}
                            variant={isBulkMode ? "default" : "outline"}
                            onClick={() => {
                                setIsBulkMode(!isBulkMode);
                                setSelectedProducts([]); // clear on toggle
                            }}
                        >
                            {isBulkMode ? "Cancel Bulk" : "Bulk Mode"}
                        </Button>
                    </div>

                    {/* Sticky Search Bar */}
                    <div className="px-6 py-2 border-b relative">
                        <Search className="absolute left-9 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-gray-50 border-gray-200"
                        />
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
                                {filteredProducts.map((product) => {
                                    const isSelected = selectedProducts.some(p => p._id === product._id);

                                    return (
                                        <div
                                            key={product._id}
                                            onClick={() => handleSelectProduct(product)}
                                            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all group ${isSelected
                                                ? 'bg-green-50 border-green-500 shadow-sm'
                                                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className={`h-12 w-12 rounded-md flex items-center justify-center shrink-0 overflow-hidden border ${isSelected ? 'bg-green-500' : 'bg-gray-100'}`}>
                                                    {isSelected ? (
                                                        <CheckCircle2 className="h-6 w-6 text-white" />
                                                    ) : product.imageUrl ? (
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
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Bulk Proceed Footer */}
                    {isBulkMode && (
                        <div className="p-4 border-t bg-white flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">
                                {selectedProducts.length} selected
                            </span>
                            <Button
                                onClick={handleProceedBulk}
                                disabled={selectedProducts.length === 0}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Proceed to Pricing
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

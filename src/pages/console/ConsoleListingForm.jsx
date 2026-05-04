import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ResultAsync } from 'neverthrow';
import { useQueryClient } from 'react-query';
import axios from 'axios';
import Cookies from 'universal-cookie';

// Your Custom Hooks
import useFetchLocations from '@/hooks/useFetchLocations';

const cookies = new Cookies();
const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const LOCALHOST = import.meta.env.VITE_LOCALHOST;
const API_VERSION = import.meta.env.VITE_API_VERSION;
const saveListingUrl = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/${API_VERSION}/listings`
    : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/listings`;

export default function ListingForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const { addToast } = useOutletContext();

    const populated = !!location.state?.populated;
    const baseProducts = location.state?.baseProducts;
    const isBulk = location.state?.isBulk;
    const isEdit = !!location.state?.isEdit;
    const listingId = location.state?.listingId;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // New States
    const [locationId, setLocationId] = useState('');
    const [prices, setPrices] = useState({}); // { [productId]: string }
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(isBulk); // Force open if bulk

    //const [formData, setFormData] = useState({
    //    updated_price: '',
    //    locationId: ''
    //});

    const { data: fetchedLocations = [], isLoading: locationsLoading } = useFetchLocations();

    const handlePriceChange = (productId, value) => {
        setPrices(prev => ({ ...prev, [productId]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!locationId) {
            addToast("Missing Information", "Please select a location before posting.", "destructive");
            return;
        }

        const selectedLocation = fetchedLocations.find(l => l._id === locationId || l.id === locationId);
        setLoading(true);

        // 1. Create a single array of all the listing payloads
        const bulkPayload = baseProducts.map(product => ({
            updated_price: parseFloat(prices[product._id] || 0),
            date_updated: new Date().toISOString().split('T')[0],
            category: {
                list: product.category?.list || null,
                name: product.category?.name || null,
                catalog: product.category?.catalog || null
            },
            location: {
                id: selectedLocation?._id || selectedLocation?.id,
                name: selectedLocation?.location_name || null
            },
            product: {
                product_id: product.product_id,
                product_name: product.product_name,
                imageUrl: product.imageUrl || null
            },
            shelf: 'published'
        }));

        try {
            // 2. Send ONE request based on whether it's a single edit or a bulk creation
            if (isEdit) {
                await axios.put(`${saveListingUrl}/${listingId}`, bulkPayload[0], {
                    headers: { Authorization: `Bearer ${cookies.get("budgetbuddy_token")}` }
                });
            } else {
                const targetUrl = isBulk ? `${saveListingUrl}/bulk` : saveListingUrl;
                const dataToSend = isBulk ? bulkPayload : bulkPayload[0];

                console.log(dataToSend)

                await axios.post(targetUrl, dataToSend, {
                    headers: { Authorization: `Bearer ${cookies.get("budgetbuddy_token")}` }
                });
            }

            queryClient.invalidateQueries('fetchedListings_Admin');
            addToast("Success", `Successfully ${isEdit ? 'updated' : 'created'} ${baseProducts.length} listing(s)!`);
            navigate('/dev-mode/listings');

        } catch (error) {
            addToast("Error", error.response?.data?.message || "Failed to save some listings.", "destructive");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!populated || baseProducts.length === 0) {
            addToast("Forbidden!", `Please access this page through console listings page.`);
            navigate("/dev-mode/listings");
        }
        if (isEdit) setLocationId(location.state.existingLocationId)
        if (!locationsLoading) setInitialLoading(false);
    }, [location, navigate, baseProducts, populated, locationsLoading]);

    if (!populated) return null;

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="relative flex-1 overflow-hidden bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8 py-4 md:py-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {isEdit ? 'Edit Listing' : isBulk ? 'Bulk Create Listings' : 'Create Listing'}
                    </h1>
                    <p className="mt-1 text-xs md:text-sm text-gray-500">
                        {isBulk ? `Drafting ${baseProducts.length} items` : `Listing based on: ${baseProducts[0]?.product_name}`}
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/dev-mode/listings')} className="bg-gray-100 hover:bg-gray-300">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
            </div>

            {/* Form Container */}
            <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
                <div className="max-w-4xl mx-auto bg-white">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Pricing Details</CardTitle>

                            {/* Location Display / Edit for the whole batch */}
                            <div className="flex items-center gap-4">
                                <Label>Location:</Label>
                                <Select value={locationId} onValueChange={setLocationId} disabled={isEdit}>
                                    <SelectTrigger className="w-[250px] hover:bg-orange-100">
                                        <SelectValue placeholder="Select a location..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {fetchedLocations.map((loc) => (
                                            <SelectItem key={loc._id || loc.id} value={loc._id || loc.id} className="cursor-pointer hover:bg-gray-200">
                                                {loc.location_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Dynamic Product List */}
                                <div className="space-y-4">
                                    {baseProducts.map((product) => (
                                        <div key={product._id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-white rounded border overflow-hidden shrink-0">
                                                    {product.imageUrl && <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{product.product_name}</h4>
                                                    <p className="text-xs text-gray-500">{product.category?.name || "Uncategorized"}</p>
                                                </div>
                                            </div>

                                            <div className="w-40">
                                                <Label className="sr-only">Price</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                                                    <Input
                                                        className="pl-8 font-semibold text-lg"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={prices[product._id] || ''}
                                                        onChange={(e) => handlePriceChange(product._id, e.target.value)}
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end space-x-4 pt-6 border-t mt-8">
                                    <Button type="button" variant="outline" onClick={() => navigate('/dev-mode/listings')}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        {isEdit ? 'Update Listing' : `Post ${baseProducts.length} Listing(s)`}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Initial Bulk Location Modal */}
            <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle>Select Location for Bulk Update</DialogTitle>
                        <DialogDescription>
                            Where are you recording prices for these {baseProducts.length} items?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={locationId} onValueChange={(val) => {
                            setLocationId(val);
                            setIsLocationModalOpen(false);
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a location..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {fetchedLocations.map((loc) => (
                                    <SelectItem key={loc._id || loc.id} value={loc._id || loc.id} className="hover:bg-gray-200 cursor-pointer">
                                        {loc.location_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

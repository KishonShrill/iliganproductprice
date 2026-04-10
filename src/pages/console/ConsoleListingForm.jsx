import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export default function ListingForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const { addToast } = useOutletContext();
    const populated = !!location.state?.populated;
    useEffect(() => {
        if (!populated) {
            addToast("Forbidden!", `Please access this page through console products page.`);
            navigate("/dev-mode/products");
        }

    }, [location, navigate]);
    if (!populated) return null;

    // We need the product ID to know what we are listing!
    const baseProduct = location.state?.baseProduct;

    // If you are editing an existing listing, you'd pass listingId
    const isEdit = !!location.state?.isEdit;
    const listingId = location.state?.listingId;

    // Fetch all necessary reference data
    const { data: fetchedLocations = [], isLoading: locationsLoading } = useFetchLocations();

    const [formData, setFormData] = useState({
        updated_price: '',
        locationId: ''
    });

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    let saveListingUrl = DEVELOPMENT
        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/listings`
        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/listings`;

    useEffect(() => {
        if (!baseProduct) {
            addToast("Error", "Please select a product first.", "destructive");
            navigate('/dev-mode/listings');
            return;
        }

        if (locationsLoading) return;

        setInitialLoading(false);
    }, [baseProduct, locationsLoading, navigate, addToast]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.locationId) {
            addToast("Missing Information", "Please select a location before posting.", "destructive");
            return;
        }

        const selectedLocation = fetchedLocations.find(l => l._id === formData.locationId || l.id === formData.locationId);

        const payload = {
            updated_price: parseFloat(formData.updated_price),
            date_updated: new Date().toISOString().split('T')[0],
            category: {
                list: baseProduct.category?.list || null,
                name: baseProduct.category?.name || null,
                catalog: baseProduct.category?.catalog || null
            },
            location: {
                id: selectedLocation?._id || selectedLocation?.id,
                name: selectedLocation?.location_name || null
            },
            product: {
                product_id: baseProduct.product_id,
                product_name: baseProduct.product_name,
                imageUrl: baseProduct.imageUrl || null
            },
            shelf: 'published'
        };

        setLoading(true);
        await ResultAsync
            .fromPromise(
                axios({
                    method: isEdit ? 'put' : 'post',
                    url: isEdit ? `${saveListingUrl}/${listingId}` : saveListingUrl,
                    data: payload,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${cookies.get("budgetbuddy_token")}`
                    }
                }),
                (error) => error.response?.data?.message || "Unable to connect to server."
            )
            .match(
                (axiosResponse) => {
                    queryClient.invalidateQueries('fetchedListings_Admin');
                    addToast("Success", `Listing successfully ${isEdit ? 'updated' : 'created'}!`);
                    navigate('/dev-mode/listings');
                },
                (errorMessage) => {
                    addToast("Error", errorMessage, "destructive");
                }
            );
        setLoading(false);
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8 py-4 md:py-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {isEdit ? 'Edit Listing' : 'Create Listing'}
                    </h1>
                    <p className="mt-1 text-xs md:text-sm text-gray-500">
                        Listing based on: <span className="font-semibold">{baseProduct?.product_name}</span>
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/dev-mode/listings')} className="bg-gray-100 hover:bg-gray-300">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
            </div>

            {/* Form Container */}
            <div className="p-4 md:p-8 pb-20 md:pb-8">
                <div className="max-w-2xl mx-auto bg-white">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing & Location Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Price */}
                                <div className="space-y-2">
                                    <Label htmlFor="updated_price">Price (₱) <span className='text-red-500'>*</span></Label>
                                    <Input
                                        className="hover:bg-orange-100"
                                        id="updated_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.updated_price}
                                        onChange={(e) => handleInputChange('updated_price', e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                {/* Location Dropdown */}
                                <div className="space-y-2">
                                    <Label htmlFor="locationId">Location <span className='text-red-500'>*</span></Label>
                                    <Select value={formData.locationId} onValueChange={(value) => handleInputChange('locationId', value)} disabled={isEdit} required>
                                        <SelectTrigger className="hover:bg-orange-100">
                                            <SelectValue placeholder="Select a location (e.g., 7-Eleven - MSUIIT)" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            {fetchedLocations.map((loc) => (
                                                <SelectItem key={loc._id || loc.id} value={loc._id || loc.id} className="cursor-pointer hover:bg-gray-100">
                                                    {loc.location_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Read-Only Base Product Category Info */}
                                <div className="space-y-4 pt-6 border-t">
                                    <Label className="text-gray-500">Inherited Category Information</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-gray-400">Inventory Type</Label>
                                            <Input
                                                value={baseProduct?.category?.list || 'N/A'}
                                                disabled
                                                className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-gray-400">Catalog</Label>
                                            <Input
                                                value={baseProduct?.category?.catalog || 'N/A'}
                                                disabled
                                                className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-gray-400">Category Name</Label>
                                            <Input
                                                value={baseProduct?.category?.name || 'N/A'}
                                                disabled
                                                className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Actions */}
                                <div className="flex justify-end space-x-4 pt-6 border-t">
                                    <Button type="button" variant="outline" onClick={() => navigate('/dev-mode/listings')}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        {isEdit ? 'Update Listing' : 'Post Listing'}
                                    </Button>
                                </div>

                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Store, Utensils } from 'lucide-react';
import { ResultAsync } from 'neverthrow';
import { useQueryClient } from 'react-query';
import axios from 'axios';
import Cookies from 'universal-cookie';

// Your Custom Hooks
import useFetchCategories from '@/hooks/useFetchCategories';
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

    // We need the product ID to know what we are listing!
    const baseProduct = location.state?.baseProduct;


    // If you are editing an existing listing, you'd pass listingId
    const isEdit = !!location.state?.isEdit;
    const listingId = location.state?.listingId;


    // Fetch all necessary reference data
    const { data: fetchedCategories = [], isLoading: categoriesLoading } = useFetchCategories();
    const { data: fetchedLocations = [], isLoading: locationsLoading } = useFetchLocations();


    const [formData, setFormData] = useState({
        updated_price: '',
        categoryId: '',
        locationId: ''
    });

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [activeList, setActiveList] = useState('Groceries');

    let saveListingUrl = DEVELOPMENT
        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/listings`
        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/listings`;

    useEffect(() => {
        // 4. Safety Check: If someone manually types the URL and bypasses the selection screen
        if (!baseProduct) {
            addToast("Error", "Please select a product first.", "destructive");
            navigate('/dev-mode/listings'); // Send them back to select one
            return;
        }

        if (categoriesLoading || locationsLoading) return;

        // 5. Pre-fill the form based on the invisibly passed baseProduct!
        if (!isEdit && fetchedCategories.length > 0) {
            const defaultCategory = fetchedCategories.find(c =>
                c.category_name === baseProduct.category?.name &&
                c.category_catalog === baseProduct.category?.catalog
            );

            setFormData({
                updated_price: '',
                categoryId: defaultCategory ? defaultCategory._id : '',
                locationId: ''
            });

            if (baseProduct.category?.list) {
                setActiveList(baseProduct.category.list);
            }
        }

        setInitialLoading(false);

    }, [baseProduct, fetchedCategories, categoriesLoading, locationsLoading, navigate, addToast, isEdit]);    // Clear category when switching lists

    useEffect(() => {
        if (!initialLoading) {
            setFormData(prev => ({ ...prev, categoryId: '' }));
        }
    }, [activeList]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Look up the full objects from our fetched data
        const selectedCategory = fetchedCategories.find(c => c._id === formData.categoryId);
        const selectedLocation = fetchedLocations.find(l => l._id === formData.locationId || l.id === formData.locationId);

        // 2. Construct the exact JSON payload requested
        const payload = {
            updated_price: parseFloat(formData.updated_price),
            date_updated: new Date().toISOString().split('T')[0],
            category: {
                list: selectedCategory?.category_list || null,
                name: selectedCategory?.category_name || null,
                catalog: selectedCategory?.category_catalog || null
            },
            location: {
                id: { "$oid": selectedLocation?._id || selectedLocation?.id }, // Ensure this matches Mongoose expectation
                name: selectedLocation?.location_name || null
            },
            product: {
                product_id: baseProduct.product_id,
                product_name: baseProduct.product_name,
                imageUrl: baseProduct.imageUrl || null
            }
        };

        return console.log(payload)

        setLoading(true);
        await ResultAsync
            .fromPromise(
                axios({
                    method: isEdit ? 'put' : 'post',
                    url: isEdit ? `${saveListingUrl}/${listingId}` : saveListingUrl,
                    data: payload, // Sending clean JSON directly!
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${cookies.get("budgetbuddy_token")}`
                    }
                }),
                (error) => error.response?.data?.message || "Unable to connect to server."
            )
            .match(
                (axiosResponse) => {
                    const savedListing = axiosResponse.data.listing; // Assuming your API returns { listing: {...} }

                    // Invalidate or update cache
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

    // Group Categories (Same as ProductForm)
    const processedCategories = useMemo(() => {
        if (!fetchedCategories.length) return [];
        const filtered = fetchedCategories.filter(c => c.category_list === activeList);
        const grouped = filtered.reduce((acc, cat) => {
            const catalog = cat.category_catalog;
            if (!acc[catalog]) acc[catalog] = [];
            acc[catalog].push(cat);
            return acc;
        }, {});

        return Object.keys(grouped).sort().map(catalog => ({
            catalogName: catalog,
            items: grouped[catalog].sort((a, b) => a.category_name.localeCompare(b.category_name))
        }));
    }, [fetchedCategories, activeList]);

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
                                    <Select value={formData.locationId} onValueChange={(value) => handleInputChange('locationId', value)} required>
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

                                {/* Category Toggle */}
                                <div className="space-y-2 pt-4 border-t">
                                    <Label>Category Type</Label>
                                    <div className="flex space-x-2">
                                        <Button
                                            type="button"
                                            variant={activeList === 'Groceries' ? 'default' : 'outline'}
                                            onClick={() => setActiveList('Groceries')}
                                            className={`${activeList === 'Groceries' ? 'bg-orange-500 text-white' : 'hover:bg-orange-100'} !flex-shrink w-full`}
                                        >
                                            <Store className="w-4 h-4 mr-2" /> Groceries
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={activeList === 'Cuisines' ? 'default' : 'outline'}
                                            onClick={() => setActiveList('Cuisines')}
                                            className={`${activeList === 'Cuisines' ? 'bg-orange-500 text-white' : 'hover:bg-orange-100'} !flex-shrink w-full`}
                                        >
                                            <Utensils className="w-4 h-4 mr-2" /> Cuisines
                                        </Button>
                                    </div>
                                </div>

                                {/* Category Dropdown */}
                                <div className="space-y-2">
                                    <Label htmlFor="categoryId">Category <span className='text-red-500'>*</span></Label>
                                    <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)} required>
                                        <SelectTrigger className="hover:bg-orange-100">
                                            <SelectValue placeholder={`Select a ${activeList.toLowerCase()} category`} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white max-h-64">
                                            {processedCategories.map((group) => (
                                                <SelectGroup key={group.catalogName}>
                                                    <SelectLabel className="font-bold bg-gray-50">{group.catalogName}</SelectLabel>
                                                    {group.items.map((cat) => (
                                                        <SelectItem key={cat._id} value={cat._id} className="ml-2 cursor-pointer hover:bg-gray-100">
                                                            {cat.category_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            ))}
                                        </SelectContent>
                                    </Select>
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

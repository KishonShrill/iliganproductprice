import { useState, useMemo } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { ArrowLeft, Save, Loader2, Info, Store, Utensils } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResultAsync } from 'neverthrow';
import axios from 'axios';
import Cookies from 'universal-cookie';

import ReCAPTCHA from 'react-google-recaptcha';
import CustomDatalist from '@/components/CustomDatalist';

import useFetchLocations from '@/hooks/useFetchLocations';
import useFetchCategories from '@/hooks/useFetchCategories';
import useFetchProducts from '@/hooks/useFetchProducts';

const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const LOCALHOST = import.meta.env.VITE_LOCALHOST;
const API_VERSION = import.meta.env.VITE_API_VERSION;
const URL = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/${API_VERSION}/contributions`
    : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/contributions`
const cookies = new Cookies();

export default function SubmitContribution() {
    const token = cookies.get("budgetbuddy_token");
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { addToast } = useOutletContext();

    // Fetch data using your existing hooks
    const { data: fetchedProducts = [], isLoading: productsLoading } = useFetchProducts(token)
    const { data: fetchedLocations = [], isLoading: locationsLoading } = useFetchLocations(token);
    const { data: fetchedCategories = [], isLoading: categoriesLoading } = useFetchCategories(token);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        locationId: '',
        categoryId: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeList, setActiveList] = useState('Groceries');
    const [capVal, setCapVal] = useState(null);

    const filteredProducts = useMemo(() => {
        if (!fetchedProducts.length) return [];
        return fetchedProducts.filter(p => p.category?.list === activeList);
    }, [fetchedProducts, activeList]);

    // --- THE GROUPING LOGIC ---
    const groupedCategories = useMemo(() => {
        if (!fetchedCategories.length) return { Groceries: [], Cuisines: [] };

        // Helper to filter and group a specific list type
        const processList = (listName) => {
            const filtered = fetchedCategories.filter(c => c.category_list === listName);
            const grouped = filtered.reduce((acc, cat) => {
                const catalog = cat.category_catalog;
                if (!acc[catalog]) acc[catalog] = [];
                acc[catalog].push(cat);
                return acc;
            }, {});

            return Object.keys(grouped).sort().map(catalog => ({
                catalogName: catalog,
                items: grouped[catalog].sort((a, b) =>
                    a.category_name.localeCompare(b.category_name)
                )
            }));
        };

        // Output a dictionary containing both processed lists!
        return {
            Groceries: processList('Groceries'),
            Cuisines: processList('Cuisines')
        };
    }, [fetchedCategories]);

    const handleNameChange = (e) => {
        const selectedName = e.target.value;

        // 1. Update the name field normally
        setFormData(prev => ({ ...prev, name: selectedName }));

        // 2. Check if this exact name exists in our products database
        const existingProduct = fetchedProducts.find(
            p => p.product_name.toLowerCase() === selectedName.toLowerCase()
        );

        // 3. If it exists, auto-fill the category to save them time!
        if (existingProduct && existingProduct.category) {
            setFormData(prev => ({
                ...prev,
                category: existingProduct.category.name
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (formData.categoryId === '') {
            addToast("Error", "Please pick a category...")
            setIsSubmitting(false)
            return;
        }
        if (formData.locationId === '') {
            addToast("Error", "Please pick a location...")
            setIsSubmitting(false)
            return;
        }

        const selectedCategory = fetchedCategories.find(c => c._id === formData.categoryId);
        const selectedLocation = fetchedLocations.find(c => c._id === formData.locationId);

        // Construct the payload matching your backend schema
        const payload = {
            productName: formData.name,
            price: Number(formData.price),
            category: {
                _id: selectedCategory._id,
                catalog: selectedCategory.category_catalog,
                list: selectedCategory.category_list,
                name: selectedCategory.category_name,
            },
            location: {
                _id: selectedLocation._id,
                name: selectedLocation.location_name,
            },
            listType: activeList // Distinguishes between Groceries vs Cuisines
        };

        await ResultAsync.fromPromise(
            axios.post(URL, payload, {
                headers: { Authorization: `Bearer ${cookies.get("budgetbuddy_token")}` }
            }),
            (error) => error.response?.data?.message || "Failed to submit contribution."
        )
            .map((response) => response.data) // Extract just the data using .map
            .match(
                () => {
                    addToast("Success", "Contribution submitted for community review!");
                    queryClient.invalidateQueries('pending_contributions');
                    navigate('/contribution/hub');
                },
                (errMessage) => {
                    addToast("Error", errMessage);
                }
            );

        setIsSubmitting(false);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (productsLoading || locationsLoading || categoriesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-end max-w-2xl mx-auto p-4 md:p-8">
            <Button variant="ghost" onClick={() => navigate('/contribution/hub')} className="mb-3 -ml-4 hover:bg-gray-300 rounded-md">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
            </Button>

            <Card className="border-gray-200 shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-[#ff6b47] text-white">
                    <CardTitle className="text-xl">Submit a New Price</CardTitle>
                    <p className="text-orange-50 text-sm mt-1 opacity-90">
                        Your submission will be reviewed by the community. You earn +5 points if approved!
                    </p>
                </CardHeader>

                <CardContent className="p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Product Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                required
                                list="existingProducts"
                                autoComplete="off"
                                placeholder="e.g. Joy Dishwashing Liquid 250ml"
                                value={formData.name}
                                onChange={handleNameChange} // Using the smart handler!
                                className="focus-visible:ring-orange-500 bg-white"
                            />
                            <CustomDatalist id="existingProducts" items={filteredProducts} inputValue={formData.name} />
                        </div>

                        {/* Category Toggle */}
                        <div className="flex space-x-2">
                            <Button
                                type="button"
                                variant={activeList === 'Groceries' ? 'default' : 'outline'}
                                onClick={() => setActiveList('Groceries')}
                                className={`${activeList === 'Groceries' ? 'bg-orange-500 text-white' : 'hover:bg-orange-100 bg-white'} !flex-shrink w-full flex items-center justify-center`}
                            >
                                <Store className="w-4 h-4 mr-2" />
                                Groceries
                            </Button>
                            <Button
                                type="button"
                                variant={activeList === 'Cuisines' ? 'default' : 'outline'}
                                onClick={() => setActiveList('Cuisines')}
                                className={`${activeList === 'Cuisines' ? 'bg-orange-500 text-white' : 'hover:bg-orange-100 bg-white'} !flex-shrink w-full flex items-center justify-center`}
                            >
                                <Utensils className="w-4 h-4 mr-2" />
                                Cuisines
                            </Button>

                        </div >

                        {/* Price & Category Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₱) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="price"
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                    className="focus-visible:ring-orange-500 bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                                <Select
                                    required
                                    value={formData.categoryId}
                                    onValueChange={(val) => handleInputChange('categoryId', val)}
                                >
                                    <SelectTrigger className="focus:ring-orange-500 bg-white">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>

                                    {/* --- UPDATED GROUPED CATEGORY CONTENT --- */}
                                    <SelectContent className="bg-white max-h-80 overflow-y-auto">
                                        {groupedCategories[activeList].length > 0 ? (
                                            groupedCategories[activeList].map((group, index) => (
                                                <SelectGroup key={`${group.catalogName}${index}`} >
                                                    <SelectLabel className="font-bold text-white bg-gray-600 border-b border-gray-100 py-2 cursor-default sticky top-0 z-10">
                                                        {group.catalogName}
                                                    </SelectLabel>

                                                    {group.items.map((cat, index) => (
                                                        <SelectItem
                                                            key={`${cat._id}${index}`}
                                                            value={cat._id} // Adjust this depending on what your DB requires
                                                            className="pl-4 bg-white hover:bg-gray-100 cursor-pointer"
                                                        >
                                                            {cat.category_name || cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-gray-500 text-sm">
                                                No categories available.
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Location Dropdown & Support Link */}
                        <div className="space-y-2">
                            <Label htmlFor="location">Store Location <span className="text-red-500">*</span></Label>
                            <Select
                                required
                                value={formData.locationId}
                                onValueChange={(val) => handleInputChange('locationId', val)}
                            >
                                <SelectTrigger className="focus:ring-orange-500 bg-white">
                                    <SelectValue placeholder="Select a store location" />
                                </SelectTrigger>
                                <SelectContent className="bg-white max-h-80 overflow-y-auto">
                                    {fetchedLocations.map((loc) => (
                                        <SelectItem
                                            key={loc._id || loc.id}
                                            value={loc._id}
                                            className="hover:bg-gray-100 cursor-pointer"
                                        >
                                            {loc.location_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {!DEVELOPMENT && (
                                <div className='flex justify-center'>
                                    <ReCAPTCHA
                                        sitekey='6Lc7v70sAAAAAKdVLFCjuNSzQq0Y6UIN5fhXf_Q9'
                                        onChange={(val) => setCapVal(val)}
                                    />
                                </div>
                            )}

                            <div className="flex flex-wrap items-center justify-center mt-2 text-sm text-gray-500">
                                <Info className="w-4 h-4 mr-1.5 text-gray-400" />
                                Don&apos;t see your store?
                                <Link
                                    to="/report"
                                    className="ml-1 text-orange-500 hover:text-orange-600 font-medium hover:underline"
                                >
                                    Request to add it here.
                                </Link>
                            </div>

                        </div>

                        {/* Submit Action */}
                        <div className="mt-8 border-t border-gray-100">
                            <Button
                                type="submit"
                                disabled={isSubmitting || !capVal}
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 text-lg transition-all"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                                ) : (
                                    <><Save className="w-5 h-5 mr-2" /> Submit for Review</>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div >
    );
}

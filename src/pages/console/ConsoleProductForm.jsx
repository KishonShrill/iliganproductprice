import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, Loader2, Store, Utensils } from 'lucide-react';
import { ResultAsync } from 'neverthrow';
import { useQueryClient } from 'react-query';
import useFetchCategories from '@/hooks/useFetchCategories';
import useFetchProduct from '@/hooks/useFetchProduct';
import axios from 'axios';
import Cookies from 'universal-cookie';


const cookies = new Cookies();
const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const LOCALHOST = import.meta.env.VITE_LOCALHOST;
const API_VERSION = import.meta.env.VITE_API_VERSION;

export default function ProductForm() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const productId = searchParams.get('productId');
    const isEdit = !!productId;

    const { addToast } = useOutletContext();
    const { data: fetchedCategories = [], isLoading: categoriesLoading } = useFetchCategories();
    const { data: fetchedProduct, isLoading: productLoading } = useFetchProduct(productId)

    const [formData, setFormData] = useState({
        productId: productId || null,
        productName: '',
        categoryId: '',
        productImage: null,
        formType: isEdit ? 'edit' : 'add'
    });

    let saveProductUrl = DEVELOPMENT
        ? `http://${LOCALHOST}:5000/api/${API_VERSION}/products`
        : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/products`;

    const [originalData, setOriginalData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);
    const [imagePreview, setImagePreview] = useState('');
    const [activeList, setActiveList] = useState('Groceries');

    // Check if form has changes
    const hasChanges = originalData ?
        JSON.stringify(formData) !== JSON.stringify(originalData) :
        formData.productName && formData.categoryId;

    useEffect(() => {
        if (!productId) {
            setInitialLoading(false);
            return;
        }

        // 2. If React Query is still fetching the product OR the categories, do nothing. Just wait.
        if (productLoading || categoriesLoading) {
            return;
        }

        // 3. If loading is done, but there is no product data (e.g., 404 from server)
        if (!fetchedProduct) {
            addToast("Redirecting...", "Product not found or fetch failed");
            navigate('/dev-mode/products');
            return;
        }

        if (fetchedProduct && fetchedCategories.length > 0) {

            // Find the matching category to get the ID for the dropdown
            const selectedCategory = fetchedCategories.find(c =>
                c.category_name === fetchedProduct.category.name &&
                c.category_catalog === fetchedProduct.category.catalog
            );

            const initialFormData = {
                productId: fetchedProduct.product_id,
                productName: fetchedProduct.product_name,
                categoryId: selectedCategory ? selectedCategory._id : '',
                productImage: fetchedProduct.imageUrl || null,
                formType: 'edit'
            };

            // CRITICAL: Ensure the UI toggle matches the fetched product's inventory type (Groceries vs Cuisines)
            if (fetchedProduct.category && fetchedProduct.category.list) {
                setActiveList(fetchedProduct.category.list);
            }

            setFormData(initialFormData);
            setOriginalData(initialFormData);
            setImagePreview(fetchedProduct.imageUrl || '');

            // Finally, turn off the loading screen
            setInitialLoading(false);
        }
    }, [productId, fetchedProduct, fetchedCategories, productLoading, categoriesLoading, navigate, addToast]);

    useEffect(() => {
        if (!initialLoading) {
            setFormData(prev => ({ ...prev, categoryId: '' }));
        }
    }, [activeList]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleImageChange = (e,) => {
        const file = e.target.files?.[0];
        if (file) {
            handleInputChange('productImage', file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const selectedCategory = fetchedCategories.find(c => c._id === formData.categoryId);
        const submitData = new FormData();

        submitData.append('product_id', formData.productId);
        submitData.append('product_name', formData.productName);
        submitData.append('imageUrl', formData.productImage);
        submitData.append('category', JSON.stringify({
            list: selectedCategory.category_list,
            name: selectedCategory.category_name,
            catalog: selectedCategory.category_catalog,
        }));
        submitData.append('formType', formData.formType);

        setLoading(true);
        await ResultAsync
            .fromPromise(
                axios({
                    method: isEdit ? 'put' : 'post',
                    url: isEdit ? `${saveProductUrl}/${productId}` : `${saveProductUrl}`,
                    data: submitData,
                    headers: {
                        Authorization: `Bearer ${cookies.get("budgetbuddy_token")}`
                    }
                }),
                (error) => {
                    return error.response?.data?.message || "Unable to connect to server. Please try again later.";
                }
            )
            .match(
                (axiosResponse) => {
                    const data = axiosResponse.data;
                    const savedProduct = data.product;
                    console.log("Server responded with:", data);

                    queryClient.setQueryData("fetchedProducts_Admin", (oldData) => {

                        // Helper function to handle the array logic cleanly
                        const updateArray = (currentArray) => {
                            if (isEdit) {
                                // EDIT: Map through and replace the matching item
                                return currentArray.map(item =>
                                    item._id === data.product._id ? savedProduct : item
                                );
                            } else {
                                // ADD: Unshift the new item to the very top of the list
                                return [savedProduct, ...currentArray];
                            }
                        };

                        // Apply the helper to whichever format your Axios data is in
                        if (oldData.data && Array.isArray(oldData.data)) {
                            return {
                                ...oldData,
                                data: updateArray(oldData.data)
                            };
                        }

                        if (Array.isArray(oldData)) {
                            return updateArray(oldData);
                        }

                        return oldData;
                    });

                    addToast("Success", `Product ${data.product.product_id} successfully created!`)

                    setLoading(false);
                    navigate('/dev-mode/products');

                },
                (errorMessage) => {
                    console.error("Submission failed:", errorMessage);

                    addToast("Error", errorMessage)

                    setLoading(false);
                }
            );
    };

    // --- DATA PROCESSING FOR DROPDOWN ---
    // useMemo ensures we only recalculate this when fetchedCategories or activeList changes
    const processedCategories = useMemo(() => {
        if (!fetchedCategories.length) return [];

        // 1. Filter by active toggle
        const filtered = fetchedCategories.filter(c => c.category_list === activeList);

        // 2. Group by category_catalog
        const grouped = filtered.reduce((acc, cat) => {
            const catalog = cat.category_catalog;
            if (!acc[catalog]) acc[catalog] = [];
            acc[catalog].push(cat);
            return acc;
        }, {});

        // 3. Sort catalogs alphabetically, then sort items within each catalog
        const sortedCatalogs = Object.keys(grouped).sort();

        console.log(sortedCatalogs)

        return sortedCatalogs.map(catalog => ({
            catalogName: catalog,
            items: grouped[catalog].sort((a, b) =>
                a.category_name.localeCompare(b.category_name)
            )
        }));
    }, [fetchedCategories, activeList]);

    if (initialLoading || categoriesLoading || productLoading) {
        return (
            <div className="flex-1 overflow-auto bg-gray-50 min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8 py-4 md:py-6">
                <div className="flex items-center space-x-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            {isEdit ? 'Edit Product' : 'Add New Product'}
                        </h1>
                        <p className="mt-1 text-xs md:text-sm text-gray-500">
                            {isEdit ? 'Update product information' : 'Create a new product entry'}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dev-mode/products')}
                    className="bg-gray-100 hover:bg-gray-300"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Products
                </Button>
            </div>

            {/* Form */}
            <div className="p-4 md:p-8 pb-20 md:pb-8">
                <div className="max-w-2xl mx-auto bg-white">
                    <Card>
                        <CardHeader className='flex-row!'>
                            <CardTitle>Product Information {isEdit && ` - ${productId}`}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Product Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="productName">Product Name <span className='text-red-500'>*</span></Label>
                                    <Input
                                        className="hover:bg-orange-100"
                                        id="productName"
                                        value={formData.productName}
                                        onChange={(e) => handleInputChange('productName', e.target.value)}
                                        placeholder="Enter product name"
                                        required
                                    />
                                </div>

                                {/* Category Type Toggle */}
                                <div className="space-y-2 pt-2 border-t">
                                    <Label>Inventory Type</Label>
                                    <div className="flex space-x-2">
                                        <Button
                                            type="button"
                                            variant={activeList === 'Groceries' ? 'default' : 'outline'}
                                            onClick={() => setActiveList('Groceries')}
                                            className={`${activeList === 'Groceries' ? 'bg-orange-500 text-white' : 'hover:bg-orange-100'} !flex-shrink w-full flex items-center justify-center`}
                                        >
                                            <Store className="w-4 h-4 mr-2" />
                                            Groceries
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={activeList === 'Cuisines' ? 'default' : 'outline'}
                                            onClick={() => setActiveList('Cuisines')}
                                            className={`${activeList === 'Cuisines' ? 'bg-orange-500 text-white' : 'hover:bg-orange-100'} !flex-shrink w-full flex items-center justify-center`}
                                        >
                                            <Utensils className="w-4 h-4 mr-2" />
                                            Cuisines
                                        </Button>
                                    </div>
                                </div>

                                {/* Grouped Category Dropdown */}
                                <div className="space-y-2">
                                    <Label htmlFor="categoryId">Category <span className='text-red-500'>*</span></Label>
                                    <Select
                                        value={formData.categoryId}
                                        onValueChange={(value) => handleInputChange('categoryId', value)}
                                    >
                                        <SelectTrigger className="hover:bg-orange-100">
                                            <SelectValue placeholder={`Select a ${activeList.toLowerCase()} category`} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            {processedCategories.length > 0 ? (
                                                processedCategories.map((group) => (
                                                    <SelectGroup key={group.catalogName}>
                                                        <SelectLabel className="font-bold text-gray-900 bg-gray-100 border-b border-gray-100 py-2 cursor-default">
                                                            {group.catalogName}
                                                        </SelectLabel>
                                                        {group.items.map((category) => (
                                                            <SelectItem key={category._id} value={category._id} className="ml-2 bg-white hover:bg-gray-200 cursor-pointer">
                                                                {category.category_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-sm text-gray-500">
                                                    No categories found.
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Product Image */}
                                <div className="space-y-2">
                                    <Label htmlFor="productImage">Product Image</Label>
                                    <div className="flex items-center space-x-4">
                                        <Input
                                            id="productImage"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="flex-1 cursor-pointer hover:bg-orange-100"
                                        />
                                    </div>
                                    {imagePreview && (
                                        <div className="mt-2">
                                            <img
                                                src={imagePreview}
                                                alt="Product preview"
                                                className="w-32 h-32 object-cover rounded-lg border"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end space-x-4 pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate('/dev-mode/products')}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={!hasChanges || loading}
                                        className={`${!hasChanges ? 'bg-gray-300' : 'bg-blue-600'} hover:bg-blue-700 text-white`}
                                    >
                                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        {isEdit ? 'Update Product' : 'Create Product'}
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

import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams, useOutletContext } from 'react-router-dom';
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

let saveProductUrl = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/${API_VERSION}/products`
    : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/products`;


export default function ProductForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const { addToast } = useOutletContext();
    const [populated] = useState(!!location.state?.populated);

    const [searchParams, setSearchParams] = useSearchParams();
    const productId = searchParams.get('productId');
    const isEdit = !!productId;

    const [originalData, setOriginalData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);
    const [imagePreview, setImagePreview] = useState('');
    const [activeList, setActiveList] = useState('Groceries');

    const { data: fetchedCategories = [], isLoading: categoriesLoading } = useFetchCategories();
    const { data: fetchedProduct, isLoading: productLoading } = useFetchProduct(productId)

    const [formData, setFormData] = useState({
        productId: productId || null,
        productName: '',
        categoryId: '',
        productImage: null,
        formType: isEdit ? 'edit' : 'add'
    });

    // --- NEW BULK IMPORT STATES ---
    const [isDragging, setIsDragging] = useState(false);
    const [bulkProducts, setBulkProducts] = useState(null); // null = single mode, array = bulk mode
    const fileInputRef = useRef(null);
    const dragCounter = useRef(0);

    useEffect(() => {
        if (!populated) {
            addToast("Forbidden!", `Please access this page through console products page.`);
            navigate("/dev-mode/products");
        } else {
            window.history.replaceState({}, '');
        }
    }, [populated, location, navigate, addToast]);

    // --- BULK IMPORT LOGIC ---
    const processBulkFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);

                // 1. Array Validation
                if (!Array.isArray(json) || json.length === 0) {
                    return addToast("Error", "JSON file must contain a valid array of products.", "destructive");
                }

                // 2. Strict Schema Validation (The "Wrong File" Check)
                // Now we only check if it has a product_name
                const sampleItem = json[0];
                if (!('product_name' in sampleItem)) {
                    return addToast(
                        "Invalid File Format",
                        "This doesn't look like a product list. Ensure your JSON items contain a 'product_name'.",
                        "destructive"
                    );
                }

                // 3. Get existing products to check for duplicates
                const cachedData = queryClient.getQueryData("fetchedProducts_Admin");
                const existingProducts = Array.isArray(cachedData) ? cachedData : cachedData?.data || [];

                // We check against lowercase names so "Knorr Soup" doesn't bypass "knorr soup"
                const existingNames = new Set(existingProducts.map(p => p.product_name?.toLowerCase()));

                // 4. Item-Level Validation & Filter
                const validNewProducts = json.filter(item => {
                    if (!item.product_name || typeof item.product_name !== 'string') return false;
                    if (item.imageUrl && typeof item.imageUrl !== 'string') return false;
                    if (item.categoryId && typeof item.categoryId !== 'string') return false;
                    if (existingNames.has(item.product_name.toLowerCase())) { addToast("Warning", `Product ${item.product_name} already exists...`); return false }

                    return true;
                }).map((item, index) => {
                    // If the JSON provided a valid categoryId, figure out if it's Groceries or Cuisines 
                    // so the UI toggle button highlights correctly.
                    let inferredActiveList = 'Groceries';
                    let verifiedCategoryId = '';

                    if (item.categoryId) {
                        const matchedCat = fetchedCategories.find(c => c._id === item.categoryId);

                        if (matchedCat) {
                            verifiedCategoryId = item.categoryId;
                            if (matchedCat.category_list) {
                                inferredActiveList = matchedCat.category_list;
                            }
                        }
                    }

                    return {
                        // Create a temporary ID just for React to use as a mapped key
                        _tempId: `temp_${Date.now()}_${index}`,
                        product_name: item.product_name,
                        imageUrl: item.imageUrl || null,
                        categoryId: verifiedCategoryId,
                        activeList: inferredActiveList
                    };
                });

                // 5. Final Status Checks
                if (validNewProducts.length === 0) {
                    return addToast("Info", "All products in this file already exist in your database, or the data was invalid.");
                }

                setBulkProducts(validNewProducts);
                addToast("Success", `Loaded ${validNewProducts.length} new products for review.`);

            } catch (err) {
                addToast("Error", "Failed to parse JSON file.", "destructive");
            }
        };
        reader.readAsText(file);
    };

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

    const handleBulkSubmit = async () => {
        const isReady = bulkProducts.every(p => p.categoryId !== '');
        if (!isReady) return addToast("Error", "Please assign a category to all products.", "destructive");

        // Format the payload, stripping out the _tempId
        const payload = bulkProducts.map(p => {
            const selectedCategory = fetchedCategories.find(c => c._id === p.categoryId);
            return {
                product_name: p.product_name,
                imageUrl: p.imageUrl,
                category: {
                    list: selectedCategory.category_list,
                    name: selectedCategory.category_name,
                    catalog: selectedCategory.category_catalog,
                }
            }
        });

        console.log(payload)

        setLoading(true);
        await ResultAsync
            .fromPromise(
                axios({
                    method: 'post',
                    url: `${saveProductUrl}?bulk=true`,
                    data: payload,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${cookies.get("budgetbuddy_token")}`
                    }
                }),
                (error) => error.response?.data?.message || "Bulk import failed."
            )
            .match(
                (axiosResponse) => {
                    console.log(axiosResponse)
                    queryClient.invalidateQueries("fetchedProducts_Admin");
                    addToast("Success", `Bulk imported ${payload.length} products!`);
                    setLoading(false);
                    navigate('/dev-mode/products');
                },
                (errorMessage) => {
                    addToast("Error", errorMessage, "destructive");
                    setLoading(false);
                }
            );
    };

    // --- DATA PROCESSING FOR DROPDOWN ---
    const processedCategories = useMemo(() => {
        if (!fetchedCategories.length) return [];

        const filtered = fetchedCategories.filter(c => c.category_list === activeList);
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

    // --- DATA PROCESSING FOR DROPDOWN (Bulk) ---
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

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
            console.log("enter");
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("dragover")
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            console.log("dragonleave")
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file && file.type === "application/json") {
                processBulkFile(file);
            } else {
                addToast("Error", "Please drop a valid JSON file.", "destructive");
            }
        }
    };

    if (!populated) return null;

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
        <div
            className={"relative flex-1 overflow-auto min-h-screen bg-gray-50"}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* ========================================= */
            /* DRAG & DROP BLUR OVERLAY                 */
            /* ========================================= */}
            {isDragging && (
                <div
                    className="absolute inset-0 z-50 flex w-full h-full items-center justify-center bg-white/60 backdrop-blur-sm"
                    onDrop={handleDrop}
                >
                    <div className="flex flex-col items-center justify-center p-10 bg-white rounded-3xl shadow-2xl border-2 border-dashed border-orange-400 animate-in zoom-in-95 duration-200">
                        <div className="p-4 bg-orange-100 rounded-full mb-4">
                            <Upload className="h-10 w-10 text-orange-600 animate-bounce" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Drop your JSON file</h2>
                        <p className="text-sm text-gray-500 mt-2">Release to parse and review products</p>
                    </div>
                </div>
            )}

            {/* Hidden file input for manual upload */}
            <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                    if (e.target.files[0]) processBulkFile(e.target.files[0]);
                }}
            />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8 py-4 md:py-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {bulkProducts ? 'Bulk Import Review' : (isEdit ? 'Edit Product' : 'Add New Product')}
                    </h1>
                    <p className="mt-1 text-xs md:text-sm text-gray-500">
                        {bulkProducts ? 'Assign categories to your imported products.' : (isEdit ? 'Update product information' : 'Drag a .json file here to bulk import!')}
                    </p>
                </div>
                <div className="flex space-x-2">
                    {!bulkProducts && !isEdit && (
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="h-4 w-4 mr-2" /> Upload JSON
                        </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dev-mode/products')} className="bg-gray-100">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                </div>
            </div>

            {/* Form */}
            <div className={`p-4 md:p-8 pb-20 md:pb-8 ${isDragging && 'pointer-events-none'}`} >
                {
                    bulkProducts ? (
                        /* ========================================= */
                        /* BULK IMPORT REVIEW UI                     */
                        /* ========================================= */
                        <div className="space-y-4" >
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-semibold max-md:font-normal text-gray-700">{bulkProducts.length} Products Pending</span>
                                <Button
                                    onClick={handleBulkSubmit}
                                    disabled={loading || !bulkProducts.every(p => p.categoryId)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Confirm & Submit Bulk Import
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {bulkProducts.map((product, index) => (
                                    <Card key={product._tempId} className={product.categoryId ? 'border-green-200 bg-green-50/30' : 'border-red-200'}>
                                        <CardContent className="p-4 space-y-4">
                                            <div>
                                                <h3 className="font-bold text-gray-900 line-clamp-1">{product.product_name}</h3>
                                                <p className="text-xs font-mono text-gray-500">{product.product_id}</p>
                                            </div>

                                            {/* Toggle specifically for this item */}
                                            <div className="flex space-x-2">
                                                <Button type="button" size="sm" variant={product.activeList === 'Groceries' ? 'default' : 'outline'}
                                                    onClick={() => {
                                                        const updated = [...bulkProducts];
                                                        updated[index].activeList = 'Groceries';
                                                        updated[index].categoryId = ''; // Reset category on switch
                                                        setBulkProducts(updated);
                                                    }}
                                                    className={`!flex-shrink w-full text-xs ${product.activeList === 'Groceries' && 'bg-orange-500'}`}
                                                >
                                                    Groceries
                                                </Button>
                                                <Button type="button" size="sm" variant={product.activeList === 'Cuisines' ? 'default' : 'outline'}
                                                    onClick={() => {
                                                        const updated = [...bulkProducts];
                                                        updated[index].activeList = 'Cuisines';
                                                        updated[index].categoryId = ''; // Reset category on switch
                                                        setBulkProducts(updated);
                                                    }}
                                                    className={`!flex-shrink w-full text-xs ${product.activeList === 'Cuisines' && 'bg-orange-500'}`}
                                                >
                                                    Cuisines
                                                </Button>
                                            </div >

                                            {/* Category Select for this item */}
                                            < Select
                                                value={product.categoryId}
                                                onValueChange={(val) => {
                                                    const updated = [...bulkProducts];
                                                    updated[index].categoryId = val;
                                                    setBulkProducts(updated);
                                                }
                                                }
                                            >
                                                <SelectTrigger className={!product.categoryId ? 'ring-2 ring-red-400' : ''}>
                                                    <SelectValue placeholder="Assign Category..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white max-h-64">
                                                    {groupedCategories[product.activeList]?.length > 0 ? (
                                                        groupedCategories[product.activeList].map((group) => (
                                                            <SelectGroup key={group.catalogName}>
                                                                <SelectLabel className="font-bold text-white bg-gray-600 border-b border-gray-100 py-2 cursor-default">
                                                                    {group.catalogName}
                                                                </SelectLabel>
                                                                {group.items.map((cat) => (
                                                                    <SelectItem
                                                                        key={cat._id}
                                                                        value={cat._id}
                                                                        className="pl-4 bg-white hover:bg-gray-100 cursor-pointer"
                                                                    >
                                                                        {cat.category_name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 text-center text-sm text-gray-500">
                                                            No categories found.
                                                        </div>
                                                    )}
                                                </SelectContent>                                        </Select >
                                        </CardContent >
                                    </Card >
                                ))}
                            </div >
                        </div >
                    ) : (
                        /* ========================================= */
                        /* STANDARD SINGLE PRODUCT FORM UI           */
                        /* ========================================= */
                        <div className="max-w-2xl mx-auto bg-white">
                            <Card>
                                <CardHeader className='flex-row!'>
                                    <CardTitle>Product Information {isEdit && ` - ${formData.productId}`}</CardTitle>
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
                                                                <SelectLabel className="font-bold text-white bg-gray-700 border-b border-gray-100 py-2 cursor-default">
                                                                    {group.catalogName}
                                                                </SelectLabel>
                                                                {group.items.map((category) => (
                                                                    <SelectItem key={category._id} value={category._id} className="pl-4 bg-white hover:bg-gray-200 cursor-pointer">
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
                    )
                }
            </div >
        </div >
    );
}

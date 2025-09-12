import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    productId: id || '',
    productName: '',
    categoryId: '',
    updatedPrice: 0,
    locationId: '',
    productImage: '',
    formType: isEdit ? 'edit' : 'add'
  });

  const [originalData, setOriginalData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [imagePreview, setImagePreview] = useState('');

  // Check if form has changes
  const hasChanges = originalData ? 
    JSON.stringify(formData) !== JSON.stringify(originalData) : 
    formData.productName || formData.categoryId || formData.locationId || formData.updatedPrice > 0;

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      // Load categories and locations
      const [categoriesRes, locationsRes] = await Promise.all([
        api.getCategories(),
        api.getLocations()
      ]);

      setCategories(categoriesRes.data)
      setLocations(locationsRes.data);

      // Load product data if editing
      if (isEdit && id) {
        const productRes = await api.getProductById(id);
        if (productRes.success && productRes.data) {
          const product = productRes.data;
          const initialFormData = {
            productId: product.id,
            productName: product.name,
            categoryId: product.categoryId,
            updatedPrice: product.price,
            locationId: product.locationId,
            productImage: product.productImage || '',
            formType: 'edit'
          };
          setFormData(initialFormData);
          setOriginalData(initialFormData);
          setImagePreview(product.productImage || '');
        } else {
//          toast({
//            title: "Error",
//            description: "Product not found",
//            variant: "destructive",
//          });
          navigate('/dev-mode/products');
        }
      }
    } catch (error) {
//      toast({
//        title: "Error",
//        description: "Failed to load data",
//        variant: "destructive",
//      });
    } finally {
      setInitialLoading(false);
    }
  };

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
    
    if (!formData.productName || !formData.categoryId || !formData.locationId || formData.updatedPrice <= 0) {
//      toast({
//        title: "Validation Error",
//        description: "Please fill in all required fields",
//        variant: "destructive",
//      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.saveProduct(formData);
      
      if (response.success) {
//        toast({
//          title: "Success",
//          description: response.message,
//        });
        navigate('/dev-mode/products');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
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
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name <span className='text-red-500'>*</span></Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category <span className='text-red-500'>*</span></Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => handleInputChange('categoryId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="updatedPrice">Price <span className='text-red-500'>*</span></Label>
                  <Input
                    id="updatedPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.updatedPrice || ''}
                    onChange={(e) => handleInputChange('updatedPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="locationId">Location <span className='text-red-500'>*</span></Label>
                  <Select
                    value={formData.locationId}
                    onValueChange={(value) => handleInputChange('locationId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} - {location.city}, {location.state}
                        </SelectItem>
                      ))}
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
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
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
                    className="bg-blue-600 hover:bg-blue-700"
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

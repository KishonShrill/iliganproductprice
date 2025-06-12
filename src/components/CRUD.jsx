import { useEffect, useState } from 'react'
import axios from 'axios'
import '../styles/crud.scss'

const CRUDProduct = ({ debugMode }) => {
  document.title = "Add New Product - Admin"

  const [isChanged, setIsChanged] = useState(false);
  const [originalProduct, setOriginalProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false)
  const [product, setProduct] = useState({
    productId: '',
    productName: '',
    categoryId: '',
    updatedPrice: '',
    locationId: '',
    productImage: null,
  })

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('productId');
  const type = urlParams.get('type');
  
  useEffect(() => {
    let fetchLocation = debugMode
      ? `http://localhost:5000/api/product/${productId}`
      : `https://iliganproductprice-mauve.vercel.app/api/product/${productId}`;

    fetch(fetchLocation)
    .then(response => response.json())
    .then(data => {
      // Do something with the product data, like filling out a form
      console.log(data)
      const formattedProduct = {
        productId: data.product_id || '',
        productName: data.product_name || '',
        categoryId: data.category.name || '',
        updatedPrice: data.updated_price || '',
        locationId: data.location_id || '',
        productImage: data.productImage || null,  // Assuming the API provides a productImage URL or path
      };
      setOriginalProduct(formattedProduct)
      setProduct(formattedProduct);
    })
    .catch(error => console.error(error));
  }, [])

  useEffect(() => {
    if (!originalProduct) return;

    const isSame = JSON.stringify(product) === JSON.stringify(originalProduct);
    setIsChanged(!isSame);
  }, [product, originalProduct]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Check if the product is unchanged
    if (JSON.stringify(product) === JSON.stringify(originalProduct)) {
      alert("No changes detected. Nothing to update.");
      setIsLoading(false)
      return;
    }

    const formData = new FormData();
    formData.append('productId', product.productId);
    formData.append('productName', product.productName);
    formData.append('categoryId', product.categoryId);
    formData.append('updatedPrice', product.updatedPrice);
    formData.append('locationId', product.locationId);
    formData.append('productImage', product.productImage);
    formData.append('formType', type);

    let postLocation = debugMode
      ? 'http://localhost:5000/api/products'
      : 'https://iliganproductprice-mauve.vercel.app/api/products';

    try {
      const res = await axios.post(postLocation, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      alert('Product added successfully!');
      setIsLoading(false)
      window.location.href = `/dev-mode`;
    } catch (error) {
      console.error('Error uploading product:', error);
      alert('Failed to upload product');
      setIsLoading(false)
    }
  };
  
  return (
    <div className="container">
      <h1>Update Product</h1>

      <form id="addProductForm" onSubmit={handleSubmit}>
      <div className="form-group">
          <label htmlFor="productName">Product Name:</label>
          <input
            type="text"
            id="productName"
            name="productName"
            defaultValue={product.productName}
            onChange={(e) => setProduct({ ...product, productName: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="categoryId">Category ID:</label>
          <input
            type="text"
            id="categoryId"
            name="categoryId"
            defaultValue={product.categoryId}
            onChange={(e) => setProduct({ ...product, categoryId: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="updatedPrice">Price:</label>
          <input
            type="number"
            id="updatedPrice"
            name="updatedPrice"
            defaultValue={product.updatedPrice}
            step="0.01"
            required
            onChange={(e) => setProduct({ ...product, updatedPrice: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="locationId">Location ID:</label>
          <input
            type="text"
            id="locationId"
            name="locationId"
            defaultValue={product.locationId}
            onChange={(e) => setProduct({ ...product, locationId: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="productImage">Product Image:</label>
          <input
            type="file"
            id="productImage"
            name="productImage"
            accept="image/*"
            onChange={(e) => setProduct((prevProduct) => ({
              ...prevProduct,
              productImage: e.target.files[0],
            }))}
          />
        </div>

        <button type="submit" className="submit-btn" disabled={!isChanged || isLoading}>
          {isLoading ? (<>Loading<span className="animated-dots"></span></>) : (type === "edit" ? "Update Product" : "Add Product")}
        </button>
      </form>
    </div>
  );
}

export default CRUDProduct;
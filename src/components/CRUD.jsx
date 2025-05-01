import React, {useEffect, useState, useRef} from 'react'
import '../styles/crud.scss'
import axios from 'axios'

const CRUDProduct = ({ debugMode }) => {
  document.title = "Add New Product - Admin"

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
  console.log("Type: ", type)
  
  useEffect(() => {
    let fetchLocation = debugMode
      ? `http://localhost:5000/api/products/${productId}`
      : `https://iliganproductprice-mauve.vercel.app/api/products/${productId}`;

    fetch(fetchLocation)
    .then(response => response.json())
    .then(data => {
      // Do something with the product data, like filling out a form
      console.log(data);
      setProduct({
        productId: data.product_id || '',
        productName: data.product_name || '',
        categoryId: data.category_id || '',
        updatedPrice: data.updated_price || '',
        locationId: data.location_id || '',
        productImage: data.productImage || null, // Assuming the API provides a productImage URL or path
      });
    })
    .catch(error => console.error(error));
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      console.log('Product added', res.data);
      alert('Product added successfully!');
      window.location.href = `/dev-mode`;
    } catch (error) {
      console.error('Error uploading product:', error);
      alert('Failed to upload product');
    }
  };
  

  const formRef = useRef(null)

  return (
    <div className="container">
      <h1>Update Product</h1>

      <form id="addProductForm" ref={formRef} onSubmit={handleSubmit}>
      <div className="form-group">
          <label htmlFor="productName">Product Name:</label>
          <input
            type="text"
            id="productName"
            name="productName"
            defaultValue={product.productName}
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
          />
        </div>

        <div className="form-group">
          <label htmlFor="locationId">Location ID:</label>
          <input
            type="text"
            id="locationId"
            name="locationId"
            defaultValue={product.locationId}
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
            required
          />
        </div>

        <button type="submit" className="submit-btn">Add Product</button>
      </form>
    </div>
  );
}

export default CRUDProduct;
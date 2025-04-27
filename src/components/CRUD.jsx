import React, {useEffect, useState, useRef} from 'react'
import '../styles/crud.scss'

const CRUDProduct = () => {
  document.title = "Add New Product - Admin"

  const [product, setProduct] = useState({
    productName: '',
    categoryId: '',
    updatedPrice: '',
    locationId: '',
    productImage: null, // You might want to handle images differently (e.g., show preview)
  })
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('productId');
  
  useEffect(() => {
    fetch(`https://iliganproductprice-mauve.vercel.app/api/products/${productId}`)
    .then(response => response.json())
    .then(data => {
      // Do something with the product data, like filling out a form
      console.log(data);
      setProduct({
        productName: data.product_name || '',
        categoryId: data.category_id || '',
        updatedPrice: data.updated_price || '',
        locationId: data.location_id || '',
        productImage: data.productImage || null, // Assuming the API provides a productImage URL or path
      });
    })
    .catch(error => console.error(error));
  }, []);

  const formRef = useRef(null)

  return (
    <div className="container">
      <h1>Update Product</h1>

      <form id="addProductForm" ref={formRef}>
      <div className="form-group">
          <label htmlFor="productName">Product Name:</label>
          <input
            type="text"
            id="productName"
            name="productName"
            defaultValue={product.productName} // Binding value from state
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
            required
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
            required
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
              productImage: e.target.files[0], // Handle file change if necessary
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

{/* <script>
        const form = document.getElementById('addProductForm');
        const messageArea = document.getElementById('messageArea');

        // Replace with your actual backend endpoint for creating products
        const backendEndpoint = '/api/products'; // Example endpoint

        form.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            messageArea.textContent = ''; // Clear previous messages
            messageArea.className = 'message-area'; // Reset classes

            const formData = new FormData();
            formData.append('productName', document.getElementById('productName').value);
            formData.append('categoryId', document.getElementById('categoryId').value);
            formData.append('updatedPrice', document.getElementById('updatedPrice').value);
            formData.append('locationId', document.getElementById('locationId').value);

            const productImageInput = document.getElementById('productImage');
            if (productImageInput.files.length > 0) {
                formData.append('productImage', productImageInput.files[0]); // Append the selected file
            } else {
                 displayMessage('Please select an image.', 'error');
                 return; // Stop if no image is selected (though input is required, double check)
            }


            try {
                // Show a loading indicator if desired
                // submitButton.disabled = true;
                // submitButton.textContent = 'Adding...';

                const response = await fetch(backendEndpoint, {
                    method: 'POST',
                    body: formData // FormData handles setting the correct Content-Type (multipart/form-data)
                });

                // submitButton.disabled = false;
                // submitButton.textContent = 'Add Product';


                const result = await response.json(); // Assuming backend sends JSON response

                if (response.ok) { // Check for successful HTTP status codes (200-299)
                    displayMessage('Product added successfully!', 'success');
                    form.reset(); // Clear the form on success
                } else {
                    // Handle backend errors (e.g., validation errors, server errors)
                    const errorMessage = result.message || 'An error occurred while adding the product.';
                    displayMessage(errorMessage, 'error');
                }

            } catch (error) {
                console.error('Error submitting form:', error);
                 // submitButton.disabled = false;
                 // submitButton.textContent = 'Add Product';
                displayMessage('Failed to connect to the server. Please try again later.', 'error');
            }
        });

        function displayMessage(message, type) {
            messageArea.textContent = message;
            messageArea.className = `message-area ${type}`; // Add success or error class
        }

    </script> */}
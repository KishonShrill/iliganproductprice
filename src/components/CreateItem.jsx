import React, {useEffect, useRef} from 'react'

const CreateItem = () => {
  useEffect(() => {
    document.title = "Add New Product - Admin"
    import('../styles/crud.scss')
  }, [])

  const formRef = useRef(null)

  return (
    <div className="container">
      <h1>Add New Product</h1>

      <form id="addProductForm" ref={formRef}>
        <div className="form-group">
          <label for="productName">Product Name:</label>
          <input type="text" id="productName" name="productName" required/>
        </div>

        <div className="form-group">
          <label for="categoryId">Category ID:</label>
          <input type="text" id="categoryId" name="categoryId" required/>
        </div>

        <div className="form-group">
          <label for="updatedPrice">Price:</label>
          <input type="number" id="updatedPrice" name="updatedPrice" step="0.01" required/>
        </div>

        <div className="form-group">
          <label for="locationId">Location ID:</label>
          <input type="text" id="locationId" name="locationId" required/>
        </div>

          <div className="form-group">
          <label for="productImage">Product Image:</label>
          <input type="file" id="productImage" name="productImage" accept="image/*" required/>
        </div>

        <button type="submit" className="submit-btn">Add Product</button>
      </form>
    </div>
  );
}

export default CreateItem;

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
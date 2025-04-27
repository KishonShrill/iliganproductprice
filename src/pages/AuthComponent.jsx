import React, { useEffect, useState,  } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import useProductsData from "../hooks/useProductsData";

import '../styles/crud-interface.scss'

const cookies = new Cookies();
const token = cookies.get("TOKEN");

export default function CRUDInterface() {
  document.title = 'Manage Products - Admin'
  
  const { isLoading, data, isError, error, isFetching } = useProductsData()
  const [message, setMessage] = useState("");

  // useEffect automatically executes once the page is fully loaded
  useEffect(() => {
    // set configurations for the API call here
    const configuration = {
      method: "get",
      url: "https://iliganproductprice-mauve.vercel.app/auth-endpoint",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // make the API call
    axios(configuration)
      .then((result) => {
        // assign the message in our result to the message we initialized above
        setMessage(result.data.message);
      })
      .catch((error) => {
        error = new Error();
      });
  }, [])

  function edit_product(productId) {
    window.location.href = `https://productprice-iligan.vercel.app/groceries/edit-item?productId=${productId}`;
  }

  // Display when fetched elements are empty or is loading...
  if (isLoading || isFetching) {return(
    <main className='errorDisplay'>
      <h2>Loading...</h2>
    </main>
  )}
  if (isError) {return(
    <main className='errorDisplay'>
      <h2>Error: {error.message}</h2>
    </main>
  )}

  console.log("Data:" + data.data)

  return (
    <div className="crud-container">
      <h1>Manage Products</h1>

      <a href="#" className="add-product-button">Add New Product</a>
      <div className="controls">
        <div className="control-group">
          <label htmlFor="searchQuery">Search Name:</label>
          <input type="text" id="searchQuery" placeholder="Enter product name" />
        </div>

        <div className="control-group">
          <label htmlFor="categoryFilter">Category:</label>
          <select id="categoryFilter">
            <option value="">All Categories</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="locationFilter">Location:</label>
          <select id="locationFilter">
            <option value="">All Locations</option>
          </select>
        </div>

        <div className="control-group">
          <button id="applyFiltersBtn">Apply Filters</button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Location</th>
            <th>Category</th>
            <th>Price</th>
            <th>Date Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data
          ? data?.data.map((item) => (
            <tr key={item._id}>
              <td>{item.product_id}</td>
              <td>{item.product_name}</td>
              <td>{item.location_id}</td>
              <td>{item.category_id}</td>
              <td>₱{(item.updated_price).toFixed(2)}</td>
              <td>{item.date_updated}</td>
              <td className="actions">
                <button className="edit-btn" onClick={() => edit_product(item._id)}>Edit</button>
                <button className="delete-btn" data-id={item._id}>Delete</button>
              </td>
            </tr>
          ))
          : (
            <tr>
              <td colspan="7" style="text-align: center;">Loading products...</td>
            </tr>
          )
          }
        </tbody>
      </table>

      <div className="pagination">
        <button id="prevPageBtn" disabled>&laquo; Previous</button>
        <span>Page <span id="currentPageSpan">1</span> of <span id="totalPagesSpan">1</span></span>
        <button id="nextPageBtn" disabled>Next &raquo;</button>
      </div>

      <h3 id="messageArea" className="message-area text-center text-danger">{message}</h3>
    </div>
  );
}
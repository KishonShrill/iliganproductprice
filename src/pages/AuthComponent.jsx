import React, { useEffect, useState,  } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import useFetchProducts from "../hooks/useFetchProducts";

import '../styles/crud-interface.scss'
import { Link } from "react-router-dom";

const cookies = new Cookies();
const token = cookies.get("TOKEN");

export default function CRUDInterface({ debugMode }) {
  document.title = 'Admin - Manage Products'
  
  const { isLoading, data, isError, error, isFetching } = useFetchProducts()
  console.log({ isLoading, isFetching })
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // useEffect automatically executes once the page is fully loaded
  useEffect(() => {
    // set configurations for the API call here
    let url = debugMode
      ? "http://localhost:5000/auth-endpoint"
      : "https://iliganproductprice-mauve.vercel.app/auth-endpoint";
    
    const configuration = {
      method: "get",
      url,
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
        new Error(error);
      });
  }, [])

  function edit_product(productId) {
    let location = debugMode
      ? `http://localhost:5173/groceries/edit-item?productId=${productId}&type=edit`
      : `https://productprice-iligan.vercel.app/groceries/edit-item?productId=${productId}&type=edit`;
    window.location.href = location;
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

  
  const paginatedData = data?.data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  console.log("Data:" + paginatedData)
  const totalPages = Math.ceil((data?.data.length || 0) / itemsPerPage);

  return (
    <div className="crud-container">
      <h1>Manage Products</h1>

      <Link to="https://productprice-iligan.vercel.app/groceries/add-item" className="add-product-button">Add New Product</Link>
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
            <th className="computer">Location</th>
            <th className="computer">Category</th>
            <th>Price</th>
            <th className="computer">Date Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData
          ? paginatedData.map((item) => (
            <tr key={item._id} style={item.imageUrl ? {background: "#5cb85c", color: "white"} : {background: "rgb(169 169 169)"}}>
              <td>{item.product_id}</td>
              <td>{item.product_name}</td>
              <td className="computer">{item.location_info?.location_name}</td>
              <td className="computer">{item.category_info?.category_name}</td>
              <td>₱{(item.updated_price).toFixed(2)}</td>
              <td className="computer">{item.date_updated}</td>
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
        <button
          id="prevPageBtn"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          &laquo; Previous
        </button>
        <span>
          Page <span id="currentPageSpan">{currentPage}</span> of{" "}
          <span id="totalPagesSpan">{totalPages}</span>
        </span>
        <button
          id="nextPageBtn"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next &raquo;
        </button>
      </div>


      <h3 id="messageArea" className="message-area text-center text-danger">{message}</h3>
    </div>
  );
}
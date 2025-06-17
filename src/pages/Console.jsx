import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import axios from "axios";
import Cookies from "universal-cookie";
import useFetchProducts from "../hooks/useFetchProducts";
import Pagination from "../components/Pagination";
import '../styles/admin_console.scss'

const cookies = new Cookies();
const token = cookies.get("TOKEN");

export default function CRUDInterface({ debugMode }) {
  document.title = 'Admin - Manage Products'
  
  const { isLoading, data, isError, error, isFetching } = useFetchProducts()
  // console.log({ isLoading, isFetching })

  const [search, setSearch] = useState("")
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    location: "",
  });
  
  // Populate data for the category and location select inputs
  const { uniqueLocations, uniqueCategories } = useMemo(() => {
    const locationsSet = new Set();
    const categorySet = new Set();

    data?.data.forEach(item => {
      if (item.location?.name) locationsSet.add(item.location.name);
      if (item.category?.name) categorySet.add(item.category.name);
    });

    //?? Output
    console.log("Locations:", Array.from(locationsSet));
    console.log("Categories:", Array.from(categorySet));
    
    return {
      uniqueLocations: Array.from(locationsSet),
      uniqueCategories: Array.from(categorySet)
    };
  }, [data]);
  
  // Normalize search terms
  const searchTerm = (search || "").toLowerCase();
  
  // Apply filters BEFORE pagination
  const filteredData = data?.data.filter(item => {
    const matchesCategory = filters.category === '' || item.category?.name === filters.category;
    const matchesLocation = filters.location === '' || item.location?.name === filters.location;
    const matchesSearch = 
      filters.search === '' ||
      item.product_name?.toLowerCase().includes(searchTerm) ||
      item.product_id?.toString().toLowerCase().includes(searchTerm);
      
    return matchesCategory && matchesLocation && matchesSearch;
  }) || [];
  
  const itemsPerPage = 10;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // console.log("Data:" + paginatedData)
  const totalPages = Math.ceil((filteredData.length || 0) / itemsPerPage);

  function edit_product(productId) {
    let location = debugMode
      ? `http://localhost:5173/groceries/edit-item?productId=${productId}&type=edit`
      : `https://productprice-iligan.vercel.app/groceries/edit-item?productId=${productId}&type=edit`;
    window.location.href = location;
  }

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


  // Display when fetched elements are empty or is loading...
  if (isLoading || isFetching) {return(
    <main className='errorDisplay'>
      <h2>Loading<span className="animated-dots"></span></h2>
    </main>
  )}
  if (isError) {return(
    <main className='errorDisplay'>
      <h2>Error: {error.message}</h2>
    </main>
  )}

  return (
    <div className="crud-container">
      <h1>Manage Products</h1>

      <Link to="https://productprice-iligan.vercel.app/groceries/add-item" className="add-product-button">Add New Product</Link>
      <div className="controls">
        <div className="control-group">
          <label htmlFor="searchQuery">Search Name:</label>
          <input type="text" id="searchQuery" value={search} onChange={(e) => (setSearch(e.target.value))} placeholder="Enter product name" />
        </div>

        <div className="control-group">
          <label htmlFor="categoryFilter">Category:</label>
          <select id="categoryFilter" onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">All Categories</option>
            {uniqueCategories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="locationFilter">Location:</label>
          <select id="locationFilter" onChange={(e) => setSelectedLocation(e.target.value)}>
            <option value="">All Locations</option>
            {uniqueLocations.map((location, index) => (
              <option key={index} value={location}>{location}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <button 
            id="applyFiltersBtn"
            onClick={() => setFilters({
              category: selectedCategory,
              location: selectedLocation,
            })}
          >Apply Filters</button>
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
              <td className="computer">{item.location?.name}</td>
              <td className="computer">{item.category?.name}</td>
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
              <td colSpan="7" style="text-align: center;">Loading products...</td>
            </tr>
          )
          }
        </tbody>
      </table>

      <Pagination setCurrentPage={setCurrentPage} currentPage={currentPage} totalPages={totalPages} />

      <h3 id="messageArea" className="message-area text-center text-danger">{message}</h3>
    </div>
  );
}

// 👇 Give the component a name for debugging purposes
CRUDInterface.displayName = "Console";

// 👇 Define PropTypes
CRUDInterface.propTypes = {
  debugMode: PropTypes.bool.isRequired,
}
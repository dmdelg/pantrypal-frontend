import { useEffect, useState } from "react";
import { apiCall } from "../services/api"; 
import { useAuth } from "../context/AuthContext"; // 

const SmartInventoryTracker = () => {
  const { token } = useAuth(); // Get the token from the context
  const [groceries, setGroceries] = useState([]);
  const [newGrocery, setNewGrocery] = useState({
    name: '',
    quantity: '',
    expiration_date: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Fetch all groceries on initial load
  useEffect(() => {
    const fetchGroceries = async () => {
      const data = await apiCall("/groceries/", {}, token); // Pass the token for authorization
      setGroceries(data.groceries);
    };

    fetchGroceries();
  }, [token]);

  // Handle Create
  const handleSubmit = async (e) => {
    e.preventDefault();
    await apiCall("/groceries/", {
      method: "POST",
      body: JSON.stringify(newGrocery),
      headers: { "Content-Type": "application/json" },
    }, token); // Pass the token
    setNewGrocery({ name: '', quantity: '', expiration_date: '' });
    const data = await apiCall("/groceries/", {}, token);
    setGroceries(data.groceries);
  };

  // Handle Update
  const handleUpdate = async (id) => {
    await apiCall(`/groceries/${id}`, {
      method: "PUT",
      body: JSON.stringify(newGrocery),
      headers: { "Content-Type": "application/json" },
    }, token); // Pass the token
    const data = await apiCall("/groceries/", {}, token);
    setGroceries(data.groceries);
    setNewGrocery({ name: '', quantity: '', expiration_date: '' });
  };

  // Handle Delete
  const handleDelete = async (id) => {
    await apiCall(`/groceries/${id}`, { method: "DELETE" }, token);
    const data = await apiCall("/groceries/", {}, token);
    setGroceries(data.groceries);
  };

  // Check for Expiring/Expired Items
  const checkExpiration = async () => {
    try {
      await apiCall("/groceries/check-expirations", {}, token); 
    } catch (error) {
      console.error("Error fetching expiring items:", error);
    }
  };

  // Handle Search by Name
  const handleSearch = async () => {
    const data = await apiCall(`/groceries/search?name=${searchQuery}`, {}, token); 
    setGroceries(data.groceries);
  };

  // Handle Get Grocery by ID
  const getGroceryById = async (id) => {
    const data = await apiCall(`/groceries/${id}`, {}, token); 
    console.log(data.grocery);
  };

  // Handle Get All Groceries with Filters
  const getFilteredGroceries = async (filterParams) => {
    const queryParams = new URLSearchParams(filterParams).toString();
    const data = await apiCall(`/groceries?${queryParams}`, {}, token); 
    setGroceries(data.groceries);
  };

  // Filter by Today's Expiry Date
  const filterByToday = () => {
    const today = new Date().toISOString().split('T')[0]; 
    getFilteredGroceries({ expiration_date: today });
  };

  return (
    <div>
      <h1>Smart Inventory Tracker</h1>

      {/* Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by name"
      />
      <button onClick={handleSearch}>Search</button>

      {/* Form for Creating/Updating Grocery Item */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Grocery Name"
          value={newGrocery.name}
          onChange={(e) => setNewGrocery({ ...newGrocery, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Quantity"
          value={newGrocery.quantity}
          onChange={(e) => setNewGrocery({ ...newGrocery, quantity: e.target.value })}
        />
        <input
          type="date"
          value={newGrocery.expiration_date}
          onChange={(e) => setNewGrocery({ ...newGrocery, expiration_date: e.target.value })}
        />
        <button type="submit">Add Grocery</button>
      </form>

      {/* Display Groceries List */}
      <ul>
        {groceries.map((grocery) => (
          <li key={grocery.id}>
            {grocery.name} - {grocery.quantity} - Expires on: {grocery.expiration_date}
            <button onClick={() => handleDelete(grocery.id)}>Delete</button>
            <button onClick={() => handleUpdate(grocery.id)}>Update</button>
            <button onClick={() => getGroceryById(grocery.id)}>View Details</button>
          </li>
        ))}
      </ul>

      {/* Expiration Check */}
      <button onClick={checkExpiration}>Check Expiring Items</button>

      {/* Filter by Today's Expiry Date */}
      <button onClick={filterByToday}>Filter by Expiration Date</button>

      {/* Filter by Custom Date */}
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />
      <button onClick={() => getFilteredGroceries({ expiration_date: selectedDate })}>
        Filter by Selected Expiry Date
      </button>
    </div>
  );
};

export default SmartInventoryTracker;

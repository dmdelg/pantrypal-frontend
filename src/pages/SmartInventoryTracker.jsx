import { useEffect, useState } from "react";
import { apiCall } from "../services/api"; 

const SmartInventoryTracker = () => {
  const [groceries, setGroceries] = useState([]);
  const [newGrocery, setNewGrocery] = useState({
    name: '',
    quantity: '',
    expiration_date: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all groceries on initial load
  useEffect(() => {
    const fetchGroceries = async () => {
      const data = await apiCall("/groceries");
      setGroceries(data.groceries);
    };

    fetchGroceries();
  }, []);

  // Handle Create
  const handleSubmit = async (e) => {
    e.preventDefault();
    await apiCall("/groceries", {
      method: "POST",
      body: JSON.stringify(newGrocery),
      headers: { "Content-Type": "application/json" },
    });
    setNewGrocery({ name: '', quantity: '', expiration_date: '' });
    const data = await apiCall("/groceries");
    setGroceries(data.groceries);
  };

  // Handle Update
  const handleUpdate = async (id) => {
    await apiCall(`/groceries/${id}`, {
      method: "PUT",
      body: JSON.stringify(newGrocery),
      headers: { "Content-Type": "application/json" },
    });
    const data = await apiCall("/groceries");
    setGroceries(data.groceries);
    setNewGrocery({ name: '', quantity: '', expiration_date: '' });
  };

  // Handle Delete
  const handleDelete = async (id) => {
    await apiCall(`/groceries/${id}`, { method: "DELETE" });
    const data = await apiCall("/groceries");
    setGroceries(data.groceries);
  };

  // Check for Expiring/Expired Items
  const checkExpiration = () => {
    const currentDate = new Date();
    return groceries.filter((grocery) => {
      const expirationDate = new Date(grocery.expiration_date);
      return expirationDate <= currentDate;
    });
  };

  // Send Notifications (Mock)
  const sendNotification = (expiringItems) => {
    alert(`These items are expiring soon: ${expiringItems.map(item => item.name).join(", ")}`);
  };

  // Handle Search by Name
  const handleSearch = async () => {
    const data = await apiCall(`/groceries/search?name=${searchQuery}`);
    setGroceries(data.groceries);
  };

  // Handle Get Grocery by ID
  const getGroceryById = async (id) => {
    const data = await apiCall(`/groceries/${id}`);
    console.log(data.grocery); // or handle it however you need
  };

  // Handle Get All Groceries with Filters
  const getFilteredGroceries = async (filterParams) => {
    const queryParams = new URLSearchParams(filterParams).toString();
    const data = await apiCall(`/groceries?${queryParams}`);
    setGroceries(data.groceries);
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
      <button onClick={() => sendNotification(checkExpiration())}>
        Check Expiring Items
      </button>

      {/* Filters */}
      <button onClick={() => getFilteredGroceries({ expiration_date: "2025-02-05" })}>Filter by Expiry Date</button>
    </div>
  );
};

export default SmartInventoryTracker;
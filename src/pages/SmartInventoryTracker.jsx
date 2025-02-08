import { useCallback, useEffect, useState } from "react";
import { apiCall } from "../services/api"; 
import { useAuth } from "../context/AuthContext"; 
import { format } from "date-fns";

const SmartInventoryTracker = () => {
  const { token } = useAuth(); 
  const [groceries, setGroceries] = useState([]);
  const [newGrocery, setNewGrocery] = useState({ name: '', quantity: '', expiration_date: '' });
  const [updateGrocery, setUpdateGrocery] = useState({ id: null, name: '', quantity: '', expiration_date: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Memoize fetchGroceries so it's stable for useEffect dependencies
  const fetchGroceries = useCallback(async () => {
    const data = await apiCall("/groceries/", {}, token); 
    setGroceries(data.groceries);
  }, [token]);

  useEffect(() => {
    fetchGroceries();
  }, [fetchGroceries]);

  // Format date as MM-dd-yyyy
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MM-dd-yyyy');
  };

  // Create a new grocery
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Creating grocery:", newGrocery);
    const formattedExpirationDate = formatDate(newGrocery.expiration_date); 
    await apiCall("/groceries/", {
      method: "POST",
      body: JSON.stringify({ ...newGrocery, expiration_date: formattedExpirationDate }),
      headers: { "Content-Type": "application/json" },
    }, token);
    setNewGrocery({ name: '', quantity: '', expiration_date: '' });
    fetchGroceries();
  };

  // Update an existing grocery
  const handleUpdate = async (id) => {
    console.log("Updating grocery id:", id, "with data:", updateGrocery);
    const formattedExpirationDate = formatDate(updateGrocery.expiration_date);
    await apiCall(`/groceries/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...updateGrocery, expiration_date: formattedExpirationDate }),
      headers: { "Content-Type": "application/json" },
    }, token);
    setUpdateGrocery({ id: null, name: '', quantity: '', expiration_date: '' });
    fetchGroceries();
  };

  // Delete a grocery
  const handleDelete = async (id) => {
    await apiCall(`/groceries/${id}`, { method: "DELETE" }, token);
    fetchGroceries();
  };

  // Search groceries by name
  const handleSearch = async () => {
    const data = await apiCall(`/groceries/name/${searchQuery}`, {}, token); 
    setGroceries(data.groceries);
  };

  // Filter groceries by a given expiration date
  const getFilteredGroceries = async (filterParams) => {
    const queryParams = new URLSearchParams(filterParams).toString();
    const data = await apiCall(`/groceries/${queryParams}`, {}, token); 
    setGroceries(data.groceries);
  };

  const filterByToday = () => {
    const today = new Date().toISOString().split('T')[0]; 
    getFilteredGroceries({ expiration_date: today });
  };

  return (
    <div>
      <h1>Smart Inventory Tracker</h1>

      {/* Search Section */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by name"
      />
      <button onClick={handleSearch}>Search</button>

      {/* Create New Grocery Form */}
      <form onSubmit={handleSubmit}>
        <h2>Create Grocery</h2>
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

      {/* Grocery List */}
      <ul>
        {groceries.map((grocery) => (
          <li key={grocery.id}>
            {updateGrocery.id === grocery.id ? (
              <>
                <input
                  type="text"
                  value={updateGrocery.name}
                  onChange={(e) => setUpdateGrocery({ ...updateGrocery, name: e.target.value })} 
                />
                <input
                  type="text"
                  value={updateGrocery.quantity}
                  onChange={(e) => setUpdateGrocery({ ...updateGrocery, quantity: e.target.value })} 
                />
                <input
                  type="date"
                  value={updateGrocery.expiration_date}
                  onChange={(e) => setUpdateGrocery({ ...updateGrocery, expiration_date: e.target.value })} 
                />
                <button onClick={() => handleUpdate(grocery.id)}>Update</button>
                <button onClick={() => setUpdateGrocery({ id: null, name: '', quantity: '', expiration_date: '' })}>Cancel</button>
              </>
            ) : (
              <>
                {grocery.name} - {grocery.quantity} - Expires on: {formatDate(grocery.expiration_date)} {/* Format expiration date */}
                <button onClick={() => setUpdateGrocery({ id: grocery.id, ...grocery })}>Update</button>
                <button onClick={() => handleDelete(grocery.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Filtering Section */}
      <button onClick={filterByToday}>Filter by Expiration Date</button>
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

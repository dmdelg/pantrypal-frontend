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
  const [filterOption, setFilterOption] = useState('all');  // New state for the filter option

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
    // No need to format the expiration date here, as Flask accepts the default YYYY-MM-DD format
    await apiCall("/groceries/", {
      method: "POST",
      body: JSON.stringify({ ...newGrocery, expiration_date: newGrocery.expiration_date }), // Send as YYYY-MM-DD
      headers: { "Content-Type": "application/json" },
    }, token);
    setNewGrocery({ name: '', quantity: '', expiration_date: '' });
    fetchGroceries();
  };

  // Update an existing grocery
  const handleUpdate = async (id) => {
    console.log("Updating grocery id:", id, "with data:", updateGrocery);
    await apiCall(`/groceries/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...updateGrocery, expiration_date: updateGrocery.expiration_date }),
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

  // Filter groceries by name, quantity, expiration date, or show all
  const handleFilter = async () => {
    let filterParams = {};

    if (filterOption === 'name' && searchQuery) {
      filterParams = { name: searchQuery };
    } else if (filterOption === 'quantity' && searchQuery) {
      filterParams = { quantity: searchQuery };
    } else if (filterOption === 'expiration_date' && selectedDate) {
      filterParams = { expiration_date: format(new Date(selectedDate), "MM-dd-yyyy") };
    } else if (filterOption === 'today') {
      const today = format(new Date(), "MM-dd-yyyy");
      filterParams = { expiration_date: today };
    }

    const queryParams = new URLSearchParams(filterParams).toString();
    const data = await apiCall(`/groceries/${queryParams}`, {}, token);
    setGroceries(data.groceries);
  };

  // Filter by today's expiration date
  const filterByToday = () => {
    const today = format(new Date(), "MM-dd-yyyy"); 
    handleFilter({ expiration_date: today });
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
      <div>
        <label htmlFor="filter">Filter by:</label>
        <select
          id="filter"
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value)}
        >
          <option value="all">Show All</option>
          <option value="name">Name</option>
          <option value="quantity">Quantity</option>
          <option value="expiration_date">Expiration Date</option>
          <option value="today">Expires Today</option>
        </select>
        <button onClick={handleFilter}>Apply Filter</button>
      </div>

      {/* Button to filter by today's expiration date */}
      <button onClick={filterByToday}>See What's Expiring Today</button>
    </div>
  );
};

export default SmartInventoryTracker;

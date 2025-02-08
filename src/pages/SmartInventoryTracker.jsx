import { useCallback, useEffect, useState } from "react";
import { apiCall } from "../services/api"; 
import { useAuth } from "../context/AuthContext"; 
import { format } from "date-fns";

const SmartInventoryTracker = () => {
  const { token } = useAuth(); 
  const [groceries, setGroceries] = useState([]);
  const [filteredGroceries, setFilteredGroceries] = useState([]);
  const [newGrocery, setNewGrocery] = useState({ name: '', quantity: '', expiration_date: '' });
  const [updateGrocery, setUpdateGrocery] = useState({ id: null, name: '', quantity: '', expiration_date: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // 'name', 'quantity', 'expiration_date', 'all'

  // Fetch groceries and set both the full list and the filtered list
  const fetchGroceries = useCallback(async () => {
    const data = await apiCall("/groceries/", {}, token); 
    setGroceries(data.groceries);
    setFilteredGroceries(data.groceries); // Initially set filtered list to be the full list
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

  // Filter groceries on the front-end
  const handleFilter = () => {
    let filtered = [...groceries]; // Start with a copy of the full grocery list

    if (filterBy === 'name' && searchQuery) {
      filtered = filtered.filter((grocery) =>
        grocery.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterBy === 'quantity' && searchQuery) {
      filtered = filtered.filter((grocery) => grocery.quantity.includes(searchQuery));
    }

    if (filterBy === 'expiration_date' && selectedDate) {
      filtered = filtered.filter((grocery) =>
        formatDate(grocery.expiration_date) === format(new Date(selectedDate), 'MM-dd-yyyy')
      );
    }

    if (filterBy === 'today') {
      filtered = filtered.filter((grocery) =>
        formatDate(grocery.expiration_date) === format(new Date(), 'MM-dd-yyyy')
      );
    }

    setFilteredGroceries(filtered); // Update the filtered list
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

      {/* Filter Dropdown */}
      <select onChange={(e) => setFilterBy(e.target.value)} value={filterBy}>
        <option value="all">All Groceries</option>
        <option value="name">Filter by Name</option>
        <option value="quantity">Filter by Quantity</option>
        <option value="expiration_date">Filter by Expiration Date</option>
        <option value="today">Filter by Expiring Today</option>
      </select>

      {/* Date Picker for Expiration Date Filter */}
      {filterBy === 'expiration_date' && (
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      )}

      <button onClick={handleFilter}>Apply Filter</button>

      {/* Grocery List */}
      <ul>
        {filteredGroceries.map((grocery) => (
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
                {grocery.name} - {grocery.quantity} - Expires on: {formatDate(grocery.expiration_date)}
                <button onClick={() => setUpdateGrocery({ id: grocery.id, ...grocery })}>Update</button>
                <button onClick={() => handleDelete(grocery.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Button to see groceries expiring today */}
      <button onClick={() => setFilterBy('today')}>Show Expiring Today</button>
    </div>
  );
};

export default SmartInventoryTracker;

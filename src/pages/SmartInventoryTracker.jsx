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
  const [sortOption, setSortOption] = useState('none');
  const [filterByToday, setFilterByToday] = useState(false);

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
      body: JSON.stringify({ ...newGrocery, expiration_date: newGrocery.expiration_date }),
      headers: { "Content-Type": "application/json" },
    }, token);
    setNewGrocery({ name: '', quantity: '', expiration_date: '' });
    fetchGroceries(); // Refresh groceries after creation
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
    fetchGroceries(); // Refresh groceries after update
  };

  // Delete a grocery
  const handleDelete = async (id) => {
    await apiCall(`/groceries/${id}`, { method: "DELETE" }, token);
    fetchGroceries(); // Refresh groceries after deletion
  };

  // Handle Search
  const handleSearch = () => {
    let filtered = [...groceries];
    if (searchQuery) {
      filtered = filtered.filter((grocery) =>
        grocery.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredGroceries(filtered);
  };

  // Sort groceries based on selected sort option
  const handleSort = (option) => {
    let sorted = [...filteredGroceries];
    switch (option) {
      case 'name_asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'quantity':
        sorted.sort((a, b) => a.quantity - b.quantity);
        break;
      case 'expiration_date':
        sorted.sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date));
        break;
      default:
        break;
    }
    setFilteredGroceries(sorted);
  };

  // Filter groceries by today (expiration date)
  const handleFilterToday = () => {
    const today = format(new Date(), 'MM-dd-yyyy');
    const filtered = groceries.filter((grocery) => formatDate(grocery.expiration_date) === today);
    setFilteredGroceries(filtered);
  };

  // Reset filter to show all groceries
  const handleResetFilter = () => {
    setFilteredGroceries(groceries);
  };

  return (
    <div>
      <h1>Smart Inventory Tracker</h1>

      {/* Create Grocery Form */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newGrocery.name}
          onChange={(e) => setNewGrocery({ ...newGrocery, name: e.target.value })}
          placeholder="Name"
          required
        />
        <input
          type="text"
          value={newGrocery.quantity}
          onChange={(e) => setNewGrocery({ ...newGrocery, quantity: e.target.value })}
          placeholder="Quantity"
          required
        />
        <input
          type="date"
          value={newGrocery.expiration_date}
          onChange={(e) => setNewGrocery({ ...newGrocery, expiration_date: e.target.value })}
          required
        />
        <button type="submit">Add Grocery</button>
      </form>

      {/* Search Section */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by name"
      />
      <button onClick={handleSearch}>Search</button>

      {/* Sorting Dropdown */}
      <select onChange={(e) => { handleSort(e.target.value); setSortOption(e.target.value); }} value={sortOption}>
        <option value="none">Sort By</option>
        <option value="name_asc">Name (A-Z)</option>
        <option value="name_desc">Name (Z-A)</option>
        <option value="quantity">Quantity</option>
        <option value="expiration_date">Expiration Date</option>
      </select>

      {/* Buttons to filter by today's expiration and see all groceries */}
      <button onClick={handleFilterToday}>Show Expiring Today</button>
      <button onClick={handleResetFilter}>See All Grocery Items</button>

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
    </div>
  );
};

export default SmartInventoryTracker;

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
  const [isLoading, setIsLoading] = useState(true);  // Added state for loading

  // Fetch groceries and set both the full list and the filtered list
  const fetchGroceries = useCallback(async () => {
    const data = await apiCall("/groceries/", {}, token); 
    setGroceries(data.groceries);
    setIsLoading(false); // Set loading to false once groceries are fetched
  }, [token]);

  useEffect(() => {
    fetchGroceries();
  }, [fetchGroceries]);

  // Format date as MM-dd-yyyy
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MM-dd-yyyy');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Create the grocery item to be added
    const newItem = {
      name: newGrocery.name,
      quantity: newGrocery.quantity,
      expiration_date: newGrocery.expiration_date,
    };
  
    // Add the grocery item to the backend (assuming an API call)
    const response = await fetch('your-api-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newItem),
    });
  
    if (response.ok) {
      // If the item is successfully added, update the state with the new grocery
      const addedGrocery = await response.json();
      setGroceries((prevGroceries) => [...prevGroceries, addedGrocery]); // Use functional update here
  
      // Optionally, reset the form fields
      setNewGrocery({
        name: '',
        quantity: '',
        expiration_date: '',
      });
    } else {
      // Handle error if the item is not added
      console.error('Failed to add grocery item');
    }
  };  

// Update an existing grocery
const handleUpdate = async (id) => {
  console.log("Updating grocery id:", id, "with data:", updateGrocery);
  
  // Format the expiration date to MM-dd-yyyy
  const formattedExpirationDate = format(new Date(updateGrocery.expiration_date), 'MM-dd-yyyy');
  
  await apiCall(`/groceries/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...updateGrocery, expiration_date: formattedExpirationDate }),
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

  // Handle Search on Enter or Button Click
  const handleSearch = () => {
    let filtered = [...groceries];
    if (searchQuery) {
      filtered = filtered.filter((grocery) =>
        grocery.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredGroceries(filtered);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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

  const handleFilterToday = () => {
    const today = format(new Date(), 'MM-dd-yyyy');
    const filtered = groceries.filter((grocery) => formatDate(grocery.expiration_date) === today);
    setFilteredGroceries(filtered);
    setFilterByToday(true);  
  };
  
  // And when resetting the filter
  const handleResetFilter = () => {
    setFilteredGroceries(groceries);
    setFilterByToday(false);  
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
        onKeyDown={handleSearchKeyDown} // Trigger search on Enter
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
      {isLoading ? (
        <p>Loading...</p> // Loading state
      ) : filteredGroceries.length === 0 && searchQuery === "" ? (
        <p>No groceries found. Please search or add groceries.</p> // Message when no groceries and no search done
      ) : (
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
      )}
    </div>
  );
};

export default SmartInventoryTracker;

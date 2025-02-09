import { useCallback, useState } from "react";
import { apiCall } from "../services/api"; 
import { useAuth } from "../context/AuthContext"; 
import { format } from "date-fns";

const SmartInventoryTracker = () => {
  const { token } = useAuth(); 
  const [groceries, setGroceries] = useState([]);
  const [newGrocery, setNewGrocery] = useState({ name: '', quantity: '', expiration_date: '' });
  const [updateGrocery, setUpdateGrocery] = useState({ id: null, name: '', quantity: '', expiration_date: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('none');
  const [filterByToday, setFilterByToday] = useState(false); 

  // Fetch groceries when triggered by buttons or actions
  const fetchGroceries = useCallback(async () => {
    const data = await apiCall("/groceries/", {}, token); 
    setGroceries(data.groceries);
  }, [token]);

  // Format date as MM-dd-yyyy
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MM-dd-yyyy');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newItem = {
      name: newGrocery.name,
      quantity: newGrocery.quantity,
      expiration_date: newGrocery.expiration_date,
    };
  
    const response = await fetch('/groceries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newItem),
    });
    
    if (response.ok) {
      const addedGrocery = await response.json();
      setGroceries((prevGroceries) => [...prevGroceries, addedGrocery]); 
      setNewGrocery({ name: '', quantity: '', expiration_date: '' });
    } else {
      console.error('Failed to add grocery item');
    }
  };

  const handleUpdate = async (id) => {
    const formattedExpirationDate = format(new Date(updateGrocery.expiration_date), 'MM-dd-yyyy');
    try {
      const response = await fetch(`/groceries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...updateGrocery,
          expiration_date: formattedExpirationDate,
        }),
      });
      
      if (response.ok) {
        const updatedGrocery = await response.json(); 
        const updatedGroceryList = groceries.map(grocery =>
          grocery.id === updatedGrocery.id ? updatedGrocery : grocery
        );
        setGroceries(updatedGroceryList);
      } else {
        const errorMessage = await response.text();
        console.error("Error:", errorMessage);
      }
    } catch (error) {
      console.error("Error updating grocery:", error);
    }
  };

  const handleDelete = async (id) => {
    await apiCall(`/groceries/${id}`, { method: "DELETE" }, token);
    fetchGroceries(); 
  };

  const handleSearch = () => {
    fetchGroceries(); // Trigger the fetch when search is executed
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSort = (option) => {
    setSortOption(option);
    fetchGroceries(); // Fetch groceries after sorting
  };

  const handleFilterToday = () => {
    setFilterByToday(true);
    fetchGroceries(); // Fetch groceries after filtering by today
  };
  
  const handleResetFilter = () => {
    setFilterByToday(false);
    fetchGroceries(); // Reset filter and fetch groceries
  };

  // Dynamically compute the filtered and sorted groceries
  const filteredGroceries = groceries
    .filter(grocery => 
      grocery.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
      (!filterByToday || formatDate(grocery.expiration_date) === format(new Date(), 'MM-dd-yyyy'))
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'quantity':
          return a.quantity - b.quantity;
        case 'expiration_date':
          return new Date(a.expiration_date) - new Date(b.expiration_date);
        default:
          return 0;
      }
    });

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
        onKeyDown={handleSearchKeyDown} 
        placeholder="Search by name"
      />
      <button onClick={handleSearch}>Search</button>

      {/* Sorting Dropdown */}
      <select onChange={(e) => handleSort(e.target.value)} value={sortOption}>
        <option value="none">Sort By</option>
        <option value="name_asc">Name (A-Z)</option>
        <option value="name_desc">Name (Z-A)</option>
        <option value="quantity">Quantity</option>
        <option value="expiration_date">Expiration Date</option>
      </select>

      <button onClick={handleFilterToday}>
        {filterByToday ? "Show All" : "Show Expiring Today"}
      </button>

      {/* Grocery List */}
      {filteredGroceries.length === 0 && searchQuery === "" ? (
        <p>No groceries found. Please search or add groceries.</p>
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

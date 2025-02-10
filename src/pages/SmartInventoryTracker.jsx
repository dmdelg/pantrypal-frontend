import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { apiCall } from "../services/api";

const SmartInventoryTracker = () => {
  const { token } = useAuth();
  const [groceries, setGroceries] = useState([]);
  const [newGrocery, setNewGrocery] = useState({ name: '', quantity: '', expiration_date: '' });
  const [updateGrocery, setUpdateGrocery] = useState({ id: null, name: '', quantity: '', expiration_date: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('none');
  const [filterByToday, setFilterByToday] = useState(false);

  useEffect(() => {
    const fetchGroceries = async () => {
      try {
        const response = await apiCall('/groceries', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroceries(response.data.groceries);
      } catch (error) {
        console.error('Error fetching groceries:', error);
      }
    };
    fetchGroceries();
  }, [token]);

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MM-dd-yyyy');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newItem = {
      name: newGrocery.name,
      quantity: Number(newGrocery.quantity),
      expiration_date: formatDate(newGrocery.expiration_date),
    };

    try {
      const response = await apiCall('/groceries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        data: newItem,
      });

      if (response.status === 201) {
        setGroceries(prevGroceries => [...prevGroceries, response.data.grocery]);
      }
    } catch (error) {
      console.error("Failed to add grocery item", error);
    }
  };

  const handleUpdate = async (id) => {
    const formattedExpirationDate = format(new Date(updateGrocery.expiration_date), 'MM-dd-yyyy');
    try {
      const response = await apiCall(`/groceries/${id}`, {
        method: 'PUT',
        data: { ...updateGrocery, expiration_date: formattedExpirationDate },
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const updatedGrocery = response.data;
        const updatedGroceryList = groceries.map(grocery =>
          grocery.id === updatedGrocery.id ? updatedGrocery : grocery
        );
        setGroceries(updatedGroceryList);
      }
    } catch (error) {
      console.error("Error updating grocery:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiCall(`/groceries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroceries((prevGroceries) => prevGroceries.filter(grocery => grocery.id !== id));
    } catch (error) {
      console.error('Error deleting grocery item:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search functionality tied to the search route for grocery items by name
    apiCall(`/groceries/name/${searchQuery}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(response => {
      setGroceries(response.data.groceries);
    }).catch(error => console.error("Error during search:", error));
  };

  const handleSort = (option) => {
    setSortOption(option);
  };

  const handleFilterChange = (e) => {
    if (e.target.value === "expiring_today") {
      setFilterByToday(true);
      apiCall("/groceries/check-expirations", {
        headers: { Authorization: `Bearer ${token}` },
      }).catch((error) => console.error("Error fetching expiring groceries:", error));
    } else {
      setFilterByToday(false);
      apiCall("/groceries", {
        headers: { Authorization: `Bearer ${token}` },
      }).catch((error) => console.error("Error fetching all groceries:", error));
    }
  };

  const filteredGroceries = groceries
    .filter(grocery => 
      (!filterByToday || formatDate(grocery.expiration_date) === format(new Date(), 'MM-dd-yyyy'))
    )
    .filter(grocery => 
      grocery.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by name"
        />
        <button type="submit">Search</button>
      </form>

      {/* Sorting Dropdown */}
      <select onChange={(e) => handleSort(e.target.value)} value={sortOption}>
        <option value="none">Sort By</option>
        <option value="name_asc">Name (A-Z)</option>
        <option value="name_desc">Name (Z-A)</option>
        <option value="quantity">Quantity</option>
        <option value="expiration_date">Expiration Date</option>
      </select>

      {/* Filter Dropdown */}
      <select onChange={handleFilterChange} value={filterByToday ? "expiring_today" : "show_all"}>
        <option value="show_all">Show All</option>
        <option value="expiring_today">Expiring Today</option>
      </select>

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

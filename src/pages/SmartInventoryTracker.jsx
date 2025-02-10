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
  const [sortOption, setSortOption] = useState('name-asc');

  const formatDate = (dateString, toFormat) => {
    if (!dateString) return '';
  
    if (toFormat === 'input') {
      const [month, day, year] = dateString.split('-'); // MM-dd-yyyy → yyyy-MM-dd
      return `${year}-${month}-${day}`;
    } else if (toFormat === 'backend') {
      const [year, month, day] = dateString.split('-'); // yyyy-MM-dd → MM-dd-yyyy
      return `${month}-${day}-${year}`;
    }
  
    return dateString; 
  };


  useEffect(() => {
    if (!token) return;

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newItem = {
      name: newGrocery.name,
      quantity: Number(newGrocery.quantity),
      expiration_date: formatDate(newGrocery.expiration_date,'backend'),
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
        setGroceries(prevGroceries => [...prevGroceries, response.grocery]);
        setNewGrocery({ name: '', quantity: '', expiration_date: '' });
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
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        data: { ...updateGrocery, expiration_date: formattedExpirationDate },
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
      const response = await apiCall(`/groceries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status < 200 || response.status >= 300) {
        console.error('Error deleting grocery item:', response.data.message);
      }
      setGroceries((prevGroceries) => prevGroceries.filter(grocery => grocery.id !== id));
    } catch (error) {
      console.error('Error deleting grocery item:', error);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiCall(`/groceries/name/${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setGroceries(data.groceries);
    } catch (error) {
      console.error("Error during search:", error);
    }
  };


  const handleShowAll = async () => {
    try {
      const response = await apiCall('/groceries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroceries(response.data.groceries);
      setSortOption('none-asc');
    } catch (error) {
      console.error('Error fetching groceries:', error);
    }
  };

  // Handle sorting option change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const sortGroceries = () => {
    let sortedGroceries = [...groceries];
    
    const [option, direction] = sortOption.split('-'); // Extract option and direction
    
    const sortOptions = {
        name: (a, b) => direction === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
        quantity: (a, b) => direction === "asc" ? a.quantity - b.quantity : b.quantity - a.quantity,
        expiration: (a, b) => {
            const dateA = new Date(a.expiration_date);
            const dateB = new Date(b.expiration_date);
            return direction === "asc" ? dateA - dateB : dateB - dateA;
        },
    };

    if (sortOptions[option]) {
        sortedGroceries.sort(sortOptions[option]); // Sort using the mapped function
    }

    return sortedGroceries;
  };
  
  return (
    <div>
      <h1>Smart Inventory Tracker</h1>
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
          value={formatDate(newGrocery.expiration_date, 'input')}
          onChange={(e) => setNewGrocery({ ...newGrocery, expiration_date: e.target.value })}
          required
        />
        <button type="submit">Add Grocery</button>
      </form>
  
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name"
        />
        <button type="submit">Search</button>
      </form>
  
      <button onClick={handleShowAll}>Show All</button>
  
      {/* Sorting Option Dropdown */}
      <select onChange={handleSortChange} value={sortOption}>
        <option value="none-asc">Sort By</option>
        <option value="name-asc">Name (A-Z)</option>
        <option value="name-desc">Name (Z-A)</option>
        <option value="quantity-asc">Quantity (Low to High)</option>
        <option value="quantity-desc">Quantity (High to Low)</option>
        <option value="expiration-asc">Expiration Date (Soonest First)</option>
        <option value="expiration-desc">Expiration Date (Latest First)</option>
      </select>
  
      <div>
        {sortGroceries().map(grocery => (
          <div key={grocery.id}>
            <p>{grocery.name}</p>
            <p>Quantity: {grocery.quantity}</p>
            <p>Expiration Date: {formatDate(grocery.expiration_date, 'backend')}</p>
  
            {/* Update Button */}
            <button onClick={() => setUpdateGrocery({
              id: grocery.id,
              name: grocery.name,
              quantity: grocery.quantity,
              expiration_date: grocery.expiration_date,
            })}>
              Update
            </button>
  
            {/* Delete Button */}
            <button onClick={() => handleDelete(grocery.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Update Grocery Form (Conditional Rendering) */}
      {updateGrocery.id && (
        <div>
          <h2>Update Grocery</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdate(updateGrocery.id);
            }}
          >
            <input
              type="text"
              value={updateGrocery.name}
              onChange={(e) => setUpdateGrocery({ ...updateGrocery, name: e.target.value })}
              placeholder="Name"
              required
            />
            <input
              type="text"
              value={updateGrocery.quantity}
              onChange={(e) => setUpdateGrocery({ ...updateGrocery, quantity: e.target.value })}
              placeholder="Quantity"
              required
            />
            <input
              type="date"
              value={formatDate(updateGrocery.expiration_date, 'input')}
              onChange={(e) => setUpdateGrocery({ ...updateGrocery, expiration_date: e.target.value })}
              required
            />
            <button type="submit">Update Grocery</button>
            <button type="button" onClick={() => setUpdateGrocery({ id: null, name: '', quantity: '', expiration_date: '' })}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SmartInventoryTracker;
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
  const [expiringSoonGroceries, setExpiringSoonGroceries] = useState([]);
  const [expiredGroceries, setExpiredGroceries] = useState([]);
  const [sortOption, setSortOption] = useState('none');

  // Fetch groceries data
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
      setFilteredGroceries(data.groceries);
    } catch (error) {
      console.error("Error during search:", error);
    }
  };
  useEffect(() => {
    if (token) {
      const fetchGroceries = async () => {
        try {
          const response = await apiCall('/check-expirations', {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Split response data into expiring soon and expired items
          const expiringSoonItems = response.data.expiringSoonGroceries || [];
          const expiredItems = response.data.expiredGroceries || [];

          setExpiringSoonGroceries(expiringSoonItems);
          setExpiredGroceries(expiredItems);
        } catch (error) {
          console.error('Error fetching groceries:', error);
        }
      };

      fetchGroceries();
    }
  }, [token]);

  // Handle Show All button click
  const handleShowAll = () => {
    fetchAllGroceries();  // Fetch all groceries
    setSortOption('none'); // Reset sorting when showing all
  };

  // Fetch all groceries (to be used in the show all function)
  const fetchAllGroceries = async () => {
    try {
      const response = await apiCall('/groceries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroceries(response.data.groceries);
    } catch (error) {
      console.error('Error fetching groceries:', error);
    }
  };

  // Handle sorting
  const handleSortChange = (e) => {
    const sortValue = e.target.value;
    setSortOption(sortValue);

    let sortedGroceries;
    if (sortValue === 'name') {
      sortedGroceries = [...groceries].sort((a, b) => a.name.localeCompare(b.name)); // Sort by name
    } else if (sortValue === 'quantity') {
      sortedGroceries = [...groceries].sort((a, b) => a.quantity - b.quantity); // Sort by quantity
    } else {
      sortedGroceries = [...groceries];
    }

    setGroceries(sortedGroceries);
  };


  return (
    <div>
      {/* Show All and Expiring Soon Buttons */}
      <button onClick={handleShowAll}>Show All</button>
      <button onClick={() => setExpiringSoonGroceries(true)}>Expiring Soon</button>
      <button onClick={() => setExpiredGroceries(true)}>Expired Items</button>

      {/* If Show All is selected, display Sort By Dropdown */}
      {groceries.length > 0 && (
        <div>
          <select onChange={handleSortChange} value={sortOption}>
            <option value="none">Sort By</option>
            <option value="name">Name</option>
            <option value="quantity">Quantity</option>
          </select>
        </div>
      )}

      {/* Display groceries */}
      <div>
        {groceries.map(grocery => (
          <div key={grocery.id}>
            <p>{grocery.name}</p>
            <p>Quantity: {grocery.quantity}</p>
            <p>Expiration Date: {formatDate(grocery.expiration_date)}</p>
          </div>
        ))}
      </div>

      {/* Displaying filtered expiring soon and expired groceries */}
      {expiringSoonGroceries.length > 0 && (
        <div>
          <h2>Expiring Soon</h2>
          <ul>
            {expiringSoonGroceries.map(grocery => (
              <li key={grocery.id}>
                {grocery.name} - {grocery.quantity} - {grocery.expiration_date}
              </li>
            ))}
          </ul>
        </div>
      )}

      {expiredGroceries.length > 0 && (
        <div>
          <h2>Expired Items</h2>
          <ul>
            {expiredGroceries.map(grocery => (
              <li key={grocery.id}>
                {grocery.name} - {grocery.quantity} - {grocery.expiration_date}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SmartInventoryTracker;
 
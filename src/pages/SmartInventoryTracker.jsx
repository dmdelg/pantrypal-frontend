import React, { useState, useEffect } from 'react';
import { apiCall } from './api';
import './SmartInventoryTracker.css';

const SmartInventoryTracker = () => {
  const [groceries, setGroceries] = useState([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [error, setError] = useState('');

  // Fetch groceries from the backend
  useEffect(() => {
    const fetchGroceries = async () => {
      try {
        const data = await apiCall('/groceries');
        setGroceries(data.groceries);
      } catch (err) {
        setError('Failed to fetch groceries.');
      }
    };
    fetchGroceries();
  }, []);

  // Add a new grocery item
  const handleAddGrocery = async (e) => {
    e.preventDefault();
    const newGrocery = {
      name,
      quantity,
      expiration_date: expirationDate,
    };

    try {
      await apiCall('/groceries', {
        method: 'POST',
        body: JSON.stringify(newGrocery),
        headers: { 'Content-Type': 'application/json' },
      });
      setGroceries((prev) => [...prev, newGrocery]);
      setName('');
      setQuantity('');
      setExpirationDate('');
    } catch (err) {
      setError('Failed to add grocery item.');
    }
  };

  // Delete a grocery item
  const handleDeleteGrocery = async (id) => {
    try {
      await apiCall(`/groceries/${id}`, { method: 'DELETE' });
      setGroceries((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError('Failed to delete grocery item.');
    }
  };

  // Update a grocery item
  const handleUpdateGrocery = async (id) => {
    const updatedGrocery = { name, quantity, expiration_date: expirationDate };
    try {
      await apiCall(`/groceries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedGrocery),
        headers: { 'Content-Type': 'application/json' },
      });
      setGroceries((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...updatedGrocery } : item
        )
      );
      setName('');
      setQuantity('');
      setExpirationDate('');
    } catch (err) {
      setError('Failed to update grocery item.');
    }
  };

  return (
    <div>
      <h2>Smart Inventory Tracker</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleAddGrocery}>
        <input
          type="text"
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <input
          type="date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
        />
        <button type="submit">Add Grocery</button>
      </form>
      <ul>
        {groceries.map((grocery) => (
          <li key={grocery.id}>
            <span>{grocery.name} - {grocery.quantity} - {grocery.expiration_date}</span>
            <button onClick={() => handleUpdateGrocery(grocery.id)}>Update</button>
            <button onClick={() => handleDeleteGrocery(grocery.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SmartInventoryTracker;

import { useEffect, useState } from "react";
import { apiCall } from "../services/api";
import { useAuth } from "../context/AuthContext";

const SmartInventoryTracker = () => {
  const { token } = useAuth();
  const [groceries, setGroceries] = useState([]);
  const [newGrocery, setNewGrocery] = useState({
    name: "",
    quantity: "",
    expiration_date: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchGroceries = async () => {
      const data = await apiCall("/groceries/", {}, token);
      setGroceries(data.groceries);
    };
    fetchGroceries();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await apiCall(
      "/groceries/",
      {
        method: "POST",
        body: JSON.stringify(newGrocery),
        headers: { "Content-Type": "application/json" },
      },
      token
    );
    setNewGrocery({ name: "", quantity: "", expiration_date: "" });
    const data = await apiCall("/groceries/", {}, token);
    setGroceries(data.groceries);
  };

  const handleUpdate = async (id) => {
    const groceryToUpdate = groceries.find((grocery) => grocery.id === id);
    if (!groceryToUpdate) {
      console.error("Grocery not found!");
      return;
    }

    const updatedGrocery = {
      ...groceryToUpdate,
      ...newGrocery,
      expiration_date: new Date(
        newGrocery.expiration_date || groceryToUpdate.expiration_date
      )
        .toISOString()
        .split("T")[0],
    };

    await apiCall(
      `/groceries/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(updatedGrocery),
        headers: { "Content-Type": "application/json" },
      },
      token
    );

    const data = await apiCall("/groceries/", {}, token);
    setGroceries(data.groceries);
    setNewGrocery({ name: "", quantity: "", expiration_date: "" });
  };

  const handleDelete = async (id) => {
    await apiCall(`/groceries/${id}`, { method: "DELETE" }, token);
    const data = await apiCall("/groceries/", {}, token);
    setGroceries(data.groceries);
  };

  const handleSearch = async () => {
    const data = await apiCall(`/groceries/search?name=${searchQuery}`, {}, token);
    setGroceries(data.groceries);
  };

  const getGroceryById = async (id) => {
    const data = await apiCall(`/groceries/${id}`, {}, token);
    console.log(data.grocery);
  };

  const getFilteredGroceries = async (filterParams) => {
    const queryParams = new URLSearchParams(filterParams).toString();
    const data = await apiCall(`/groceries?${queryParams}`, {}, token);
    setGroceries(data.groceries);
  };

  const filterByToday = () => {
    const today = new Date().toISOString().split("T")[0];
    getFilteredGroceries({ expiration_date: today });
  };

  return (
    <div>
      <h1>Smart Inventory Tracker</h1>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by name"
      />
      <button onClick={handleSearch}>Search</button>

      <form onSubmit={handleSubmit}>
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
          onChange={(e) =>
            setNewGrocery({ ...newGrocery, expiration_date: e.target.value })
          }
        />
        <button type="submit">Add Grocery</button>
      </form>

      <ul>
        {groceries.map((grocery) => (
          <li key={grocery.id}>
            <input
              type="text"
              value={newGrocery.name || grocery.name}
              onChange={(e) => setNewGrocery({ ...newGrocery, name: e.target.value })}
            />
            <input
              type="text"
              value={newGrocery.quantity || grocery.quantity}
              onChange={(e) => setNewGrocery({ ...newGrocery, quantity: e.target.value })}
            />
            <input
              type="date"
              value={newGrocery.expiration_date || grocery.expiration_date}
              onChange={(e) =>
                setNewGrocery({ ...newGrocery, expiration_date: e.target.value })
              }
            />
            <button onClick={() => handleUpdate(grocery.id)}>Update</button>
            <button onClick={() => handleDelete(grocery.id)}>Delete</button>
            <button onClick={() => getGroceryById(grocery.id)}>View Details</button>
          </li>
        ))}
      </ul>

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
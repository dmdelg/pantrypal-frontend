import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MyRecipes = () => {
  const { token } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [recipe, setRecipe] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [showAllRecipes, setShowAllRecipes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Fetch user's recipes on demand
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get('/recipes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecipes(response.data.recipes);
        setFilteredRecipes(response.data.recipes);
      } catch (err) {
        setError(`Error fetching recipes: ${err.message}`);
        console.error('Error fetching recipes:', err);
      }
    };

    fetchRecipes();
  }, [token]);

  // Search handler with debouncing
  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      const filtered = recipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecipes(filtered);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceSearch);
  }, [searchQuery, recipes]);

  // Sort handler
  useEffect(() => {
    let sortedRecipes = [...filteredRecipes];
    if (sortBy === 'name') {
      sortedRecipes.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'date') {
      sortedRecipes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    setFilteredRecipes(sortedRecipes);
  }, [sortBy, filteredRecipes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      setError('Title, ingredients, and instructions are required.');
      return;
    }

    try {
      if (editingId) {
        // Edit existing recipe
        await axios.put(`/recipes/${editingId}`, recipe, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEditingId(null);
      } else {
        // Create new recipe
        await axios.post('/recipes', recipe, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setRecipe({
        title: '',
        ingredients: '',
        instructions: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
      });
      fetchRecipes(); // Refresh recipe list after save
    } catch (err) {
      setError('Error saving recipe.');
    }
  };

  const handleEdit = (recipe) => {
    setEditingId(recipe.id);
    setRecipe(recipe); // Load recipe data into form for editing
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    try {
      await axios.delete(`/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRecipes();
    } catch (err) {
      setError(`Error deleting recipe: ${err.message}`);
      console.error('Error deleting recipe:', err);
    }
  };

  return (
    <div>
      <h1>My Recipes</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search recipes by name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      {/* Sort Dropdown */}
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="name">Sort by Name</option>
        <option value="date">Sort by Date</option>
      </select>

      {/* See All Recipes Button */}
      <button onClick={() => setShowAllRecipes((prev) => !prev)}>
        {showAllRecipes ? 'Hide All Recipes' : 'See All Recipes'}
      </button>

      {/* Recipe Form */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Recipe Name</label>
          <input type="text" name="title" value={recipe.title} onChange={handleChange} required />
        </div>
        <div>
          <label>Ingredients</label>
          <textarea name="ingredients" value={recipe.ingredients} onChange={handleChange} required />
        </div>
        <div>
          <label>Instructions</label>
          <textarea name="instructions" value={recipe.instructions} onChange={handleChange} required />
        </div>
        <div>
          <label>Nutritional Info (Optional)</label>
          <input type="number" name="calories" value={recipe.calories} onChange={handleChange} placeholder="Calories" />
          <input type="number" name="protein" value={recipe.protein} onChange={handleChange} placeholder="Protein" />
          <input type="number" name="carbs" value={recipe.carbs} onChange={handleChange} placeholder="Carbs" />
          <input type="number" name="fat" value={recipe.fat} onChange={handleChange} placeholder="Fat" />
        </div>
        <button type="submit">{editingId ? 'Update Recipe' : 'Add Recipe'}</button>
      </form>

      {/* Recipe List */}
      <h2>Recipe List</h2>
      {showAllRecipes && (
        <ul>
          {filteredRecipes.map((r) => (
            <li key={r.id}>
              <strong>{r.title}</strong>
              <button onClick={() => handleEdit(r)}>Edit</button>
              <button onClick={() => handleDelete(r.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      {!showAllRecipes && <p>Click "See All Recipes" to view your recipes.</p>}
    </div>
  );
};

export default MyRecipes;

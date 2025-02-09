import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../services/api'; 

const RecipeEntry = () => {
  const { token } = useAuth(); // Getting the token from Auth context
  const [recipe, setRecipe] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const { title, ingredients, instructions, calories, protein, carbs, fat } = recipe;

    if (!title || !ingredients || !instructions) {
      setError('Title, ingredients, and instructions are required.');
      return;
    }

    const newRecipe = {
      title,
      ingredients,
      instructions,
      calories: calories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
    };

    try {
      const response = await apiCall('/recipes', {
        method: 'POST',
        body: JSON.stringify(newRecipe),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        // Handle success, e.g., redirect or show success message
        alert('Recipe added successfully!');
      } else {
        const errorMessage = await response.json();
        setError(errorMessage.details || 'Something went wrong.');
      }
    } catch (err) {
      setError('Error occurred while adding the recipe.');
    }
  };

  return (
    <div>
      <h1>Add Your Recipe</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Recipe Name</label>
          <input
            type="text"
            name="title"
            value={recipe.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Ingredients</label>
          <textarea
            name="ingredients"
            value={recipe.ingredients}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Instructions</label>
          <textarea
            name="instructions"
            value={recipe.instructions}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Nutritional Information (optional)</label>
          <input
            type="number"
            name="calories"
            value={recipe.calories}
            onChange={handleChange}
            placeholder="Calories"
          />
          <input
            type="number"
            name="protein"
            value={recipe.protein}
            onChange={handleChange}
            placeholder="Protein"
          />
          <input
            type="number"
            name="carbs"
            value={recipe.carbs}
            onChange={handleChange}
            placeholder="Carbs"
          />
          <input
            type="number"
            name="fat"
            value={recipe.fat}
            onChange={handleChange}
            placeholder="Fat"
          />
        </div>
        <button type="submit">Add Recipe</button>
      </form>
    </div>
  );
};

export default RecipeEntry;

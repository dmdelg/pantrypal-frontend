import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiCall } from "../services/api";

const RecipeManager = () => {
  const { token } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [sortOption, setSortOption] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [updateRecipe, setUpdateRecipe] = useState({
    id: null,
    title: '',
    ingredients: '',
    instructions: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const recipeData = {
      title: newRecipe.title,
      ingredients: newRecipe.ingredients,
      instructions: newRecipe.instructions,
      calories: newRecipe.calories || 0,
      protein: newRecipe.protein || 0,
      carbs: newRecipe.carbs || 0,
      fat: newRecipe.fat || 0
    };

    try {
      const response = await apiCall('/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        data: recipeData,
      });

      if (response.status === 201) {
        console.log("Recipe successfully added!", response.data.recipe);
        setNewRecipe({
          title: '',
          ingredients: '',
          instructions: '',
          calories: '',
          protein: '',
          carbs: '',
          fat: ''
        });
        setRecipes(prevRecipes => [...prevRecipes, response.data.recipe]);
      }
    } catch (error) {
      console.error("Failed to add recipe", error);
    }
  };

  const handleShowAllRecipes = async () => {
    try {
      const response = await apiCall('/recipes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes(response.data.recipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const handleRecipeUpdate = async (id) => {
    const updateRecipeData = {
      title: updateRecipe.title,
      ingredients: updateRecipe.ingredients,
      instructions: updateRecipe.instructions,
      calories: updateRecipe.calories || 0,
      protein: updateRecipe.protein || 0,
      carbs: updateRecipe.carbs || 0,
      fat: updateRecipe.fat || 0
    };

    try {
      const response = await apiCall(`/recipes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        data: updateRecipeData,
      });

      if (response.status === 200) {
        setRecipes(prevRecipes =>
          prevRecipes.map(recipe =>
            recipe.id === id ? response.data.recipe : recipe
          )
        );
        setUpdateRecipe({
          id: null,
          title: '',
          ingredients: '',
          instructions: '',
          calories: '',
          protein: '',
          carbs: '',
          fat: ''
        });
      }
    } catch (error) {
      console.error("Failed to update recipe", error);
    }
  };

  const handleDeleteRecipe = async (id) => {
    try {
      const response = await apiCall(`/recipes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status < 200 || response.status >= 300) {
        console.error('Error deleting recipe:', response.data.message);
      }
      setRecipes((prevRecipes) => prevRecipes.filter(recipe => recipe.id !== id));
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const handleSortChangeRecipe = (e) => {
    setSortOption(e.target.value);
  };

  const sortRecipes = () => {
    let sortedRecipes = [...recipes];
  
    const [option, direction] = sortOption.split('-'); 

    const sortOptions = {
      title: (a, b) =>
        direction === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title),
    };
  
    if (sortOptions[option]) {
      sortedRecipes.sort(sortOptions[option]);
    }
  
    return sortedRecipes;  
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value; 
    setSearchTerm(searchTerm); 
  
    if (searchTerm.trim()) { 
      const filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        recipe.ingredients.toLowerCase().includes(searchTerm.toLowerCase()) 
      );
      setRecipes(filteredRecipes); 
    } 
  };

  const handleCancel = () => {
    setSearchTerm('');
    setSortOption('');
    setNewRecipe({
      title: '',
      ingredients: '',
      instructions: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    });
    setUpdateRecipe({
      id: null,
      title: '',
      ingredients: '',
      instructions: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    });
    setRecipes([]);
  };

  return (
    <div>
      {/* Form for creating a new recipe */}
<form onSubmit={handleSubmit}>
  <label>
    Title:
    <input
      type="text"
      value={newRecipe.title}
      onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
    />
  </label>
  <label>
    Ingredients:
    <input
      type="text"
      value={newRecipe.ingredients}
      onChange={(e) => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
    />
  </label>
  <label>
    Instructions:
    <input
      type="text"
      value={newRecipe.instructions}
      onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
    />
  </label>
  <label>
    Calories:
    <input
      type="number"
      value={newRecipe.calories}
      onChange={(e) => setNewRecipe({ ...newRecipe, calories: e.target.value })}
    />
  </label>
  <label>
    Protein:
    <input
      type="number"
      value={newRecipe.protein}
      onChange={(e) => setNewRecipe({ ...newRecipe, protein: e.target.value })}
    />
  </label>
  <label>
    Carbs:
    <input
      type="number"
      value={newRecipe.carbs}
      onChange={(e) => setNewRecipe({ ...newRecipe, carbs: e.target.value })}
    />
  </label>
  <label>
    Fat:
    <input
      type="number"
      value={newRecipe.fat}
      onChange={(e) => setNewRecipe({ ...newRecipe, fat: e.target.value })}
    />
  </label>
  <button type="submit">Add Recipe</button>
</form>

{/* Update Form (only visible when a recipe is selected for update) */}
{updateRecipe.id && (
  <form onSubmit={(e) => {
    e.preventDefault();
    handleRecipeUpdate(updateRecipe.id);  // Call the update function with the recipe ID
  }}>
    <label>
      Title:
      <input
        type="text"
        value={updateRecipe.title}
        onChange={(e) => setUpdateRecipe({ ...updateRecipe, title: e.target.value })}
      />
    </label>
    <label>
      Ingredients:
      <input
        type="text"
        value={updateRecipe.ingredients}
        onChange={(e) => setUpdateRecipe({ ...updateRecipe, ingredients: e.target.value })}
      />
    </label>
    <label>
      Instructions:
      <input
        type="text"
        value={updateRecipe.instructions}
        onChange={(e) => setUpdateRecipe({ ...updateRecipe, instructions: e.target.value })}
      />
    </label>
    <label>
      Calories:
      <input
        type="number"
        value={updateRecipe.calories}
        onChange={(e) => setUpdateRecipe({ ...updateRecipe, calories: e.target.value })}
      />
    </label>
    <label>
      Protein:
      <input
        type="number"
        value={updateRecipe.protein}
        onChange={(e) => setUpdateRecipe({ ...updateRecipe, protein: e.target.value })}
      />
    </label>
    <label>
      Carbs:
      <input
        type="number"
        value={updateRecipe.carbs}
        onChange={(e) => setUpdateRecipe({ ...updateRecipe, carbs: e.target.value })}
      />
    </label>
    <label>
      Fat:
      <input
        type="number"
        value={updateRecipe.fat}
        onChange={(e) => setUpdateRecipe({ ...updateRecipe, fat: e.target.value })}
      />
    </label>
    <button type="submit">Update Recipe</button>
  </form>
)}

      {/* Search Form */}
      <form>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search for recipes..."
        />
      </form>
<button type="submit"onClick={handleSearch}>Search</button>
<button type="button" onClick={handleCancel}>Cancel</button>
<button onClick={handleShowAllRecipes}>Show All Recipes</button>

{/* Sort Recipes */}
<select onChange={handleSortChangeRecipe} value={sortOption}>
  <option value="none-asc">Sort By</option>
  <option value="title-asc">Title (A-Z)</option>
  <option value="title-desc">Title (Z-A)</option>
</select>

{/* Recipe List Display */}
<div>
  {sortRecipes().map(recipe => (
    <div key={recipe.id}>
      <p>{recipe.title}</p>
  
      {/* Update Button */}
      <button onClick={() => setUpdateRecipe({
        id: recipe.id,
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat
      })}>
        Update
      </button>
  
      {/* Delete Button */}
      <button onClick={() => handleDeleteRecipe(recipe.id)}>
        Delete
      </button>
    </div>
  ))}
</div>
    </div>
  );
};

export default RecipeManager;

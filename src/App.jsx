import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Profile from './pages/Profile';
import SmartInventoryTracker from './pages/SmartInventoryTracker';
import RecipeEntry from './pages/UserGeneratedRecipeEntry';
import Navbar from './components/Navbar';
import './App.css';
import './index.css';
import MyRecipes from './pages/UserGeneratedRecipeEntry';

function App() {
  return (
    <AuthProvider> {/* Wrap everything inside AuthProvider */}
      <Router>
        <Navbar /> {/* Navbar spans full width */}
        <div className="container"> {/* Content inside container */}
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/smart-inventory" element={<SmartInventoryTracker />} />
              <Route path="/user-generated-recipe" element={<MyRecipes />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

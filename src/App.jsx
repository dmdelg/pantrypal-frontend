import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Profile from './pages/Profile';
import SmartInventoryTracker from './pages/SmartInventoryTracker';
import Navbar from './components/Navbar';
import './App.css';
import './index.css';

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
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

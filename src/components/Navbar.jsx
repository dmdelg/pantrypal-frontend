import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import './Navbar.css';

function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate(); 

  const handleLogout = () => {
    logout(); 
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* Left side: Name */}
      <div className="navbar-left">
        <Link to="/">
          <h1>PantryPal</h1>
        </Link>
      </div>

      {/* Right side: Navigation Links */}
      <div className="navbar-right">
        <Link to="/">Home</Link>
        {token ? (  // Show Logout if logged in
          <>
            <Link to="/profile">Profile</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/signup">Sign Up</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
import { Link } from 'react-router-dom';
import './Profile.css';

function Profile() {
  return (
    <div>
      <h2>My Profile</h2>
      <div className="grid-container">
        <Link to="/smart-inventory" className="grid-item">
          <h3>Smart Inventory Tracker</h3>
        </Link>
        <Link to="/user-generated-recipe" className="grid-item">
          <h3>User-Generated Recipe Entry</h3>
        </Link>
        <Link to="/health-dashboard" className="grid-item">
          <h3>Health Dashboard</h3>
        </Link>
      </div>
    </div>
  );
}

export default Profile;

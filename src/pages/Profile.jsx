import { Link } from "react-router-dom";
import './Profile.css';

function Profile() {
  return (
    <div>
      <h2>My Profile</h2>
      <ul className="profile-links">
        <li>
          <Link to="/smart-inventory">Smart Inventory Tracker</Link>
        </li>
        <li>
          <Link to="/recipe-entry">User-Generated Recipe Entry</Link>
        </li>
        <li>
          <Link to="/health-dashboard">Health Dashboard</Link>
        </li>
      </ul>
    </div>
  );
}

export default Profile;

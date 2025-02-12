import { Link } from 'react-router-dom';
import './Profile.css';
import { Card, Button, Row, Col } from 'react-bootstrap'; 
import pantryInventory from '../assets/pantryinventory.jpg';
import recipeEntry from '../assets/recipeentry.jpg';

function Profile() {
  return (
    <div>
      <h2>My Profile</h2>

      {/* Product Cards Section */}
      <Row className="mt-4">
        {/* Smart Inventory Tracker Card */}
        <Col xs={12} md={4}>
          <Card className="mb-4">
            <div className="card-img-container">
              <Card.Img 
                variant="top" 
                src={pantryInventory} 
                className="img-fluid custom-img" 
              />
            </div>
            <Card.Body>
              <Card.Title>Smart Inventory Tracker</Card.Title>
              <Card.Text>
                Track your pantry items and manage your inventory efficiently to reduce waste.
              </Card.Text>
              <Button variant="primary" as={Link} to="/smart-inventory">Start Tracking</Button>
            </Card.Body>
          </Card>
        </Col>

        {/* User-Generated Recipe Entry Card */}
        <Col xs={12} md={4}>
          <Card className="mb-4">
            <div className="card-img-container">
              <Card.Img 
                variant="top" 
                src={recipeEntry}
                className="img-fluid custom-img" 
              />
            </div>
            <Card.Body>
              <Card.Title>User-Generated Recipe Entry</Card.Title>
              <Card.Text>
                Share and save your own recipes, keeping your cooking fresh and healthy.
              </Card.Text>
              <Button variant="primary" as={Link} to="/user-generated-recipe">Add to Cookbook</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Profile;

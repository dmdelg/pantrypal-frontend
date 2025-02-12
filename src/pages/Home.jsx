import { Link } from "react-router-dom";
import { Button, Container, Row, Col } from 'react-bootstrap';
import '../index.css';
import './home.css'; 
import groceriesImage from '../assets/groceries.jpg'
import groceriesListImage from '../assets/grocerieslist.jpg'
import pantryImage from '../assets/pantry.jpg'



const Home = () => {
  return (
    <div className="text-center py-5" style={{ backgroundColor: '#FFEDFA' }}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <h1 className="display-5 fw-bold" style={{ color: '#DE3163' }}>
              Welcome to PantryPal
            </h1>
            <p className="lead mb-4">
              Households often struggle to efficiently manage their food inventory, leading to unnecessary waste, while also finding it challenging to maintain wellness goals such as balanced nutrition.
            </p>
            <p className="lead mb-4">
              This project aims to solve these issues by creating PantryPal, a web application that combines food inventory tracking with personalized wellness features, empowering users to manage their groceries, create and store recipes, and track their daily nutrition and goals.
            </p>
            <Button variant="primary" size="lg" as={Link} to="/signup">
              Get Started
            </Button>
          </Col>
        </Row>

        {/* Images Section */}
        <Row className="mt-5">
          <Col xs={12} sm={4} className="mb-4">
            <div className="image-container">
              <img src={pantryImage} alt="Pantry" className="img-fluid rounded" />
            </div>
          </Col>
          <Col xs={12} sm={4} className="mb-4">
            <div className="image-container">
              <img src={groceriesImage} alt="Groceries" className="img-fluid rounded" />
            </div>
          </Col>
          <Col xs={12} sm={4} className="mb-4">
            <div className="image-container">
              <img src={groceriesListImage} alt="Groceries List" className="img-fluid rounded" />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
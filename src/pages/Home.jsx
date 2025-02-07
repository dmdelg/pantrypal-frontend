import { Link } from "react-router-dom";
import '../index.css';

const Home = () => {
  return (
    <div>
      <section className="home-section">
        <h1>Welcome to PantryPal</h1>
        <p>
          Households often struggle to efficiently manage their food inventory, leading to unnecessary waste, while also finding it challenging to maintain wellness goals such as balanced nutrition.
        </p>
        <p>
          This project aims to solve these issues by creating PantryPal, a web application that combines food inventory tracking with personalized wellness features, empowering users to manage their groceries, create and store recipes, and track their daily nutrition and goals.
        </p>
        <div>
          <Link to="/signup">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

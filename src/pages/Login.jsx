import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../services/api';
import { Button, Container, Form, Alert } from 'react-bootstrap';
import logo from '../assets/logo.png';

const Login = () => {
  const { token, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  // If already logged in, redirect to profile page
  useEffect(() => {
    if (token) {
      navigate('/profile');  // Redirect to profile if already logged in
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginData = {
      email,
      password,
    };

    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: loginData,
      });
      
      const data = response.data;
      if (data.token) {
        login(data.token);
        navigate('/profile');
      } else {
        setError('No token received. Please try again.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="col-md-4">
        {/* Logo Section */}
        <div className="text-center mb-4">
          <img src={logo} alt="PantryPal Logo" style={{ maxWidth: '55%', height: 'auto' }} />

        </div>

        <h2 className="text-center mb-4" style={{ color: '#DE3163' }}>Login</h2>

        {/* Show error if any */}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* Email input field */}
          <Form.Group controlId="formEmail" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          {/* Password input field */}
          <Form.Group controlId="formPassword" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          {/* Submit button */}
          <Button variant="primary" type="submit" className="w-100">
            Login
          </Button>
        </Form>

        <div className="text-center mt-3">
          <p>Don't have an account? <a href="/signup" style={{ color: '#DE3163' }}>Sign up here</a></p>
        </div>
      </div>
    </Container>
  );
};

export default Login;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../services/api';
import logo from '../assets/logo.png';


const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    const signUpData = {
      email,
      password,
    };

    try {
      const response = await apiCall('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: signUpData,
      });

      const responseData = response.data;
      if (responseData.message) {
        console.log('User registered successfully');
        navigate('/login'); 
      } else {
        setError(responseData.details || 'Sign up failed');
      }
    } catch (err) {
      console.error('Error during sign up:', err);
      setError(err.message || 'An error occurred during sign up');
    }
  };

  return (
    <div className="container mt-5">
      {/* Logo Section */}
      <div className="text-center mb-4">
        <img src={logo} alt="PantryPal Logo" style={{ maxWidth: '20%', height: 'auto' }} />
      </div>

      <h2 className="text-center mb-4" style={{ color: '#DE3163' }}>Sign Up</h2>

      {/* Display error message */}
      {error && <div className="alert alert-danger mb-4">{error}</div>}

      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={handleSubmit} className="card p-4">
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="d-grid gap-2">
              <button type="submit" className="btn btn-primary">Sign Up</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

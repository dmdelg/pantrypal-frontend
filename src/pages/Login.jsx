import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../services/api';

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
    <div>
      <h2>Login</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;

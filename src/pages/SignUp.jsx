import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../services/api'; 

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
        data: signUpData,
      });
      
      // Check if the registration was successful based on the response status
      if (response.status >= 200 && response.status < 300) {
        console.log('User registered successfully');
        navigate('/login');
      } else {
        setError(response.details || 'Sign up failed');
      }
    } catch (err) {
      console.error('Error during sign up:', err);
      setError(err.message || 'An error occurred during sign up');
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      {error && <p className="error">{error}</p>} {/* Display error */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;

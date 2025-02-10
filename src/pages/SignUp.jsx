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
        headers: {
          'Content-Type': 'application/json',
        },
        data: signUpData,
      });

      if (response.message) {
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
    <div>
      <h2>Sign Up</h2>
      {error && <p>{error}</p>} {/* Display error message */}
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
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;

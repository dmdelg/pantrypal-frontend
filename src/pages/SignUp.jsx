import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from './api'; // Import your apiCall function

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiCall('/auth/register', {
        method: 'POST',
        data: { email, password },
      });

      // If the registration is successful, redirect to login page
      if (response.message) {
        navigate('/login');
      }
    } catch (error) {
      setError(error.message || 'Something went wrong');
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Sign Upr</button>
      </form>
    </div>
  );
};

export default SignUp;

import { useState, useEffect } from 'react';
import { authContext } from './AuthContext';
import PropTypes from 'prop-types';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true); 
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false); 
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token); 
    } else {
      localStorage.removeItem('token'); 
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token'); 
  };

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <authContext.Provider value={{ token, login, logout }}>
      {children}
    </authContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

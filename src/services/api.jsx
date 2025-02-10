import axios from 'axios';

const BASE_URL = 'https://pantrypal-backend.onrender.com';

export const apiCall = async (url, options = {}, token = '') => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,  // Directly use the passed token
    ...options.headers,
  };

  try {
    const response = await axios(`${BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error('Something went wrong!');
    }

    return response.data;
  } catch (error) {
    console.error('Error during API call:', error);
    throw new Error(error.message || 'An unknown error occurred');
  }
};

import axios from 'axios';

const BASE_URL = 'https://pantrypal-backend.onrender.com';

export const apiCall = async (url, options = {}, token = '') => {
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers, 
  };

  try {
    const response = await axios({
      method: options.method,
      url: `${BASE_URL}${url}`,
      headers,
      data: options.body, // axios uses 'data' for the request body
      withCredentials: true, // To include cookies if needed
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

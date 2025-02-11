import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:5000';

export const apiCall = async (url, options = {}, token = '') => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await axios(`${BASE_URL}${url}`, {
      ...options,
      headers,
      withCredentials: true,
    });

    return response;
  } catch (error) {
    console.error('Error during API call:', error);
    throw new Error(error.message || 'An unknown error occurred');
  }
};

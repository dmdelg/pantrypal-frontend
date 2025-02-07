const BASE_URL = 'https://pantrypal-backend.onrender.com';

export const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token'); 

  const headers = {
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }), 
  };

  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong!');
    }

    return response.json();
  } catch (error) {
    console.error('Error during API call:', error);
    throw new Error(error.message || 'An unknown error occurred');
  }
};

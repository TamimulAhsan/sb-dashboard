import axios from 'axios';

const api = axios.create({
  baseURL: 'http://sb.tamimulahsan.com:4000/api/', // Backend base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: add token handling later if needed

export default api;
import axios from "axios";

// Create axios instance with base URL from environment variable
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies with requests (httpOnly cookies)
  timeout: 30000, // 30 second timeout for all requests
});

// No need for Authorization header interceptor - httpOnly cookies are sent automatically

export default api;

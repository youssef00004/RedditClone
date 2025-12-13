import api from "./api";

const authService = {
  // Login
  login: async (identifier, password) => {
    try {
      const response = await api.post("/auth/login", { identifier, password });
      // Token is now stored in httpOnly cookie, only save user data
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  },

  // Register
  register: async (email, username, password) => {
    try {
      const response = await api.post("/auth/register", {
        email,
        username,
        password,
      });
      // Note: Your backend doesn't return token on register, so we need to login after
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Registration failed";
    }
  },

  // Google Login
  googleLogin: async (credential) => {
    try {
      const response = await api.post("/auth/google", { credential });
      // Token is now stored in httpOnly cookie, only save user data
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Google login failed";
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("user");
    } catch (error) {
      // Clear user data even if API call fails
      localStorage.removeItem("user");
      throw error.response?.data?.message || "Logout failed";
    }
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("user");
  },
};

export default authService;

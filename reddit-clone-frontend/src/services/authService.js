import api from "./api";

const authService = {
  // Login
  login: async (identifier, password) => {
    try {
      const response = await api.post("/auth/login", { identifier, password });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
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
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Google login failed";
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

export default authService;

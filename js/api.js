/* ==========================================================================
   NexusBlog - Frontend API Client (Module 5 Auth & Route Protection)
   ========================================================================== */

const API_BASE_URL = "http://localhost:5000/api";

class ApiClient {
  static getToken() {
    return localStorage.getItem("nexus_jwt_token");
  }

  static setToken(token) {
    localStorage.setItem("nexus_jwt_token", token);
  }

  static removeToken() {
    localStorage.removeItem("nexus_jwt_token");
    localStorage.removeItem("nexus_session");
  }

  static isAuthenticated() {
    return !!this.getToken();
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...options.headers
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (response.status === 401 && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/register")) {
        console.warn("JWT Session expired or unauthorized access.");
        this.removeToken();
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error ${response.status}`);
      }

      return data;
    } catch (err) {
      console.warn(`[API Call Failed: ${endpoint}]`, err.message);
      throw err;
    }
  }

  // --- Auth APIs ---
  static async register(name, email, password, avatar) {
    const data = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, avatar })
    });
    if (data.token) {
      this.setToken(data.token);
      localStorage.setItem("nexus_session", JSON.stringify(data.user));
    }
    return data;
  }

  static async login(email, password) {
    const data = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      this.setToken(data.token);
      localStorage.setItem("nexus_session", JSON.stringify(data.user));
    }
    return data;
  }

  static async getMe() {
    return await this.request("/auth/me");
  }

  // --- Blog APIs ---
  static async getBlogs(category = "All", search = "") {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (search) params.append("search", search);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return await this.request(`/blogs${queryString}`);
  }

  static async getBlogById(id) {
    return await this.request(`/blogs/${id}`);
  }

  static async createBlog(blogData) {
    return await this.request("/blogs", {
      method: "POST",
      body: JSON.stringify(blogData)
    });
  }

  static async updateBlog(id, blogData) {
    return await this.request(`/blogs/${id}`, {
      method: "PUT",
      body: JSON.stringify(blogData)
    });
  }

  static async deleteBlog(id) {
    return await this.request(`/blogs/${id}`, {
      method: "DELETE"
    });
  }

  static async getUserBlogsAndStats() {
    return await this.request("/blogs/user/me");
  }

  static async addComment(postId, text, authorName) {
    return await this.request(`/blogs/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text, author: authorName })
    });
  }

  static async toggleLike(postId) {
    return await this.request(`/blogs/${postId}/like`, {
      method: "POST"
    });
  }
}

window.ApiClient = ApiClient;

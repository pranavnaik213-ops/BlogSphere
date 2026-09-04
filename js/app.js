/* ==========================================================================
   NexusBlog - App Core Engine & State Manager (Backend API Connected)
   ========================================================================== */

class AppEngine {
  constructor() {
    this.posts = [];
    this.currentUser = null;
    this.activeCategory = "All";
    this.searchQuery = "";
    this.init();
  }

  async init() {
    // Load User Session
    const userSession = localStorage.getItem("nexus_session");
    if (userSession) {
      this.currentUser = JSON.parse(userSession);
    }

    // Initialize posts from Express REST API
    await this.fetchPosts();

    // Theme initialization & event listeners
    this.initTheme();
    this.setupGlobalListeners();
  }

  async fetchPosts(category = "All", search = "") {
    try {
      const response = await ApiClient.getBlogs(category, search);
      if (response && response.data) {
        this.posts = response.data;
        return response.data;
      }
    } catch (err) {
      console.warn("Backend API offline, using fallback posts state.");
      const storedPosts = localStorage.getItem("nexus_posts");
      if (storedPosts) {
        this.posts = JSON.parse(storedPosts);
      }
    }
    return this.posts;
  }

  initTheme() {
    const savedTheme = localStorage.getItem("nexus_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.innerHTML = savedTheme === "dark" 
        ? '<i class="fa-solid me-0 fa-sun"></i>' 
        : '<i class="fa-solid me-0 fa-moon"></i>';
    }
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("nexus_theme", next);
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.innerHTML = next === "dark" 
        ? '<i class="fa-solid me-0 fa-sun"></i>' 
        : '<i class="fa-solid me-0 fa-moon"></i>';
    }
    this.showToast(`Switched to ${next} theme mode`, "info");
  }

  showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icon = type === "success" ? "fa-circle-check" : type === "error" ? "fa-circle-exclamation" : "fa-circle-info";
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(50px)";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  setupGlobalListeners() {
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => this.toggleTheme());
    }

    const avatarBtn = document.getElementById("user-avatar-btn");
    const dropdown = document.getElementById("user-dropdown");
    if (avatarBtn && dropdown) {
      avatarBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("show");
      });
      document.addEventListener("click", () => dropdown.classList.remove("show"));
    }
  }

  renderAuthNav() {
    const authActions = document.getElementById("nav-actions-wrap");
    if (!authActions) return;

    if (this.currentUser) {
      authActions.innerHTML = `
        <button id="theme-toggle" class="theme-toggle-btn" title="Toggle Theme">
          <i class="fa-solid fa-sun"></i>
        </button>
        <div class="user-menu">
          <button id="user-avatar-btn" class="user-avatar-btn">
            <img src="${this.currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" class="avatar-img" alt="Avatar">
            <span style="font-weight: 600; font-size: 0.9rem;">${this.currentUser.name}</span>
            <i class="fa-solid fa-chevron-down" style="font-size: 0.75rem; color: var(--text-dim);"></i>
          </button>
          <div id="user-dropdown" class="user-dropdown">
            <a href="dashboard.html" class="dropdown-item"><i class="fa-solid fa-chart-line"></i> Dashboard</a>
            <a href="create-blog.html" class="dropdown-item"><i class="fa-solid fa-pen-to-square"></i> Create Blog</a>
            <hr style="border: none; border-top: 1px solid var(--border-color); margin: 0.4rem 0;">
            <button id="logout-btn" class="dropdown-item" style="color: var(--rose); width: 100%; text-align: left;"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
          </div>
        </div>
      `;
      this.initTheme();
      this.setupGlobalListeners();
      document.getElementById("logout-btn")?.addEventListener("click", () => {
        ApiClient.removeToken();
        this.showToast("Logged out successfully", "info");
        setTimeout(() => window.location.href = "index.html", 800);
      });
    } else {
      authActions.innerHTML = `
        <button id="theme-toggle" class="theme-toggle-btn" title="Toggle Theme">
          <i class="fa-solid fa-sun"></i>
        </button>
        <a href="login.html" class="btn btn-secondary btn-sm">Login</a>
        <a href="register.html" class="btn btn-primary btn-sm">Register</a>
      `;
      this.initTheme();
      this.setupGlobalListeners();
    }
  }

  async toggleLike(postId) {
    try {
      const res = await ApiClient.toggleLike(postId);
      const post = this.posts.find(p => p.id === postId);
      if (post) {
        post.liked = res.liked;
        post.likes = res.likes;
      }
      this.showToast(res.liked ? "Added to liked posts" : "Removed like", "success");
    } catch (err) {
      this.showToast("Failed to toggle like", "error");
    }
  }

  toggleBookmark(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    post.bookmarked = !post.bookmarked;
    this.showToast(post.bookmarked ? "Post saved to bookmarks" : "Post removed from bookmarks", "info");
  }

  async openArticleModal(postId) {
    let post = null;
    try {
      const res = await ApiClient.getBlogById(postId);
      post = res.data;
    } catch (err) {
      post = this.posts.find(p => p.id === postId);
    }

    if (!post) return;

    const modal = document.getElementById("article-modal");
    if (!modal) return;

    modal.querySelector(".article-header").innerHTML = `
      <span class="card-badge">${post.category || 'Tech'}</span>
      <h1 class="article-title">${post.title}</h1>
      <div class="card-meta">
        <div class="author-info">
          <img src="${post.author ? post.author.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" class="author-avatar" alt="Author">
          <span class="author-name">${post.author ? post.author.name : 'Author'}</span>
        </div>
        <span>•</span>
        <span>${post.publishedAt}</span>
        <span>•</span>
        <span><i class="fa-regular fa-clock"></i> ${post.readTime}</span>
        <span>•</span>
        <span><i class="fa-regular fa-eye"></i> ${post.views || 0} views</span>
      </div>
    `;

    modal.querySelector("#modal-cover-img").src = post.coverImage;
    modal.querySelector("#modal-article-body").innerHTML = post.content;
    
    this.renderModalComments(post);
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeArticleModal() {
    const modal = document.getElementById("article-modal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  }

  renderModalComments(post) {
    const commentList = document.getElementById("modal-comment-list");
    if (!commentList) return;

    if (!post.comments || post.comments.length === 0) {
      commentList.innerHTML = `<p style="color: var(--text-dim); font-size: 0.9rem;">No comments yet. Be the first to share your thoughts!</p>`;
    } else {
      commentList.innerHTML = post.comments.map(c => `
        <div class="comment-card">
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-author">${c.author}</span>
              <span class="comment-time">${c.date || 'Recently'}</span>
            </div>
            <p class="comment-text">${c.text}</p>
          </div>
        </div>
      `).join("");
    }

    const submitBtn = document.getElementById("modal-comment-submit");
    const commentInput = document.getElementById("modal-comment-input");
    
    if (submitBtn && commentInput) {
      submitBtn.onclick = async () => {
        const text = commentInput.value.trim();
        if (!text) {
          this.showToast("Please enter a comment before posting", "error");
          return;
        }
        const authorName = this.currentUser ? this.currentUser.name : "Guest Reader";
        try {
          const res = await ApiClient.addComment(post.id, text, authorName);
          post.comments = res.data;
          commentInput.value = "";
          this.renderModalComments(post);
          this.showToast("Comment published via REST API!", "success");
        } catch (err) {
          this.showToast("Error adding comment", "error");
        }
      };
    }
  }
}

window.appEngine = new AppEngine();
document.addEventListener("DOMContentLoaded", () => {
  window.appEngine.renderAuthNav();
});

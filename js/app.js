/* ==========================================================================
   NexusBlog - App Core Engine & State Manager
   ========================================================================== */

const INITIAL_POSTS = [
  {
    id: "post-1",
    title: "Mastering Modern Web Architecture: HTML5, CSS3, and ES6+",
    slug: "mastering-modern-web-architecture",
    excerpt: "Explore the core foundational pillars of front-end development, responsive layouts, modular CSS architectures, and dynamic user interfaces.",
    content: `<p>Web development has undergone a massive transformation in recent years. With HTML5 semantic structures, advanced CSS3 capabilities like Grid and Flexbox, and modern JavaScript standards, building application interfaces is more expressive than ever.</p>
    <h2>Key Components of Modern Web Apps</h2>
    <p>Designing modern user experiences demands clarity, performance, and responsive design systems. By leveraging CSS custom properties, component-driven layouts, and modular state management, developers can craft rich applications without heavy external frameworks.</p>
    <blockquote>"Great front-end development is where clean code meets stunning visual aesthetics."</blockquote>
    <p>Start with solid semantic tags like <code>&lt;header&gt;</code>, <code>&lt;main&gt;</code>, and <code>&lt;article&gt;</code>, then construct custom CSS tokens for scalable color palettes and fluid typography.</p>`,
    category: "Web Dev",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    author: {
      name: "Pranav Sharma",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    publishedAt: "2026-09-04",
    readTime: "5 min read",
    views: 1420,
    likes: 384,
    bookmarked: false,
    liked: false,
    comments: [
      { id: "c1", author: "Alex Rivers", text: "This article is super insightful! Love the breakdown of CSS variables.", date: "2 hours ago" },
      { id: "c2", author: "Sarah Lin", text: "Very clear explanation of semantic HTML structures.", date: "5 hours ago" }
    ]
  },
  {
    id: "post-2",
    title: "Designing Glassmorphic & Cyberpunk UI Systems",
    slug: "designing-glassmorphic-cyberpunk-ui",
    excerpt: "Learn how to combine dark modes, backdrop blur filters, glowing neon borders, and dynamic hover animations for high-impact visual design.",
    content: `<p>Glassmorphism and cyber-inspired UI designs create immersive digital experiences. Through strategic use of translucency, ambient background gradients, and micro-interactions, interfaces come to life.</p>
    <h2>Implementing Backdrop Blur</h2>
    <p>Using standard CSS, setting <code>backdrop-filter: blur(16px)</code> with semi-transparent background colors allows elements to blend smoothly into background artwork.</p>`,
    category: "Design",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    author: {
      name: "Maya Vance",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
    },
    publishedAt: "2026-09-03",
    readTime: "4 min read",
    views: 980,
    likes: 256,
    bookmarked: false,
    liked: false,
    comments: []
  },
  {
    id: "post-3",
    title: "Building Intelligent Web Applications with Generative AI APIs",
    slug: "building-intelligent-web-applications-ai",
    excerpt: "A beginner-friendly guide to integrating intelligent AI subagents, context retrieval systems, and real-time interaction flows into web interfaces.",
    content: `<p>Generative AI tools are reshaping how developers construct features. From automatic text summarization to automated content creation, AI APIs provide exciting capabilities for front-end engineers.</p>`,
    category: "AI",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
    author: {
      name: "David Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    publishedAt: "2026-09-02",
    readTime: "7 min read",
    views: 2150,
    likes: 512,
    bookmarked: false,
    liked: false,
    comments: []
  },
  {
    id: "post-4",
    title: "10 Essential Responsive CSS Layout Techniques Every Developer Should Know",
    slug: "10-essential-responsive-css-layout-techniques",
    excerpt: "From CSS Grid auto-fit auto-fill magic to clamp() fluid typography, master the modern tools for layout perfection across screen sizes.",
    content: `<p>Responsive layout design ensures your application looks flawless on mobile, tablet, and desktop monitors alike. Let's cover key layout practices.</p>`,
    category: "Tech",
    coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    author: {
      name: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
    },
    publishedAt: "2026-09-01",
    readTime: "6 min read",
    views: 1890,
    likes: 420,
    bookmarked: false,
    liked: false,
    comments: []
  }
];

class AppEngine {
  constructor() {
    this.posts = [];
    this.currentUser = null;
    this.activeCategory = "All";
    this.searchQuery = "";
    this.init();
  }

  init() {
    // Load Posts from LocalStorage or seed defaults
    const storedPosts = localStorage.getItem("nexus_posts");
    if (!storedPosts) {
      this.posts = INITIAL_POSTS;
      localStorage.setItem("nexus_posts", JSON.stringify(this.posts));
    } else {
      this.posts = JSON.parse(storedPosts);
    }

    // Load User Session
    const userSession = localStorage.getItem("nexus_session");
    if (userSession) {
      this.currentUser = JSON.parse(userSession);
    }

    // Theme initialization
    this.initTheme();

    // Event listeners for global elements
    this.setupGlobalListeners();
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

  savePosts() {
    localStorage.setItem("nexus_posts", JSON.stringify(this.posts));
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
    // Theme toggle button
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => this.toggleTheme());
    }

    // User Avatar Dropdown toggle
    const avatarBtn = document.getElementById("user-avatar-btn");
    const dropdown = document.getElementById("user-dropdown");
    if (avatarBtn && dropdown) {
      avatarBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("show");
      });
      document.addEventListener("click", () => dropdown.classList.remove("show"));
    }

    // Mobile Navigation Toggle
    const mobileBtn = document.getElementById("mobile-menu-btn");
    const navLinks = document.getElementById("nav-links");
    if (mobileBtn && navLinks) {
      mobileBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active-mobile");
      });
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
      // Re-bind listeners
      this.initTheme();
      this.setupGlobalListeners();
      document.getElementById("logout-btn")?.addEventListener("click", () => {
        localStorage.removeItem("nexus_session");
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

  toggleLike(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    this.savePosts();
    this.showToast(post.liked ? "Added to liked posts" : "Removed like", "success");
  }

  toggleBookmark(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    post.bookmarked = !post.bookmarked;
    this.savePosts();
    this.showToast(post.bookmarked ? "Post saved to bookmarks" : "Post removed from bookmarks", "info");
  }

  openArticleModal(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    post.views += 1;
    this.savePosts();

    const modal = document.getElementById("article-modal");
    if (!modal) return;

    modal.querySelector(".article-header").innerHTML = `
      <span class="card-badge">${post.category}</span>
      <h1 class="article-title">${post.title}</h1>
      <div class="card-meta">
        <div class="author-info">
          <img src="${post.author.avatar}" class="author-avatar" alt="${post.author.name}">
          <span class="author-name">${post.author.name}</span>
        </div>
        <span>•</span>
        <span>${post.publishedAt}</span>
        <span>•</span>
        <span><i class="fa-regular fa-clock"></i> ${post.readTime}</span>
        <span>•</span>
        <span><i class="fa-regular fa-eye"></i> ${post.views} views</span>
      </div>
    `;

    modal.querySelector("#modal-cover-img").src = post.coverImage;
    modal.querySelector("#modal-article-body").innerHTML = post.content;
    
    // Render comments inside modal
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
              <span class="comment-time">${c.date}</span>
            </div>
            <p class="comment-text">${c.text}</p>
          </div>
        </div>
      `).join("");
    }

    // Attach comment submit button
    const submitBtn = document.getElementById("modal-comment-submit");
    const commentInput = document.getElementById("modal-comment-input");
    
    if (submitBtn && commentInput) {
      submitBtn.onclick = () => {
        const text = commentInput.value.trim();
        if (!text) {
          this.showToast("Please enter a comment before posting", "error");
          return;
        }
        const authorName = this.currentUser ? this.currentUser.name : "Guest Reader";
        if (!post.comments) post.comments = [];
        post.comments.unshift({
          id: "c_" + Date.now(),
          author: authorName,
          text: text,
          date: "Just now"
        });
        this.savePosts();
        commentInput.value = "";
        this.renderModalComments(post);
        this.showToast("Comment published!", "success");
      };
    }
  }
}

// Global App Instance
window.appEngine = new AppEngine();
document.addEventListener("DOMContentLoaded", () => {
  window.appEngine.renderAuthNav();
});

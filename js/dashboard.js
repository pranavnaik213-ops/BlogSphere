/* ==========================================================================
   NexusBlog - Dashboard Controller
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = window.appEngine.currentUser;
  
  if (!currentUser) {
    window.appEngine.showToast("Please log in to access your dashboard", "error");
    setTimeout(() => window.location.href = "login.html", 1000);
    return;
  }

  initDashboard(currentUser);
});

function initDashboard(user) {
  // Update header greetings
  const welcomeTitle = document.getElementById("welcome-title");
  if (welcomeTitle) {
    welcomeTitle.innerText = `Welcome back, ${user.name}! 👋`;
  }

  renderStats(user);
  renderUserPostsTable(user);
  setupSearchAndFilters(user);
}

function renderStats(user) {
  const posts = window.appEngine.posts;
  // User posts match author name or ID
  const userPosts = posts.filter(p => p.author && p.author.name === user.name);

  const totalPosts = userPosts.length;
  const totalViews = userPosts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = userPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const draftCount = userPosts.filter(p => p.status === "draft").length;

  document.getElementById("stat-total-posts").innerText = totalPosts;
  document.getElementById("stat-total-views").innerText = totalViews.toLocaleString();
  document.getElementById("stat-total-likes").innerText = totalLikes.toLocaleString();
  document.getElementById("stat-drafts").innerText = draftCount;
}

function renderUserPostsTable(user, filterStatus = "all", searchQuery = "") {
  const tableBody = document.getElementById("dashboard-posts-body");
  if (!tableBody) return;

  let posts = window.appEngine.posts.filter(p => p.author && p.author.name === user.name);

  if (filterStatus === "published") {
    posts = posts.filter(p => p.status !== "draft");
  } else if (filterStatus === "draft") {
    posts = posts.filter(p => p.status === "draft");
  }

  if (searchQuery) {
    posts = posts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  if (posts.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-dim);">
          <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <p>No blog posts found.</p>
          <a href="create-blog.html" class="btn btn-primary btn-sm" style="margin-top: 1rem;">Create Your First Blog</a>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = posts.map(post => {
    const isDraft = post.status === "draft";
    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.9rem;">
            <img src="${post.coverImage}" style="width: 48px; height: 48px; border-radius: var(--radius-sm); object-fit: cover;">
            <div>
              <div style="font-weight: 600; color: var(--text-main); font-size: 0.95rem;">${post.title}</div>
              <div style="font-size: 0.8rem; color: var(--text-dim);">${post.category || 'General'} • ${post.publishedAt}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="status-badge ${isDraft ? 'draft' : 'published'}">
            <i class="fa-solid ${isDraft ? 'fa-pen-to-square' : 'fa-circle-check'}"></i> ${isDraft ? 'Draft' : 'Published'}
          </span>
        </td>
        <td><i class="fa-regular fa-eye" style="color: var(--text-dim);"></i> ${post.views || 0}</td>
        <td><i class="fa-regular fa-heart" style="color: var(--text-dim);"></i> ${post.likes || 0}</td>
        <td>
          <div class="action-btns">
            <button onclick="viewPost('${post.id}')" class="btn btn-secondary btn-sm" title="View Article"><i class="fa-solid fa-eye"></i></button>
            <a href="create-blog.html?id=${post.id}" class="btn btn-secondary btn-sm" title="Edit Post"><i class="fa-solid fa-pen"></i></a>
            <button onclick="confirmDeletePost('${post.id}')" class="btn btn-danger btn-sm" title="Delete Post"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function setupSearchAndFilters(user) {
  const searchInput = document.getElementById("dashboard-search");
  const filterSelect = document.getElementById("dashboard-filter");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderUserPostsTable(user, filterSelect ? filterSelect.value : "all", e.target.value);
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", (e) => {
      renderUserPostsTable(user, e.target.value, searchInput ? searchInput.value : "");
    });
  }
}

// Global action helpers
window.viewPost = (id) => {
  window.appEngine.openArticleModal(id);
};

window.confirmDeletePost = (id) => {
  if (confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
    window.appEngine.posts = window.appEngine.posts.filter(p => p.id !== id);
    window.appEngine.savePosts();
    window.appEngine.showToast("Blog post deleted successfully", "success");
    renderStats(window.appEngine.currentUser);
    renderUserPostsTable(window.appEngine.currentUser);
  }
};

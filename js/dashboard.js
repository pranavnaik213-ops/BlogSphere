/* ==========================================================================
   NexusBlog - Private Dashboard Controller (JWT Protected & User-Isolated)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  // Enforce private route protection
  if (!ApiClient.isAuthenticated()) {
    window.appEngine.showToast("Please log in to access your private dashboard", "error");
    setTimeout(() => window.location.href = "login.html", 800);
    return;
  }

  try {
    const authRes = await ApiClient.getMe();
    if (authRes && authRes.user) {
      window.appEngine.currentUser = authRes.user;
      localStorage.setItem("nexus_session", JSON.stringify(authRes.user));
    }
  } catch (err) {
    window.appEngine.showToast("Session expired. Please log in again.", "error");
    ApiClient.removeToken();
    setTimeout(() => window.location.href = "login.html", 800);
    return;
  }

  const currentUser = window.appEngine.currentUser;
  initDashboard(currentUser);
});

let userPostsData = [];

async function initDashboard(user) {
  const welcomeTitle = document.getElementById("welcome-title");
  if (welcomeTitle) {
    welcomeTitle.innerText = `Welcome back, ${user.name}! 👋`;
  }

  await loadDashboardData(user);
  setupSearchAndFilters(user);
}

async function loadDashboardData(user) {
  try {
    const res = await ApiClient.getUserBlogsAndStats();
    if (res && res.stats) {
      renderStats(res.stats);
    }
    if (res && res.data) {
      userPostsData = res.data;
      renderUserPostsTable(userPostsData);
    }
  } catch (err) {
    console.warn("Backend user API error, using isolated user state:", err.message);
    const posts = window.appEngine.posts.filter(p => p.author && (p.author.id === user.id || p.author.name === user.name));
    userPostsData = posts;
    const totalPosts = posts.length;
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
    const draftCount = posts.filter(p => p.status === "draft").length;

    renderStats({ totalPosts, totalViews, totalLikes, draftCount });
    renderUserPostsTable(userPostsData);
  }
}

function renderStats(stats) {
  document.getElementById("stat-total-posts").innerText = stats.totalPosts || 0;
  document.getElementById("stat-total-views").innerText = (stats.totalViews || 0).toLocaleString();
  document.getElementById("stat-total-likes").innerText = (stats.totalLikes || 0).toLocaleString();
  document.getElementById("stat-drafts").innerText = stats.draftCount || 0;
}

function renderUserPostsTable(postsList) {
  const tableBody = document.getElementById("dashboard-posts-body");
  if (!tableBody) return;

  if (!postsList || postsList.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-dim);">
          <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <p>You haven't written any blog posts yet.</p>
          <a href="create-blog.html" class="btn btn-primary btn-sm" style="margin-top: 1rem;">Create Your First Blog</a>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = postsList.map(post => {
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

  const filterAction = () => {
    let filtered = [...userPostsData];
    const statusVal = filterSelect ? filterSelect.value : "all";
    const query = searchInput ? searchInput.value.toLowerCase() : "";

    if (statusVal === "published") {
      filtered = filtered.filter(p => p.status !== "draft");
    } else if (statusVal === "draft") {
      filtered = filtered.filter(p => p.status === "draft");
    }

    if (query) {
      filtered = filtered.filter(p => p.title.toLowerCase().includes(query));
    }

    renderUserPostsTable(filtered);
  };

  if (searchInput) searchInput.addEventListener("input", filterAction);
  if (filterSelect) filterSelect.addEventListener("change", filterAction);
}

// Global action helpers
window.viewPost = (id) => {
  window.location.href = `blog-detail.html?id=${id}`;
};

window.confirmDeletePost = async (id) => {
  if (confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
    try {
      await ApiClient.deleteBlog(id);
      window.appEngine.showToast("Blog post deleted via Express REST API", "success");
      await loadDashboardData(window.appEngine.currentUser);
    } catch (err) {
      window.appEngine.showToast("Error deleting blog post", "error");
    }
  }
};

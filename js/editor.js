/* ==========================================================================
   NexusBlog - Create / Edit Blog Editor Controller
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = window.appEngine.currentUser;
  
  if (!currentUser) {
    window.appEngine.showToast("Please log in to create or edit blogs", "error");
    setTimeout(() => window.location.href = "login.html", 1000);
    return;
  }

  initEditor(currentUser);
});

let editorTags = ["Web Dev", "Frontend"];
let editingPostId = null;

function initEditor(user) {
  // Check if URL has ?id=POST_ID for editing
  const urlParams = new URLSearchParams(window.location.search);
  editingPostId = urlParams.get("id");

  setupFormattingToolbar();
  setupTagInput();
  setupCoverImagePreview();
  setupLivePreview();
  setupPublishHandlers(user);

  if (editingPostId) {
    loadPostForEditing(editingPostId);
  }
}

function loadPostForEditing(postId) {
  const post = window.appEngine.posts.find(p => p.id === postId);
  if (!post) {
    window.appEngine.showToast("Post not found", "error");
    return;
  }

  document.getElementById("editor-page-title").innerText = "Edit Blog Post";
  document.getElementById("blog-title").value = post.title;
  document.getElementById("blog-category").value = post.category || "Tech";
  document.getElementById("cover-url").value = post.coverImage;
  document.getElementById("blog-excerpt").value = post.excerpt;
  document.getElementById("blog-content").value = post.content;
  
  // Set cover preview image
  const previewImg = document.getElementById("cover-preview-img");
  const previewPlaceholder = document.getElementById("cover-preview-placeholder");
  if (previewImg && previewPlaceholder) {
    previewImg.src = post.coverImage;
    previewImg.style.display = "block";
    previewPlaceholder.style.display = "none";
  }

  // Tags
  if (post.tags && Array.isArray(post.tags)) {
    editorTags = [...post.tags];
  } else {
    editorTags = [post.category || "Tech"];
  }
  renderTags();
}

function setupFormattingToolbar() {
  const textarea = document.getElementById("blog-content");
  if (!textarea) return;

  const toolBtns = document.querySelectorAll(".tool-btn");
  toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tag = btn.getAttribute("data-tag");
      if (!tag) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const selected = text.substring(start, end) || "Sample text";

      let replacement = "";
      if (tag === "b") replacement = `<b>${selected}</b>`;
      else if (tag === "i") replacement = `<i>${selected}</i>`;
      else if (tag === "h2") replacement = `\n<h2>${selected}</h2>\n`;
      else if (tag === "quote") replacement = `\n<blockquote>${selected}</blockquote>\n`;
      else if (tag === "code") replacement = `<code>${selected}</code>`;
      else if (tag === "ul") replacement = `\n<ul>\n  <li>${selected}</li>\n</ul>\n`;

      textarea.value = text.substring(0, start) + replacement + text.substring(end);
      textarea.focus();
    });
  });
}

function setupTagInput() {
  const tagInput = document.getElementById("tag-input");
  if (!tagInput) return;

  renderTags();

  tagInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.value.trim().replace(",", "");
      if (val && !editorTags.includes(val)) {
        editorTags.push(val);
        tagInput.value = "";
        renderTags();
      }
    }
  });
}

function renderTags() {
  const container = document.getElementById("tags-list");
  if (!container) return;

  container.innerHTML = editorTags.map((tag, idx) => `
    <span class="tag-pill">
      #${tag}
      <i class="fa-solid fa-xmark tag-remove" onclick="removeTag(${idx})"></i>
    </span>
  `).join("");
}

window.removeTag = (idx) => {
  editorTags.splice(idx, 1);
  renderTags();
};

function setupCoverImagePreview() {
  const coverUrlInput = document.getElementById("cover-url");
  const previewImg = document.getElementById("cover-preview-img");
  const previewPlaceholder = document.getElementById("cover-preview-placeholder");

  if (!coverUrlInput || !previewImg || !previewPlaceholder) return;

  const presetBtns = document.querySelectorAll(".preset-cover-btn");
  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const url = btn.getAttribute("data-url");
      coverUrlInput.value = url;
      previewImg.src = url;
      previewImg.style.display = "block";
      previewPlaceholder.style.display = "none";
    });
  });

  coverUrlInput.addEventListener("input", () => {
    const url = coverUrlInput.value.trim();
    if (url) {
      previewImg.src = url;
      previewImg.style.display = "block";
      previewPlaceholder.style.display = "none";
    } else {
      previewImg.style.display = "none";
      previewPlaceholder.style.display = "block";
    }
  });
}

function setupLivePreview() {
  const previewBtn = document.getElementById("live-preview-btn");
  if (!previewBtn) return;

  previewBtn.addEventListener("click", () => {
    const title = document.getElementById("blog-title").value.trim() || "Untitled Blog Post";
    const category = document.getElementById("blog-category").value;
    const coverImage = document.getElementById("cover-url").value || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80";
    const content = document.getElementById("blog-content").value || "<p>Start writing your blog content...</p>";

    const tempPost = {
      id: "preview_temp",
      title: title,
      category: category,
      coverImage: coverImage,
      content: content,
      author: window.appEngine.currentUser,
      publishedAt: "Preview Mode",
      readTime: "3 min read",
      views: 0,
      likes: 0,
      comments: []
    };

    window.appEngine.openArticleModal("preview_temp");
    // Inject preview post manually into modal
    const modal = document.getElementById("article-modal");
    if (modal) {
      modal.querySelector(".article-header").innerHTML = `
        <span class="card-badge">${category}</span>
        <h1 class="article-title">${title} (Live Preview)</h1>
        <div class="card-meta">
          <div class="author-info">
            <img src="${window.appEngine.currentUser.avatar}" class="author-avatar" alt="Author">
            <span class="author-name">${window.appEngine.currentUser.name}</span>
          </div>
          <span>•</span>
          <span>Draft Preview</span>
        </div>
      `;
      modal.querySelector("#modal-cover-img").src = coverImage;
      modal.querySelector("#modal-article-body").innerHTML = content;
    }
  });
}

function setupPublishHandlers(user) {
  const publishBtn = document.getElementById("publish-btn");
  const saveDraftBtn = document.getElementById("save-draft-btn");

  if (publishBtn) {
    publishBtn.addEventListener("click", () => savePost(user, "published"));
  }

  if (saveDraftBtn) {
    saveDraftBtn.addEventListener("click", () => savePost(user, "draft"));
  }
}

function savePost(user, status = "published") {
  const title = document.getElementById("blog-title").value.trim();
  const category = document.getElementById("blog-category").value;
  const coverImage = document.getElementById("cover-url").value.trim() || 
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80";
  const excerpt = document.getElementById("blog-excerpt").value.trim() || 
    title.substring(0, 120) + "...";
  const content = document.getElementById("blog-content").value.trim();

  if (!title || !content) {
    window.appEngine.showToast("Please enter both a title and blog content", "error");
    return;
  }

  const posts = window.appEngine.posts;

  if (editingPostId) {
    const index = posts.findIndex(p => p.id === editingPostId);
    if (index !== -1) {
      posts[index] = {
        ...posts[index],
        title,
        category,
        coverImage,
        excerpt,
        content,
        tags: [...editorTags],
        status: status
      };
      window.appEngine.savePosts();
      window.appEngine.showToast(`Post updated successfully!`, "success");
    }
  } else {
    const newPost = {
      id: "post-" + Date.now(),
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category,
      coverImage,
      excerpt,
      content,
      tags: [...editorTags],
      status: status,
      author: {
        name: user.name,
        avatar: user.avatar
      },
      publishedAt: new Date().toISOString().split("T")[0],
      readTime: Math.ceil(content.split(" ").length / 200) + " min read",
      views: 0,
      likes: 0,
      comments: []
    };
    posts.unshift(newPost);
    window.appEngine.savePosts();
    window.appEngine.showToast(status === "draft" ? "Saved as draft!" : "Blog published successfully!", "success");
  }

  setTimeout(() => window.location.href = "dashboard.html", 1000);
}

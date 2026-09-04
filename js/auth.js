/* ==========================================================================
   NexusBlog - Auth Engine (Login & Registration Controller)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initAuthForm();
  initPasswordToggles();
  initPasswordStrengthMeter();
  initAvatarPicker();
});

function initAuthForm() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const demoLoginBtn = document.getElementById("demo-login-btn");

  // Demo Login Handler
  if (demoLoginBtn) {
    demoLoginBtn.addEventListener("click", () => {
      const demoUser = {
        id: "usr_demo",
        name: "Alex Dev",
        email: "demo@nexus.com",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
      };
      localStorage.setItem("nexus_session", JSON.stringify(demoUser));
      window.appEngine.showToast("Logged in as Demo User!", "success");
      setTimeout(() => window.location.href = "dashboard.html", 800);
    });
  }

  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (!email || !password) {
        window.appEngine.showToast("Please fill in all fields", "error");
        return;
      }

      // Check registered users
      const users = JSON.parse(localStorage.getItem("nexus_users") || "[]");
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (user || (email === "demo@nexus.com" && password === "password123")) {
        const sessionUser = user || {
          id: "usr_demo",
          name: "Alex Dev",
          email: "demo@nexus.com",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
        };
        localStorage.setItem("nexus_session", JSON.stringify(sessionUser));
        window.appEngine.showToast(`Welcome back, ${sessionUser.name}!`, "success");
        setTimeout(() => window.location.href = "dashboard.html", 800);
      } else {
        window.appEngine.showToast("Invalid email or password", "error");
      }
    });
  }

  // Register Form Submission
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("reg-name").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-password").value;
      const confirmPassword = document.getElementById("reg-confirm-password").value;
      const selectedAvatar = document.querySelector(".avatar-option.selected")?.src || 
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";

      if (!name || !email || !password) {
        window.appEngine.showToast("Please fill in all required fields", "error");
        return;
      }

      if (password !== confirmPassword) {
        window.appEngine.showToast("Passwords do not match", "error");
        return;
      }

      if (password.length < 6) {
        window.appEngine.showToast("Password must be at least 6 characters long", "error");
        return;
      }

      const users = JSON.parse(localStorage.getItem("nexus_users") || "[]");
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        window.appEngine.showToast("An account with this email already exists", "error");
        return;
      }

      const newUser = {
        id: "usr_" + Date.now(),
        name: name,
        email: email,
        password: password,
        avatar: selectedAvatar,
        registeredAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem("nexus_users", JSON.stringify(users));

      // Auto login user
      localStorage.setItem("nexus_session", JSON.stringify(newUser));
      window.appEngine.showToast("Account created successfully!", "success");
      setTimeout(() => window.location.href = "dashboard.html", 800);
    });
  }
}

function initPasswordToggles() {
  const toggleBtns = document.querySelectorAll(".toggle-pwd-btn");
  toggleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      if (input && input.type === "password") {
        input.type = "text";
        btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
      } else if (input) {
        input.type = "password";
        btn.innerHTML = '<i class="fa-solid fa-eye"></i>';
      }
    });
  });
}

function initPasswordStrengthMeter() {
  const passwordInput = document.getElementById("reg-password");
  const strengthBar = document.getElementById("pwd-strength-bar");

  if (!passwordInput || !strengthBar) return;

  passwordInput.addEventListener("input", () => {
    const val = passwordInput.value;
    let score = 0;

    if (val.length >= 6) score += 25;
    if (val.length >= 10) score += 25;
    if (/[A-Z]/.test(val)) score += 25;
    if (/[0-9!@#$%^&*]/.test(val)) score += 25;

    strengthBar.style.width = score + "%";

    if (score <= 25) {
      strengthBar.style.backgroundColor = "var(--rose)";
    } else if (score <= 50) {
      strengthBar.style.backgroundColor = "var(--amber)";
    } else if (score <= 75) {
      strengthBar.style.backgroundColor = "var(--cyan)";
    } else {
      strengthBar.style.backgroundColor = "var(--emerald)";
    }
  });
}

function initAvatarPicker() {
  const avatars = document.querySelectorAll(".avatar-option");
  avatars.forEach(avatar => {
    avatar.addEventListener("click", () => {
      avatars.forEach(a => a.classList.remove("selected"));
      avatar.classList.add("selected");
    });
  });
}

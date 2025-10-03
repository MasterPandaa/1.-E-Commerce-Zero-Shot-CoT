function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const requestResetForm = document.getElementById("requestResetForm");
  const resetForm = document.getElementById("resetForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const resp = await api("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setToken(resp.token);
        window.location.href = "/";
      } catch (err) {
        alert(err.message);
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const resp = await api("/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        setToken(resp.token);
        window.location.href = "/";
      } catch (err) {
        alert(err.message);
      }
    });
  }

  if (requestResetForm) {
    requestResetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const email = document.getElementById("email").value.trim();
        await api("/auth/request-password-reset", {
          method: "POST",
          body: JSON.stringify({ email }),
        });
        alert("If the email exists, a reset link has been sent.");
        window.location.href = "/login.html";
      } catch (err) {
        alert(err.message);
      }
    });
  }

  if (resetForm) {
    resetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const password = document.getElementById("password").value;
        const token = getQueryParam("token");
        await api("/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({ token, password }),
        });
        alert("Password updated. Please login.");
        window.location.href = "/login.html";
      } catch (err) {
        alert(err.message);
      }
    });
  }
});

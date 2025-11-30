const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";

// Proteger HOME si no hay token => login
if (window.location.pathname.endsWith("home.html")) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "login.html";
  }
}

// REGISTRO  -> POST /auth/register
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const idItsonInput = document.getElementById("idItson");
    const itsonId = idItsonInput ? idItsonInput.value.trim() : "";
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validación sencilla para que no truene la API
    if (!/^\d{6}$/.test(itsonId)) {
      alert("El ID ITSON debe tener exactamente 6 dígitos numéricos.");
      return;
    }

    const body = {
      name: nombre,
      email: email,
      itsonId: itsonId,
      password: password,
    };

    fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        const ok = result.ok;
        const data = result.data;
        console.log("Respuesta register:", data);

        if (!ok) {
          alert(data.message || "Error al registrar usuario.");
          return;
        }

        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        window.location.href = "login.html";
      })
      .catch(function (error) {
        console.error("Error register:", error);
        alert("Ocurrió un error al registrar. Intenta de nuevo.");
      });
  });
}

// LOGIN  -> POST /auth/login
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const body = { email: email, password: password };

    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        const ok = result.ok;
        const data = result.data;
        console.log("Respuesta login:", data);

        if (!ok) {
          alert(data.message || "Credenciales incorrectas.");
          return;
        }

        if (data.token) {
          // Guardamos el token para las rutas protegidas
          localStorage.setItem("authToken", data.token);

          // Guardar id de usuario 
          if (data.user) {
            const userId = data.user.id || data.user._id;
            if (userId) {
              localStorage.setItem("userId", userId);
            }
          }

          window.location.href = "home.html";
        } else {
          alert("No se recibió token del servidor.");
        }
      })
      .catch(function (error) {
        console.error("Error login:", error);
        alert("Ocurrió un error al iniciar sesión.");
      });
  });
}

// LOGOUT (botón en Home)
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    window.location.href = "login.html";
  });
}

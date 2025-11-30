document.addEventListener("DOMContentLoaded", function () {
  const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";

  let projects = [];

  const projectsList = document.getElementById("projectsList");
  const projectModal = document.getElementById("projectModal");
  const modalTitle = document.getElementById("modalTitle");
  const projectForm = document.getElementById("projectForm");
  const projectIdInput = document.getElementById("projectId");
  const projectTitleInput = document.getElementById("projectTitle");
  const projectDescriptionInput = document.getElementById("projectDescription");
  const openModalBtn = document.getElementById("openModal");
  const closeModalBtn = document.getElementById("closeModal");
  const refreshBtn = document.getElementById("refreshProjects");

  let editingId = null;

  // Helpers
  function getToken() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Tu sesión ha expirado. Vuelve a iniciar sesión.");
      window.location.href = "login.html";
    }
    return token;
  }

  function handleUnauthorized(status) {
    if (status === 401) {
      alert("Tu sesión ya no es válida. Vuelve a iniciar sesión.");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      window.location.href = "login.html";
      return true;
    }
    return false;
  }

  // GET /projects -> cargar proyectos
  async function loadProjects() {
    if (!projectsList) return;

    projectsList.innerHTML =
      "<p class='no-projects'>Cargando proyectos...</p>";

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/projects`, {
        headers: {
          "auth-token": token,
        },
      });

      if (handleUnauthorized(res.status)) return;

      const data = await res.json();
      console.log("Proyectos desde la API:", data);

      if (!res.ok) {
        alert(data.message || "Error al obtener proyectos.");
        projects = [];
      } else {
        projects = data.map(function (p) {
          return {
            id: p._id,
            title: p.title,
            description: p.description || "",
          };
        });
      }
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
      alert("No se pudieron cargar los proyectos.");
      projects = [];
    }

    renderProjects();
  }

  // Pintar tarjetas
  function renderProjects() {
    if (!projectsList) return;

    projectsList.innerHTML = "";

    if (!projects || projects.length === 0) {
      const msg = document.createElement("p");
      msg.className = "no-projects";
      msg.textContent = "No hay proyectos registrados por el momento.";
      projectsList.appendChild(msg);
      return;
    }

    projects.forEach(function (project) {
      const card = document.createElement("article");
      card.className = "project-card";

      card.innerHTML = `
        <h3>${project.title}</h3>
        <small>ID proyecto: ${project.id}</small>
        <p>${project.description}</p>
        <div class="project-actions">
          <button class="btn-edit" data-id="${project.id}">Editar</button>
          <button class="btn-delete" data-id="${project.id}">Eliminar</button>
        </div>
      `;

      projectsList.appendChild(card);
    });

    const editButtons = document.querySelectorAll(".btn-edit");
    const deleteButtons = document.querySelectorAll(".btn-delete");

    editButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-id");
        openEditModal(id);
      });
    });

    deleteButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-id");
        deleteProject(id);
      });
    });
  }

  // MODAL: NUEVO / EDITAR
  function openNewModal() {
    editingId = null;
    if (!projectModal) return;

    modalTitle.textContent = "Nuevo proyecto";
    projectIdInput.value = "";
    projectTitleInput.value = "";
    projectDescriptionInput.value = "";
    projectModal.classList.remove("hidden");
  }

  async function openEditModal(id) {
    editingId = id;
    modalTitle.textContent = "Editar proyecto";

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        headers: {
          "auth-token": token,
        },
      });

      if (handleUnauthorized(res.status)) return;

      const data = await res.json();
      console.log("Proyecto individual:", data);

      if (!res.ok) {
        alert(data.message || "No se pudo cargar el proyecto.");
        return;
      }

      projectIdInput.value = data._id;
      projectTitleInput.value = data.title || "";
      projectDescriptionInput.value = data.description || "";
      projectModal.classList.remove("hidden");
    } catch (error) {
      console.error("Error al obtener proyecto:", error);
      alert("Ocurrió un error al cargar el proyecto.");
    }
  }

  function closeModal() {
    if (!projectModal) return;
    projectModal.classList.add("hidden");
  }

  // Guardar (submit del modal)
  async function handleSaveProject(e) {
    e.preventDefault();

    const title = projectTitleInput.value.trim();
    const description = projectDescriptionInput.value.trim();

    if (!title || !description) {
      alert("Por favor llena todos los campos del proyecto.");
      return;
    }

    try {
      if (editingId) {
        await updateProject(editingId, { title, description });
        alert("Proyecto actualizado correctamente.");
      } else {
        await createProject({ title, description });
        alert("Proyecto creado correctamente.");
      }

      closeModal();
      await loadProjects();
    } catch (error) {
      console.error("Error al guardar proyecto:", error);
      alert("Ocurrió un error al guardar el proyecto.");
    }
  }

  // POST /projects -> crear
  async function createProject({ title, description }) {
    const token = getToken();

    const body = {
      title: title,
      description: description,
    };

    const res = await fetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": token,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("Respuesta createProject:", data);

    if (handleUnauthorized(res.status)) return;

    if (!res.ok) {
      console.error("Error al crear proyecto:", data);
      throw new Error(data.message || "Error al crear proyecto.");
    }

    return data;
  }

  // PUT /projects/:id -> actualizar
  async function updateProject(id, updates) {
    const token = getToken();

    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": token,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    console.log("Respuesta updateProject:", data);

    if (handleUnauthorized(res.status)) return;

    if (!res.ok) {
      console.error("Error al actualizar proyecto:", data);
      throw new Error(data.message || "Error al actualizar proyecto.");
    }

    return data;
  }

  // DELETE /projects/:id -> eliminar
  async function deleteProject(id) {
    const confirmDelete = confirm(
      "¿Seguro que quieres eliminar este proyecto?"
    );
    if (!confirmDelete) return;

    try {
      const token = getToken();

      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: "DELETE",
        headers: {
          "auth-token": token,
        },
      });

      const data = await res.json();
      console.log("Respuesta deleteProject:", data);

      if (handleUnauthorized(res.status)) return;

      if (!res.ok) {
        console.error("Error al eliminar proyecto:", data);
        alert(data.message || "No se pudo eliminar el proyecto.");
        return;
      }

      alert("Proyecto eliminado correctamente.");
      await loadProjects();
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);
      alert("Ocurrió un error al eliminar el proyecto.");
    }
  }

  // Eventos
  if (openModalBtn) {
    openModalBtn.addEventListener("click", openNewModal);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
  }

  if (projectForm) {
    projectForm.addEventListener("submit", handleSaveProject);
  }

  if (projectModal) {
    projectModal.addEventListener("click", function (e) {
      if (e.target === projectModal) {
        closeModal();
      }
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      loadProjects();
    });
  }

  // Carga inicial
  loadProjects();
});

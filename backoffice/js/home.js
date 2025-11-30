
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

let editingId = null;

// Render de todas las tarjetas
function renderProjects() {
  projectsList.innerHTML = "";

  if (projects.length === 0) {
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
      const id = Number(btn.getAttribute("data-id"));
      openEditModal(id);
    });
  });

  deleteButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = Number(btn.getAttribute("data-id"));
      deleteProject(id);
    });
  });
}

function openNewModal() {
  editingId = null;
  modalTitle.textContent = "Nuevo proyecto";
  projectIdInput.value = "";
  projectTitleInput.value = "";
  projectDescriptionInput.value = "";
  projectModal.classList.remove("hidden");
}

function openEditModal(id) {
  const project = projects.find(function (p) {
    return p.id === id;
  });
  if (!project) return;

  editingId = id;
  modalTitle.textContent = "Editar proyecto";
  projectIdInput.value = project.id;
  projectTitleInput.value = project.title;
  projectDescriptionInput.value = project.description;
  projectModal.classList.remove("hidden");
}

function closeModal() {
  projectModal.classList.add("hidden");
}

function handleSaveProject(e) {
  e.preventDefault();

  const title = projectTitleInput.value.trim();
  const description = projectDescriptionInput.value.trim();

  if (!title || !description) {
    alert("Por favor llena todos los campos del proyecto.");
    return;
  }

  if (editingId) {
    // Actualizar proyecto existente
    projects = projects.map(function (p) {
      if (p.id === editingId) {
        return {
          ...p,
          title: title,
          description: description,
        };
      }
      return p;
    });
  } else {
    // Crear nuevo proyecto
    const newId = projects.length > 0 ? projects[projects.length - 1].id + 1 : 1;
    const newProject = {
      id: newId,
      title: title,
      description: description,
    };
    projects.push(newProject);
  }

  renderProjects();
  closeModal();
}

function deleteProject(id) {
  const confirmDelete = confirm("¿Seguro que quieres eliminar este proyecto?");
  if (!confirmDelete) return;

  projects = projects.filter(function (p) {
    return p.id !== id;
  });

  renderProjects();
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

// Botón Actualizar lista
const refreshBtn = document.getElementById("refreshProjects");
if (refreshBtn) {
  refreshBtn.addEventListener("click", function () {
    renderProjects();
    alert("Lista de proyectos actualizada (en memoria).");
  });
}

// Cerrar modal clickeando fuera del contenido
if (projectModal) {
  projectModal.addEventListener("click", function (e) {
    if (e.target === projectModal) {
      closeModal();
    }
  });
}

renderProjects();

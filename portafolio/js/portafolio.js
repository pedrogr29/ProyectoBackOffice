
const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";

const ITSON_ID = "252455";

document.addEventListener("DOMContentLoaded", function () {
  const projectsContainer = document.getElementById("projectsContainer");
  const reloadBtn = document.getElementById("reloadProjects");

  if (!projectsContainer) {
    console.warn("No encontré el contenedor con id='projectsContainer'");
    return;
  }

  // Helpers

  function renderMessage(text, className) {
    projectsContainer.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = text;
    if (className) {
      p.className = className;
    }
    projectsContainer.appendChild(p);
  }

  // Crea la tarjeta HTML de un proyecto
  function createProjectCard(project) {
    const card = document.createElement("article");
    card.className = "project-card";

    // Campos que normalmente trae la API
    const title = project.title || project.name || "Proyecto sin título";
    const description =
      project.description || "Este proyecto no tiene descripción.";
    const tech =
      project.technologies ||
      project.techStack ||
      project.stack ||
      "";

    // Intento de sacar un link del repositorio o demo
    const url =
      project.repository ||
      project.repoUrl ||
      project.demoUrl ||
      project.githubUrl ||
      "";

    card.innerHTML = `
      <h3>${title}</h3>
      <small>ID proyecto: ${project.id || project._id || "N/A"}</small>
      <p>${description}</p>

      <div class="project-meta">
        ${tech ? `<span>${tech}</span>` : ""}
      </div>

      ${
        url
          ? `<p class="project-link">
               <a href="${url}" target="_blank" rel="noopener noreferrer">
                 Ver más
               </a>
             </p>`
          : ""
      }
    `;

    return card;
  }

  // Llamada a la API pública
  async function loadPublicProjects() {
    renderMessage("Cargando proyectos...", "loading-msg");

    try {
      const res = await fetch(`${API_BASE}/publicProjects/${ITSON_ID}`);
      const data = await res.json();

      console.log("Respuesta publicProjects:", data);

      if (!res.ok) {
        // Mensaje de error que venga de la API
        throw new Error(data.message || "Error al obtener proyectos públicos.");
      }

      let projects = [];

      if (Array.isArray(data)) {
        projects = data;
      } else if (Array.isArray(data.projects)) {
        projects = data.projects;
      } else if (Array.isArray(data.data)) {
        projects = data.data;
      } else {
        console.warn("Formato de respuesta no esperado, se intenta adaptar.");
        projects = data.projects || data.data || [];
      }

      projectsContainer.innerHTML = "";

      if (!projects || projects.length === 0) {
        renderMessage(
          "Aún no hay proyectos públicos registrados con tu ID.",
          "no-projects"
        );
        return;
      }

      projects.forEach(function (project) {
        const card = createProjectCard(project);
        projectsContainer.appendChild(card);
      });
    } catch (error) {
      console.error("Error al cargar proyectos públicos:", error);
      renderMessage(
        "Ocurrió un error al cargar los proyectos. Intenta nuevamente.",
        "error-msg"
      );
    }
  }

  // Eventos
  if (reloadBtn) {
    reloadBtn.addEventListener("click", function () {
      loadPublicProjects();
    });
  }

  loadPublicProjects();
});

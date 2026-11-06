const navbar = document.getElementById("navbar");

// Icono de "usuario anónimo" que se muestra en el avatar cuando no hay sesión
const ICONO_USUARIO =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
  '<path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-8 2.2-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.8-3.6-5-8-5z"/>' +
  '</svg>';

// paginas = [nombre(id), html, (se puede ir sin iniciar sesión)]
const paginas = [
  ["home", "index", true],
  ["perfil", "perfil", false],
  ["progreso", "progreso", false],
  ["rutina_diaria", "reto_dia", true],
  ["mis_rutinas", "mis_rutinas", false],
  ["ejercicios", "ejercicios", true],
  ["rutinas", "rutinas", true],
  ["estadisticas", "estadisticas", true]
];

fetch("components/navbar.html")
  .then(response => {
    if (!response.ok) throw new Error("No se pudo cargar components/navbar.html");
    return response.text();
  })
  .then(data => {
    navbar.innerHTML = data;

    iniciarSidebarMovil();

    // Enlaces y perfil dependen de quién esté logueado
    sesionPromesa.then(aplicarSesion);
  })
  .catch(error => console.error(error));

// ---------- Enlaces del menú + perfil ----------
function aplicarSesion(s) {
  const paginaActual = window.location.pathname.split("/").pop().replace(".html", "") || "index";

  paginas.forEach(([id, pagina, sin_sesion]) => {
    const elemento = document.getElementById(id);
    if (!elemento) return;
    if (pagina === paginaActual) elemento.classList.add("active");
    if (sin_sesion || s.logueado) {
      elemento.addEventListener("click", () => cambioPagina(pagina));
    } else {
      elemento.addEventListener("click", () => mostrarLog_in());
    }
  });

  // Tarjeta de perfil: la del aside (escritorio) y la de la barra superior (móvil)
  ["perfil", "mobile_perfil"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    const avatar = el.querySelector(".profile-avatar");
    const nombre = el.querySelector(".profile-info strong");
    const detalle = el.querySelector(".profile-info span"); // solo existe en el aside

    // textContent (nunca innerHTML) con el nombre: lo escribe el usuario
    if (s.logueado) {
      avatar.classList.remove("anonimo");
      avatar.textContent = iniciales(s.nombre);
      nombre.textContent = s.nombre;
      if (detalle) detalle.textContent = "Ver perfil";
      el.setAttribute("aria-label", "Perfil de " + s.nombre);
    } else {
      avatar.classList.add("anonimo");
      avatar.innerHTML = ICONO_USUARIO;
      nombre.textContent = "Iniciar sesión";
      if (detalle) detalle.textContent = "Accede a tu cuenta";
      el.setAttribute("aria-label", "Iniciar sesión");
    }

    const accion = () => (s.logueado ? cambioPagina("perfil") : mostrarLog_in());
    el.addEventListener("click", accion);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        accion();
      }
    });

    el.classList.remove("cargando");
  });
}

// ---------- Sidebar móvil ----------
function iniciarSidebarMovil() {
  const sidebar = document.getElementById("sidebar");
  const hamburguesa = document.getElementById("hamburguesa");

  if (!sidebar || !hamburguesa) return;

  let sidebarEscondida = true;
  const mobileQuery = window.matchMedia("(max-width: 777px)");

  function abrirSidebar() {
    sidebarEscondida = false;
    sidebar.style.transform = "translateX(0)";
    hamburguesa.classList.add("is-open");
  }

  function cerrarSidebar() {
    sidebarEscondida = true;
    sidebar.style.transform = "translateX(-105%)";
    hamburguesa.classList.remove("is-open");
  }

  function toggleSidebar() {
    sidebarEscondida ? abrirSidebar() : cerrarSidebar();
  }

  mobileQuery.matches ? cerrarSidebar() : abrirSidebar();

  hamburguesa.addEventListener("click", toggleSidebar);

  window.addEventListener("resize", () => {
    mobileQuery.matches ? cerrarSidebar() : abrirSidebar();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") cerrarSidebar();
  });
}
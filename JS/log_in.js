const log_in = document.getElementById("log_in");

const LOGIN_URL = "login"; // LoginServlet (@WebServlet("/login"))

function mostrarLog_in() {
  if (log_in != null) {
    log_in.style.display = "flex";
    const email = document.getElementById("Email");
    if (email) email.focus();
  } else {
    console.error("<log_in> no se ha cargado bien :/");
  }
}

function esconderLog_in() {
  if (log_in != null) {
    log_in.style.display = "none";
  } else {
    console.error("<log_in> no se ha cargado bien :/");
  }
}

fetch("components/log_in.html")
  .then(response => {
    if (!response.ok) throw new Error("No se pudo cargar components/log_in.html");
    return response.text();
  })
  .then(data => {
    log_in.innerHTML = data;

    const niebla = document.getElementById("niebla_log_in");
    const formulario = document.getElementById("formulario");
    const email = document.getElementById("Email");
    const contrasena = document.getElementById("Contrasena");
    const boton_log_in = document.getElementById("boton_log_in");
    const mensaje_error = document.getElementById("log_in_incorrecto");
    const boton_ojo = formulario.querySelector(".show-password");
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let enviando = false;

    // ---------- Botón activo solo si los datos tienen buen formato ----------
    function datosValidos() {
      return contrasena.value.length >= 1 && regex.test(email.value.trim());
    }

    function actualizarBotonLog_in() {
      boton_log_in.disabled = enviando || !datosValidos();
    }

    function ocultarError() {
      mensaje_error.classList.remove("visible");
    }

    function mostrarError(texto) {
      mensaje_error.querySelector("span").textContent = texto;
      mensaje_error.classList.remove("visible");
      void mensaje_error.offsetWidth; // reinicia la animación
      mensaje_error.classList.add("visible");
    }

    [email, contrasena].forEach(campo => {
      campo.addEventListener("input", () => {
        ocultarError();
        actualizarBotonLog_in();
      });
    });
    actualizarBotonLog_in();

    // ---------- Mostrar / ocultar contraseña ----------
    boton_ojo.addEventListener("click", () => {
      const visible = contrasena.type === "text";
      contrasena.type = visible ? "password" : "text";
      boton_ojo.classList.toggle("activo", !visible);
      boton_ojo.setAttribute("aria-pressed", String(!visible));
      boton_ojo.setAttribute("aria-label", visible ? "Mostrar contraseña" : "Ocultar contraseña");
      contrasena.focus();
    });

    // ---------- Cerrar con clic fuera o con Escape ----------
    niebla.addEventListener("click", (e) => {
      if (e.target === niebla) esconderLog_in();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") esconderLog_in();
    });

    // ---------- Enviar al servidor ----------
    formulario.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (!datosValidos() || enviando) return;

      enviando = true;
      actualizarBotonLog_in();
      boton_log_in.textContent = "Entrando…";
      ocultarError();

      try {
        const resp = await fetch(LOGIN_URL, {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Accept": "application/json", // el servlet responde JSON si lo pedimos así
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
          },
          body: new URLSearchParams({
            correo: email.value.trim().toLowerCase(),
            clave: contrasena.value
          })
        });

        const json = await resp.json().catch(() => ({}));

        if (resp.ok && json.ok) {
          // Sesión creada en el servidor (cookie JSESSIONID): recargamos la página actual
          window.location.reload();
          return;
        }

        if (resp.status === 401) {
          mostrarError(json.error || "Correo electrónico o contraseña incorrectos");
          contrasena.select();
        } else if (resp.status === 404) {
          mostrarError(json.error || "El servidor está mal configurado, por favor, contáctanos en 927350@unizar.es");
          contrasena.select();
        } else {
          mostrarError("El servidor ha tenido un problema. Inténtalo de nuevo en un momento.");
        }
      } catch (error) {
        console.error(error);
        mostrarError("No se pudo conectar con el servidor.");
      }

      enviando = false;
      boton_log_in.textContent = "Iniciar sesión";
      actualizarBotonLog_in();
    });

    document.getElementById("contra_olvidada").addEventListener("click", (e) => {
      e.preventDefault();
      alert("Todavía no hay recuperación de contraseña 🙂");
    });
  })
  .catch(error => console.error(error));
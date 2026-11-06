(function () {
  const DATOS_URL = "datosPerfil"; // PerfilServlet
  const CLAVE_URL = "cambiarClave"; // CambiarClaveServlet
  const NIVELES = ["", "Principiante", "Básico", "Intermedio", "Avanzado", "Experto"];

  const $ = (id) => document.getElementById(id);

  const sinSesion = $("perfil_sin_sesion");
  const errorCarga = $("perfil_error");
  const contenido = $("perfil_contenido");

  const formDatos = $("form_datos");
  const nombre = $("pf_nombre");
  const edad = $("pf_edad");
  const altura = $("pf_altura");
  const peso = $("pf_peso");
  const dificultad = $("pf_dificultad");
  const sesiones = $("pf_sesiones");
  const botonGuardar = $("boton_guardar_datos");

  const formClave = $("form_clave");
  const claveActual = $("pf_clave_actual");
  const claveNueva = $("pf_clave_nueva");
  const claveNueva2 = $("pf_clave_nueva2");

  const cabeceras = {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
  };

  // =========================================================
  // Estados de la página
  // =========================================================
  function mostrarSinSesion() {
    contenido.hidden = true;
    errorCarga.hidden = true;
    sinSesion.hidden = false;
    mostrarLog_in();
  }

  function mostrarErrorCarga() {
    contenido.hidden = true;
    sinSesion.hidden = true;
    errorCarga.hidden = false;
  }

  $("perfil_reintentar").addEventListener("click", () => {
    errorCarga.hidden = true;
    cargarPerfil();
  });

  sesionPromesa.then(s => {
    if (!s.logueado) mostrarSinSesion();
    else cargarPerfil();
  });

  // =========================================================
  // Cargar y pintar
  // =========================================================
  async function cargarPerfil() {
    try {
      const resp = await fetch(DATOS_URL, { credentials: "same-origin", headers: { "Accept": "application/json" } });
      if (resp.status === 401) { mostrarSinSesion(); return; }
      const d = await resp.json();
      if (!resp.ok || !d.ok) throw new Error(d.error || "Respuesta no válida");
      pintar(d);
    } catch (e) {
      console.error(e);
      mostrarErrorCarga();
    }
  }

  function pintarCabecera(nombreCuenta) {
    $("perfil_avatar").textContent = iniciales(nombreCuenta);
    $("perfil_nombre").textContent = nombreCuenta;
  }

  // Chips con nivel, sesiones y rol (textContent siempre: son datos del usuario)
  function pintarChips(d) {
    const chips = $("perfil_chips");
    chips.textContent = "";
    const anadir = (texto, extra) => {
      const c = document.createElement("span");
      c.className = "pf-chip" + (extra ? " " + extra : "");
      c.textContent = texto;
      chips.appendChild(c);
    };
    if (d.dificultad) anadir("Nivel " + NIVELES[d.dificultad].toLowerCase());
    if (d.sesiones) anadir(d.sesiones + (d.sesiones === 1 ? " sesión" : " sesiones") + " por semana");
    if (d.esAdmin) anadir("Administrador", "admin");
  }

  function pintar(d) {
    sinSesion.hidden = true;
    errorCarga.hidden = true;
    contenido.hidden = false;

    pintarCabecera(d.nombre);
    $("perfil_correo").textContent = d.correo;

    pintarChips(d);

    // Formulario
    nombre.value = d.nombre;
    edad.value = d.edad ?? "";
    altura.value = d.altura == null ? "" : String(d.altura);
    peso.value = d.peso ?? "";
    dificultad.value = d.dificultad ?? "";
    sesiones.value = d.sesiones ?? "";

    [nombre, edad, altura, peso, dificultad, sesiones].forEach(limpiar);
    guardado = instantanea();
    botonGuardar.disabled = true;
  }

  // =========================================================
  // Utilidades de formulario
  // =========================================================
  function marcar(input, mensaje) {
    const campo = input.closest(".campo");
    if (mensaje) campo.classList.add("error");
    else campo.classList.remove("error");
    campo.querySelector(".mensaje-error").textContent = mensaje || "";
    return !mensaje;
  }

  function limpiar(input) {
    marcar(input, "");
  }

  let temporizadorAviso = {};
  function avisar(elemento, texto, esError) {
    elemento.textContent = texto;
    elemento.classList.toggle("fallo", !!esError);
    clearTimeout(temporizadorAviso[elemento.id]);
    if (texto && !esError) {
      temporizadorAviso[elemento.id] = setTimeout(() => { elemento.textContent = ""; }, 4000);
    }
  }

  // =========================================================
  // Datos personales
  // =========================================================
  let guardado = "";
  const instantanea = () => JSON.stringify([nombre, edad, altura, peso, dificultad, sesiones].map(i => i.value.trim()));

  [nombre, edad, altura, peso, dificultad, sesiones].forEach(input => {
    const evento = input.tagName === "SELECT" ? "change" : "input";
    input.addEventListener(evento, () => {
      botonGuardar.disabled = instantanea() === guardado;
      avisar($("aviso_datos"), "", false);
    });
  });

  function validarNombre() {
    return marcar(nombre, nombre.value.trim().length < 2 ? "Escribe tu nombre (mínimo 2 letras)." : "");
  }

  function validarNumero(input, min, max, etiqueta, entero) {
    const texto = input.value.trim();
    if (texto === "") return marcar(input, "");
    const n = Number(texto);
    if (!Number.isFinite(n) || n < min || n > max || (entero && !Number.isInteger(n))) {
      return marcar(input, etiqueta + " entre " + min + " y " + max + ".");
    }
    return marcar(input, "");
  }

  const CAMPOS_DATOS = {
    nombreUsuario: nombre,
    edadUsuario: edad,
    alturaUsuario: altura,
    pesoUsuario: peso,
    dificultadUsuario: dificultad,
    sesiones_semanalesUsuario: sesiones
  };

  formDatos.addEventListener("submit", async (e) => {
    e.preventDefault();
    const aviso = $("aviso_datos");
    avisar(aviso, "", false);

    const resultados = [
      [nombre, validarNombre()],
      [edad, validarNumero(edad, 10, 100, "Edad", true)],
      [altura, validarNumero(altura, 100, 250, "Altura", true)],
      [peso, validarNumero(peso, 30, 300, "Peso", false)]
    ];
    const primerError = resultados.find(([, ok]) => !ok);
    if (primerError) { primerError[0].focus(); return; }

    // Los opcionales se envían siempre: vacío = borrar ese dato
    const datos = new URLSearchParams({
      nombreUsuario: nombre.value.trim(),
      edadUsuario: edad.value.trim(),
      alturaUsuario: altura.value.trim(),
      pesoUsuario: peso.value.trim(),
      dificultadUsuario: dificultad.value,
      sesiones_semanalesUsuario: sesiones.value
    });

    botonGuardar.disabled = true;
    botonGuardar.textContent = "Guardando…";

    try {
      const resp = await fetch(DATOS_URL, { method: "POST", credentials: "same-origin", headers: cabeceras, body: datos });
      const json = await resp.json().catch(() => ({}));

      if (resp.status === 401) { mostrarSinSesion(); return; }

      if (!resp.ok || !json.ok) {
        const input = CAMPOS_DATOS[json.campo];
        if (input) { marcar(input, json.error || "Revisa este campo."); input.focus(); }
        else avisar(aviso, json.error || "No se pudieron guardar los cambios.", true);
        botonGuardar.disabled = false;
        return;
      }

      pintarCabecera(json.nombre);
      actualizarNavbar(json.nombre);
      guardado = instantanea();
      avisar(aviso, "Cambios guardados", false);
      cargarChips();
    } catch (error) {
      console.error(error);
      avisar(aviso, "No se pudo conectar con el servidor.", true);
      botonGuardar.disabled = false;
    } finally {
      botonGuardar.textContent = "Guardar cambios";
    }
  });

  // Refresca los chips tras guardar (nivel y sesiones)
  async function cargarChips() {
    try {
      const resp = await fetch(DATOS_URL, { credentials: "same-origin", headers: { "Accept": "application/json" } });
      const d = await resp.json();
      if (resp.ok && d.ok) pintarChips(d);
    } catch (e) {
      console.error(e);
    }
  }

  // El navbar ya está pintado con el nombre anterior
  function actualizarNavbar(nuevoNombre) {
    ["perfil", "mobile_perfil"].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const strong = el.querySelector(".profile-info strong");
      const avatar = el.querySelector(".profile-avatar");
      if (strong) strong.textContent = nuevoNombre;
      if (avatar) avatar.textContent = iniciales(nuevoNombre);
      el.setAttribute("aria-label", "Perfil de " + nuevoNombre);
    });
  }

  // =========================================================
  // Cambiar contraseña
  // =========================================================
  $("pf_mostrar_claves").addEventListener("change", (e) => {
    const tipo = e.target.checked ? "text" : "password";
    [claveActual, claveNueva, claveNueva2].forEach(i => { i.type = tipo; });
  });

  const CAMPOS_CLAVE = {
    claveActual: claveActual,
    claveNueva: claveNueva,
    claveNuevaRepetida: claveNueva2
  };

  formClave.addEventListener("submit", async (e) => {
    e.preventDefault();
    const aviso = $("aviso_clave");
    const boton = $("boton_cambiar_clave");
    avisar(aviso, "", false);

    const v = claveNueva.value;
    const resultados = [
      [claveActual, marcar(claveActual, claveActual.value === "" ? "Escribe tu contraseña actual." : "")],
      [claveNueva, marcar(claveNueva,
        v.length < 8 ? "Debe tener al menos 8 caracteres."
        : (!/[a-zA-Z]/.test(v) || !/\d/.test(v)) ? "Incluye al menos una letra y un número." : "")],
      [claveNueva2, marcar(claveNueva2, claveNueva2.value !== v ? "Las contraseñas no coinciden." : "")]
    ];
    const primerError = resultados.find(([, ok]) => !ok);
    if (primerError) { primerError[0].focus(); return; }

    boton.disabled = true;
    boton.textContent = "Cambiando…";

    try {
      const resp = await fetch(CLAVE_URL, {
        method: "POST",
        credentials: "same-origin",
        headers: cabeceras,
        body: new URLSearchParams({
          claveActual: claveActual.value,
          claveNueva: claveNueva.value,
          claveNuevaRepetida: claveNueva2.value
        })
      });
      const json = await resp.json().catch(() => ({}));

      if (resp.status === 401) { mostrarSinSesion(); return; }

      if (!resp.ok || !json.ok) {
        const input = CAMPOS_CLAVE[json.campo];
        if (input) { marcar(input, json.error || "Revisa este campo."); input.focus(); }
        else avisar(aviso, json.error || "No se pudo cambiar la contraseña.", true);
        return;
      }

      formClave.reset();
      [claveActual, claveNueva, claveNueva2].forEach(i => { i.type = "password"; limpiar(i); });
      avisar(aviso, "Contraseña actualizada", false);
    } catch (error) {
      console.error(error);
      avisar(aviso, "No se pudo conectar con el servidor.", true);
    } finally {
      boton.disabled = false;
      boton.textContent = "Cambiar contraseña";
    }
  });

  // =========================================================
  // Cerrar sesión
  // =========================================================
  $("boton_logout").addEventListener("click", () => {
    $("boton_logout").disabled = true;
    cerrarSesion();
  });
})();
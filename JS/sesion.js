// =====================================================================
// Uso en cualquier página:
//   sesionPromesa.then(s => { if (s.logueado) { ... s.nombre, s.correo, s.esAdmin ... } });
// =====================================================================

let sesion = { logueado: false };
let sesion_iniciada = false; // se mantiene por compatibilidad con código antiguo

const sesionPromesa = fetch("sesion", {
  credentials: "same-origin",
  headers: { "Accept": "application/json" }
}).then(r => (r.ok ? r.json() : { logueado: false }))
  .catch(() => ({ logueado: false }))
  .then(datos => {
    sesion = datos;
    sesion_iniciada = !!datos.logueado;
    return datos;
  });

function cambioPagina(pagina) {
  window.location.href = pagina + ".html";
}

// "Andrés Llorente" -> "AL" · "Andrés" -> "A" · "ana maría pérez" -> "AM"
function iniciales(nombre) {
  const palabras = (nombre || "").trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return "?";
  return palabras
    .slice(0, 2)
    .map(p => Array.from(p)[0].toUpperCase()) // Array.from para acentos y emojis
    .join("");
}

async function cerrarSesion() {
  try {
    await fetch("logout", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Accept": "application/json" }
    });
  } catch (e) {
    console.error("No se pudo contactar con el servidor para cerrar sesión", e);
  }
  window.location.href = "index.html";
}
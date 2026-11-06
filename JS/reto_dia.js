// reto_dia.js
// Genera los ejercicios del reto diario de forma dinámica y gestiona el progreso.
// Al hacer click en un ejercicio se despliega una tabla con una fila por serie
// (peso y repeticiones) y un botón "Completar" que solo se activa si todo está relleno.

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

// ───────────────────────────────────────────────────────────────────────────────
// Para cambiar el número de ejercicios, se añade o quita elementos de esta lista.
// Cada ejercicio guarda:
//   descripcion → texto del ejercicio
//   series      → nº de series (filas del desplegable). Por defecto 3.
//   imagen      → (opcional) ruta de la imagen
// ───────────────────────────────────────────────────────────────────────────────
let ejercicios = [
  { descripcion: LOREM, series: 3 },
  { descripcion: LOREM, series: 4 },
  { descripcion: LOREM, series: 3 },
  { descripcion: LOREM, series: 5 },
  { descripcion: LOREM, series: 2 },
  { descripcion: LOREM, series: 4 },
];

const SERIES_POR_DEFECTO = 3;

// Estado: índices de los ejercicios completados
let completados = new Set();

// Referencias al DOM
const reto_dia = document.getElementById("reto_dia");
const contenedor = document.getElementById("ejercicios_dia");
const textoProgreso = document.getElementById("ejercicios_completados");
const barraProgreso = document.querySelector(".progress-track span");
const contadorEjercicios = document.querySelector(".exercise-count");
const notaProgreso = document.querySelector(".challenge-progress small");

const MENSAJE_PENDIENTE = "Completa todos los ejercicios para terminar el reto.";
const MENSAJE_FINAL = "¡Reto completado! Buen trabajo";

// Número con dos dígitos: 1 -> "01"
function formatearNumero(n) {
  return String(n).padStart(2, "0");
}

// Crea las filas de series + botón "Completar"
function crearDetalle(ejercicio, indice) {
  const numSeries = Math.max(1, parseInt(ejercicio.series, 10) || SERIES_POR_DEFECTO);

  const detalle = document.createElement("div");
  detalle.className = "exercise-detalle";

  const cabecera = document.createElement("div");
  cabecera.className = "series-fila cabecera";
  cabecera.innerHTML = "<span>Serie</span><span>Peso (kg)</span><span>Repeticiones</span>";
  detalle.appendChild(cabecera);

  for (let s = 1; s <= numSeries; s++) {
    const fila = document.createElement("div");
    fila.className = "series-fila";
    fila.innerHTML = `
      <span class="serie-nombre">Serie ${s}</span>
      <input type="number" class="input-peso" min="0" step="0.5" inputmode="decimal" placeholder="kg" aria-label="Peso de la serie ${s}">
      <input type="number" class="input-reps" min="1" step="1" inputmode="numeric" placeholder="reps" aria-label="Repeticiones de la serie ${s}">
    `;
    detalle.appendChild(fila);
  }

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn-completar";
  btn.textContent = "Completar";
  btn.disabled = true;
  detalle.appendChild(btn);

  // Habilitar / deshabilitar el botón según los campos
  detalle.addEventListener("input", () => validarDetalle(detalle, indice));
  btn.addEventListener("click", () => alternarEjercicio(indice));

  return detalle;
}

// ¿Están todos los campos rellenados correctamente?
function detalleCompleto(detalle) {
  const pesos = detalle.querySelectorAll(".input-peso");
  const reps = detalle.querySelectorAll(".input-reps");
  for (let i = 0; i < pesos.length; i++) {
    const p = pesos[i].value.trim();
    const r = reps[i].value.trim();
    if (p === "" || r === "") return false;
    if (isNaN(Number(p)) || Number(p) < 0) return false;
    if (isNaN(Number(r)) || Number(r) < 1) return false;
  }
  return true;
}

function validarDetalle(detalle, indice) {
  const btn = detalle.querySelector(".btn-completar");
  // Si ya está completado el botón sirve para deshacer, así que siempre activo
  btn.disabled = completados.has(indice) ? false : !detalleCompleto(detalle);
}

// Crea el HTML de un ejercicio (tarjeta + desplegable)
function crearTarjeta(ejercicio, indice) {
  const numero = indice + 1;

  const item = document.createElement("div");
  item.className = "exercise-item";
  item.dataset.indice = indice;

  const tarjeta = document.createElement("article");
  tarjeta.className = "exercise-card";
  tarjeta.setAttribute("role", "button");
  tarjeta.setAttribute("tabindex", "0");
  tarjeta.setAttribute("aria-expanded", "false");

  const num = document.createElement("div");
  num.className = "exercise-number";
  num.textContent = formatearNumero(numero);

  const info = document.createElement("div");
  info.className = "exercise-info";
  info.innerHTML = `<span>Ejercicio ${numero}:</span><p></p>`;
  info.querySelector("p").textContent = ejercicio.descripcion || "";

  const img = document.createElement("img");
  img.src = ejercicio.imagen || "sources/icono_mancuerna.png";
  img.alt = `Ejercicio ${numero}`;

  tarjeta.append(num, info, img);

  const detalle = crearDetalle(ejercicio, indice);
  item.append(tarjeta, detalle);

  // Click y teclado (Enter / Espacio) sobre el ejercicio → despliega / pliega
  tarjeta.addEventListener("click", () => alternarDesplegable(indice));
  tarjeta.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      alternarDesplegable(indice);
    }
  });

  return item;
}

// Pinta todos los ejercicios
function renderizarEjercicios() {
  contenedor.innerHTML = "";
  ejercicios.forEach((ej, i) => contenedor.appendChild(crearTarjeta(ej, i)));

  if (contadorEjercicios) {
    const total = ejercicios.length;
    contadorEjercicios.textContent = `${total} ${total === 1 ? "ejercicio" : "ejercicios"}`;
  }
}

function obtenerItem(indice) {
  return contenedor.querySelector(`.exercise-item[data-indice="${indice}"]`);
}

// Abre / cierra el desplegable
function alternarDesplegable(indice, forzar) {
  const item = obtenerItem(indice);
  if (!item) return;
  const abrir = typeof forzar === "boolean" ? forzar : !item.classList.contains("abierto");

  // Al abrir uno, se cierran los demás
  if (abrir) {
    contenedor.querySelectorAll(".exercise-item.abierto").forEach((otro) => {
      if (otro !== item) alternarDesplegable(Number(otro.dataset.indice), false);
    });
  }

  item.classList.toggle("abierto", abrir);
  const tarjeta = item.querySelector(".exercise-card");
  tarjeta.classList.toggle("abierto", abrir);
  tarjeta.setAttribute("aria-expanded", String(abrir));
}

// Marca / desmarca un ejercicio (botón "Completar")
function alternarEjercicio(indice) {
  const item = obtenerItem(indice);
  if (!item) return;
  const detalle = item.querySelector(".exercise-detalle");

  if (completados.has(indice)) {
    completados.delete(indice);
  } else {
    if (!detalleCompleto(detalle)) return; // seguridad extra
    completados.add(indice);
  }

  actualizarTarjeta(indice);
  actualizarProgreso();

  // Al completar, se pliega el desplegable
  if (completados.has(indice)) alternarDesplegable(indice, false);
}

// Cambia el número por un tick (o lo restaura) y bloquea / desbloquea campos
function actualizarTarjeta(indice) {
  const item = obtenerItem(indice);
  if (!item) return;

  const tarjeta = item.querySelector(".exercise-card");
  const num = item.querySelector(".exercise-number");
  const detalle = item.querySelector(".exercise-detalle");
  const btn = detalle.querySelector(".btn-completar");
  const hecho = completados.has(indice);

  tarjeta.classList.toggle("completado", hecho);
  num.textContent = hecho ? "✓" : formatearNumero(indice + 1);

  detalle.querySelectorAll("input").forEach((inp) => (inp.disabled = hecho));
  btn.textContent = hecho ? "Deshacer" : "Completar";
  validarDetalle(detalle, indice);
}

// Actualiza el texto "X/Y" y la barra
function actualizarProgreso() {
  const total = ejercicios.length;
  const hechos = completados.size;
  const porcentaje = total === 0 ? 0 : Math.round((hechos / total) * 100);

  if (textoProgreso) textoProgreso.textContent = `${hechos}/${total}`;
  if (barraProgreso) barraProgreso.style.width = `${porcentaje}%`;
  if (notaProgreso) {
    notaProgreso.textContent = total > 0 && hechos === total ? MENSAJE_FINAL : MENSAJE_PENDIENTE;
  }
}

// ─────────────────────────────────────────────────────────────
// API pública: sustituye la lista de ejercicios y reinicia el progreso.
// Ejemplos:
//   cargarEjercicios([{ descripcion: "Flexiones", series: 4 }, { descripcion: "Sentadillas", series: 3 }]);
//   cargarEjercicios(8);   // 8 ejercicios con el texto por defecto y 3 series
// ─────────────────────────────────────────────────────────────
function cargarEjercicios(datos) {
  if (typeof datos === "number") {
    ejercicios = Array.from({ length: Math.max(0, datos) }, () => ({
      descripcion: LOREM,
      series: SERIES_POR_DEFECTO,
    }));
  } else if (Array.isArray(datos)) {
    ejercicios = datos;
  } else {
    return;
  }
  completados = new Set();
  renderizarEjercicios();
  actualizarProgreso();
}
window.cargarEjercicios = cargarEjercicios;

// Inicio
if (contenedor) {
  renderizarEjercicios();
  actualizarProgreso();
}

// Actualizar altura del reto diario
const setHeight = () =>
  reto_dia.style.setProperty('--height-reto-dia', reto_dia.offsetHeight + 'px');
setHeight();
new ResizeObserver(setHeight).observe(reto_dia);
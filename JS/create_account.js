(function() {
    // ---------- Configuración ----------
    const CREAR_USUARIO_URL = "InsertarUsuario"; // CrearUsuarioServlet (mapeado en web.xml)
    const LOGIN_URL = "login"; // LoginServlet

    const formulario = document.getElementById("form_crear_cuenta");
    if (!formulario) return;

    const nombre = document.getElementById("ca_nombre");
    const email = document.getElementById("ca_email");
    const contrasena = document.getElementById("ca_contrasena");
    const contrasena2 = document.getElementById("ca_contrasena2");
    const edad = document.getElementById("ca_edad");
    const altura = document.getElementById("ca_altura");
    const peso = document.getElementById("ca_peso");
    const dificultad = document.getElementById("ca_dificultad");
    const sesiones = document.getElementById("ca_sesiones");
    const terminos = document.getElementById("ca_terminos");
    const boton = document.getElementById("boton_crear_cuenta");
    const exito = document.getElementById("ca_exito");
    const fuerza = document.getElementById("ca_fuerza");
    const fuerzaTexto = document.getElementById("ca_fuerza_texto");

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Si ya hay sesión no tiene sentido crear otra cuenta
    sesionPromesa.then(s => {
        if (s.logueado) window.location.replace("index.html");
    });

    // ---------- Marcar un campo como correcto o con error ----------
    function marcar(input, mensaje) {
        const campo = input.closest(".campo");
        const texto = campo.querySelector(".mensaje-error");
        if (mensaje) {
            campo.classList.add("error");
            campo.classList.remove("ok");
            texto.textContent = mensaje;
        } else {
            campo.classList.remove("error");
            campo.classList.add("ok");
            texto.textContent = "";
        }
        return !mensaje;
    }

    function limpiar(input) {
        const campo = input.closest(".campo");
        campo.classList.remove("error", "ok");
        campo.querySelector(".mensaje-error").textContent = "";
    }

    // ---------- Validaciones (devuelven true si el campo es correcto) ----------
    function validarNombre() {
        if (nombre.value.trim().length < 2) return marcar(nombre, "Escribe tu nombre (mínimo 2 letras).");
        return marcar(nombre, "");
    }

    function validarEmail() {
        if (!regexEmail.test(email.value.trim())) {
            return marcar(email, "Escribe un correo válido, por ejemplo nombre@correo.com.");
        }
        return marcar(email, ""); // si ya existe, lo dirá el servidor al enviar
    }

    function validarContrasena() {
        const valor = contrasena.value;
        if (valor.length < 8) return marcar(contrasena, "Debe tener al menos 8 caracteres.");
        if (!/[a-zA-Z]/.test(valor) || !/\d/.test(valor)) return marcar(contrasena, "Incluye al menos una letra y un número.");
        return marcar(contrasena, "");
    }

    function validarContrasena2() {
        if (contrasena2.value === "") return marcar(contrasena2, "Repite la contraseña.");
        if (contrasena2.value !== contrasena.value) return marcar(contrasena2, "Las contraseñas no coinciden.");
        return marcar(contrasena2, "");
    }

    // Campos numéricos opcionales: vacío = correcto
    function validarNumero(input, min, max, etiqueta, entero) {
        const texto = input.value.trim();
        if (texto === "") { limpiar(input); return true; }
        const n = Number(texto);
        if (!Number.isFinite(n) || n < min || n > max || (entero && !Number.isInteger(n))) {
            return marcar(input, etiqueta + " entre " + min + " y " + max + ".");
        }
        return marcar(input, "");
    }

    const validarEdad = () => validarNumero(edad, 10, 100, "Edad", true);
    const validarAltura = () => validarNumero(altura, 100, 250, "Altura", true);
    const validarPeso = () => validarNumero(peso, 30, 300, "Peso", false);

    function validarTerminos() {
        const campo = terminos.closest(".campo");
        const texto = campo.querySelector(".mensaje-error");
        if (!terminos.checked) {
            campo.classList.add("error");
            texto.textContent = "Tienes que aceptar los términos para continuar.";
            return false;
        }
        campo.classList.remove("error");
        texto.textContent = "";
        return true;
    }

    // ---------- Medidor de seguridad de la contraseña ----------
    function actualizarFuerza() {
        const v = contrasena.value;
        let nivel = 0;
        if (v.length >= 8) nivel++;
        if (/[a-z]/.test(v) && /[A-Z]/.test(v)) nivel++;
        if (/\d/.test(v)) nivel++;
        if (/[^a-zA-Z0-9]/.test(v) || v.length >= 12) nivel++;
        if (v.length === 0) nivel = 0;

        const textos = ["Usa letras y números.", "Contraseña débil", "Contraseña mejorable", "Contraseña buena", "Contraseña segura"];
        fuerza.dataset.nivel = nivel;
        fuerzaTexto.textContent = textos[nivel];
    }

    // ---------- Validar al salir del campo y revalidar al escribir ----------
    function enlazar(input, validar) {
        input.addEventListener("blur", validar);
        input.addEventListener("input", () => {
            const campo = input.closest(".campo");
            if (campo.classList.contains("error") || campo.classList.contains("ok")) validar();
        });
    }

    enlazar(nombre, validarNombre);
    enlazar(email, validarEmail);
    enlazar(contrasena, validarContrasena);
    enlazar(contrasena2, validarContrasena2);
    enlazar(edad, validarEdad);
    enlazar(altura, validarAltura);
    enlazar(peso, validarPeso);

    contrasena.addEventListener("input", () => {
        actualizarFuerza();
        if (contrasena2.value !== "") validarContrasena2();
    });

    terminos.addEventListener("change", validarTerminos);

    // ---------- Mostrar / ocultar contraseña ----------
    document.querySelectorAll(".toggle-password").forEach(boton_ojo => {
        boton_ojo.addEventListener("click", () => {
            const input = document.getElementById(boton_ojo.dataset.target);
            const visible = input.type === "text";
            input.type = visible ? "password" : "text";
            boton_ojo.classList.toggle("activo", !visible);
            boton_ojo.setAttribute("aria-pressed", String(!visible));
            boton_ojo.setAttribute("aria-label", visible ? "Mostrar contraseña" : "Ocultar contraseña");
        });
    });

    // ---------- Mensaje general ----------
    function mostrarMensaje(texto, esError) {
        exito.textContent = texto;
        exito.classList.add("visible");
        exito.classList.toggle("fallo", !!esError);
    }

    function reactivarBoton() {
        boton.disabled = false;
        boton.textContent = "Crear cuenta";
    }

    // El servidor indica en "campo" qué parámetro falló: lo llevamos a su input
    const CAMPOS_SERVIDOR = {
        correoUsuario: email,
        nombreUsuario: nombre,
        claveUsuario: contrasena,
        claveUsuarioRepetida: contrasena2,
        edadUsuario: edad,
        alturaUsuario: altura,
        pesoUsuario: peso
    };

    // ---------- Enviar ----------
    formulario.addEventListener("submit", async function(e) {
        e.preventDefault();
        exito.classList.remove("visible");

        // Se evalúan todos (sin cortocircuito) para que salgan todos los errores
        const resultados = [
            [nombre, validarNombre()],
            [email, validarEmail()],
            [contrasena, validarContrasena()],
            [contrasena2, validarContrasena2()],
            [edad, validarEdad()],
            [altura, validarAltura()],
            [peso, validarPeso()],
            [terminos, validarTerminos()]
        ];

        const primerError = resultados.find(([, ok]) => !ok);
        if (primerError) {
            primerError[0].focus();
            return;
        }

        boton.disabled = true;
        boton.textContent = "Creando cuenta…";

        const correo = email.value.trim().toLowerCase();

        // Mismos nombres de parámetro que lee CrearUsuarioServlet
        const datos = new URLSearchParams();
        datos.set("correoUsuario", correo);
        datos.set("nombreUsuario", nombre.value.trim());
        datos.set("claveUsuario", contrasena.value);
        datos.set("claveUsuarioRepetida", contrasena2.value);
        if (edad.value.trim()) datos.set("edadUsuario", edad.value.trim());
        if (altura.value.trim()) {
            const cm = Number(altura.value);
            datos.set("alturaUsuario", String(cm));
        }
        if (peso.value.trim()) datos.set("pesoUsuario", peso.value.trim());
        if (dificultad.value) datos.set("dificultadUsuario", dificultad.value);
        if (sesiones.value) datos.set("sesiones_semanalesUsuario", sesiones.value);

        const cabeceras = {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        };

        try {
            const resp = await fetch(CREAR_USUARIO_URL, {
                method: "POST",
                credentials: "same-origin",
                headers: cabeceras,
                body: datos
            });
            const json = await resp.json().catch(() => ({}));

            if (!resp.ok || !json.ok) {
                const input = CAMPOS_SERVIDOR[json.campo];
                if (input) {
                    marcar(input, json.error || "Revisa este campo.");
                    input.focus();
                } else {
                    mostrarMensaje(json.error || "No se pudo crear la cuenta. Inténtalo de nuevo.", true);
                }
                reactivarBoton();
                return;
            }

            // Cuenta creada: iniciamos sesión con los mismos datos para entrar directamente
            mostrarMensaje("Cuenta creada. Entrando…", false);

            const loginResp = await fetch(LOGIN_URL, {
                method: "POST",
                credentials: "same-origin",
                headers: cabeceras,
                body: new URLSearchParams({ correo: correo, clave: contrasena.value })
            });
            const loginJson = await loginResp.json().catch(() => ({}));

            if (loginResp.ok && loginJson.ok) {
                window.location.href = "index.html";
            } else {
                mostrarMensaje("Cuenta creada. Inicia sesión para continuar.", false);
                mostrarLog_in();
                reactivarBoton();
            }
        } catch (error) {
            console.error(error);
            mostrarMensaje("No se pudo conectar con el servidor.", true);
            reactivarBoton();
        }
    });
})();
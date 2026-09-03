const menuButton = document.querySelector("#menu-button");
const mobileMenu = document.querySelector("#mobile-menu");

menuButton.addEventListener("click", () => {
  const menuAbierto = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!menuAbierto));
  menuButton.setAttribute("aria-label", menuAbierto ? "Abrir menú" : "Cerrar menú");
  mobileMenu.hidden = menuAbierto;
});


mobileMenu.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    mobileMenu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú");
  }
});

const dominiosPermitidos = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

function correoValido(correo) {
  const partes = correo.trim().split("@");
  if (partes.length !== 2) return false;
  const dominio = partes[1].toLowerCase();
  return dominiosPermitidos.includes(dominio);
}

function claveValida(clave) {
  return clave.length >= 4 && clave.length <= 10;
}

function mostrarError(elementoError, mensaje) {
  elementoError.textContent = mensaje;
  elementoError.classList.remove("hidden");
}

function ocultarError(elementoError) {
  elementoError.classList.add("hidden");
  elementoError.textContent = "";
}

function validarFormulario({ correoInput, claveInput, errorEl }) {
  const correo = correoInput.value.trim();
  const clave = claveInput.value;

  if (!correo || !clave) {
    mostrarError(errorEl, "Debes completar correo electrónico y contraseña.");
    return false;
  }

  if (correo.length > 100 || clave.length > 100) {
    mostrarError(errorEl, "Los campos no pueden superar los 100 caracteres.");
    return false;
  }

  if (!correoValido(correo)) {
    mostrarError(errorEl, "Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.");
    return false;
  }

  if (!claveValida(clave)) {
    mostrarError(errorEl, "La contraseña debe tener entre 4 y 10 caracteres.");
    return false;
  }

  ocultarError(errorEl);
  return true;
}

// --- Validación Acceder ---
const formAcceder = document.querySelector("#form-acceder");
formAcceder.addEventListener("submit", (event) => {
  event.preventDefault();

  const correoInput = document.querySelector("#acceder-correo");
  const errorEl = document.querySelector("#acceder-error");
  const claveInput = document.querySelector("#acceder-clave");

  const valido = validarFormulario({
    correoInput,
    claveInput,
    errorEl,
  });
  if (!valido) return;

  // Buscar el cliente ficticio con ese correo
  //trim quita espacios al inicio o final
  const correoIngresado = correoInput.value.trim();
  //find busca el primer elemento que cumpla la condición, si no encuentra ninguno devuelve undefined
  //la pregunta es si el correo del cliente c.correo es igual al ingresado
  const cliente = window.clientesPrueba.find((c) => c.correo === correoIngresado);

  if (!cliente) {
    mostrarError(errorEl, "No existe un cliente de prueba con ese correo.");
    return;
  }

  // Guardar el cliente en el navegador para que otras páginas lo lean
  localStorage.setItem("clienteActual", JSON.stringify(cliente));

  // Redirigir al inicio
  window.location.href = "./index.html";
});

// --- Validación Registrarse ---
const formRegistrarse = document.querySelector("#form-registrarse");
formRegistrarse.addEventListener("submit", (event) => {
  event.preventDefault();
  const valido = validarFormulario({
    correoInput: document.querySelector("#registrarse-correo"),
    claveInput: document.querySelector("#registrarse-clave"),
    errorEl: document.querySelector("#registrarse-error"),
  });
  if (valido) {
    const esContratista = document.querySelector("#registrarse-contratista").checked;
    // Aquí va la lógica real de registro (conexión al backend) cuando corresponda
    console.log("Registro válido:", { esContratista });
  }
});

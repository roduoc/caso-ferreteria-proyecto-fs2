////////menu movil
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

/////////////////// reglas de validacion de formulario
const dominiosPermitidos = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

//es para saber si el correo esta dentro de los dominios permitidos
//separa el correo por el arroba, y si no tiene dos partes es porque no es un correo entonces retorna false
//si tiene dos partes, pasa la segunda parte a minusculas y verifica que este dentro de los dominios permitidos
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

  if (!correo) {
    mostrarError(errorEl, "No puede haber campos en blanco.");
    return false;
  }

  if (correo.length > 100) {
    mostrarError(errorEl, "El correo no puede superar los 100 caracteres.");
    return false;
  }

  if (!correoValido(correo)) {
    mostrarError(errorEl, "Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.");
    return false;
  }

  if (!clave) {
    mostrarError(errorEl, "No puede haber campos en blanco.");
    return false;
  }

  if (!claveValida(clave)) {
    mostrarError(errorEl, "La contraseña debe tener entre 4 y 10 caracteres.");
    return false;
  }

  ocultarError(errorEl);
  return true;
}
/////////////////////fin de validaciones de campo

const rutasPorRol = {
  admin: "index.html",
  vendedor: "vista_vendedor.html",
  cliente: "vista_mis_pedidos.html",
};

// --- Validación Acceder ---
//asignamos el form a la variable
//al hacer click en submit, se ejecuta la funcion
//prevent default cancela que se recargue la pagina al hacer submit para manejarlo nosotros
//le pasamos el id de correo, clave y error
//para el error, el id se lo pasamos a mostrar error para que muestre un mensaje
const formAcceder = document.querySelector("#form-acceder");
formAcceder.addEventListener("submit", (event) => {
  event.preventDefault();

  const correoInput = document.querySelector("#acceder-correo");
  const claveInput = document.querySelector("#acceder-clave");
  const errorEl = document.querySelector("#acceder-error");
  

  const valido = validarFormulario({ correoInput, claveInput, errorEl });
  if (!valido) return;

  const correoIngresado = correoInput.value.trim();
  const claveIngresada = claveInput.value;

  //revisa usuario por usuario y compara la contraseña y correo ingresados
  const usuario = window.clientesPrueba.find(
    (u) => u.correo === correoIngresado && u.clave === claveIngresada
  );

  if (!usuario) {
    mostrarError(errorEl, "Correo o contraseña incorrectos.");
    return;
  }

  const destino = rutasPorRol[usuario.rol];
  window.location.href = destino;
});


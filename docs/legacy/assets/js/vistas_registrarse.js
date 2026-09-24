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

//////////////////////////////////////regiones y comunas
////////regiones y comunas
const regionesComunas = {
  "Arica y Parinacota": ["Arica", "Camarones", "General Lagos", "Putre"],
  "Tarapacá": ["Alto Hospicio", "Camiña", "Colchane", "Huara", "Iquique", "Pica", "Pozo Almonte"],
  "Antofagasta": ["Antofagasta", "Calama", "María Elena", "Mejillones", "Ollagüe", "San Pedro de Atacama", "Sierra Gorda", "Taltal", "Tocopilla"],
  "Atacama": ["Alto del Carmen", "Caldera", "Chañaral", "Copiapó", "Diego de Almagro", "Freirina", "Huasco", "Tierra Amarilla", "Vallenar"],
  "Coquimbo": ["Andacollo", "Canela", "Combarbalá", "Coquimbo", "Illapel", "La Higuera", "La Serena", "Los Vilos", "Monte Patria", "Ovalle", "Paihuano", "Punitaqui", "Río Hurtado", "Salamanca", "Vicuña"],
  "Valparaíso": ["Algarrobo", "Cabildo", "Calera", "Calle Larga", "Cartagena", "Casablanca", "Catemu", "Concón", "El Quisco", "El Tabo", "Hijuelas", "Isla de Pascua", "Juan Fernández", "La Cruz", "La Ligua", "Limache", "Llaillay", "Nogales", "Olmué", "Panquehue", "Papudo", "Petorca", "Puchuncaví", "Putaendo", "Quillota", "Quilpué", "Quintero", "Rinconada", "San Antonio", "San Esteban", "San Felipe", "Santa María", "Santo Domingo", "Valparaíso", "Villa Alemana", "Viña del Mar", "Zapallar"],
  "Metropolitana de Santiago": ["Alhué", "Buin", "Calera de Tango", "Cerrillos", "Cerro Navia", "Colina", "Conchalí", "Curacaví", "El Bosque", "El Monte", "Estación Central", "Huechuraba", "Independencia", "Isla de Maipo", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Lampa", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "María Pinto", "Melipilla", "Ñuñoa", "Padre Hurtado", "Paine", "Pedro Aguirre Cerda", "Peñaflor", "Peñalolén", "Pirque", "Providencia", "Pudahuel", "Puente Alto", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Bernardo", "San Joaquín", "San José de Maipo", "San Miguel", "San Pedro", "San Ramón", "Santiago", "Talagante", "Til Til", "Vitacura"],
  "Libertador General Bernardo O'Higgins": ["Chépica", "Chimbarongo", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "La Estrella", "Las Cabras", "Litueche", "Lolol", "Machalí", "Malloa", "Marchihue", "Mostazal", "Nancagua", "Navidad", "Olivar", "Paredones", "Peralillo", "Peumo", "Pichidegua", "Pichilemu", "Placilla", "Pumanque", "Quinta de Tilcoco", "Rancagua", "Rengo", "Requínoa", "San Fernando", "San Vicente", "Santa Cruz"],
  "Maule": ["Cauquenes", "Chanco", "Colbún", "Constitución", "Curepto", "Curicó", "Empedrado", "Hualañé", "Licantén", "Linares", "Longaví", "Maule", "Molina", "Parral", "Pelarco", "Pelluhue", "Pencahue", "Rauco", "Retiro", "Río Claro", "Romeral", "Sagrada Familia", "San Clemente", "San Javier", "San Rafael", "Talca", "Teno", "Vichuquén", "Villa Alegre", "Yerbas Buenas"],
  "Ñuble": ["Bulnes", "Chillán", "Chillán Viejo", "Cobquecura", "Coelemu", "Coihueco", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"],
  "Biobío": ["Alto Biobío", "Antuco", "Arauco", "Cabrero", "Cañete", "Chiguayante", "Concepción", "Contulmo", "Coronel", "Curanilahue", "Florida", "Hualpén", "Hualqui", "Laja", "Lebu", "Los Álamos", "Los Ángeles", "Lota", "Mulchén", "Nacimiento", "Negrete", "Penco", "Quilaco", "Quilleco", "San Pedro de la Paz", "San Rosendo", "Santa Bárbara", "Santa Juana", "Talcahuano", "Tirúa", "Tomé", "Tucapel", "Yumbel"],
  "Araucanía": ["Angol", "Carahue", "Cholchol", "Collipulli", "Cunco", "Curacautín", "Curarrehue", "Ercilla", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Lonquimay", "Los Sauces", "Lumaco", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Purén", "Renaico", "Saavedra", "Temuco", "Teodoro Schmidt", "Toltén", "Traiguén", "Victoria", "Vilcún", "Villarrica"],
  "Los Ríos": ["Corral", "Futrono", "La Unión", "Lago Ranco", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "Río Bueno", "Valdivia"],
  "Los Lagos": ["Ancud", "Calbuco", "Castro", "Chaitén", "Chonchi", "Cochamó", "Curaco de Vélez", "Dalcahue", "Fresia", "Frutillar", "Futaleufú", "Hualaihué", "Llanquihue", "Los Muermos", "Maullín", "Osorno", "Palena", "Puerto Montt", "Puerto Octay", "Puerto Varas", "Puqueldón", "Purranque", "Puyehue", "Queilén", "Quellón", "Quemchi", "Quinchao", "Río Negro", "San Juan de la Costa", "San Pablo"],
  "Aysén": ["Aysén", "Chile Chico", "Cisnes", "Cochrane", "Coyhaique", "Guaitecas", "Lago Verde", "O'Higgins", "Río Ibáñez", "Tortel"],
  "Magallanes y de la Antártica Chilena": ["Antártica", "Cabo de Hornos", "Laguna Blanca", "Natales", "Porvenir", "Primavera", "Punta Arenas", "Río Verde", "San Gregorio", "Timaukel", "Torres del Paine"]
};

const regionSelect = document.querySelector("#region");
const comunaSelect = document.querySelector("#comuna");

//llena los select con las opciones, solo las keys, o sea, las regiones
Object.keys(regionesComunas).forEach((region) => {
    //crea la opcion para el desplegable
  const option = document.createElement("option");
  option.value = region;
  //le asigna el texto visible a la opcion
  option.textContent = region;
  //se inserta la opcion en el html
  regionSelect.appendChild(option);
});

regionSelect.addEventListener("change", () => {
    //vacia por completo el select de comuna para que no queden las de la seleccion anterior
  comunaSelect.innerHTML = "";
  //habilita la seleccion
  comunaSelect.disabled = false;

  regionesComunas[regionSelect.value].forEach((comuna) => {
    //crea la opcion para el desplegable
    const option = document.createElement("option");
    option.value = comuna;
    option.textContent = comuna;
    //inserta la opcion en el html
    comunaSelect.appendChild(option);
  });
});

//////////////////////////////////////////validacion de campos

//rut sin puntos ni guion
//^ marca el inicio del string
//0-9
function rutValido(rut) {
  return /^[0-9]{6,8}[0-9kK]$/.test(rut);
}
 
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
 
const formRegistrarse = document.querySelector("#form-registrarse");
const errorEl = document.querySelector("#registrarse-error");
 
formRegistrarse.addEventListener("submit", (event) => {
  event.preventDefault();
 
const nombre = document.querySelector("#registrarse-nombre").value.trim();
const apellidos = document.querySelector("#registrarse-apellidos").value.trim();
const rut = document.querySelector("#registrarse-rut").value.trim();
const correo = document.querySelector("#registrarse-correo").value.trim();
const clave = document.querySelector("#registrarse-clave").value;
const region = regionSelect.value;
const comuna = comunaSelect.value;
const direccion = document.querySelector("#registrarse-direccion").value.trim();
 
if (!rut) {
  mostrarError(errorEl, "El RUT es obligatorio.");
  return;
}
if (!nombre) {
  mostrarError(errorEl, "El nombre es obligatorio.");
  return;
}
if (nombre.length > 50) {
  mostrarError(errorEl, "El nombre no puede superar los 50 caracteres.");
  return;
}

if (!apellidos) {
  mostrarError(errorEl, "Los apellidos son obligatorios.");
  return;
}
if (apellidos.length > 100) {
  mostrarError(errorEl, "Los apellidos no pueden superar los 100 caracteres.");
  return;
}
if (!rutValido(rut)) {
  mostrarError(errorEl, "El RUT debe ingresarse sin puntos ni guion (solo números, opcionalmente terminado en K), entre 7 y 9 caracteres.");
  return;
}

if (!correo) {
  mostrarError(errorEl, "El correo electrónico es obligatorio.");
  return;
}
if (correo.length > 100) {
  mostrarError(errorEl, "El correo no puede superar los 100 caracteres.");
  return;
}
if (!correoValido(correo)) {
  mostrarError(errorEl, "Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.");
  return;
}

if (!clave) {
  mostrarError(errorEl, "La contraseña es obligatoria.");
  return;
}
if (!claveValida(clave)) {
  mostrarError(errorEl, "La contraseña debe tener entre 4 y 10 caracteres.");
  return;
}
if (!region) {
  mostrarError(errorEl, "Debes seleccionar una región.");
  return;
}
if (!comuna) {
  mostrarError(errorEl, "Debes seleccionar una comuna.");
  return;
}

if (!direccion) {
  mostrarError(errorEl, "La dirección es obligatoria.");
  return;
}
if (direccion.length > 300) {
  mostrarError(errorEl, "La dirección no puede superar los 300 caracteres.");
  return;
}

ocultarError(errorEl);
});
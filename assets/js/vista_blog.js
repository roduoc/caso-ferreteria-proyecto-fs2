const publicaciones = {
  herramientas: {
    categoria: "Consejos",
    titulo: "Cómo elegir una herramienta para el hogar",
    resumen: "Algunos consejos básicos para comprar herramientas que realmente sirvan para los trabajos de la casa.",
    contenido: [
      "Antes de comprar una herramienta es importante pensar para qué trabajo se va a utilizar y con qué frecuencia. Para arreglos pequeños no siempre se necesita el modelo más caro, pero sí conviene elegir una herramienta cómoda y resistente.",
      "También se recomienda revisar el tamaño, el peso y los materiales. Un mango firme y antideslizante ayuda a trabajar con mayor seguridad. En herramientas eléctricas se debe comprobar la potencia, el largo del cable y los accesorios incluidos.",
      "Para comenzar, un kit sencillo puede incluir martillo, alicate, destornilladores, cinta métrica y llave ajustable. Después se pueden agregar otras herramientas según las necesidades de cada proyecto.",
    ],
    consejo: "Revisa siempre el stock y compara las características antes de comprar.",
  },
  reparacion: {
    categoria: "Construcción",
    titulo: "Materiales básicos para una reparación",
    resumen: "Una lista sencilla para preparar reparaciones pequeñas sin comprar materiales de más.",
    contenido: [
      "Para una reparación pequeña primero se debe revisar bien la zona y calcular aproximadamente cuánto material será necesario. Esto ayuda a evitar viajes extra y también reduce los sobrantes.",
      "Algunos materiales comunes son cemento, mortero, arena, tornillos, cinta de enmascarar y pintura. La elección depende del tipo de superficie y de si el trabajo será realizado en interior o exterior.",
      "Además de los materiales, es bueno tener elementos de seguridad como guantes, lentes y mascarilla. Antes de comenzar hay que limpiar el lugar y leer las indicaciones de cada producto.",
    ],
    consejo: "Si tienes dudas sobre una medida o material, anótala antes de venir a la ferretería.",
  },
};

const parametros = new URLSearchParams(window.location.search);
const claveArticulo = parametros.get("articulo");
const publicacion = publicaciones[claveArticulo] || publicaciones.herramientas;

document.title = `${publicacion.titulo} | Blog Los Maestros`;
document.querySelector("#blog-category").textContent = publicacion.categoria;
document.querySelector("#blog-heading").textContent = publicacion.titulo;
document.querySelector("#blog-summary").textContent = publicacion.resumen;
document.querySelector("#blog-content").innerHTML = publicacion.contenido
  .map((parrafo) => `<p>${parrafo}</p>`)
  .join("");
document.querySelector("#blog-tip").textContent = publicacion.consejo;

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

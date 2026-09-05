# Ferretería Los Maestros

Este proyecto corresponde a la primera entrega de la asignatura Fullstack 2. La idea es desarrollar una página web para la Ferretería Los Maestros, donde los clientes puedan revisar los productos disponibles, ver su detalle y agregarlos al carrito de compras

Por ahora el proyecto está hecho solamente con HTML, CSS, Tailwind CSS y JavaScript. Todavía no se utiliza React, base de datos ni backend, por lo que los productos y usuarios están escritos directamente en los archivos JavaScript

## Funciones realizadas

Actualmente el sitio cuenta con algunas de las siguientes vistas:

- Página principal.
- Catálogo de productos.
- Detalle de cada producto.
- Carrito de compras.
- Inicio de sesión.
- Registro de clientes.
- Mis pedidos.
- Opciones de retiro o despacho.
- Formulario de contacto.
- Vistas para administrador.
- Vistas para vendedor.
  
## Roles del sistema

El proyecto considera tres tipos de usuario:

- Administrador
- Vendedor
- Cliente

Dependiendo del usuario ingresado en el login, la página redirige a una vista diferente

## Credenciales para probar el login

Los usuarios de prueba están creados en el archivo `assets/js/clientes_prueba.js`

### Administrador

- Correo: `ana.torres@duoc.cl`
- Contraseña: `1234`

### Vendedor

- Correo: `luis.fuentes@duoc.cl`
- Contraseña: `1234`

### Cliente

- Correo: `juan.perez@gmail.com`
- Contraseña: `1234`

También existe este cliente dentro del arreglo:

- Correo: `constructura@gmail.cl`
- Contraseña: `1234`

Este último usuario actualmente no puede ingresar porque el formulario solo permite correos terminados en `@duoc.cl`, `@profesor.duoc.cl` o `@gmail.com`. Se debe cambiar su correo a un dominio permitido si se quiere utilizar para las pruebas

## Cómo ejecutar el proyecto

Primero se deben instalar las dependencias:

```bash
npm install

npm run build:css
```

### Uso de IA

Se utilizo herramientas de IA principalmente para los assets y SVGs, y en algunas vistas para corregir temas de diseño y potenciar los estilos de CSS, tambien fue utilizada como herramienta para darnos ideas y darle un enfoque a nuestro proyecto

## FULLSTACKEANDO AURA

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

- Correo: `admin@duoc.cl`
- Contraseña: `1234`

### Vendedor

- Correo: `vendedor@duoc.cl`
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

## CI/CD del frontend en AWS

**Frontend CI/CD** ejecuta lint, Vitest con respuestas simuladas y la compilación
de Vite en los PR hacia `main` y al actualizar `main`. En Actions se pueden
descargar el reporte de cobertura y la carpeta compilada.

Para activar la publicación automática, configura estas variables en
**Settings → Secrets and variables → Actions → Variables** del repositorio.

| Variable | Valor |
| --- | --- |
| `VITE_API_URL` | URL pública del API Gateway, sin barra final. |
| `AWS_REGION` | Región del bucket existente. |
| `AWS_S3_BUCKET` | Nombre del bucket, sin `s3://`. |
| `FRONTEND_URL` | URL pública que usan los usuarios para entrar a la tienda. |
| `AWS_DEPLOY_ENABLED` | `true` cuando el bucket y el acceso estén listos. |
| `AWS_ROLE_ARN` | Rol de AWS para publicar mediante OIDC, cuando está disponible. |
| `E2E_API_URL` | URL del backend de pruebas, con su propia base de datos. Solo se usa para la suite completa de Playwright. |

El rol OIDC debe confiar en este repositorio y en el entorno
`frontend-s3` de GitHub, y tener permiso para listar el bucket y subir los
archivos. Restringe ese entorno a la rama `main`. Si el sandbox de AWS
Academy entrega credenciales temporales en vez de un rol OIDC, deja
`AWS_ROLE_ARN` vacío y guarda `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
y `AWS_SESSION_TOKEN` como secretos del entorno `frontend-s3`. Esos tres
valores se deben renovar cuando venza la sesión del laboratorio.

El workflow sube los archivos de `dist/` a la raíz del bucket y publica
`index.html` al final. Luego Playwright abre la portada y comprueba que el
catálogo cargue. El API Gateway debe permitir por CORS el origen de
`FRONTEND_URL`.

Para ejecutar las pruebas completas de Aisleen, abre **Actions → Frontend CI/CD
→ Run workflow** en `main` y marca la opción de Playwright. Esa ejecución
levanta el frontend en el runner y usa `E2E_API_URL`; el backend de pruebas
debe aceptar el origen `http://localhost:4173` y tener los datos iniciales
de pruebas. La ejecución de la suite completa omite la publicación, porque
incluye casos que cambian datos.

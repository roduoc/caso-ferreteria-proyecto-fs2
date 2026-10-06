# Pruebas con Vitest

Para correr las pruebas una vez: `npm run test:run`.

Para ver la cobertura: `npm run test:coverage`. El detalle HTML queda en `coverage/index.html`. El comando falla si cualquiera de las cuatro métricas globales baja del 80 %.

Las pruebas cubren registro y sesiones (HU 1 y 2), administración de usuarios (HU 3), catálogo y stock (HU 4), estados y privacidad de pedidos (HU 10), historial por cliente para el administrador (HU 12), carrito, pagos y compras a crédito. Los archivos `.test.js` y `.test.jsx` están junto al código probado.

La cobertura configurada incluye `src/services` y `src/components`. También hay pruebas de vistas en `src/pages/flujosHistorias.test.jsx`, pero las páginas no forman parte del porcentaje de cobertura. Las rutas con rol y los servicios que consultan pedidos o administran usuarios se prueban por separado.

Este proyecto usa datos simulados y `localStorage`. El token de sesión se genera y se invalida en el navegador para probar el flujo, pero no equivale a autenticación segura en un servidor. Antes de usar cuentas reales, contraseñas, permisos y tokens deben verificarse en una API/backend.

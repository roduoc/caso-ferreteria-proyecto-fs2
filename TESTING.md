# Pruebas con Vitest

Para correr las pruebas una vez: `npm run test:run`.

Para ver la cobertura: `npm run test:coverage`. El detalle HTML queda en `coverage/index.html`. El comando falla si cualquiera de las cuatro métricas globales baja del 80 %.

Las pruebas cubren registro y sesiones (HU 1 y 2), administración de usuarios (HU 3), catálogo, búsqueda y filtros (HU 4 y 5), gestión de productos y alertas de stock (HU 6 y 7), carrito y cantidades (HU 8), retiro y despacho (HU 9), estados y privacidad de pedidos (HU 10), compras a cuenta corriente (HU 11), historial por cliente (HU 12) y reportes de ventas (HU 13). Los archivos `.test.js` y `.test.jsx` están junto al código probado.

La cobertura configurada incluye `src/services` y `src/components`. También hay pruebas de vistas en `src/pages/flujosHistorias.test.jsx` y `src/pages/historiasPendientes.test.jsx`, pero las páginas no forman parte del porcentaje de cobertura. Las rutas con rol y los servicios que consultan pedidos o administran usuarios se prueban por separado.

Este proyecto usa datos simulados y `localStorage`. El token de sesión se genera y se invalida en el navegador para probar el flujo, pero no equivale a autenticación segura en un servidor. Antes de usar cuentas reales, contraseñas, permisos y tokens deben verificarse en una API/backend.

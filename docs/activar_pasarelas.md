# Activar Webpay y Mercado Pago

El código de las dos pasarelas está listo y apagado. Sirve para los pedidos del
portal (dominio, hosting, pack, correos, renovaciones) y para el anticipo y el
saldo de las cotizaciones. Se encienden solo con variables de Vercel.

Las variables `VITE_*` se leen al construir: después de cambiarlas hay que hacer
**Redeploy**. Las demás se leen en cada llamado.

## 1. Pruebas en la vista previa (Preview)

No requieren inicio de actividades ni contrato.

| Variable | Valor | Para qué |
|---|---|---|
| `VITE_PAGO_WEBPAY` | `si` | Muestra el botón de Webpay. Sin `TBK_*` usa el comercio de integración de Transbank. |
| `MP_ACCESS_TOKEN` | `TEST-…` | Access Token de prueba (MP Developers → tu app Checkout Pro → Credenciales de prueba). |
| `MP_WEBHOOK_SECRET` | clave del webhook | Opcional en pruebas. MP Developers → Webhooks → URL `https://<vista-previa>/api/mercadopago/webhook`, evento "Pagos". |
| `VITE_PAGO_MP` | `si` | Muestra el botón de Mercado Pago. |

Además, en Vercel → Settings → Deployment Protection, activar **Protection
Bypass for Automation**: sin eso el aviso de Mercado Pago no entra a la vista
previa (el pago igual se registra cuando el cliente vuelve).

Tarjetas de prueba:
- Webpay: `4051 8856 0044 6623`, vencimiento cualquiera futuro, CVV `123`. En el
  banco de prueba: RUT `11.111.111-1`, clave `123`.
- Mercado Pago: las de su documentación ("Tarjetas de prueba"). El nombre del
  titular decide el resultado: `APRO` aprobado, `OTHE` rechazado.

Casos a probar (guardar captura de cada uno, sirven para la validación de Transbank):

1. Webpay aprobado: un pedido del portal y el anticipo de una cotización nueva.
   Debe verse el comprobante (N.º de orden, monto, fecha, código de autorización,
   tipo de pago, cuotas, últimos 4 dígitos).
2. Webpay rechazado (en el banco de prueba, "Rechazar").
3. Webpay anulado ("Anular compra" en el formulario de Webpay), en el portal y en la cotización.
4. Mercado Pago aprobado: un pedido del portal y el saldo de una cotización.
5. Mercado Pago rechazado.

En cada caso revisar la tabla `orders` o `quote_payments` y los correos.

## 2. Trámites (antes de cobrar de verdad)

1. Inicio de actividades de la SpA en el SII (F4415).
2. Cuenta bancaria de la SpA → llenar `src/data/transferencia.js` (banco, tipo y
   número) y publicar: los datos aparecen solos en el portal, la cotización y el
   correo de aceptación.
3. Transbank: contrato de Webpay Plus, validación con las capturas de arriba y
   entrega del código de comercio y la API Key de producción.
4. Mercado Pago: cuenta de vendedor a nombre de la SpA, credenciales de
   producción y webhook a `https://interfaz360.cl/api/mercadopago/webhook`
   (evento "Pagos"), copiando su clave secreta.
5. Vercel Pro: el plan Hobby no permite uso comercial.

## 3. Encender en producción (Production)

| Variable | Valor |
|---|---|
| `TBK_AMBIENTE` | `produccion` |
| `TBK_COMMERCE_CODE` | código de comercio de Transbank |
| `TBK_API_KEY` | API Key secreta de Transbank |
| `VITE_PAGO_WEBPAY` | `si` |
| `MP_ACCESS_TOKEN` | Access Token de producción (`APP_USR-…`) |
| `MP_WEBHOOK_SECRET` | clave del webhook de producción (**obligatoria**: sin ella todo aviso se rechaza) |
| `VITE_PAGO_MP` | `si` |

Orden: cargar todas las variables → Redeploy de producción → una compra real
chica (un dominio) con cada pasarela → revisar el pedido en /admin y el correo.

Protecciones del código: en producción Webpay se niega a usar el comercio de
integración y Mercado Pago rechaza un token `TEST-`. Si falta algo, el botón da
error en vez de cobrar mal.

Devoluciones: desde el panel de Transbank o de Mercado Pago. Después, anotar el
pedido como cancelado en /admin.

# Guía para Gestionar Tickets de Soporte

Actualmente, la gestión de tickets (responder y marcarlos como resueltos) se hace directamente desde la base de datos de Supabase.

## ¿Cómo marcar un ticket como "Resuelto"?

1.  Ingresa a tu proyecto en **Supabase**.
2.  Ve al **Table Editor** (icono de tabla a la izquierda).
3.  Selecciona la tabla **`tickets`** (en las pestañas superiores o en la lista lateral).
4.  Busca la fila del ticket que quieres cerrar.
5.  Busca la columna **`status`**.
6.  Cambia el valor de `pending` a **`solved`**.
    *   `pending` = En Revisión (Amarillo)
    *   `solved` = Resuelto (Verde)
7.  Haz clic en **Save** (o presiona Enter) para guardar el cambio.

### (Opcional) Agregar Mensaje de Respuesta

Si quieres dejarle un mensaje al cliente (ej: "Ya reiniciamos el servidor"):

1.  Busca la columna **`admin_response`**.
2.  Haz doble clic en la celda vacía de esa fila.
3.  Escribe tu mensaje.
4.  Guarda los cambios.

¡Listo! El cliente verá inmediatamente el estado actualizado y tu respuesta en su Dashboard.

## Estados Disponibles

El sistema reconoce automáticamente estos dos estados:

| Valor en Base de Datos | Se muestra como | Color |
| :--- | :--- | :--- |
| `pending` | **EN REVISIÓN** | Amarillo |
| `solved` | **RESUELTO** | Verde |

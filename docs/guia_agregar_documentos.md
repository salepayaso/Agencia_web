# Guía para Agregar Documentos al Portal Cliente

Actualmente, el portal soporta múltiples documentos por cliente. El proceso es manual desde Supabase (Base de Datos y Storage).

## Paso 1: Subir el Archivo (PDF, Imagen, etc.)

1. Ingresa a tu proyecto en **Supabase**.
2. Ve a la sección **Storage** (ícono de carpeta en la izquierda).
3. Entra al bucket llamado `documents`.
   - *Nota: Si no existe, debes crearlo y configurar las políticas como "Público" o con acceso autenticado según tu `storage_policy_fix.sql`.*
4. Sube el archivo que deseas compartir con el cliente (ej: `contrato_servicio_2026.pdf`).
5. **Copia el nombre exacto** del archivo tal como se guardó en el bucket.

## Paso 2: Obtener el ID del Usuario (Cliente)

Necesitas el `user_id` del cliente al que le asignarás el documento.

1. Ve a la sección **Authentication > Users**.
2. Busca el correo del cliente.
3. Copia el `User UID` (una cadena larga de letras y números).

## Paso 3: Registrar el Documento en la Base de Datos

Para que el documento aparezca en el Dashboard, debes insertar un registro en la tabla `documents`.

1. Ve al **SQL Editor** en Supabase.
2. Pega y ejecuta el siguiente script (reemplazando los datos):

```sql
INSERT INTO documents (user_id, title, file_url)
VALUES (
    'PEGA_AQUI_EL_UID_DEL_USUARIO',       -- ID del Usuario (Authentication)
    'Nombre Visible del Documento',       -- Título que verá el cliente (ej: "Contrato 2026")
    'nombre_del_archivo_en_bucket.pdf'    -- Nombre exacto del archivo en Storage
);
```

### Ejemplo Real

```sql
INSERT INTO documents (user_id, title, file_url)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Factura Enero 2026',
    'factura_enero_2026.pdf'
);
```

## Verificación

1. Pide al cliente que inicie sesión o inicia tú con sus credenciales.
2. En el **Dashboard**, sección "Documentación", debería aparecer el nuevo archivo listado.
3. Al hacer clic en el botón de descarga, el sistema generará un enlace seguro (Signed URL) para visualizarlo.

## Opción Visual (Más Fácil - Desde el Table Editor)

Si prefieres no usar código SQL, puedes hacerlo directamente desde el **Table Editor** (donde estás viendo la tabla `profiles`):

1.  **Copia el ID del cliente**:
    *   En la tabla `profiles` (donde estás ahora), busca al cliente.
    *   Copia el valor de la columna `id` (ej: `8f0ae0e7...`).

2.  **Ve a la tabla `documents`**:
    *   Mira las pestañas en la parte superior de la tabla.
    *   Haz clic en la que dice `documents` (al lado de `profiles` y `tickets`).

3.  **Insertar Fila**:
    *   Haz clic en el botón verde **"Insert"**.
    *   **user_id**: Pega el ID que copiaste.
    *   **title**: Escribe el nombre visible (ej: "Cotización Web").
    *   **file_url**: Pega el nombre EXACTO del archivo que subiste al Storage.
    *   Haz clic en **Save**.

¡Listo!

## ¿Cómo agregar un SEGUNDO (o tercer) documento?

¡Es muy simple! **Solo repite el Paso de Registro (ya sea con SQL o el botón Insert)**.

## ¿Cómo agregar un SEGUNDO (o tercer) documento?

¡Es muy simple! **Solo repite el Paso 3**.

No necesitas borrar nada. Cada vez que ejecutas el comando `INSERT`, se agrega un **nuevo** documento a la lista de ese cliente.

Ejemplo para agregar otro archivo más al mismo cliente:

```sql
INSERT INTO documents (user_id, title, file_url)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',  -- El MISMO ID del usuario
    'Contrato de Confidencialidad',          -- TÍTULO nuevo
    'nda_firmado.pdf'                        -- ARCHIVO nuevo (que subiste al Storage)
);
```

Ahora el cliente verá **ambos** documentos en su lista.

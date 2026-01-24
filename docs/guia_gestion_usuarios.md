# Guía de Gestión de Usuarios y Autenticación

## 1. Sobre "Allow new users to sign up"
**Pregunta:** ¿Si activo esta opción para enviar el correo, tengo que desactivarla después?

**Respuesta:** **SÍ, es lo recomendable.**
*   **Actívala** solo cuando necesites enviar invitaciones o correos de confirmación a nuevos clientes.
*   **Desactívala** después para evitar que desconocidos se registren en tu plataforma (aunque tus políticas de seguridad RLS los bloquearían de ver datos, es mejor mantener la puerta cerrada).

---

## 2. Cómo Establecer la Contraseña MANUALMENTE (Sin Correo)

Si prefieres no depender del correo del cliente y asignarle tú mismo una contraseña (por ejemplo, `Cliente2026!`), puedes usar este truco SQL.

> **NOTA:** Esto fuerza la verificación del correo y cambia la contraseña inmediatamente.

### Paso 1: Ir al SQL Editor
En Supabase, ve al editor SQL y pega el siguiente código.

### Paso 2: Ejecutar Script de "Forzar Contraseña"

```sql
-- Instalar extensión de encriptación (solo necesario ejecutar una vez)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- AJUSTA ESTOS DOS VALORES:
UPDATE auth.users
SET 
    encrypted_password = crypt('AQUI_LA_CONTRASEÑA_NUEVA', gen_salt('bf')), -- Tu contraseña elegida
    email_confirmed_at = now(), -- Lo marca como verificado automáticamente
    raw_app_meta_data = raw_app_meta_data || '{"provider": "email", "providers": ["email"]}'::jsonb
WHERE email = 'CORREO_DEL_CLIENTE@EJEMPLO.COM'; -- El correo exacto del cliente
```

### Ejemplo Real

```sql
UPDATE auth.users
SET 
    encrypted_password = crypt('Empresa123!', gen_salt('bf')),
    email_confirmed_at = now()
WHERE email = 'contacto@cliente.cl';
```

Al hacer esto:
1.  El cliente queda **Verificado** (ya no dice "Waiting for verification").
2.  Su contraseña pasa a ser la que tú escribiste (`Empresa123!`).
3.  Ya puede iniciar sesión directamente sin revisar su email.

---

## 3. Resumen del Flujo Ideal
Tienes dos caminos:

### Opción A: "Autoservicio" (Recomendada)
1.  Ve a **Authentication > Configuration > Sign In / Providers**.
2.  Si no lo ves ahí, revisa en **Attack Protection**.
3.  Busca y activa **"Allow new users to sign up"**.
4.  Le das a "Send Confirmation/Magic Link" en la lista de usuarios.

**Nota:** Si no encuentras la opción en la interfaz, **usa la Opción B (SQL)**. Es infalible y no requiere configuración.

### Opción B: "Manual" (Control Total)
1.  Creas el usuario en Supabase (o ya existe).
2.  Ejecutas el **Script SQL** de arriba para ponerle la clave tú mismo.
3.  Le entregas las credenciales (Email + Clave) por WhatsApp/Correo.

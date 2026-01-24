-- Solución para la Alerta de Seguridad: Function public.handle_new_user has a role mutable search_path
-- Problema: La función se ejecuta con privilegios elevados pero no especifica dónde buscar tablas,
-- lo que podría permitir que alguien reemplace tablas del sistema si logra inyectar código.

-- Solución: Forzamos a la función a buscar SOLO en el esquema 'public'.

ALTER FUNCTION public.handle_new_user() SET search_path = public;

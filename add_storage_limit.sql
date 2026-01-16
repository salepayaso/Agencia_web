-- AGREGAR COLUMNA LIMITE DE ALMACENAMIENTO
-- Ejecuta este script en el Editor SQL de Supabase

-- 1. Agregar la columna 'storage_limit' a la tabla 'profiles'
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS storage_limit text DEFAULT '10 GB';

-- 2. (Opcional) Actualizar un usuario específico (reemplaza el ID)
-- UPDATE profiles SET storage_limit = '20 GB' WHERE id = '...';

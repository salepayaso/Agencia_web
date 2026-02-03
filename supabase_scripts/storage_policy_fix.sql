-- ACTIVAR PERMISOS PARA DESCARGAR DOCUMENTOS
-- Copia y pega esto en el Editor SQL de Supabase

-- 1. Crear política de lectura para el bucket 'documents'
-- Permite que cualquier usuario autenticado (logeado) pueda ver y descargar archivos de 'documents'

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Authenticated users can read documents'
    ) THEN
        CREATE POLICY "Authenticated users can read documents" 
        ON storage.objects 
        FOR SELECT 
        TO authenticated 
        USING ( bucket_id = 'documents' );
    END IF;
END $$;

-- 2. (Opcional) Si quieres que ellos puedan SUBIR archivos también (ej: comprobantes), avísame.
-- Por ahora, esto solo permite DESCARGAR lo que tú subas.

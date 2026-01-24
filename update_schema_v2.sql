-- 1. Crear tabla de documentos (para múltiples archivos)
create table if not exists documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null, -- Nombre visible del archivo (ej: "Factura Enero")
  file_url text not null, -- Ruta en el Storage (ej: "facturas/enero_2026.pdf")
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar seguridad (RLS) en documentos
alter table documents enable row level security;

-- Política: El usuario solo puede ver SUS propios documentos
create policy "Usuarios solo ven sus propios documentos"
on documents for select
using (auth.uid() = user_id);

-- 3. Agregar soporte para emails adicionales en profiles
-- Usaremos JSONB para ser flexibles (ej: ["admin@empresa.com", "pagos@empresa.com"])
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'additional_emails') then
        alter table profiles add column additional_emails jsonb default '[]'::jsonb;
    end if;
end $$;

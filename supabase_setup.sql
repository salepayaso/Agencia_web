-- 1. Crear la tabla profiles si no existe
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Agregar columnas (verificando existencia para no dar error)
do $$
begin
    -- Información básica
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'client_name') then
        alter table profiles add column client_name text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'active_web') then
        alter table profiles add column active_web text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'app_name') then
        alter table profiles add column app_name text;
    end if;

    -- Nuevos campos solicitados
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'avatar_url') then
        alter table profiles add column avatar_url text; -- Para la foto de perfil
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'next_payment_date') then
        alter table profiles add column next_payment_date date; -- Para ver "Próximo Pago"
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'document_url') then
        alter table profiles add column document_url text; -- Para el PDF (Factura o Contrato)
    end if;
end $$;

-- 3. Habilitar seguridad (RLS)
alter table profiles enable row level security;

-- 4. Crear políticas de seguridad (ACTUALIZADO: SOLO LECTURA PARA CLIENTES)
do $$
begin
    -- Política de Lectura (El cliente PUEDE VER su perfil)
    if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Perfiles públicos son visibles por todos.') then
        create policy "Perfiles públicos son visibles por todos." on profiles for select using (true);
    end if;

    -- Política de Inserción (El cliente PUEDE crear su perfil al inicio si no existe, o puedes restringirlo también)
    if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Usuarios pueden insertar su propio perfil.') then
        create policy "Usuarios pueden insertar su propio perfil." on profiles for insert with check (auth.uid() = id);
    end if;

    -- Política de Actualización (ELIMINADA o NO CREADA):
    -- Si ya la creaste antes, puedes ejecutar: drop policy "Usuarios pueden actualizar su propio perfil." on profiles;
    -- Aquí comentamos la creación de la política de actualización para que sea SOLO LECTURA.
    -- create policy "Usuarios pueden actualizar su propio perfil." ... (OMITIDO)
end $$;

-- Agregar columna para respuesta del administrador
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'tickets' and column_name = 'admin_response') then
        alter table tickets add column admin_response text;
    end if;
end $$;

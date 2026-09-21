-- Libera o status "pendencia" nos cards de QA (coluna Pendência, antes de Homologação).
do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'qa_items'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%status%'
  loop
    execute format('alter table public.qa_items drop constraint if exists %I', constraint_name);
  end loop;
end $$;

alter table public.qa_items
  add constraint qa_items_status_check
  check (status in ('aberto', 'em_correcao', 'pendencia', 'em_homologacao', 'finalizado'));

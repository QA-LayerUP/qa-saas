-- Status de projeto: em andamento, pausado, cancelado, concluído
-- Rode no SQL Editor do Supabase antes de usar o seletor na lista.

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

UPDATE projects
SET status = 'em_andamento'
WHERE status IN ('em_qa', 'corrigindo', 'homologando', 'em_desenvolvimento')
   OR status IS NULL;

UPDATE projects
SET status = 'concluido'
WHERE status = 'finalizado';

ALTER TABLE projects
  ALTER COLUMN status SET DEFAULT 'em_andamento';

ALTER TABLE projects
  ADD CONSTRAINT projects_status_check
  CHECK (status IN ('em_andamento', 'pausado', 'cancelado', 'concluido'));

-- Criar tabela de teams (times)
CREATE TABLE IF NOT EXISTS teams (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar coluna team_id na tabela qa_categories
ALTER TABLE qa_categories
ADD COLUMN team_id uuid REFERENCES teams(id) ON DELETE CASCADE;

-- Remover a coluna project_id da tabela qa_categories (optional, só se quiser)
-- ALTER TABLE qa_categories DROP COLUMN project_id;

-- Se preferir manter project_id para referência, deixe como está

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_teams_project_id ON teams(project_id);
CREATE INDEX IF NOT EXISTS idx_qa_categories_team_id ON qa_categories(team_id);

-- Habilitar RLS para a nova tabela
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para teams
CREATE POLICY "Allow read access for authenticated users" ON teams 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert access for authenticated users" ON teams 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update access for authenticated users" ON teams 
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete access for authenticated users" ON teams 
  FOR DELETE USING (auth.role() = 'authenticated');

-- Atualizar a política de qa_categories para considerar team_id
-- (remover a política antiga se necessário)
DROP POLICY IF EXISTS "Allow insert access for authenticated users" ON qa_categories;

CREATE POLICY "Allow insert access for authenticated users" ON qa_categories 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND team_id IS NOT NULL);

CREATE POLICY "Allow update access for authenticated users" ON qa_categories 
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete access for authenticated users" ON qa_categories 
  FOR DELETE USING (auth.role() = 'authenticated');

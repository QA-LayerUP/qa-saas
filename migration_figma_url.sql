-- Migration: URL do Figma no projeto
ALTER TABLE projects ADD COLUMN IF NOT EXISTS figma_url text;

COMMENT ON COLUMN projects.figma_url IS 'URL do arquivo Figma de referência do projeto';

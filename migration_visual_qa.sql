-- Migration: Add Visual QA Support
-- This migration adds fields needed for the visual QA feature with integrated browser and screenshot capture

-- Add site_url to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS site_url text;

-- Add visual QA metadata to qa_items table
ALTER TABLE qa_items ADD COLUMN IF NOT EXISTS page_url text;
ALTER TABLE qa_items ADD COLUMN IF NOT EXISTS scroll_position integer;
ALTER TABLE qa_items ADD COLUMN IF NOT EXISTS viewport_size jsonb;

-- Add comment for documentation
COMMENT ON COLUMN projects.site_url IS 'URL of the project website to be loaded in the visual QA browser';
COMMENT ON COLUMN qa_items.page_url IS 'Specific page URL where the QA issue was found';
COMMENT ON COLUMN qa_items.scroll_position IS 'Vertical scroll position when screenshot was captured';
COMMENT ON COLUMN qa_items.viewport_size IS 'Viewport dimensions when screenshot was captured (JSON: {width: number, height: number})';

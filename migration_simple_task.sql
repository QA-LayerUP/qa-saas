-- Add assigned_role column to qa_items
alter table qa_items 
add column assigned_role text check (assigned_role in ('ux', 'dev', 'content', 'qa'));

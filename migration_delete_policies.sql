-- Allow delete access for authenticated users
create policy "Allow delete access for authenticated users" on projects for delete using (auth.role() = 'authenticated');
create policy "Allow delete access for authenticated users" on qa_items for delete using (auth.role() = 'authenticated');

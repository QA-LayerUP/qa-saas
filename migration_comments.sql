-- Create qa_comments table
create table qa_comments (
  id uuid default uuid_generate_v4() primary key,
  qa_item_id uuid references qa_items(id) on delete cascade not null,
  user_id uuid references users(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for comments
alter table qa_comments enable row level security;

create policy "Allow read access for authenticated users" on qa_comments for select using (auth.role() = 'authenticated');
create policy "Allow insert access for authenticated users" on qa_comments for insert with check (auth.role() = 'authenticated');
create policy "Allow delete access for own comments" on qa_comments for delete using (auth.uid() = user_id);

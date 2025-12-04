-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create projects table
create table projects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  client text,
  status text check (status in ('em_qa', 'corrigindo', 'homologando', 'finalizado')) default 'em_qa',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create qa_categories table
create table qa_categories (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create users table (public profile linked to auth.users)
create table users (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  role text check (role in ('ux', 'dev', 'content', 'qa', 'admin')) default 'qa',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create qa_items table
create table qa_items (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references qa_categories(id) on delete cascade not null,
  title text not null,
  description text,
  priority text check (priority in ('alta', 'media', 'baixa')) default 'media',
  status text check (status in ('aberto', 'em_correcao', 'em_homologacao', 'finalizado')) default 'aberto',
  assigned_to uuid references users(id),
  assigned_role text check (assigned_role in ('ux', 'dev', 'content', 'qa')),
  created_by uuid references users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create qa_evidences table
create table qa_evidences (
  id uuid default uuid_generate_v4() primary key,
  qa_item_id uuid references qa_items(id) on delete cascade not null,
  file_url text not null,
  file_type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table projects enable row level security;
alter table qa_categories enable row level security;
alter table users enable row level security;
alter table qa_items enable row level security;
alter table qa_evidences enable row level security;

-- Allow read access to authenticated users for now (can be refined later)
create policy "Allow read access for authenticated users" on projects for select using (auth.role() = 'authenticated');
create policy "Allow insert access for authenticated users" on projects for insert with check (auth.role() = 'authenticated');
create policy "Allow update access for authenticated users" on projects for update using (auth.role() = 'authenticated');

create policy "Allow read access for authenticated users" on qa_categories for select using (auth.role() = 'authenticated');
create policy "Allow insert access for authenticated users" on qa_categories for insert with check (auth.role() = 'authenticated');

create policy "Allow read access for authenticated users" on users for select using (auth.role() = 'authenticated');
create policy "Allow update access for users" on users for update using (auth.uid() = id);

create policy "Allow read access for authenticated users" on qa_items for select using (auth.role() = 'authenticated');
create policy "Allow insert access for authenticated users" on qa_items for insert with check (auth.role() = 'authenticated');
create policy "Allow update access for authenticated users" on qa_items for update using (auth.role() = 'authenticated');

create policy "Allow read access for authenticated users" on qa_evidences for select using (auth.role() = 'authenticated');
create policy "Allow insert access for authenticated users" on qa_evidences for insert with check (auth.role() = 'authenticated');

create policy "Allow delete access for authenticated users" on projects for delete using (auth.role() = 'authenticated');
create policy "Allow delete access for authenticated users" on qa_items for delete using (auth.role() = 'authenticated');

-- Trigger to create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', 'qa');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage Bucket Setup (You need to create 'evidences' bucket in Supabase Dashboard)
-- insert into storage.buckets (id, name, public) values ('evidences', 'evidences', true);
-- create policy "Public Access" on storage.objects for select using ( bucket_id = 'evidences' );
-- create policy "Auth Upload" on storage.objects for insert with check ( bucket_id = 'evidences' and auth.role() = 'authenticated' );

-- Migration to improve RLS policies

-- Update Projects policies
-- Drop existing broad policies to implement more granular ones
drop policy if exists "Allow delete access for authenticated users" on projects;
-- (Assuming "Allow update..." was also too broad, but we will keep select/insert/update for team for now as per plan, only restricting DELETE)

-- Create new DELETE policy for admins only
create policy "Allow delete access for admins" on projects 
for delete using (
  auth.role() = 'authenticated' and 
  exists (
    select 1 from public.users 
    where users.id = auth.uid() 
    and users.role = 'admin'
  )
);

-- QA Items policies
drop policy if exists "Allow delete access for authenticated users" on qa_items;

create policy "Allow delete access for admins or creator" on qa_items
for delete using (
  auth.role() = 'authenticated' and (
    exists (
      select 1 from public.users 
      where users.id = auth.uid() 
      and users.role = 'admin'
    )
    or
    created_by = auth.uid()
  )
);

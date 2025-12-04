-- Enable RLS on storage.objects (usually enabled by default)
alter table storage.objects enable row level security;

-- Allow authenticated users to upload files to the 'evidences' bucket
create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'evidences' );

-- Allow public access to view files in the 'evidences' bucket
create policy "Allow public viewing"
on storage.objects for select
to public
using ( bucket_id = 'evidences' );

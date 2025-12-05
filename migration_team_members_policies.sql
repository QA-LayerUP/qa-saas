-- Migration: team members + RLS policies for categories
-- Run this in Supabase SQL editor after reviewing and replacing placeholders where needed.

-- 1) Create team_members table to link users to teams
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(team_id, user_id)
);

-- 2) Ensure RLS is enabled on qa_categories (should be already, but safe to include)
ALTER TABLE public.qa_categories ENABLE ROW LEVEL SECURITY;

-- 3) Drop previous generic policies (if any) and create new policies enforcing team ownership
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.qa_categories;
DROP POLICY IF EXISTS "Allow insert access for authenticated users" ON public.qa_categories;
DROP POLICY IF EXISTS "Allow update access for authenticated users" ON public.qa_categories;
DROP POLICY IF EXISTS "Allow delete access for authenticated users" ON public.qa_categories;

-- Allow authenticated users to SELECT categories
CREATE POLICY "qa_categories_select_auth" ON public.qa_categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow INSERT when the actor is a member of the target team OR member of the CS team for that project
CREATE POLICY "qa_categories_insert_team_or_cs" ON public.qa_categories
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      -- user is member of the team being assigned
      new.team_id IN (
        SELECT tm.team_id FROM public.team_members tm WHERE tm.user_id = auth.uid()
      )
      -- OR user is member of a CS team for the same project
      OR new.project_id IN (
        SELECT t.project_id FROM public.teams t
        JOIN public.team_members tm ON t.id = tm.team_id
        WHERE tm.user_id = auth.uid() AND t.name = 'CS'
      )
    )
  );

-- Allow UPDATE only if actor is member of the category's team OR CS member for that project
CREATE POLICY "qa_categories_update_team_or_cs" ON public.qa_categories
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      -- user is member of the category's team
      public.qa_categories.team_id IN (
        SELECT tm.team_id FROM public.team_members tm WHERE tm.user_id = auth.uid()
      )
      -- OR user is member of a CS team for the same project
      OR public.qa_categories.project_id IN (
        SELECT t.project_id FROM public.teams t
        JOIN public.team_members tm ON t.id = tm.team_id
        WHERE tm.user_id = auth.uid() AND t.name = 'CS'
      )
    )
  );

-- Allow DELETE only if actor is member of the category's team OR CS member for that project
CREATE POLICY "qa_categories_delete_team_or_cs" ON public.qa_categories
  FOR DELETE USING (
    auth.role() = 'authenticated' AND (
      -- user is member of the category's team
      public.qa_categories.team_id IN (
        SELECT tm.team_id FROM public.team_members tm WHERE tm.user_id = auth.uid()
      )
      -- OR user is member of a CS team for the same project
      OR public.qa_categories.project_id IN (
        SELECT t.project_id FROM public.teams t
        JOIN public.team_members tm ON t.id = tm.team_id
        WHERE tm.user_id = auth.uid() AND t.name = 'CS'
      )
    )
  );

-- 4) Teams table policies: allow select to authenticated, inserts allowed to authenticated (to allow creating teams), but restrict updates/deletes to CS members
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.teams;
DROP POLICY IF EXISTS "Allow insert access for authenticated users" ON public.teams;
DROP POLICY IF EXISTS "Allow update access for authenticated users" ON public.teams;
DROP POLICY IF EXISTS "Allow delete access for authenticated users" ON public.teams;

CREATE POLICY "teams_select_auth" ON public.teams FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "teams_insert_auth" ON public.teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "teams_update_cs_only" ON public.teams FOR UPDATE USING (
  auth.role() = 'authenticated' AND (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      JOIN public.teams t2 ON t2.id = tm.team_id
      WHERE tm.user_id = auth.uid() AND t2.name = 'CS' AND t2.project_id = public.teams.project_id
    )
  )
);

CREATE POLICY "teams_delete_cs_only" ON public.teams FOR DELETE USING (
  auth.role() = 'authenticated' AND (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      JOIN public.teams t2 ON t2.id = tm.team_id
      WHERE tm.user_id = auth.uid() AND t2.name = 'CS' AND t2.project_id = public.teams.project_id
    )
  )
);

-- 5) Example seed (replace <PROJECT_ID> and <CS_USER_ID> with real values)
-- Insert default teams for a given project
-- INSERT INTO public.teams (project_id, name, description) VALUES ('<PROJECT_ID>'::uuid, 'CS', 'Customer Success');
-- INSERT INTO public.teams (project_id, name, description) VALUES ('<PROJECT_ID>'::uuid, 'Dev', 'Time de Dev');
-- INSERT INTO public.teams (project_id, name, description) VALUES ('<PROJECT_ID>'::uuid, 'UX', 'Time de UX');
-- INSERT INTO public.teams (project_id, name, description) VALUES ('<PROJECT_ID>'::uuid, 'Content', 'Time de Conteúdo');

-- Example: assign a user to CS team
-- INSERT INTO public.team_members (team_id, user_id, role) VALUES ('<CS_TEAM_ID>'::uuid, '<CS_USER_ID>'::uuid, 'manager');

-- Notes:
-- - After running this migration, make sure to create at least one CS team for each project and add the CS users to that team.
-- - The policies assume that a team named 'CS' exists per project to represent Customer Success members who can manage categories across teams.
-- - If you prefer a different mechanism to identify CS users (e.g., a dedicated auth.role or a separate table), adjust the policies accordingly.

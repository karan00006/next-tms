-- Enable RLS
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Read access for both tables (anon + authenticated)
DROP POLICY IF EXISTS "user_select_public" ON "user";
CREATE POLICY "user_select_public"
ON "user"
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "tasks_select_public" ON tasks;
CREATE POLICY "tasks_select_public"
ON tasks
FOR SELECT
TO anon, authenticated
USING (true);

-- Basic CRUD access for both tables (demo-friendly)
DROP POLICY IF EXISTS "user_insert_public" ON "user";
CREATE POLICY "user_insert_public"
ON "user"
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "user_update_public" ON "user";
CREATE POLICY "user_update_public"
ON "user"
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "user_delete_public" ON "user";
CREATE POLICY "user_delete_public"
ON "user"
FOR DELETE
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "tasks_insert_public" ON tasks;
CREATE POLICY "tasks_insert_public"
ON tasks
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "tasks_update_public" ON tasks;
CREATE POLICY "tasks_update_public"
ON tasks
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "tasks_delete_public" ON tasks;
CREATE POLICY "tasks_delete_public"
ON tasks
FOR DELETE
TO anon, authenticated
USING (true);

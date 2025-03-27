CREATE POLICY "Users_read_policy" ON "public"."users"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = id OR EXISTS (
  SELECT 1
  FROM users AS u2
  WHERE u2.id = auth.uid() AND u2.is_super_admin = TRUE
));

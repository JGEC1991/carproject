CREATE POLICY "Activities_insert_policy" ON "public"."activities"
    FOR INSERT
    TO authenticated
    WITH CHECK (
      organization_id IN (
        SELECT users.organization_id
        FROM users
        WHERE users.id = auth.uid()
      )
    );

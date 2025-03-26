CREATE POLICY "Activities_delete_policy" ON "public"."activities"
    FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
        AND users.organization_id = activities.organization_id
      ) OR EXISTS (
        SELECT 1
        FROM drivers
        WHERE drivers.id = activities.driver_id
        AND drivers.user_id = auth.uid()
        AND drivers.organization_id = activities.organization_id
      )
    );

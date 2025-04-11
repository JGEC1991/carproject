-- automate_function_calling.sql
-- This SQL script automates the function calling using pg_cron and pg_net.

-- Schedule the Edge Function execution
SELECT cron.schedule(
  'daily-activity-trigger-job',
  '0 0 * * *',  -- Runs every day at midnight UTC
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/daily-activity-trigger',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'anon_key')
    ),
    body := jsonb_build_object('timestamp', NOW())
  );
  $$
);

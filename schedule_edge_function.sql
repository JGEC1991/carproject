-- schedule_edge_function.sql
-- This SQL script schedules the daily execution of an Edge Function using pg_cron and pg_net.

-- Ensure pg_cron is installed and enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Ensure pg_net is installed
CREATE EXTENSION IF NOT EXISTS net;

-- Create vault extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS vault;

-- Store Supabase URL and anon key in vault
SELECT vault.create_secret(
  'project_url',
  'https://ticghrxzdsdoaiwvahht.supabase.co'
);

SELECT vault.create_secret(
  'anon_key',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpY2docnh6ZHNkb2Fpd3ZhaGh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMjYwNTQsImV4cCI6MjA1NTgwMjA1NH0.XoRX3JBDMhLGYCs_7olFeH-PzGhyyNid-J2B8KpxCU8'
);

-- Schedule the Edge Function execution
SELECT cron.schedule(
  'invoke-daily-activity-trigger',
  '0 0 * * *',  -- Run daily at midnight UTC
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

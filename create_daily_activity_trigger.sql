CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA public;

CREATE OR REPLACE FUNCTION public.trigger_daily_activity()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.http_post(
    url := 'https://carproject.functions.supabase.co/daily-activity-trigger',
    body := '{}',
    content_type := 'application/json'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS daily_activity_trigger ON public.automatic_activities;

CREATE TRIGGER daily_activity_trigger
AFTER INSERT ON public.automatic_activities
FOR EACH ROW
EXECUTE FUNCTION public.trigger_daily_activity();

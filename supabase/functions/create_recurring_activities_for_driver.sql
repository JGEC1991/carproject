-- Supabase Function to Create Recurring Activities for a Specific Driver
CREATE OR REPLACE FUNCTION public.create_recurring_activities_for_driver(
    driver_id UUID,
    vehicle_id UUID,
    activity_type TEXT,
    cadence TEXT,
    day_of_week TEXT[],
    start_date DATE,
    description TEXT,
    status TEXT,
    amount NUMERIC,
    organization_id UUID
)
RETURNS VOID AS $$
DECLARE
    activity_date DATE;
    day_of_week_text TEXT;
BEGIN
    -- Validate driver_id
    IF driver_id IS NULL THEN
        RAISE EXCEPTION 'driver_id must be specified';
    END IF;

    -- Validate vehicle_id
    IF vehicle_id IS NULL THEN
        RAISE EXCEPTION 'vehicle_id must be specified';
    END IF;

    -- Validate start_date
    IF start_date IS NULL THEN
        RAISE EXCEPTION 'start_date must be specified';
    END IF;

    -- Daily cadence
    IF cadence = 'daily' THEN
        activity_date := start_date;
        INSERT INTO public.activities (date, vehicle_id, driver_id, activity_type, description, status, amount, organization_id)
        VALUES (activity_date, vehicle_id, driver_id, activity_type, description, status, amount, organization_id);
    END IF;

    -- Weekly cadence
    IF cadence = 'weekly' THEN
        IF day_of_week IS NULL THEN
            RAISE EXCEPTION 'day_of_week must be specified for weekly cadence';
        END IF;

        FOREACH day_of_week_text IN ARRAY day_of_week LOOP
            IF to_char(start_date, 'Day') = day_of_week_text THEN
                INSERT INTO public.activities (date, vehicle_id, driver_id, activity_type, description, status, amount, organization_id)
                VALUES (start_date, vehicle_id, driver_id, activity_type, description, status, amount, organization_id);
            END IF;
        END LOOP;
    END IF;

    -- Monthly cadence
    IF cadence = 'monthly' THEN
        IF day_of_month IS NULL THEN
            RAISE EXCEPTION 'day_of_month must be specified for monthly cadence';
        END IF;

        IF extract(day FROM start_date) = day_of_month THEN
            INSERT INTO public.activities (date, vehicle_id, driver_id, activity_type, description, status, amount, organization_id)
            VALUES (start_date, vehicle_id, driver_id, activity_type, description, status, amount, organization_id);
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

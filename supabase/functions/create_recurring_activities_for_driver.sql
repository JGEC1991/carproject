-- Supabase Function to Create Recurring Activities for a Specific Driver
CREATE OR REPLACE FUNCTION public.create_recurring_activities_for_driver(
    driver_id UUID,
    activity_type TEXT,
    cadence TEXT,
    day_of_week TEXT[],
    day_of_month INTEGER,
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
    driver_record RECORD;
    vehicle_id UUID;
BEGIN
    -- Validate driver_id
    IF driver_id IS NULL THEN
        RAISE EXCEPTION 'driver_id must be specified';
    END IF;

    -- Validate start_date
    IF start_date IS NULL THEN
        RAISE EXCEPTION 'start_date must be specified';
    END IF;

    -- Get the vehicle_id for the specified driver
    SELECT id, vehicle_id INTO driver_record FROM public.drivers WHERE id = driver_id;
    IF driver_record IS NULL THEN
        RAISE EXCEPTION 'Driver with id % not found', driver_id;
    END IF;

    vehicle_id := driver_record.vehicle_id;

    -- Daily cadence
    IF cadence = 'daily' THEN
        activity_date := start_date;
        WHILE activity_date <= CURRENT_DATE + interval '365 days' LOOP
            INSERT INTO public.activities (date, vehicle_id, driver_id, activity_type, description, status, amount, organization_id)
            VALUES (activity_date, vehicle_id, driver_id, activity_type, description, status, amount, organization_id);
            activity_date := activity_date + interval '1 day';
        END LOOP;
    END IF;

    -- Weekly cadence
    IF cadence = 'weekly' THEN
        IF day_of_week IS NULL THEN
            RAISE EXCEPTION 'day_of_week must be specified for weekly cadence';
        END IF;

        FOREACH day_of_week_text IN ARRAY day_of_week LOOP
            activity_date := start_date;
            WHILE activity_date <= CURRENT_DATE + interval '365 days' LOOP
                IF to_char(activity_date, 'Day') = day_of_week_text THEN
                    INSERT INTO public.activities (date, vehicle_id, driver_id, activity_type, description, status, amount, organization_id)
                END IF;
                activity_date := activity_date + interval '1 day';
            END LOOP;
        END FOREACH;
    END IF;

    -- Monthly cadence
    IF cadence = 'monthly' THEN
        IF day_of_month IS NULL THEN
            RAISE EXCEPTION 'day_of_month must be specified for monthly cadence';
        END IF;

        activity_date := start_date;
        WHILE activity_date <= CURRENT_DATE + interval '365 days' LOOP
            IF extract(day FROM activity_date) = day_of_month THEN
                INSERT INTO public.activities (date, vehicle_id, driver_id, activity_type, description, status, amount, organization_id)
                VALUES (activity_date, vehicle_id, driver_id, activity_type, description, status, amount, organization_id);
            END IF;
            activity_date := activity_date + interval '1 day';
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

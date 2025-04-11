CREATE OR REPLACE FUNCTION public.create_recurring_activities()
RETURNS TRIGGER AS $$
DECLARE
    activity_date DATE;
    day_of_week TEXT;
    vehicle_record RECORD;
    driver_record RECORD;
    vehicle_id UUID;
    driver_id UUID;
BEGIN
    -- Initialize variables
    activity_date := NEW.start_date;

    -- Validate start_date
    IF activity_date IS NULL THEN
        RAISE EXCEPTION 'start_date must be specified';
    END IF;

    -- Handle activities for all vehicles
    IF NEW.apply_to_type = 'all_vehicles' THEN
        DECLARE
            vehicle_id UUID;
            driver_id UUID;
        BEGIN
            -- Iterate through all vehicles
            FOR vehicle_record IN SELECT id, driver_id FROM public.vehicles LOOP
                vehicle_id := vehicle_record.id;
                driver_id := vehicle_record.driver_id;

                -- Daily cadence
                IF NEW.cadence = 'daily' THEN
                    WHILE TRUE LOOP
                        INSERT INTO public.activities (date, vehicle_id, driver_id, activity_type, description, status, amount, organization_id)
                        VALUES (activity_date, vehicle_id, driver_id, NEW.activity_type, NEW.description, NEW.status, NEW.amount, NEW.organization_id);
                        activity_date := activity_date + interval '1 day';
                        -- Exit loop if activity_date is in the future (optional, for safety)
                        IF activity_date > CURRENT_DATE + interval '365 days' THEN
                            EXIT;
                        END IF;
                    END LOOP;
                    activity_date := NEW.start_date; -- Reset activity_date
                END IF;

                -- Weekly cadence
                IF NEW.cadence = 'weekly' THEN
                    IF NEW.day_of_week IS NULL THEN
                        RAISE EXCEPTION 'day_of_week must be specified for weekly cadence';
                    END IF;

                    FOREACH day_of_week IN ARRAY NEW.day_of_week LOOP
                        activity_date := NEW.start_date; -- Reset activity_date for each day_of_week
                        WHILE TRUE LOOP
                            IF to_char(activity_date, 'Day') = day_of_week THEN
                                INSERT INTO public.activities (date, vehicle_id, driver_id, NEW.activity_type, NEW.description, NEW.status, NEW.amount, NEW.organization_id)
                                VALUES (activity_date, vehicle_id, driver_id, NEW.activity_type, NEW.description, NEW.status, NEW.amount, NEW.organization_id);
                            END IF;
                            activity_date := activity_date + interval '1 day';
                            -- Exit loop if activity_date is in the future (optional, for safety)
                            IF activity_date > CURRENT_DATE + interval '365 days' THEN
                                EXIT;
                            END IF;
                        END LOOP;
                    END LOOP;
                END IF;

                -- Monthly cadence
                IF NEW.cadence = 'monthly' THEN
                    IF NEW.day_of_month IS NULL THEN
                        RAISE EXCEPTION 'day_of_month must be specified for monthly cadence';
                    END IF;

                    WHILE TRUE LOOP
                        IF extract(day FROM activity_date) = NEW.day_of_month THEN
                            INSERT INTO public.activities (date, vehicle_id, driver_id, NEW.activity_type, NEW.description, NEW.status, NEW.amount, NEW.organization_id)
                            VALUES (activity_date, vehicle_id, driver_id, NEW.activity_type, NEW.description, NEW.status, NEW.amount, NEW.organization_id);
                        END IF;
                        activity_date := activity_date + interval '1 day';
                        -- Exit loop if activity_date is in the future (optional, for safety)
                        IF activity_date > CURRENT_DATE + interval '365 days' THEN
                            EXIT;
                        END IF;
                    END LOOP;
                END IF;
            END LOOP;
        END; -- END for all_vehicles

    -- Handle activities for all drivers
    ELSIF NEW.apply_to_type = 'all_drivers' THEN
        DECLARE
            vehicle_id UUID;
            driver_id UUID;
        BEGIN
            -- Iterate through all drivers
            FOR driver_record IN SELECT id, vehicle_id FROM public.drivers LOOP
                driver_id := driver_record.id;
                vehicle_id := driver_record.vehicle_id;

                -- Daily cadence
                IF NEW.cadence = 'daily' THEN
                    WHILE TRUE LOOP
                        INSERT INTO public.activities (date, vehicle_id, driver_id, NEW.activity_type, NEW.description, NEW.status, NEW.amount, NEW.organization_id)
                        VALUES (activity_date, vehicle_id, driver_id, NEW.activity_type, NEW.description, NEW.status, NEW.amount, NEW.organization_id);
                        activity_date := activity_date + interval '1 day';
                         -- Exit loop if activity_date is in the future (optional, for safety)
                        IF activity_date > CURRENT_DATE + interval '365 days' THEN
                            EXIT;
                        END IF;
                    END LOOP;
                    activity_date := NEW.start_date; -- Reset activity_date
                END IF;

                -- Weekly cadence
                IF NEW.cadence = 'weekly' THEN
                    IF NEW.day_of_week IS NULL THEN
                        RAISE EXCEPTION 'day_of_week must be specified for weekly cadence';
                    END IF;

                    FOREACH day_of_week IN ARRAY NEW.day_of_week LOOP
                        activity_date := NEW.start_date; -- Reset activity_date for each day_of_week
                        WHILE TRUE LOOP
                            IF to_char(activity_date, 'Day') = day_of_week THEN
                                INSERT INTO public.activities (date, vehicle_id, driver_id, NEW.activity_type, NEW.description, NEW.status, NEW.amount, NEW.organization_id)
                                VALUES (activity_date, vehicle_id, driver_id, NEW.activity_type, NEW.description, NEW.status, NEW.amount, NEW.organization_id);
                            END IF;
                            activity_date := activity_date + interval '1 day';
                             -- Exit loop if activity_date is in the future (optional, for safety)
                            IF activity_date > CURRENT_DATE + interval '365 days' THEN
                                EXIT;
                            END IF;
                        END LOOP;
                    END LOOP;
                END IF;

                -- Monthly cadence
                IF NEW.cadence = 'monthly' THEN
                    IF NEW.day_of_month IS NULL THEN
                        RAISE EXCEPTION 'day_of_month must be specified for monthly cadence';
                    END IF;

                    WHILE TRUE LOOP
                        IF extract(day FROM activity_date) = NEW.day_of_month THEN
                            INSERT INTO public.activities (date, vehicle_id, driver_id, NEW.activity_type, NEW.description, NEW.status, NEW.amount, NEW.organization_id)
                            VALUES (activity_date, vehicle_id, driver_id, NEW.activity_type, NEW.description, NEW.status, NEW.amount, NEW.organization_id);
                        END IF;
                        activity_date := activity_date + interval '1 day';
                         -- Exit loop if activity_date is in the future (optional, for safety)
                        IF activity_date > CURRENT_DATE + interval '365 days' THEN
                            EXIT;
                        END IF;
                    END LOOP;
                END IF;
        END LOOP;
    END; -- END for all_drivers
    ELSE
        -- Handle activities for all other apply_to_type options (vehicle_status, specific_vehicle, specific_driver)
        -- (You'll need to implement the logic for these cases as well)
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

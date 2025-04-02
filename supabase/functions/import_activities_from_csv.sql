CREATE OR REPLACE FUNCTION public.import_activities_from_csv(
        activities_data JSONB,
        org_id UUID  -- Add organization_id as an argument
    )
    RETURNS TABLE (
        row_number INTEGER,
        success BOOLEAN,
        error_message TEXT
    )
    LANGUAGE plpgsql
    AS $$
    DECLARE
        activity JSONB;
        row_count INTEGER := 0;
        success_count INTEGER := 0;
        error_count INTEGER := 0; -- Declare error_count variable
        error_msg TEXT;
    BEGIN
        -- Initialize the return table
        CREATE TEMP TABLE import_results (
            row_number INTEGER,
            success BOOLEAN,
            error_message TEXT
        ) ON COMMIT DROP;

        FOR activity IN SELECT jsonb_array_elements(activities_data)
        LOOP
            row_count := row_count + 1;
            BEGIN
                INSERT INTO public.activities (
                    date,
                    vehicle_id,
                    driver_id,
                    activity_type,
                    description,
                    status,
                    amount,
                    organization_id
                )
                VALUES (
                    (activity ->> 'date')::DATE,
                    (activity ->> 'vehicle_id')::UUID,
                    (activity ->> 'driver_id')::UUID,
                    activity ->> 'activity_type',
                    activity ->> 'description',
                    activity ->> 'status',
                    (activity ->> 'amount')::NUMERIC,
                    org_id
                );

                success_count := success_count + 1;
                INSERT INTO import_results (row_number, success, error_message)
                VALUES (row_count, TRUE, NULL);

        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            error_msg := SQLERRM;
            INSERT INTO import_results (row_number, success, error_message)
            VALUES (row_count, FALSE, error_msg);
        END;
    END LOOP;

    -- Return the results
    RETURN QUERY SELECT * FROM import_results;
    END;
    $$;

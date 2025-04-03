DROP FUNCTION IF EXISTS public.import_activities_from_csv(JSONB);

CREATE OR REPLACE FUNCTION public.import_activities_from_csv(
    activities_data JSONB
)
RETURNS TABLE (
    row_number INTEGER,
    success BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Initialize the return table
    CREATE TEMP TABLE import_results (
        row_number INTEGER,
        success BOOLEAN,
        error_message TEXT
    ) ON COMMIT DROP;

    INSERT INTO import_results (row_number, success, error_message)
    VALUES (1, TRUE, activities_data::TEXT);

    -- Return the results
    RETURN QUERY SELECT * FROM import_results;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_org_and_user(
    org_name TEXT,
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    user_phone TEXT,
    user_is_driver BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    org_id UUID;
BEGIN
    -- 1. Log input parameters
    RAISE NOTICE 'create_org_and_user called with: org_name = %, user_id = %', org_name, user_id;

    -- 2. Create the organization
    INSERT INTO public.organizations (name)
    VALUES (org_name)
    RETURNING id INTO org_id;

    RAISE NOTICE 'Organization created with id: %', org_id;

    -- 3. Check if the user already exists
    IF EXISTS (SELECT 1 FROM public.users WHERE id = user_id) THEN
        RAISE EXCEPTION 'User with ID % already exists', user_id;
    END IF;

    -- 4. Insert the user record with organization_id and other details
    INSERT INTO public.users (id, organization_id, name, phone, is_driver, email, role)
    VALUES (user_id, org_id, user_name, user_phone, user_is_driver, user_email, 'user');

    RAISE NOTICE 'User created with id: %, org_id: %', user_id, org_id;

    -- 5. Add the user to the organization_members table
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (org_id, user_id, 'user');

    RAISE NOTICE 'User added to organization_members with org_id: %, user_id: %', org_id, user_id;

    -- 6. Return a JSON object containing the organization ID and user ID
    RETURN jsonb_build_object(
        'organization_id', org_id,
        'user_id', user_id
    );

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating organization and user';
END;
$$;

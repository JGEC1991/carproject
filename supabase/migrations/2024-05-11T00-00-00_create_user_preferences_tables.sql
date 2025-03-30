-- Create user_filters table
    CREATE TABLE public.user_filters (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) NOT NULL,
        filter_data JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Enable Row Level Security (RLS)
    ALTER TABLE public.user_filters ENABLE ROW LEVEL SECURITY;

    -- Create policy for user-specific access
    CREATE POLICY "user_filters_policy" ON public.user_filters
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

    -- Create user_visible_columns table
    CREATE TABLE public.user_visible_columns (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) NOT NULL,
        visible_columns TEXT[],
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Enable Row Level Security (RLS)
    ALTER TABLE public.user_visible_columns ENABLE ROW LEVEL SECURITY;

    -- Create policy for user-specific access
    CREATE POLICY "user_visible_columns_policy" ON public.user_visible_columns
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

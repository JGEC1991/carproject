CREATE TABLE public.automatic_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id),
    activity_type TEXT NOT NULL,
    cadence TEXT NOT NULL,
    day_of_week TEXT[],
    day_of_month INTEGER,
    start_date DATE,
    end_date DATE,
    description TEXT,
    status TEXT,
    amount NUMERIC,
    apply_to_type TEXT,
    vehicle_id UUID REFERENCES public.vehicles(id),
    driver_id UUID REFERENCES public.drivers(id),
    vehicle_status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.automatic_activities ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to select automatic activities within their organization
CREATE POLICY "automatic_activities_select_policy" ON public.automatic_activities
    FOR SELECT
    USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- Create a policy that allows users to insert automatic activities within their organization
CREATE POLICY "automatic_activities_insert_policy" ON public.automatic_activities
    FOR INSERT
    WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- Create a policy that allows users to update automatic activities within their organization
CREATE POLICY "automatic_activities_update_policy" ON public.automatic_activities
    FOR UPDATE
    USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()))
    WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- Create a policy that allows users to delete automatic activities within their organization
CREATE POLICY "automatic_activities_delete_policy" ON public.automatic_activities
    FOR DELETE
    USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

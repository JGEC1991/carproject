CREATE TABLE public.activity_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_default BOOLEAN NOT NULL DEFAULT FALSE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to select activity types within their organization
CREATE POLICY "activity_types_select_policy" ON public.activity_types
    FOR SELECT
    USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- Create a policy that allows users to insert activity types within their organization
CREATE POLICY "activity_types_insert_policy" ON public.activity_types
    FOR INSERT
    WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- Create a policy that allows users to update activity types within their organization
CREATE POLICY "activity_types_update_policy" ON public.activity_types
    FOR UPDATE
    USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()))
    WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- Create a policy that allows users to delete activity types within their organization
CREATE POLICY "activity_types_delete_policy" ON public.activity_types
    FOR DELETE
    USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

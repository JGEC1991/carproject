CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id),
    action TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to select permissions within their organization
CREATE POLICY "permissions_select_policy" ON public.permissions
    FOR SELECT
    USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- Create a policy that allows users to insert permissions within their organization
CREATE POLICY "permissions_insert_policy" ON public.permissions
    FOR INSERT
    WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- Create a policy that allows users to update permissions within their organization
CREATE POLICY "permissions_update_policy" ON public.permissions
    FOR UPDATE
    USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()))
    WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- Create a policy that allows users to delete permissions within their organization
CREATE POLICY "permissions_delete_policy" ON public.permissions
    FOR DELETE
    USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

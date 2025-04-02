-- This SQL script assumes you have an existing vehicles table.
-- It adds new columns to the table to enhance its functionality.

ALTER TABLE vehicles
ADD COLUMN vehicle_type VARCHAR(50);

ALTER TABLE vehicles
ADD COLUMN fuel_type VARCHAR(50);

ALTER TABLE vehicles
ADD COLUMN transmission_type VARCHAR(50);

ALTER TABLE vehicles
ADD COLUMN seating_capacity INTEGER;

ALTER TABLE vehicles
ADD COLUMN daily_rate NUMERIC;

ALTER TABLE vehicles
ADD COLUMN weekly_rate NUMERIC;

ALTER TABLE vehicles
ADD COLUMN monthly_rate NUMERIC;

ALTER TABLE vehicles
ADD COLUMN insurance_provider VARCHAR(100);

ALTER TABLE vehicles
ADD COLUMN insurance_policy_number VARCHAR(50);

ALTER TABLE vehicles
ADD COLUMN registration_expiry_date DATE;

ALTER TABLE vehicles
ADD COLUMN notes TEXT;

-- Create automatic_activities table
CREATE TABLE public.automatic_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) NOT NULL,
    activity_type TEXT NOT NULL,
    cadence TEXT NOT NULL, -- e.g., 'daily', 'weekly', 'monthly'
    day_of_week TEXT,       -- e.g., 'Monday', 'Tuesday', etc. (for weekly)
    day_of_month INTEGER,   -- 1-31 (for monthly)
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    status TEXT DEFAULT 'Pendiente',
    amount NUMERIC,

    -- Rule Definition (Instead of apply_to, driver_id, vehicle_id, vehicle_status)
    apply_to_type TEXT NOT NULL, -- ENUM('all_vehicles', 'all_drivers', 'specific_vehicle', 'specific_driver', 'vehicle_status')
    vehicle_id UUID REFERENCES public.vehicles(id), -- Only used if apply_to_type = 'specific_vehicle'
    driver_id UUID REFERENCES public.drivers(id),   -- Only used if apply_to_type = 'specific_driver'
    vehicle_status TEXT,      -- Only used if apply_to_type = 'vehicle_status'

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.automatic_activities
ADD CONSTRAINT valid_day_of_month CHECK (CASE WHEN cadence = 'monthly' THEN day_of_month BETWEEN 1 AND 31 ELSE TRUE END);

ALTER TABLE public.automatic_activities
ADD CONSTRAINT valid_driver_assignment CHECK (
    (apply_to_type = 'specific_driver' AND driver_id IS NOT NULL AND vehicle_id IS NULL AND vehicle_status IS NULL) OR
    (apply_to_type = 'specific_vehicle' AND vehicle_id IS NOT NULL AND driver_id IS NULL AND vehicle_status IS NULL) OR
    (apply_to_type = 'vehicle_status' AND vehicle_status IS NOT NULL AND driver_id IS NULL AND vehicle_id IS NULL) OR
    (apply_to_type IN ('all_vehicles', 'all_drivers') AND driver_id IS NULL AND vehicle_id IS NULL AND vehicle_status IS NULL)
);

-- Example SQL for Selecting Applicable Vehicles:

-- Selecting vehicles for a 'vehicle_status' rule
-- SELECT id
-- FROM public.vehicles
-- WHERE organization_id = 'your_organization_id'
-- AND status = 'Ocupado'; -- Example status

-- Selecting all vehicles in the organization
-- SELECT id
-- FROM public.vehicles
-- WHERE organization_id = 'your_organization_id';

-- Selecting all drivers in the organization
-- SELECT id
-- FROM public.drivers
-- WHERE organization_id = 'your_organization_id';

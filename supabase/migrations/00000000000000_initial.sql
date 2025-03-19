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

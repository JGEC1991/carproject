CREATE TABLE demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20),
  email VARCHAR(255),
  num_vehicles INTEGER,
  city VARCHAR(255),
  country VARCHAR(255),
  business_needs TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

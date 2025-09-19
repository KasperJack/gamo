-- Complete Database Schema for Maintenance Management System
-- Run this script in your NeonDB console to create all required tables

-- ============================================================================
-- MIGRATION OPTION 1: Add missing columns to existing tables
-- ============================================================================
-- If you want to keep your existing data, run these commands first:

-- Add missing columns to existing equipment table
-- ALTER TABLE equipment ADD COLUMN IF NOT EXISTS code TEXT;
-- ALTER TABLE equipment ADD COLUMN IF NOT EXISTS description TEXT;
-- ALTER TABLE equipment ADD COLUMN IF NOT EXISTS category TEXT;
-- ALTER TABLE equipment ADD COLUMN IF NOT EXISTS location TEXT;
-- ALTER TABLE equipment ADD COLUMN IF NOT EXISTS manufacturer TEXT;
-- ALTER TABLE equipment ADD COLUMN IF NOT EXISTS model TEXT;
-- ALTER TABLE equipment ADD COLUMN IF NOT EXISTS serial_number TEXT;
-- ALTER TABLE equipment ADD COLUMN IF NOT EXISTS purchase_date DATE;
-- ALTER TABLE equipment ADD COLUMN IF NOT EXISTS warranty_end_date DATE;
-- ALTER TABLE equipment ADD COLUMN IF NOT EXISTS criticality TEXT DEFAULT 'medium';

-- Update existing equipment with temporary codes (you'll need to set proper codes)
-- UPDATE equipment SET code = 'EQ' || LPAD(id::text, 3, '0') WHERE code IS NULL;

-- Add unique constraint after populating codes
-- ALTER TABLE equipment ADD CONSTRAINT equipment_code_unique UNIQUE (code);

-- Add check constraints
-- ALTER TABLE equipment ADD CONSTRAINT equipment_status_check CHECK (status IN ('active', 'inactive', 'maintenance', 'decommissioned'));
-- ALTER TABLE equipment ADD CONSTRAINT equipment_criticality_check CHECK (criticality IN ('low', 'medium', 'high', 'critical'));

-- ============================================================================
-- MIGRATION OPTION 2: Fresh start (drops existing tables)
-- ============================================================================
-- Drop existing tables if they exist (be careful with this in production!)
-- DROP TABLE IF EXISTS spare_parts CASCADE;
-- DROP TABLE IF EXISTS maintenance_interventions CASCADE;
-- DROP TABLE IF EXISTS breakdowns CASCADE;
-- DROP TABLE IF EXISTS preventive_schedules CASCADE;
-- DROP TABLE IF EXISTS equipment CASCADE;
-- DROP TABLE IF EXISTS auth_verification_token CASCADE;
-- DROP TABLE IF EXISTS auth_sessions CASCADE;
-- DROP TABLE IF EXISTS auth_accounts CASCADE;
-- DROP TABLE IF EXISTS auth_users CASCADE;

-- ============================================================================
-- AUTHENTICATION TABLES (Auth.js)
-- ============================================================================

CREATE TABLE IF NOT EXISTS auth_users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    email_verified TIMESTAMP WITH TIME ZONE,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS auth_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_token TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_verification_token (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- ============================================================================
-- MAIN APPLICATION TABLES
-- ============================================================================

-- Equipment table with all columns your code expects
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,  -- This was missing in your current table!
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    type TEXT,  -- Keep your existing type field
    location TEXT,
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    purchase_date DATE,
    warranty_end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'decommissioned')),
    criticality TEXT DEFAULT 'medium' CHECK (criticality IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance interventions table
CREATE TABLE IF NOT EXISTS maintenance_interventions (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    intervention_type TEXT NOT NULL CHECK (intervention_type IN ('preventive', 'curative', 'corrective', 'predictive')),
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled', 'postponed')),
    assigned_technician TEXT,
    planned_date DATE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER,    -- in minutes
    cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Breakdowns table
CREATE TABLE IF NOT EXISTS breakdowns (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    reported_by TEXT,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    symptoms TEXT,
    cause_analysis TEXT,
    resolution TEXT,
    status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'in_progress', 'resolved', 'closed')),
    resolved_at TIMESTAMP WITH TIME ZONE,
    downtime_minutes INTEGER,
    cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Preventive schedules table (referenced in your maintenance route)
CREATE TABLE IF NOT EXISTS preventive_schedules (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    frequency_type TEXT CHECK (frequency_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'hours', 'cycles')),
    frequency_value INTEGER, -- e.g., every 2 weeks, every 500 hours
    last_performed DATE,
    next_due DATE,
    estimated_duration INTEGER, -- in minutes
    assigned_technician TEXT,
    instructions TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spare parts table
CREATE TABLE IF NOT EXISTS spare_parts (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE SET NULL,
    part_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    manufacturer TEXT,
    supplier TEXT,
    unit_price DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    current_stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER DEFAULT 0,
    location TEXT,
    unit_of_measure TEXT DEFAULT 'pieces',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Equipment indexes
CREATE INDEX IF NOT EXISTS idx_equipment_code ON equipment(code);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
CREATE INDEX IF NOT EXISTS idx_equipment_location ON equipment(location);

-- Maintenance interventions indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_equipment_id ON maintenance_interventions(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_type ON maintenance_interventions(intervention_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_interventions(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_planned_date ON maintenance_interventions(planned_date);

-- Breakdowns indexes
CREATE INDEX IF NOT EXISTS idx_breakdowns_equipment_id ON breakdowns(equipment_id);
CREATE INDEX IF NOT EXISTS idx_breakdowns_status ON breakdowns(status);
CREATE INDEX IF NOT EXISTS idx_breakdowns_severity ON breakdowns(severity);
CREATE INDEX IF NOT EXISTS idx_breakdowns_reported_at ON breakdowns(reported_at);

-- Spare parts indexes
CREATE INDEX IF NOT EXISTS idx_spare_parts_part_number ON spare_parts(part_number);
CREATE INDEX IF NOT EXISTS idx_spare_parts_category ON spare_parts(category);
CREATE INDEX IF NOT EXISTS idx_spare_parts_stock_status ON spare_parts(current_stock, minimum_stock);

-- ============================================================================
-- SAMPLE DATA (Optional - remove if not needed)
-- ============================================================================

-- Sample equipment data
INSERT INTO equipment (code, name, description, category, type, location, manufacturer, model, status, criticality) VALUES
('EQ001', 'Main Compressor Unit', 'Primary air compressor for production line', 'Compressor', 'Industrial', 'Building A - Floor 1', 'Atlas Copco', 'GA 55', 'active', 'critical'),
('EQ002', 'Conveyor Belt System', 'Main production line conveyor', 'Conveyor', 'Mechanical', 'Building A - Floor 2', 'Siemens', 'CB-2000', 'active', 'high'),
('EQ003', 'HVAC Unit 1', 'Heating and cooling system for office area', 'HVAC', 'Climate Control', 'Building B - Roof', 'Carrier', '50TC-012', 'active', 'medium'),
('EQ004', 'Emergency Generator', 'Backup power generator', 'Generator', 'Electrical', 'Building C - Basement', 'Caterpillar', 'C18', 'inactive', 'critical'),
('EQ005', 'Water Pump Station', 'Main water circulation pump', 'Pump', 'Hydraulic', 'Pump House', 'Grundfos', 'CR 64-2', 'maintenance', 'high')
ON CONFLICT (code) DO NOTHING;

-- Sample spare parts
INSERT INTO spare_parts (part_number, name, description, category, manufacturer, current_stock, minimum_stock, maximum_stock, location, unit_price, currency) VALUES
('SP001', 'Air Filter Element', 'High-efficiency air filter for compressors', 'Filters', 'Atlas Copco', 15, 5, 50, 'Warehouse A-1', 45.50, 'EUR'),
('SP002', 'Conveyor Belt', 'Replacement belt for conveyor system', 'Belts', 'Siemens', 3, 2, 10, 'Warehouse B-2', 850.00, 'EUR'),
('SP003', 'Motor Bearing Set', 'Sealed bearing set for motors', 'Bearings', 'SKF', 20, 8, 40, 'Warehouse A-2', 125.75, 'EUR'),
('SP004', 'Oil Filter', 'Engine oil filter for generators', 'Filters', 'Caterpillar', 12, 4, 25, 'Warehouse C-1', 28.90, 'EUR')
ON CONFLICT (part_number) DO NOTHING;

-- Sample maintenance interventions
INSERT INTO maintenance_interventions (equipment_id, intervention_type, title, description, priority, status, planned_date, estimated_duration) VALUES
(1, 'preventive', 'Monthly Compressor Service', 'Regular maintenance check and oil change', 'medium', 'planned', '2025-10-01', 120),
(2, 'curative', 'Belt Replacement', 'Replace worn conveyor belt', 'high', 'in_progress', '2025-09-25', 180),
(3, 'preventive', 'HVAC Filter Change', 'Replace air filters and check refrigerant levels', 'low', 'completed', '2025-09-20', 60),
(5, 'corrective', 'Pump Seal Repair', 'Fix water leak from main seal', 'urgent', 'planned', '2025-09-30', 240)
ON CONFLICT DO NOTHING;

-- Sample breakdowns
INSERT INTO breakdowns (equipment_id, title, description, severity, reported_by, symptoms, status) VALUES
(1, 'Compressor Overheating', 'Main compressor running hot and shutting down frequently', 'high', 'John Smith', 'High temperature alarms, automatic shutdowns', 'investigating'),
(2, 'Belt Slipping', 'Conveyor belt losing grip and slipping on drive pulley', 'medium', 'Maria Garcia', 'Reduced conveyor speed, belt alignment issues', 'in_progress'),
(4, 'Generator Wont Start', 'Emergency generator fails to start during weekly test', 'critical', 'Mike Johnson', 'No response from starter motor, battery seems charged', 'reported')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- USEFUL QUERIES FOR TESTING
-- ============================================================================

-- Verify all tables were created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check equipment with maintenance status
-- SELECT e.code, e.name, e.status, COUNT(mi.id) as active_maintenance
-- FROM equipment e
-- LEFT JOIN maintenance_interventions mi ON e.id = mi.equipment_id AND mi.status IN ('planned', 'in_progress')
-- GROUP BY e.id, e.code, e.name, e.status
-- ORDER BY e.code;

-- Check spare parts stock levels
-- SELECT part_number, name, current_stock, minimum_stock,
--        CASE
--          WHEN current_stock <= 0 THEN 'OUT_OF_STOCK'
--          WHEN current_stock <= minimum_stock THEN 'LOW_STOCK'
--          ELSE 'OK'
--        END as stock_status
-- FROM spare_parts
-- ORDER BY stock_status DESC, part_number;

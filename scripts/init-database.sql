-- NutriKids Database Schema
-- Compatible with both Supabase (PostgreSQL) and Neon (PostgreSQL)

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  preparation TEXT NOT NULL,
  preparation_time_minutes INTEGER,
  servings INTEGER,
  notes TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  shift VARCHAR(20) NOT NULL CHECK (shift IN ('day1', 'day2', 'both')),
  time VARCHAR(10) NOT NULL,
  location VARCHAR(255) NOT NULL,
  capacity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Settings table (for global date management)
CREATE TABLE IF NOT EXISTS event_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date DATE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  display_date_label VARCHAR(255),
  team_name VARCHAR(255),
  team_size INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  dni VARCHAR(15) NOT NULL UNIQUE,
  edad INTEGER NOT NULL,
  sexo VARCHAR(10) NOT NULL CHECK (sexo IN ('M', 'F', 'Otro')),
  celular VARCHAR(20) NOT NULL,
  correo VARCHAR(255) NOT NULL,
  jornada VARCHAR(20) NOT NULL CHECK (jornada IN ('day1', 'day2', 'both')),
  diagnostico TEXT NOT NULL,
  como_se_entero TEXT NOT NULL,
  comentarios TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
CREATE INDEX IF NOT EXISTS idx_activities_shift ON activities(shift);
CREATE INDEX IF NOT EXISTS idx_registrations_correo ON registrations(correo);
CREATE INDEX IF NOT EXISTS idx_registrations_dni ON registrations(dni);
CREATE INDEX IF NOT EXISTS idx_registrations_jornada ON registrations(jornada);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Insert default event settings
INSERT INTO event_settings (event_date, start_date, end_date, display_date_label, team_name, team_size)
SELECT
  CURRENT_DATE,
  CURRENT_DATE,
  CURRENT_DATE + 1,
  NULL,
  'Equipo universitario independiente NutriKids',
  31
WHERE NOT EXISTS (
  SELECT 1 FROM event_settings
);

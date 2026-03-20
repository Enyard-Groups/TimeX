-- Create holidays table
CREATE TABLE IF NOT EXISTS holidays (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  holidaystart DATE NOT NULL,
  holidayend DATE NOT NULL,
  company VARCHAR(255),
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_holidays_code ON holidays(code);
CREATE INDEX IF NOT EXISTS idx_holidays_company ON holidays(company);
CREATE INDEX IF NOT EXISTS idx_holidays_location ON holidays(location);
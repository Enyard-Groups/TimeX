-- SQL for Shift Roster
CREATE TABLE IF NOT EXISTS shift_roster (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER,
    location_id INTEGER,
    shift_id INTEGER,
    roster_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, roster_date)
);

CREATE TABLE IF NOT EXISTS facility_complaint (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    contact VARCHAR(20),
    issue_type VARCHAR(100),
    location VARCHAR(255),
    date_noticed DATE,
    description TEXT,
    safety_concerns VARCHAR(10),
    urgent BOOLEAN DEFAULT FALSE,
    requested_action TEXT,
    attached_file VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

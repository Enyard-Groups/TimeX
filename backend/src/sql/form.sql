-- Comprehensive SQL Schema for All Forms

-- 1. Facility Complaint Form
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

-- 2. Incident/Accident Report Form
CREATE TABLE IF NOT EXISTS incident_accident (
    id SERIAL PRIMARY KEY,
    date_of_incident DATE,
    time_of_incident TIME,
    location VARCHAR(255),
    building VARCHAR(255),
    other_details TEXT,
    type_of_incident VARCHAR(255),
    person_affected VARCHAR(255),
    specify_other_details TEXT,
    incident_timeline TEXT,
    action_taken TEXT,
    injury_details JSONB, -- Details about injury, treatment, etc.
    mso_occ JSONB, -- Management/OCC section
    signature TEXT, -- Path to signature image
    report_acknowledge JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Leave Application Form
CREATE TABLE IF NOT EXISTS leave_application (
    id SERIAL PRIMARY KEY,
    employee VARCHAR(255),
    location VARCHAR(255),
    enrollment_id VARCHAR(100),
    designation VARCHAR(255),
    date DATE,
    nationality VARCHAR(100),
    nature_of_leave JSONB, -- Boolean flags for different leave types
    calendar_days_leave INTEGER,
    leave_from DATE,
    leave_to DATE,
    toil_req VARCHAR(255),
    calendar_days_toil INTEGER,
    toil_from DATE,
    toil_to DATE,
    calendar_days_leave_toil INTEGER,
    actual_days INTEGER,
    rejoin_date DATE,
    reason_for_leave TEXT,
    visa_expiry DATE,
    emergency_contact VARCHAR(255),
    signature TEXT, -- Main signature path
    admin_operation JSONB, -- Admin review section
    leave_granted VARCHAR(255),
    leave_granted_from DATE,
    leave_granted_to DATE,
    final_approval JSONB, -- Multi-stage approval data
    passport_collection JSONB,
    employee_form JSONB,
    signatures JSONB, -- Collection of additional signatures/paths
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Monthly Fire Safety Inspection Form
CREATE TABLE IF NOT EXISTS monthly_fire_safety (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255),
    inspector_name VARCHAR(255),
    inspection_date DATE,
    comments TEXT,
    safety_status JSONB, -- Collection of all OK/NOT-OK status flags
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Opt-Out Request Form
CREATE TABLE IF NOT EXISTS opt_out_request (
    id SERIAL PRIMARY KEY,
    employee VARCHAR(255),
    enrollment_id VARCHAR(100),
    designation VARCHAR(255),
    date DATE,
    accommodation BOOLEAN DEFAULT FALSE,
    transportation BOOLEAN DEFAULT FALSE,
    effective_from DATE,
    house_allowance BOOLEAN DEFAULT FALSE,
    transportation_allowance BOOLEAN DEFAULT FALSE,
    address_details JSONB, -- house_no, street, building, area, country, zip
    emergency_contacts JSONB, -- contact1, contact2, relations, numbers
    signatures JSONB, -- name_sign, approved_by, concurred_by paths
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Passport Request Form
CREATE TABLE IF NOT EXISTS passport_request (
    id SERIAL PRIMARY KEY,
    employee VARCHAR(255),
    enrollment_id VARCHAR(100),
    passport_purpose TEXT,
    date DATE,
    return_date DATE,
    date2 DATE,
    signature TEXT, -- Path to signature image
    officer_sign TEXT, -- Path to officer signature
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Patrolling Checklist Form
CREATE TABLE IF NOT EXISTS patrolling_checklist (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    staff_id VARCHAR(100),
    school_name VARCHAR(255),
    shift_timing TIME,
    date DATE,
    rows JSONB, -- Array of patrolling task status objects
    signature TEXT, -- Path to signature image
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Shift Handover Form
CREATE TABLE IF NOT EXISTS shift_handover (
    id SERIAL PRIMARY KEY,
    school_name VARCHAR(255),
    time_in TIME,
    time_out TIME,
    date DATE,
    guard_out VARCHAR(255),
    guard_in VARCHAR(255),
    id_out VARCHAR(100),
    id_in VARCHAR(100),
    remarks JSONB, -- security, maintenance, staff, lost_found, procedures, etc.
    equipment_status JSONB, -- radios, tour_system, duty_mobile, keys
    prepared_by_sign TEXT, -- Path
    acknowledged_by_sign TEXT, -- Path
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Staff Training Checklist Form
CREATE TABLE IF NOT EXISTS staff_training_checklist (
    id SERIAL PRIMARY KEY,
    employee_name VARCHAR(255),
    enrollment_id VARCHAR(100),
    trainer_name VARCHAR(255),
    date DATE,
    position_title VARCHAR(255),
    location VARCHAR(255),
    training_data JSONB, -- Large object containing all status and assessment levels
    signatures JSONB, -- Trainee and Trainer signature paths
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. TPC Form
CREATE TABLE IF NOT EXISTS tpc_form (
    id SERIAL PRIMARY KEY,
    employee_name VARCHAR(255),
    location VARCHAR(255),
    enrollment_id VARCHAR(100),
    mobile VARCHAR(50),
    date DATE,
    comments TEXT,
    through_person VARCHAR(255),
    signature TEXT, -- Path
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Weekly Overtime Form
CREATE TABLE IF NOT EXISTS weekly_overtime (
    id SERIAL PRIMARY KEY,
    employee_name VARCHAR(255),
    designation VARCHAR(255),
    enrollment_id VARCHAR(100),
    site_name VARCHAR(255),
    rest_day BOOLEAN DEFAULT FALSE,
    shift_extension BOOLEAN DEFAULT FALSE,
    overtime_details JSONB, -- Array of objects: day, date, start, end, total, reason
    checker_name VARCHAR(255),
    checker_signature TEXT,
    checked_date DATE,
    approver_name VARCHAR(255),
    approver_signature TEXT,
    approved_date DATE,
    verifier_details JSONB, -- verified_by, verifier_name, signature, date
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

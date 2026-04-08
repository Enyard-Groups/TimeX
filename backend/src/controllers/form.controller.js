import db from "../lib/db.js";  

// Helper to convert dd/mm/yyyy to yyyy-mm-dd
const formatToPostgresDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.includes("-")) return dateStr; // Already in yyyy-mm-dd format
  const [day, month, year] = dateStr.split("/");
  if (!day || !month || !year) return dateStr;
  return `${year}-${month}-${day}`;
};

// Helper to extract time (HH:MM:SS) from ISO string or time string
const formatToPostgresTime = (timeStr) => {
  if (!timeStr) return null;
  if (typeof timeStr === "string" && timeStr.includes("T")) {
    return timeStr.split("T")[1].split(".")[0]; // Extract HH:MM:SS
  }
  return timeStr;
};

export const getFacilityComplaint = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM facility_complaint ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const createFacilityComplaint = async (req, res) => {
    const { name, email, contact, issue_type, location, date_noticed, description, safety_concerns, urgent, requested_action, attached_file } = req.body;
    // console.log(req.body);
    
   try {
        const result = await db.query(  
            'INSERT INTO facility_complaint (name, email, contact, issue_type, location, date_noticed, description, safety_concerns, urgent, requested_action, attached_file) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [name, email, contact, issue_type, location,  formatToPostgresDate(date_noticed), description, safety_concerns, urgent, requested_action, attached_file]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.log("Error in create facility complaint :",error.message)
        res.status(500).json({ message: error.message });
    }
};

export const updateFacilityComplaint = async (req, res) => {
    const { id } = req.params;
    const { name, email, contact, issue_type, location, date_noticed, description, safety_concerns, urgent, requested_action, attached_file} = req.body;
    
   

    try {
        const result = await db.query(
            'UPDATE facility_complaint SET name=$1, email=$2, contact=$3, issue_type=$4, location=$5, date_noticed=$6, description=$7, safety_concerns=$8, urgent=$9, requested_action=$10, attached_file=$11 WHERE id=$12 RETURNING *',
            [name, email, contact, issue_type, location,  formatToPostgresDate(date_noticed), description, safety_concerns, urgent, requested_action, attached_file, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("error in updateFacility:",error.message);
    }
};

export const deleteFacilityComplaint = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM facility_complaint WHERE id = $1', [id]);
        res.json({ message: 'Facility complaint removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
        }
};



export const getIncident = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM incident_accident ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createIncident = async (req, res) => {
    const { 
        date_of_incident, time_of_incident, location, building, other_details, 
        type_of_incident, person_affected, specify_other_details, 
        incident_timeline, action_taken, injury_details, mso_occ, 
        signature, report_acknowledge 
    } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO incident_accident (date_of_incident, time_of_incident, location, building, other_details, type_of_incident, person_affected, specify_other_details, incident_timeline, action_taken, injury_details, mso_occ, signature, report_acknowledge) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *',
            [formatToPostgresDate(date_of_incident), formatToPostgresTime(time_of_incident), location, building, other_details, type_of_incident, person_affected, specify_other_details, incident_timeline, action_taken, JSON.stringify(injury_details), JSON.stringify(mso_occ), signature, JSON.stringify(report_acknowledge)]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateIncident = async (req, res) => {
    const { id } = req.params;
    const { 
        date_of_incident, time_of_incident, location, building, other_details, 
        type_of_incident, person_affected, specify_other_details, 
        incident_timeline, action_taken, injury_details, mso_occ, 
        signature, report_acknowledge 
    } = req.body;
    try {
        const result = await db.query(
            'UPDATE incident_accident SET date_of_incident=$1, time_of_incident=$2, location=$3, building=$4, other_details=$5, type_of_incident=$6, person_affected=$7, specify_other_details=$8, incident_timeline=$9, action_taken=$10, injury_details=$11, mso_occ=$12, signature=$13, report_acknowledge=$14 WHERE id=$15 RETURNING *',
            [formatToPostgresDate(date_of_incident), formatToPostgresTime(time_of_incident), location, building, other_details, type_of_incident, person_affected, specify_other_details, incident_timeline, action_taken, JSON.stringify(injury_details), JSON.stringify(mso_occ), signature, JSON.stringify(report_acknowledge), id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteIncident = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM incident_accident WHERE id = $1', [id]);
        res.json({ message: 'Incident removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });   
    }
};


export const getLeaveApplication = async (req, res) => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS leave_application_requests (
                id SERIAL PRIMARY KEY,
                employee VARCHAR(255),
                location VARCHAR(255),
                "enrollmentId" VARCHAR(100),
                designation VARCHAR(255),
                date DATE,
                nationality VARCHAR(100),
                natureofleave JSONB,
                "calenderDaysLeave" VARCHAR(255),
                "leaveFrom" DATE,
                "leaveTo" DATE,
                "toilReq" VARCHAR(255),
                "calenderDaystoil" VARCHAR(255),
                "toilFrom" DATE,
                "toilTo" DATE,
                "calenderDaysLeaveToil" VARCHAR(255),
                "actualDays" VARCHAR(255),
                "rejoinDate" DATE,
                "reasonForLeave" TEXT,
                "visaExpiry" DATE,
                "emergencyContact" VARCHAR(255),
                signature TEXT,
                signaturehere TEXT,
                adminoperation JSONB,
                "leaveGranted" VARCHAR(255),
                "leaveGrantedFrom" DATE,
                "leaveGrantedTo" DATE,
                "finalApproval" JSONB,
                "passportCollection" JSONB,
                "employeeForm" JSONB,
                "finalSignature" TEXT,
                "finalSignatureHere" TEXT,
                sign TEXT,
                approval1sign TEXT,
                approval2sign TEXT,
                passportsign TEXT,
                finalsign TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        const result = await db.query('SELECT * FROM leave_application_requests ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createLeaveApplication = async (req, res) => {
    const { 
        employee, location, enrollmentId, designation, date, nationality, natureofleave,
        calenderDaysLeave, leaveFrom, leaveTo, toilReq, calenderDaystoil, toilFrom, toilTo,
        calenderDaysLeaveToil, actualDays, rejoinDate, reasonForLeave, visaExpiry, emergencyContact,
        signature, signaturehere, adminoperation, leaveGranted, leaveGrantedFrom, leaveGrantedTo,
        finalApproval, passportCollection, employeeForm, finalSignature, finalSignatureHere,
        sign, approval1sign, approval2sign, passportsign, finalsign
    } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO leave_application_requests (
                employee, location, "enrollmentId", designation, date, nationality, natureofleave,
                "calenderDaysLeave", "leaveFrom", "leaveTo", "toilReq", "calenderDaystoil", "toilFrom", "toilTo",
                "calenderDaysLeaveToil", "actualDays", "rejoinDate", "reasonForLeave", "visaExpiry", "emergencyContact",
                signature, signaturehere, adminoperation, "leaveGranted", "leaveGrantedFrom", "leaveGrantedTo",
                "finalApproval", "passportCollection", "employeeForm", "finalSignature", "finalSignatureHere",
                sign, approval1sign, approval2sign, passportsign, finalsign
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36) RETURNING *`,
            [
                employee, location, enrollmentId, designation, formatToPostgresDate(date), nationality, JSON.stringify(natureofleave),
                calenderDaysLeave, formatToPostgresDate(leaveFrom), formatToPostgresDate(leaveTo), toilReq, calenderDaystoil, formatToPostgresDate(toilFrom), formatToPostgresDate(toilTo),
                calenderDaysLeaveToil, actualDays, formatToPostgresDate(rejoinDate), reasonForLeave, formatToPostgresDate(visaExpiry), emergencyContact,
                signature, signaturehere, JSON.stringify(adminoperation), leaveGranted, formatToPostgresDate(leaveGrantedFrom), formatToPostgresDate(leaveGrantedTo),
                JSON.stringify(finalApproval), JSON.stringify(passportCollection), JSON.stringify(employeeForm), finalSignature, finalSignatureHere,
                sign, approval1sign, approval2sign, passportsign, finalsign
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const updateLeaveApplication = async (req, res) => {
    const { id } = req.params;
    const { 
        employee, location, enrollmentId, designation, date, nationality, natureofleave,
        calenderDaysLeave, leaveFrom, leaveTo, toilReq, calenderDaystoil, toilFrom, toilTo,
        calenderDaysLeaveToil, actualDays, rejoinDate, reasonForLeave, visaExpiry, emergencyContact,
        signature, signaturehere, adminoperation, leaveGranted, leaveGrantedFrom, leaveGrantedTo,
        finalApproval, passportCollection, employeeForm, finalSignature, finalSignatureHere,
        sign, approval1sign, approval2sign, passportsign, finalsign
    } = req.body;
    try {
        const result = await db.query(
            `UPDATE leave_application_requests SET 
                employee=$1, location=$2, "enrollmentId"=$3, designation=$4, date=$5, nationality=$6, natureofleave=$7,
                "calenderDaysLeave"=$8, "leaveFrom"=$9, "leaveTo"=$10, "toilReq"=$11, "calenderDaystoil"=$12, "toilFrom"=$13, "toilTo"=$14,
                "calenderDaysLeaveToil"=$15, "actualDays"=$16, "rejoinDate"=$17, "reasonForLeave"=$18, "visaExpiry"=$19, "emergencyContact"=$20,
                signature=$21, signaturehere=$22, adminoperation=$23, "leaveGranted"=$24, "leaveGrantedFrom"=$25, "leaveGrantedTo"=$26,
                "finalApproval"=$27, "passportCollection"=$28, "employeeForm"=$29, "finalSignature"=$30, "finalSignatureHere"=$31,
                sign=$32, approval1sign=$33, approval2sign=$34, passportsign=$35, finalsign=$36
                WHERE id=$37 RETURNING *`,
            [
                employee, location, enrollmentId, designation, formatToPostgresDate(date), nationality, JSON.stringify(natureofleave),
                calenderDaysLeave, formatToPostgresDate(leaveFrom), formatToPostgresDate(leaveTo), toilReq, calenderDaystoil, formatToPostgresDate(toilFrom), formatToPostgresDate(toilTo),
                calenderDaysLeaveToil, actualDays, formatToPostgresDate(rejoinDate), reasonForLeave, formatToPostgresDate(visaExpiry), emergencyContact,
                signature, signaturehere, JSON.stringify(adminoperation), leaveGranted, formatToPostgresDate(leaveGrantedFrom), formatToPostgresDate(leaveGrantedTo),
                JSON.stringify(finalApproval), JSON.stringify(passportCollection), JSON.stringify(employeeForm), finalSignature, finalSignatureHere,
                sign, approval1sign, approval2sign, passportsign, finalsign,
                id
            ]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteLeaveApplication = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM leave_application_requests WHERE id = $1', [id]);
        res.json({ message: 'Leave application removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getOptRequest = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM opt_out_request ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createOptRequest = async (req, res) => {
    const { 
        employee, enrollment_id, designation, date, 
        accommodation, transportation, effective_from, 
        house_allowance, transportation_allowance,
        house_no, street_name, building_name, area, country, zip_pin_code, landmark,
        emergency_contact, contact_no, relation, 
        emergency_contact2, contact_no2, relation2,
        name_sign, approvedBy, concurredBy,
        name_sign_drawn, approvedBy_drawn, concurredBy_drawn
    } = req.body;

    const address_details = { house_no, street_name, building_name, area, country, zip_pin_code, landmark };
    const emergency_contacts = { emergency_contact, contact_no, relation, emergency_contact2, contact_no2, relation2 };
    const signatures = { name_sign, approvedBy, concurredBy, name_sign_drawn, approvedBy_drawn, concurredBy_drawn };

    try {
        const result = await db.query(
            'INSERT INTO opt_out_request (employee, enrollment_id, designation, date, accommodation, transportation, effective_from, house_allowance, transportation_allowance, address_details, emergency_contacts, signatures) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
            [
                employee, enrollment_id, designation, formatToPostgresDate(date), 
                accommodation, transportation, formatToPostgresDate(effective_from), 
                house_allowance, transportation_allowance,
                JSON.stringify(address_details),
                JSON.stringify(emergency_contacts),
                JSON.stringify(signatures)
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error in createOptRequest:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const updateOptRequest = async (req, res) => {
    const { id } = req.params;
    const { 
        employee, enrollment_id, designation, date, 
        accommodation, transportation, effective_from, 
        house_allowance, transportation_allowance,
        house_no, street_name, building_name, area, country, zip_pin_code, landmark,
        emergency_contact, contact_no, relation, 
        emergency_contact2, contact_no2, relation2,
        name_sign, approvedBy, concurredBy,
        name_sign_drawn, approvedBy_drawn, concurredBy_drawn
    } = req.body;

    const address_details = { house_no, street_name, building_name, area, country, zip_pin_code, landmark };
    const emergency_contacts = { emergency_contact, contact_no, relation, emergency_contact2, contact_no2, relation2 };
    const signatures = { name_sign, approvedBy, concurredBy, name_sign_drawn, approvedBy_drawn, concurredBy_drawn };

    try {
        const result = await db.query(
            'UPDATE opt_out_request SET employee=$1, enrollment_id=$2, designation=$3, date=$4, accommodation=$5, transportation=$6, effective_from=$7, house_allowance=$8, transportation_allowance=$9, address_details=$10, emergency_contacts=$11, signatures=$12 WHERE id=$13 RETURNING *',
            [
                employee, enrollment_id, designation, formatToPostgresDate(date), 
                accommodation, transportation, formatToPostgresDate(effective_from), 
                house_allowance, transportation_allowance,
                JSON.stringify(address_details),
                JSON.stringify(emergency_contacts),
                JSON.stringify(signatures),
                id
            ]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error in updateOptRequest:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const deleteOptRequest = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM opt_out_request WHERE id = $1', [id]);
        res.json({ message: 'OPT request removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getPassportRequest = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM passport_request ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createPassportRequest = async (req, res) => {
    const { employee_name, enrollment_id, department, position_title, mobile, passport_number, request_date, expected_return_date, reason_for_request, agreement, employee_signature, mso_signature } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO passport_request (employee_name, enrollment_id, department, position_title, mobile, passport_number, request_date, expected_return_date, reason_for_request, agreement, employee_signature, mso_signature) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
            [employee_name, enrollment_id, department, position_title, mobile, passport_number, formatToPostgresDate(request_date), formatToPostgresDate(expected_return_date), reason_for_request, agreement, employee_signature, mso_signature]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePassportRequest = async (req, res) => {
    const { id } = req.params;
    const { employee_name, enrollment_id, department, position_title, mobile, passport_number, request_date, expected_return_date, reason_for_request, agreement, employee_signature, mso_signature } = req.body;
    try {
        const result = await db.query(
            'UPDATE passport_request SET employee_name=$1, enrollment_id=$2, department=$3, position_title=$4, mobile=$5, passport_number=$6, request_date=$7, expected_return_date=$8, reason_for_request=$9, agreement=$10, employee_signature=$11, mso_signature=$12 WHERE id=$13 RETURNING *',
            [employee_name, enrollment_id, department, position_title, mobile, passport_number, formatToPostgresDate(request_date), formatToPostgresDate(expected_return_date), reason_for_request, agreement, employee_signature, mso_signature, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePassportRequest = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM passport_request WHERE id = $1', [id]);
        res.json({ message: 'Passport request removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};  


export const getShiftOver = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM shift_handover ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createShiftOver = async (req, res) => {
    const { school_name, time_in, time_out, date, guard_out, guard_in, id_out, id_in, remarks, equipment_status, prepared_by_sign, acknowledged_by_sign } = req.body;
    
    try {
        const result = await db.query(
            'INSERT INTO shift_handover (school_name, time_in, time_out, date, guard_out, guard_in, id_out, id_in, remarks, equipment_status, prepared_by_sign, acknowledged_by_sign) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
            [school_name, formatToPostgresTime(time_in), formatToPostgresTime(time_out), formatToPostgresDate(date), guard_out, guard_in, id_out, id_in, JSON.stringify(remarks), JSON.stringify(equipment_status), prepared_by_sign, acknowledged_by_sign]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("error in createshiftover:", error.message);
    }
};

export const updateShiftOver = async (req, res) => {
    const { id } = req.params;
    const { school_name, time_in, time_out, date, guard_out, guard_in, id_out, id_in, remarks, equipment_status, prepared_by_sign, acknowledged_by_sign } = req.body;
    try {
        const result = await db.query(
            'UPDATE shift_handover SET school_name=$1, time_in=$2, time_out=$3, date=$4, guard_out=$5, guard_in=$6, id_out=$7, id_in=$8, remarks=$9, equipment_status=$10, prepared_by_sign=$11, acknowledged_by_sign=$12 WHERE id=$13 RETURNING *',
            [school_name, formatToPostgresTime(time_in), formatToPostgresTime(time_out), formatToPostgresDate(date), guard_out, guard_in, id_out, id_in, JSON.stringify(remarks), JSON.stringify(equipment_status), prepared_by_sign, acknowledged_by_sign, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteShiftOver = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM shift_handover WHERE id = $1', [id]);
        res.json({ message: 'Shift Handover removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};  


export const getStaffTraining = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM staff_training_checklist ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createStaffTraining = async (req, res) => {
    const { employee_name, enrollment_id, trainer_name, date, position_title, location, training_data, signatures } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO staff_training_checklist (employee_name, enrollment_id, trainer_name, date, position_title, location, training_data, signatures) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [employee_name, enrollment_id, trainer_name, formatToPostgresDate(date), position_title, location, JSON.stringify(training_data), JSON.stringify(signatures)]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateStaffTraining = async (req, res) => {
    const { id } = req.params;
    const { employee_name, enrollment_id, trainer_name, date, position_title, location, training_data, signatures } = req.body;
    try {
        const result = await db.query(
            'UPDATE staff_training_checklist SET employee_name=$1, enrollment_id=$2, trainer_name=$3, date=$4, position_title=$5, location=$6, training_data=$7, signatures=$8 WHERE id=$9 RETURNING *',
            [employee_name, enrollment_id, trainer_name, formatToPostgresDate(date), position_title, location, JSON.stringify(training_data), JSON.stringify(signatures), id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteStaffTraining = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM staff_training_checklist WHERE id = $1', [id]);
        res.json({ message: 'Staff training checklist removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};      


export const getTcpForm = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tpc_form ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createTcpForm = async (req, res) => {
    const { employee_name, location, enrollment_id, mobile, date, comments, through_person, signature } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO tpc_form (employee_name, location, enrollment_id, mobile, date, comments, through_person, signature) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [employee_name, location, enrollment_id, mobile, formatToPostgresDate(date), comments, through_person, signature]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("error in createTcpform:",error.message);
    }
};

export const updateTcpForm = async (req, res) => {
    const { id } = req.params;
    const { employee_name, location, enrollment_id, mobile, date, comments, through_person, signature } = req.body;
    try {
        const result = await db.query(
            'UPDATE tpc_form SET employee_name=$1, location=$2, enrollment_id=$3, mobile=$4, date=$5, comments=$6, through_person=$7, signature=$8 WHERE id=$9 RETURNING *',
            [employee_name, location, enrollment_id, mobile, formatToPostgresDate(date), comments, through_person, signature, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteTcpForm = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM tpc_form WHERE id = $1', [id]);
        res.json({ message: 'TCP form removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};      


export const getWeeklyOvertime = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM weekly_overtime ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createWeeklyOvertime = async (req, res) => {
    const { 
        employee_name, designation, enrollment_id, site_name, 
        rest_day, shift_extension, overtime_details, 
        checker_name, checker_signature, checked_date, 
        approver_name, approver_signature, approved_date, 
        verifier_details 
    } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO weekly_overtime (employee_name, designation, enrollment_id, site_name, rest_day, shift_extension, overtime_details, checker_name, checker_signature, checked_date, approver_name, approver_signature, approved_date, verifier_details) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *',
            [
                employee_name, designation, enrollment_id, site_name, 
                rest_day, shift_extension, JSON.stringify(overtime_details), 
                checker_name, checker_signature, formatToPostgresDate(checked_date), 
                approver_name, approver_signature, formatToPostgresDate(approved_date), 
                JSON.stringify(verifier_details)
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.log("Error in creating weekly overtime:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const updateWeeklyOvertime = async (req, res) => {
    const { id } = req.params;
    const { 
        employee_name, designation, enrollment_id, site_name, 
        rest_day, shift_extension, overtime_details, 
        checker_name, checker_signature, checked_date, 
        approver_name, approver_signature, approved_date, 
        verifier_details 
    } = req.body;
    try {
        const result = await db.query(
            'UPDATE weekly_overtime SET employee_name=$1, designation=$2, enrollment_id=$3, site_name=$4, rest_day=$5, shift_extension=$6, overtime_details=$7, checker_name=$8, checker_signature=$9, checked_date=$10, approver_name=$11, approver_signature=$12, approved_date=$13, verifier_details=$14 WHERE id=$15 RETURNING *',
            [
                employee_name, designation, enrollment_id, site_name, 
                rest_day, shift_extension, JSON.stringify(overtime_details), 
                checker_name, checker_signature, formatToPostgresDate(checked_date), 
                approver_name, approver_signature, formatToPostgresDate(approved_date), 
                JSON.stringify(verifier_details), id
            ]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.log("Error in updating weekly overtime:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const deleteWeeklyOvertime = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM weekly_overtime WHERE id = $1', [id]);
        res.json({ message: 'Weekly overtime removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};      


export const getPatrollingChecklist = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM patrolling_checklist ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createPatrollingChecklist = async (req, res) => {
    const { name, staff_id, school_name, shift_timing, date, rows, signature } = req.body;
    
    try {
        const result = await db.query(
            'INSERT INTO patrolling_checklist (name, staff_id, school_name, shift_timing, date, rows, signature) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, staff_id, school_name, formatToPostgresTime(shift_timing), formatToPostgresDate(date), JSON.stringify(rows), signature]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.log("Error in creating patrolling checklist:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const updatePatrollingChecklist = async (req, res) => {
    const { id } = req.params;
    const { name, staff_id, school_name, shift_timing, date, rows, signature } = req.body;
    try {
        const result = await db.query(
            'UPDATE patrolling_checklist SET name=$1, staff_id=$2, school_name=$3, shift_timing=$4, date=$5, rows=$6, signature=$7 WHERE id=$8 RETURNING *',
            [name, staff_id, school_name, formatToPostgresTime(shift_timing), formatToPostgresDate(date), JSON.stringify(rows), signature, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.log("Error in updating patrolling checklist:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const deletePatrollingChecklist = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM patrolling_checklist WHERE id = $1', [id]);
        res.json({ message: 'Patrolling checklist removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};      

export const getMonthlyFireSafety = async (req, res) => {
    try {
        // Ensure table exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS monthly_fire_safety_inspections (
                id SERIAL PRIMARY KEY,
                employee VARCHAR(255),
                location VARCHAR(255),
                "createdDate" DATE,
                "fireHazards" JSONB,
                "fireAlarm" JSONB,
                extinguishers JSONB,
                "fireHose" JSONB,
                fm200 JSONB,
                "fireExits" JSONB,
                "noticeSigns" JSONB,
                "paSystem" JSONB,
                pumps JSONB,
                "smokeExtraction" JSONB,
                remarks JSONB,
                signature TEXT,
                signhere TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        const result = await db.query('SELECT * FROM monthly_fire_safety_inspections ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.log("Error in getting monthly fire safety inspections:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const createMonthlyFireSafety = async (req, res) => {
    const { 
        employee, location, createdDate,
        fireHazards, fireAlarm, extinguishers, fireHose, fm200, 
        fireExits, noticeSigns, paSystem, pumps, smokeExtraction,
        remarks, signature, signhere
    } = req.body;
    
    try {
        // Ensure table exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS monthly_fire_safety_inspections (
                id SERIAL PRIMARY KEY,
                employee VARCHAR(255),
                location VARCHAR(255),
                "createdDate" DATE,
                "fireHazards" JSONB,
                "fireAlarm" JSONB,
                extinguishers JSONB,
                "fireHose" JSONB,
                fm200 JSONB,
                "fireExits" JSONB,
                "noticeSigns" JSONB,
                "paSystem" JSONB,
                pumps JSONB,
                "smokeExtraction" JSONB,
                remarks JSONB,
                signature TEXT,
                signhere TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const result = await db.query(
            'INSERT INTO monthly_fire_safety_inspections (employee, location, "createdDate", "fireHazards", "fireAlarm", extinguishers, "fireHose", fm200, "fireExits", "noticeSigns", "paSystem", pumps, "smokeExtraction", remarks, signature, signhere) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *',
            [
                employee, location, formatToPostgresDate(createdDate), 
                JSON.stringify(fireHazards), JSON.stringify(fireAlarm), JSON.stringify(extinguishers), 
                JSON.stringify(fireHose), JSON.stringify(fm200), JSON.stringify(fireExits), 
                JSON.stringify(noticeSigns), JSON.stringify(paSystem), JSON.stringify(pumps), 
                JSON.stringify(smokeExtraction), JSON.stringify(remarks), 
                signature, signhere
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.log("Error in creating monthly fire safety:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const updateMonthlyFireSafety = async (req, res) => {
    const { id } = req.params;
    const { 
        employee, location, createdDate,
        fireHazards, fireAlarm, extinguishers, fireHose, fm200, 
        fireExits, noticeSigns, paSystem, pumps, smokeExtraction,
        remarks, signature, signhere
    } = req.body;
    try {
        const result = await db.query(
            'UPDATE monthly_fire_safety_inspections SET employee=$1, location=$2, "createdDate"=$3, "fireHazards"=$4, "fireAlarm"=$5, extinguishers=$6, "fireHose"=$7, fm200=$8, "fireExits"=$9, "noticeSigns"=$10, "paSystem"=$11, pumps=$12, "smokeExtraction"=$13, remarks=$14, signature=$15, signhere=$16 WHERE id=$17 RETURNING *',
            [
                employee, location, formatToPostgresDate(createdDate), 
                JSON.stringify(fireHazards), JSON.stringify(fireAlarm), JSON.stringify(extinguishers), 
                JSON.stringify(fireHose), JSON.stringify(fm200), JSON.stringify(fireExits), 
                JSON.stringify(noticeSigns), JSON.stringify(paSystem), JSON.stringify(pumps), 
                JSON.stringify(smokeExtraction), JSON.stringify(remarks), 
                signature, signhere, id
            ]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.log("Error in updating monthly fire safety:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const deleteMonthlyFireSafety = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM monthly_fire_safety_inspections WHERE id = $1', [id]);
        res.json({ message: 'Monthly fire safety inspection removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
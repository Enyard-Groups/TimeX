import db from "../lib/db.js";  

// Helper to convert dd/mm/yyyy to yyyy-mm-dd
const formatToPostgresDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.includes("-")) return dateStr; // Already in yyyy-mm-dd format
  const [day, month, year] = dateStr.split("/");
  if (!day || !month || !year) return dateStr;
  return `${year}-${month}-${day}`;
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
    console.log(req.body);
    
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
        const result = await db.query('SELECT * FROM incident ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createIncident = async (req, res) => {
    const { name, email, contact, incidentType, location, date, description, safetyConcerns, urgent, requestedAction, attachedFile } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO incident (name, email, contact, incident_type, location, date_noticed, description, safety_concerns, urgent, requested_action, attached_file) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [name, email, contact, incidentType, location, date, description, safetyConcerns, urgent, requestedAction, attachedFile]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateIncident = async (req, res) => {
    const { id } = req.params;
    const { name, email, contact, incidentType, location, date, description, safetyConcerns, urgent, requestedAction, attachedFile } = req.body;
    try {
        const result = await db.query(
            'UPDATE incident SET name=$1, email=$2, contact=$3, incident_type=$4, location=$5, date_noticed=$6, description=$7, safety_concerns=$8, urgent=$9, requested_action=$10, attached_file=$11 WHERE id=$12 RETURNING *',
            [name, email, contact, incidentType, location, date, description, safetyConcerns, urgent, requestedAction, attachedFile, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteIncident = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM incident WHERE id = $1', [id]);
        res.json({ message: 'Incident removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });   
    }
};


export const getLeaveApplication = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM leave_application ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createLeaveApplication = async (req, res) => {
    const { name, email, contact, leaveType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO leave_application (name, email, contact, leave_type, start_date, end_date, description, safety_concerns, urgent, requested_action, attached_file) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [name, email, contact, leaveType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateLeaveApplication = async (req, res) => {
    const { id } = req.params;
    const { name, email, contact, leaveType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile } = req.body;
    try {
        const result = await db.query(
            'UPDATE leave_application SET name=$1, email=$2, contact=$3, leave_type=$4, start_date=$5, end_date=$6, description=$7, safety_concerns=$8, urgent=$9, requested_action=$10, attached_file=$11 WHERE id=$12 RETURNING *',
            [name, email, contact, leaveType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteLeaveApplication = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM leave_application WHERE id = $1', [id]);
        res.json({ message: 'Leave application removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getOptRequest = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM opt_request ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createOptRequest = async (req, res) => {
    const { name, email, contact, optType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO opt_request (name, email, contact, opt_type, start_date, end_date, description, safety_concerns, urgent, requested_action, attached_file) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [name, email, contact, optType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOptRequest = async (req, res) => {
    const { id } = req.params;
    const { name, email, contact, optType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile } = req.body;
    try {
        const result = await db.query(
            'UPDATE opt_request SET name=$1, email=$2, contact=$3, opt_type=$4, start_date=$5, end_date=$6, description=$7, safety_concerns=$8, urgent=$9, requested_action=$10, attached_file=$11 WHERE id=$12 RETURNING *',
            [name, email, contact, optType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteOptRequest = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM opt_request WHERE id = $1', [id]);
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
    const { name, email, contact, passportType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO passport_request (name, email, contact, passport_type, start_date, end_date, description, safety_concerns, urgent, requested_action, attached_file) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [name, email, contact, passportType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePassportRequest = async (req, res) => {
    const { id } = req.params;
    const { name, email, contact, passportType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile } = req.body;
    try {
        const result = await db.query(
            'UPDATE passport_request SET name=$1, email=$2, contact=$3, passport_type=$4, start_date=$5, end_date=$6, description=$7, safety_concerns=$8, urgent=$9, requested_action=$10, attached_file=$11 WHERE id=$12 RETURNING *',
            [name, email, contact, passportType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile, id]
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
        const result = await db.query('SELECT * FROM shift_over ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createShiftOver = async (req, res) => {
    const { name, email, contact, shiftOverType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO shift_over (name, email, contact, shift_over_type, start_date, end_date, description, safety_concerns, urgent, requested_action, attached_file) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [name, email, contact, shiftOverType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateShiftOver = async (req, res) => {
    const { id } = req.params;
    const { name, email, contact, shiftOverType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile } = req.body;
    try {
        const result = await db.query(
            'UPDATE shift_over SET name=$1, email=$2, contact=$3, shift_over_type=$4, start_date=$5, end_date=$6, description=$7, safety_concerns=$8, urgent=$9, requested_action=$10, attached_file=$11 WHERE id=$12 RETURNING *',
            [name, email, contact, shiftOverType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteShiftOver = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM shift_over WHERE id = $1', [id]);
        res.json({ message: 'Shift over removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};  


export const getStaffTraining = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM staff_training ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createStaffTraining = async (req, res) => {
    const { name, email, contact, staffTrainingType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO staff_training (name, email, contact, staff_training_type, start_date, end_date, description, safety_concerns, urgent, requested_action, attached_file) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [name, email, contact, staffTrainingType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateStaffTraining = async (req, res) => {
    const { id } = req.params;
    const { name, email, contact, staffTrainingType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile } = req.body;
    try {
        const result = await db.query(
            'UPDATE staff_training SET name=$1, email=$2, contact=$3, staff_training_type=$4, start_date=$5, end_date=$6, description=$7, safety_concerns=$8, urgent=$9, requested_action=$10, attached_file=$11 WHERE id=$12 RETURNING *',
            [name, email, contact, staffTrainingType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteStaffTraining = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM staff_training WHERE id = $1', [id]);
        res.json({ message: 'Staff training removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};      


export const getTcpForm = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tcp_form ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createTcpForm = async (req, res) => {
    const { name, email, contact, tcpFormType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO tcp_form (name, email, contact, tcp_form_type, start_date, end_date, description, safety_concerns, urgent, requested_action, attached_file) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [name, email, contact, tcpFormType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTcpForm = async (req, res) => {
    const { id } = req.params;
    const { name, email, contact, tcpFormType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile } = req.body;
    try {
        const result = await db.query(
            'UPDATE tcp_form SET name=$1, email=$2, contact=$3, tcp_form_type=$4, start_date=$5, end_date=$6, description=$7, safety_concerns=$8, urgent=$9, requested_action=$10, attached_file=$11 WHERE id=$12 RETURNING *',
            [name, email, contact, tcpFormType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteTcpForm = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM tcp_form WHERE id = $1', [id]);
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
    const { name, email, contact, weeklyOvertimeType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO weekly_overtime (name, email, contact, weekly_overtime_type, start_date, end_date, description, safety_concerns, urgent, requested_action, attached_file) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [name, email, contact, weeklyOvertimeType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateWeeklyOvertime = async (req, res) => {
    const { id } = req.params;
    const { name, email, contact, weeklyOvertimeType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile } = req.body;
    try {
        const result = await db.query(
            'UPDATE weekly_overtime SET name=$1, email=$2, contact=$3, weekly_overtime_type=$4, start_date=$5, end_date=$6, description=$7, safety_concerns=$8, urgent=$9, requested_action=$10, attached_file=$11 WHERE id=$12 RETURNING *',
            [name, email, contact, weeklyOvertimeType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
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
    const { name, email, contact, patrollingChecklistType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO patrolling_checklist (name, email, contact, patrolling_checklist_type, start_date, end_date, description, safety_concerns, urgent, requested_action, attached_file) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [name, email, contact, patrollingChecklistType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePatrollingChecklist = async (req, res) => {
    const { id } = req.params;
    const { name, email, contact, patrollingChecklistType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile } = req.body;
    try {
        const result = await db.query(
            'UPDATE patrolling_checklist SET name=$1, email=$2, contact=$3, patrolling_checklist_type=$4, start_date=$5, end_date=$6, description=$7, safety_concerns=$8, urgent=$9, requested_action=$10, attached_file=$11 WHERE id=$12 RETURNING *',
            [name, email, contact, patrollingChecklistType, startDate, endDate, description, safetyConcerns, urgent, requestedAction, attachedFile, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
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
    
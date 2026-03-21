import db from "../lib/db.js";



export const getDepartments = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM departments ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDepartment = async (req, res) => {
  const { name, code, company, description, is_active } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO departments (name, code, company, description, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, code, company, description, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, code, company, description, is_active } = req.body;
  try {
    const result = await db.query(
      'UPDATE departments SET name=$1, code=$2, company=$3, description=$4, is_active=$5 WHERE id=$6 RETURNING *',
      [name, code, company, description, is_active, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM departments WHERE id = $1', [id]);
    res.json({ message: 'Department removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDesignations = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM designations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDesignation = async (req, res) => {
  const { name, code, company, description, is_active } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO designations (name, code, company, description, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, code, company, description, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDesignation = async (req, res) => {
  const { id } = req.params;
  const { name, code, company, description, is_active } = req.body;
  try {
    const result = await db.query(
      'UPDATE designations SET name=$1, code=$2, company=$3, description=$4, is_active=$5 WHERE id=$6 RETURNING *',
      [name, code, company, description, is_active, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 export const deleteDesignation = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM designations WHERE id = $1', [id]);
    res.json({ message: 'Designation removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getShifts = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM shifts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createShift = async (req, res) => {
  const { shift_name, shift_code, start_time, end_time, grace_period, is_active } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO shifts (shift_name, shift_code, start_time, end_time, grace_period, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [shift_name, shift_code, start_time, end_time, grace_period, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateShift = async (req, res) => {
  const { id } = req.params;
  const { shift_name, shift_code, start_time, end_time, grace_period, is_active } = req.body;
  try {
    const result = await db.query(
      'UPDATE shifts SET shift_name=$1, shift_code=$2, start_time=$3, end_time=$4, grace_period=$5, is_active=$6 WHERE id=$7 RETURNING *',
      [shift_name, shift_code, start_time, end_time, grace_period, is_active, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 export const deleteShift = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM shifts WHERE id = $1', [id]);
    res.json({ message: 'Shift removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getHolidays = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, code, holidaystart, holidayend, company, location, is_active FROM holidays ORDER BY created_at DESC');

    // Format dates back to dd/mm/yyyy for frontend
    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const holidays = result.rows.map(holiday => ({
      ...holiday,
      holidaystart: formatDate(holiday.holidaystart),
      holidayend: formatDate(holiday.holidayend)
    }));

    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createHoliday = async (req, res) => {
  const { name, code, holidaystart, holidayend, company, location, is_active } = req.body;

  // Parse dates from dd/mm/yyyy to yyyy-mm-dd format
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const formattedStart = parseDate(holidaystart);
  const formattedEnd = parseDate(holidayend);

  try {
    const result = await db.query(
      'INSERT INTO holidays (name, code, holidaystart, holidayend, company, location, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, code, holidaystart, holidayend, company, location, is_active',
      [name, code, formattedStart, formattedEnd, company, location, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log("error in createholidays", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateHoliday = async (req, res) => {
  const { id } = req.params;
  const { name, code, holidaystart, holidayend, company, location, is_active } = req.body;

  // Parse dates from dd/mm/yyyy to yyyy-mm-dd format
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const formattedStart = parseDate(holidaystart);
  const formattedEnd = parseDate(holidayend);

  try {
    const result = await db.query(
      'UPDATE holidays SET name=$1, code=$2, holidaystart=$3, holidayend=$4, company=$5, location=$6, is_active=$7 WHERE id=$8 RETURNING id, name, code, holidaystart, holidayend, company, location, is_active',
      [name, code, formattedStart, formattedEnd, company, location, is_active, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHoliday = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM holidays WHERE id = $1', [id]);
    res.json({ message: 'Holiday removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getClaimCategories = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM claim_categories ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createClaimCategory = async (req, res) => {
  const { name, company, description, is_attachment, is_active } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO claim_categories (name, company, description, is_attachment, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, company, description, is_attachment, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateClaimCategory = async (req, res) => {
  const { id } = req.params;
  const { name, company, description, is_attachment, is_active } = req.body;
  try {
    const result = await db.query(
      'UPDATE claim_categories SET name=$1, company=$2, description=$3, is_attachment=$4, is_active=$5 WHERE id=$6 RETURNING *',
      [name, company, description, is_attachment, is_active, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteClaimCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM claim_categories WHERE id = $1', [id]);
    res.json({ message: 'Claim category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getIssueTypes = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM issue_types ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createIssueType = async (req, res) => {
  const { name, code, description, is_active } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO issue_types (type_name, code, description, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, code, description, is_active],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateIssueType = async (req, res) => {
  const { id } = req.params;
  const { name, code, description, is_active } = req.body;
  console.log(req.body);
  try {
    const result = await db.query(
      'UPDATE issue_types SET type_name=$1, code=$2, description=$3, is_active=$4 WHERE id=$5 RETURNING *',
      [name, code, description, is_active, id],
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteIssueType = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM issue_types WHERE id = $1', [id]);
    res.json({ message: 'Issue type removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getLeaveTypes = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM leave_types ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createLeaveType = async (req, res) => {
  const { name, code, company, total_leaves, description, is_active } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO leave_types (name, code, company, total_leaves, description, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, code, company, total_leaves, description, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLeaveType = async (req, res) => {
  const { id } = req.params;
  const { name, code, company, total_leaves, description, is_active } = req.body;
  try {
    const result = await db.query(
      'UPDATE leave_types SET name=$1, code=$2, company=$3, total_leaves=$4, description=$5, is_active=$6 WHERE id=$7 RETURNING *',
      [name, code, company, total_leaves, description, is_active, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLeaveType = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM leave_types WHERE id = $1', [id]);
    res.json({ message: 'Leave type removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getGeofencingLocations = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM geofencing_masters ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.log("Error in get geo fencing :",error.message)
    res.status(500).json({ message: error.message });
  }
};

export const createGeofencingLocation = async (req, res) => {
  const { name, latitude, longitude, search_radius } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO geofencing_masters (name, latitude, longitude, radius) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, latitude, longitude, search_radius]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGeofencingLocation = async (req, res) => {
  const { id } = req.params;
  const { name, latitude, longitude, search_radius } = req.body;
  try {
    const result = await db.query(
      'UPDATE geofencing_masters SET name=$1, latitude=$2, longitude=$3, radius=$4 WHERE id=$5 RETURNING *',
      [name, latitude, longitude, search_radius, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGeofencingLocation = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM geofencing_masters WHERE id = $1', [id]);
    res.json({ message: 'Geofencing location removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getEmployeeGeofencing = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT e.id as employee_id, e.full_name, e.device_enrollment_id, e.company_enrollment_id, 
             d.name as department_name, ds.name as designation_name,
             gm.name as geofencing_name, gm.id as geofencing_id
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations ds ON e.designation_id = ds.id
      LEFT JOIN employee_geofencing eg ON e.id = eg.employee_id
      LEFT JOIN geofencing_masters gm ON eg.geofencing_id = gm.id
      ORDER BY e.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.log("Error in get employee geofencing :",error.message);
    res.status(500).json({ message: error.message });
  }
};

export const assignGeofencingToEmployees = async (req, res) => {
  const { employeeIds, geofencingIds } = req.body; // geofencingIds should be an array
  
  if (!employeeIds || !Array.isArray(employeeIds) || !geofencingIds || !Array.isArray(geofencingIds)) {
    return res.status(400).json({ message: "Invalid payload: employeeIds and geofencingIds must be arrays." });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    for (const empId of employeeIds) {
      // Clear existing assignments for this employee
      await client.query('DELETE FROM employee_geofencing WHERE employee_id = $1', [empId]);
      
      // Insert new assignments
      for (const geoId of geofencingIds) {
        if (geoId) {
          await client.query(
            'INSERT INTO employee_geofencing (employee_id, geofencing_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [empId, geoId]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    res.json({ message: "Geofencing assigned successfully" });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};
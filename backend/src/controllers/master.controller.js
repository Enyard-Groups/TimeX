import db from "../lib/db.js";



export const getDepartments = async (req, res) => {
  try {
    const result = await db.query(`
  SELECT d.*, c.name AS company_name
  FROM departments d
  LEFT JOIN companies c ON d.company = c.id
  ORDER BY d.created_at DESC
`);
    console.log(result.rows)
    res.json(result.rows);

  } catch (error) {
    console.log("Erro in get departments:", error.message)
    res.status(500).json({ message: error.message });
  }
};

export const createDepartment = async (req, res) => {
  const { name, code, company, description, is_active } = req.body;
  console.log(req.body);
  try {
    const result = await db.query(
      'INSERT INTO departments (name, code, company, description, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, code, company, description, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("error in createDepartment", error.message);
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
    const result = await db.query(`
      SELECT ds.*, c.name as company_name, d.name as department_name

      FROM designations ds
      LEFT JOIN companies c ON ds.company_id = c.id
      LEFT JOIN departments d ON ds.department_id = d.id
      ORDER BY ds.created_at DESC
    `);

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDesignation = async (req, res) => {
  const { name, code, company, department, description, is_active } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO designations (name, code, company_id,  department_id, description, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, code, company, department, description, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("error in createDesignation", error.message);
  }
};

export const updateDesignation = async (req, res) => {
  const { id } = req.params;
  const { name, code, company, department, description, is_active } = req.body;
  try {
    const result = await db.query(
      'UPDATE designations SET name=$1, code=$2, company=$3, description=$4, is_active=$5 WHERE id=$6 RETURNING *',
      [name, code, company, department, description, is_active, id]
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
    const result = await db.query(`
      SELECT s.*, c.name as company_name
      FROM shifts s
      LEFT JOIN companies c ON s.company = c.id
      ORDER BY s.created_at DESC
    `);
    console.log(result.rows)
    res.json(result.rows);
  } catch (error) {
    console.log("error in getShifts", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const createShift = async (req, res) => {
  const { shift_name, shift_code, start_time, end_time, grace_period, is_active, company } = req.body;
  console.log(req.body);

  try {
    const result = await db.query(
      'INSERT INTO shifts (shift_name, shift_code, start_time, end_time, grace_period, is_active, company) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [shift_name, shift_code, start_time, end_time, grace_period, is_active, company]
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
    const result = await db.query(`
      SELECT h.*, c.name as company_name
      FROM holidays h
      LEFT JOIN companies c ON h.company = CAST(c.id AS TEXT)
      ORDER BY h.created_at DESC
    `);


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
  // Dates arrive as yyyy-mm-dd from the frontend — pass through directly
  try {
    const result = await db.query(
      'INSERT INTO holidays (name, code, holidaystart, holidayend, company, location, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, code, holidaystart, holidayend, company, location, is_active',
      [name, code, holidaystart || null, holidayend || null, company, location, is_active]
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
  // Dates arrive as yyyy-mm-dd from the frontend — pass through directly
  try {
    const result = await db.query(
      'UPDATE holidays SET name=$1, code=$2, holidaystart=$3, holidayend=$4, company=$5, location=$6, is_active=$7 WHERE id=$8 RETURNING id, name, code, holidaystart, holidayend, company, location, is_active',
      [name, code, holidaystart || null, holidayend || null, company, location, is_active, id]
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
    const result = await db.query(`
      SELECT cc.*, c.name as company_name
      FROM claim_categories cc
      LEFT JOIN companies c ON cc.company = CAST(c.id AS TEXT)
      ORDER BY cc.created_at DESC
    `);
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
    const result = await db.query(`
      SELECT lt.*, c.name as company_name
      FROM leave_types lt
      LEFT JOIN companies c ON lt.company = CAST(c.id AS TEXT)
      ORDER BY lt.created_at DESC
    `);
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
    console.log("Error in get geo fencing :", error.message)
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
    console.log("Error in get employee geofencing :", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ── Location Groups ────────────────────────────────────────────────────────────

export const getLocationGroups = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT lg.*, c.name as company_name
      FROM location_groups lg
      LEFT JOIN companies c ON lg.company = CAST(c.id AS TEXT)
      ORDER BY lg.created_at DESC
    `);
    res.json({ data: result.rows });

  } catch (error) {
    console.error('Error in getLocationGroups:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const createLocationGroup = async (req, res) => {
  const { group_name, company, description, site_manager, time_keeper } = req.body;
  if (!group_name || !company || !description || !site_manager || !time_keeper) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const result = await db.query(
      `INSERT INTO location_groups (group_name, company, description, site_manager, time_keeper)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [group_name, company, description, site_manager, time_keeper]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error in createLocationGroup:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateLocationGroup = async (req, res) => {
  const { id } = req.params;
  const { group_name, company, description, site_manager, time_keeper } = req.body;
  try {
    const result = await db.query(
      `UPDATE location_groups
       SET group_name=$1, company=$2, description=$3, site_manager=$4, time_keeper=$5
       WHERE id=$6 RETURNING *`,
      [group_name, company, description, site_manager, time_keeper, id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Location group not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error in updateLocationGroup:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteLocationGroup = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM location_groups WHERE id=$1 RETURNING id',
      [id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Location group not found.' });
    }
    res.json({ message: 'Location group removed.' });
  } catch (error) {
    console.error('Error in deleteLocationGroup:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// ── Employee Geofencing ────────────────────────────────────────────────────────

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

// ── Employee Categories ────────────────────────────────────────────────────────

export const getEmployeeCategories = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT ec.*, c.name as company_name 
      FROM employee_categories ec
      LEFT JOIN companies c ON ec.company_id = c.id
      ORDER BY ec.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getEmployeeCategories:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const createEmployeeCategory = async (req, res) => {
  const { name, description, is_active, company_id, work_hours } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Category name is required.' });
  }
  try {
    const result = await db.query(
      'INSERT INTO employee_categories (name, description, is_active, company_id, work_hours) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, is_active ?? true, company_id, work_hours]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error in createEmployeeCategory:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateEmployeeCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, is_active, company_id, work_hours } = req.body;
  try {
    const result = await db.query(
      'UPDATE employee_categories SET name=$1, description=$2, is_active=$3, company_id=$4, work_hours=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
      [name, description, is_active, company_id, work_hours, id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Employee category not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error in updateEmployeeCategory:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteEmployeeCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM employee_categories WHERE id=$1 RETURNING id',
      [id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Employee category not found.' });
    }
    res.json({ message: 'Employee category removed.' });
  } catch (error) {
    console.error('Error in deleteEmployeeCategory:', error.message);
    res.status(500).json({ message: error.message });
  }
};
import db from "../lib/db.js";

export const getEmployeeReport = async (req, res) => {
  try {
    const { company, type, location, designation_id, finger } = req.query;

    const conditions = [];
    const params = [];

    if (company) {
      params.push(company);
      conditions.push(`c.id = $${params.length}`);
    }
    if (type) {
      params.push(type);
      conditions.push(`e.type = $${params.length}`);
    }
    if (location) {
      params.push(location);
      conditions.push(`e.location = $${params.length}`);
    }
    if (designation_id) {
      params.push(designation_id);
      conditions.push(`e.designation_id = $${params.length}`);
    }
    if (finger) {
      params.push(Number(finger));
      conditions.push(`e.device_enrollment_id IS NOT NULL`);
      // finger count filter — stored as integer in device_enrollment_id count or separate field
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await db.query(
      `SELECT
        e.id,
        e.company_enrollment_id AS "employeeID",
        e.full_name             AS name,
        c.name                  AS company,
        c.id                    AS company_id,
        e.type                  AS "employeeCategory",
        e.location,
        ds.name                 AS department,
        ds.id                   AS designation_id,
        d.name                  AS department_name,
        d.id                    AS department_id,
        e.is_active,
        e.phone,
        e.dob,
        e.doj,
        e.shift_id,
        s.shift_name,
        e.created_at
       FROM employees e
       LEFT JOIN companies c      ON e.company = CAST(c.id AS int)
       LEFT JOIN designations ds  ON e.designation_id = ds.id
       LEFT JOIN departments d    ON e.department_id = d.id
       LEFT JOIN shifts s         ON e.shift_id = s.id
       ${whereClause}
       ORDER BY e.created_at DESC`,
      params
    );

    return res.json(result.rows);
  } catch (error) {
    console.log("Error in getEmployeeReport:", error.message);
    return res.status(500).json({ message: error.message });
  }
};



export const getEmployees = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.*, 
              d.name as department_name, 
              ds.name as designation_name, 
              s.shift_name,
              c.name as company_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations ds ON e.designation_id = ds.id
       LEFT JOIN shifts s ON e.shift_id = s.id
       LEFT JOIN companies c ON e.company = CAST(c.id AS int)
       ORDER BY e.created_at DESC`
    );


    res.json(result.rows);
  } catch (error) {
    console.log("Error in get employees :", error.message)
    res.status(500).json({ message: error.message });
  }
};

export const createEmployee = async (req, res) => {
  const {
    device_enrollment_id,
    company_enrollment_id,
    full_name,
    mobile,
    dob,
    doj,
    company,
    location,
    designation,
    shift,
    leave_plan,
    first_approver,
    second_approver,
    is_manager,
    type,
    break_hours_friday,
    is_active,
    is_mobile_user,
  } = req.body;

  try {
    const insertResult = await db.query(
      `INSERT INTO employees (
        device_enrollment_id, company_enrollment_id, full_name, phone,
        dob, doj, company, location, leave_plan,
        first_approver, second_approver, is_manager, type,
        friday_break_hours, is_active, is_mobile_user,
        department_id, designation_id, shift_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
      RETURNING id`,
      [
        device_enrollment_id,
        company_enrollment_id,
        full_name,
        mobile,
        dob || null,
        doj || null,
        company,
        location,
        leave_plan,
        first_approver,
        second_approver,
        is_manager ?? false,
        type ?? "User",
        break_hours_friday ?? false,
        is_active ?? false,
        is_mobile_user ?? false,
        req.body.department_id || null,
        req.body.designation_id || null,
        req.body.shift_id || null,
      ]
    );

    const newId = insertResult.rows[0].id;
    const result = await db.query(
      `SELECT e.*, 
              d.name as department_name, 
              ds.name as designation_name, 
              s.shift_name,
              c.name as company_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations ds ON e.designation_id = ds.id
       LEFT JOIN shifts s ON e.shift_id = s.id
       LEFT JOIN companies c ON e.company = CAST(c.id AS int)
       WHERE e.id = $1`,
      [newId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log("Error in create employee :", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const {
    device_enrollment_id,
    company_enrollment_id,
    full_name,
    mobile,
    dob,
    doj,
    company,
    location,
    designation,
    shift,
    leave_plan,
    first_approver,
    second_approver,
    is_manager,
    type,
    break_hours_friday,
    is_active,
    is_mobile_user,
  } = req.body;

  try {
    const updateResult = await db.query(
      `UPDATE employees SET
        device_enrollment_id=$1, company_enrollment_id=$2, full_name=$3,
        phone=$4, dob=$5, doj=$6, company=$7, location=$8,
        leave_plan=$9, first_approver=$10,
        second_approver=$11, is_manager=$12, type=$13,
        friday_break_hours=$14, is_active=$15, is_mobile_user=$16,
        department_id=$17, designation_id=$18, shift_id=$19,
        updated_at=NOW()
      WHERE id=$20 RETURNING id`,
      [
        device_enrollment_id,
        company_enrollment_id,
        full_name,
        mobile,
        dob || null,
        doj || null,
        company,
        location,
        leave_plan,
        first_approver,
        second_approver,
        is_manager ?? false,
        type ?? "User",
        break_hours_friday ?? false,
        is_active ?? false,
        is_mobile_user ?? false,
        req.body.department_id || null,
        req.body.designation_id || null,
        req.body.shift_id || null,
        id,
      ]
    );
    if (!updateResult.rows[0]) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const result = await db.query(
      `SELECT e.*, 
              d.name as department_name, 
              ds.name as designation_name, 
              s.shift_name,
              c.name as company_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations ds ON e.designation_id = ds.id
       LEFT JOIN shifts s ON e.shift_id = s.id
       LEFT JOIN companies c ON e.company = CAST(c.id AS int)
       WHERE e.id = $1`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM employees WHERE id = $1", [id]);
    res.json({ message: "Employee removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

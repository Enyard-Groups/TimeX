import db from "../lib/db.js";

const handleError = (res, error, message) => {
  console.error(`${message}:`, error);
  return res.status(500).json({ error: message, details: error.message });
};

// Helper to convert dd/mm/yyyy to yyyy-mm-dd
const formatToPostgresDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.includes("-")) return dateStr; // Already in yyyy-mm-dd format
  const [day, month, year] = dateStr.split("/");
  if (!day || !month || !year) return dateStr;
  return `${year}-${month}-${day}`;
};

// Leave Report
export const getLeaveReport = async (req, res) => {
  try {
    const { company_id, employee_id, from_date, to_date, status } = req.query;

    const conditions = [];
    const params = [];

    if (company_id) {
      params.push(company_id);
      conditions.push(`e.company = CAST($${params.length} AS int)`);
    }
    if (employee_id) {
      params.push(employee_id);
      conditions.push(`lr.employee_id = $${params.length}`);
    }
    if (from_date) {
      params.push(formatToPostgresDate(from_date));
      conditions.push(`lr.start_date >= $${params.length}`);
    }
    if (to_date) {
      params.push(formatToPostgresDate(to_date));
      conditions.push(`lr.end_date <= $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`lr.status = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await db.query(
      `SELECT 
        lr.*, 
        e.full_name AS employee_name,
        e.company_enrollment_id AS employee_code,
        c.name AS company_name
      FROM leave_requests lr
      LEFT JOIN employees e ON lr.employee_id = e.company_enrollment_id
      LEFT JOIN companies c ON e.company = CAST(c.id AS int)
      ${whereClause}
      ORDER BY lr.created_at DESC`,
      params
    );
    console.log(result.rows);

  } catch (error) {
    return handleError(res, error, "Error in getLeaveReport");
  }
};

// Leave Requests
export const getLeaveRequests = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT 
        lr.*, 
        e.full_name AS employee_name, 
        e.company_enrollment_id AS "idNo",
        c.name AS company_name
      FROM leave_requests lr
      LEFT JOIN employees e 
        ON lr.employee_id = e.company_enrollment_id
      LEFT JOIN companies c 
        ON e.company = c.id
    `; // ❌ removed semicolon here

    const params = [];

    if (status) {
      query += ` WHERE lr.status = $1`;
      params.push(status);
    }

    query += ` ORDER BY lr.created_at DESC`; // ✅ now valid

    const result = await db.query(query, params);
    console.log(result.rows);
    return res.json(result.rows);

  } catch (error) {
    return handleError(res, error, "Error in getLeaveRequests");
  }
};
export const createLeaveRequest = async (req, res) => {
  const {
    employee_id,
    leave_type,
    start_date,
    end_date,
    resume_date,
    reason,
    contact_number,
    email,
    is_half_day,
    number_of_days,
    pending_days,
    pendingDays,
    leave_balance,
    leaveBalance,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO leave_requests (
        employee_id, leave_type, start_date, end_date, resume_date, 
        reason, contact_number, email, is_half_day, number_of_days,
        pending_days, leave_balance
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        employee_id,
        leave_type,
        formatToPostgresDate(start_date),
        formatToPostgresDate(end_date),
        formatToPostgresDate(resume_date),
        reason,
        contact_number,
        email,
        is_half_day,
        number_of_days,
        pending_days || pendingDays,
        leave_balance || leaveBalance,
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return handleError(res, error, "Error in createLeaveRequest");
  }
};

export const updateLeaveRequest = async (req, res) => {
  const { id } = req.params;
  const {
    employee_id,
    leave_type,
    start_date,
    end_date,
    resume_date,
    reason,
    contact_number,
    email,
    is_half_day,
    number_of_days,
    pending_days,
    pendingDays,
    leave_balance,
    leaveBalance,
    status,
    remarks,
    rejectedreason,
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE leave_requests SET 
        employee_id = COALESCE($1, employee_id), 
        leave_type = COALESCE($2, leave_type), 
        start_date = COALESCE($3, start_date), 
        end_date = COALESCE($4, end_date), 
        resume_date = COALESCE($5, resume_date), 
        reason = COALESCE($6, reason), 
        contact_number = COALESCE($7, contact_number), 
        email = COALESCE($8, email), 
        is_half_day = COALESCE($9, is_half_day), 
        number_of_days = COALESCE($10, number_of_days),
        pending_days = COALESCE($11, pending_days), 
        leave_balance = COALESCE($12, leave_balance), 
        status = COALESCE($13, status),
        remarks = COALESCE($14, remarks),
        rejectedreason = COALESCE($15, rejectedreason),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16 RETURNING *`,
      [
        employee_id,
        leave_type,
        formatToPostgresDate(start_date),
        formatToPostgresDate(end_date),
        formatToPostgresDate(resume_date),
        reason,
        contact_number,
        email,
        is_half_day,
        number_of_days,
        pending_days || pendingDays,
        leave_balance || leaveBalance,
        status,
        remarks,
        rejectedreason,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return handleError(res, error, "Error in updateLeaveRequest");
  }
};

export const bulkUpdateLeaveStatus = async (req, res) => {
  const { ids, status, remarks, rejectedreason } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Invalid or empty IDs list" });
  }

  try {
    const result = await db.query(
      `UPDATE leave_requests SET 
        status = $1, 
        remarks = COALESCE($2, remarks), 
        rejectedreason = COALESCE($3, rejectedreason),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($4) RETURNING *`,
      [status, remarks, rejectedreason, ids]
    );

    return res.json({ message: "Bulk update successful", count: result.rows.length, data: result.rows });
  } catch (error) {
    return handleError(res, error, "Error in bulkUpdateLeaveStatus");
  }
};

export const deleteLeaveRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM leave_requests WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Leave request not found" });
    }
    return res.json({ message: "Leave request deleted successfully" });
  } catch (error) {
    return handleError(res, error, "Error in deleteLeaveRequest");
  }
};

// Claim Report
export const getClaimReport = async (req, res) => {
  try {
    const { company_id, company_enrollment_id, from_date, to_date, status } = req.query;
    console.log(req.query);

    const conditions = [];
    const params = [];

    if (company_id) {
      params.push(company_id);
      conditions.push(`e.company = CAST($${params.length} AS int)`);
    }
    if (company_enrollment_id) {
      params.push(company_enrollment_id);
      conditions.push(`cr.employee_id = $${params.length}`);
    }
    if (from_date) {
      params.push(formatToPostgresDate(from_date));
      conditions.push(`cr.date >= $${params.length}`);
    }
    if (to_date) {
      params.push(formatToPostgresDate(to_date));
      conditions.push(`cr.date <= $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`cr.status = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await db.query(
      `SELECT 
        cr.*, 
        e.full_name AS employee_name,
        e.company_enrollment_id AS employee_code,
        c.name AS company_name
      FROM claim_requests cr
      LEFT JOIN employees e ON cr.employee_id = e.company_enrollment_id
      LEFT JOIN companies c ON e.company = CAST(c.id AS int)
      ${whereClause}
      ORDER BY cr.created_at DESC`,
      params
    );
    return res.json(result.rows);
  } catch (error) {
    return handleError(res, error, "Error in getClaimReport");
  }
};

// Claim Requests
export const getClaimRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
     SELECT 
    cr.*, 
    e.full_name AS employee_name,
    c.name
FROM claim_requests cr
LEFT JOIN employees e 
    ON cr.employee_id = e.company_enrollment_id
LEFT JOIN companies c 
    ON e.company= c.id
    `;
    const params = [];
    if (status) {
      query += ` WHERE cr.status = $1`;
      params.push(status);
    }
    query += ` ORDER BY cr.created_at DESC`;

    const result = await db.query(query, params);
    console.log(result.rows);
    return res.json(result.rows);
  } catch (error) {
    return handleError(res, error, "Error in getClaimRequests");
  }
};

export const createClaimRequest = async (req, res) => {
  const {
    employee_id,
    claim_category,
    date,
    amount,
    purpose,
    remarks,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO claim_requests (
        employee_id, claim_category, date, amount, purpose, remarks
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        employee_id,
        claim_category,
        formatToPostgresDate(date),
        amount,
        purpose,
        remarks,
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return handleError(res, error, "Error in createClaimRequest");
  }
};

export const updateClaimRequest = async (req, res) => {
  const { id } = req.params;
  const {
    employee_id,
    claim_category,
    date,
    amount,
    purpose,
    remarks,
    status,
    rejectedreason,
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE claim_requests SET 
        employee_id = COALESCE($1, employee_id), 
        claim_category = COALESCE($2, claim_category), 
        date = COALESCE($3, date), 
        amount = COALESCE($4, amount), 
        purpose = COALESCE($5, purpose), 
        remarks = COALESCE($6, remarks), 
        status = COALESCE($7, status), 
        rejectedreason = COALESCE($8, rejectedreason),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 RETURNING *`,
      [
        employee_id,
        claim_category,
        date ? formatToPostgresDate(date) : null,
        amount,
        purpose,
        remarks,
        status,
        rejectedreason,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Claim request not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return handleError(res, error, "Error in updateClaimRequest");
  }
};

export const bulkUpdateClaimStatus = async (req, res) => {
  const { ids, status, rejectedreason } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Invalid or empty IDs list" });
  }

  try {
    const result = await db.query(
      `UPDATE claim_requests SET 
        status = $1, 
        rejectedreason = COALESCE($2, rejectedreason),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($3) RETURNING *`,
      [status, rejectedreason, ids]
    );

    return res.json({ message: "Bulk update successful", count: result.rows.length, data: result.rows });
  } catch (error) {
    return handleError(res, error, "Error in bulkUpdateClaimStatus");
  }
};

export const deleteClaimRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM claim_requests WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Claim request not found" });
    }
    return res.json({ message: "Claim request deleted successfully" });
  } catch (error) {
    return handleError(res, error, "Error in deleteClaimRequest");
  }
};

// Business Travel Requests
export const getTravelRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
     SELECT 
    tr.*, 
    e.full_name AS employee_name,
    c.name
FROM business_travel_requests tr
LEFT JOIN employees e 
    ON tr.employee_id = e.company_enrollment_id
LEFT JOIN companies c 
    ON e.company = c.id
    `;
    const params = [];
    if (status) {
      query += ` WHERE tr.status = $1`;
      params.push(status);
    }
    query += ` ORDER BY tr.created_at DESC`;

    const result = await db.query(query, params);
    return res.json(result.rows);
  } catch (error) {
    return handleError(res, error, "Error in getTravelRequests");
  }
};

export const createTravelRequest = async (req, res) => {
  const {
    employee_id,
    start_date,
    end_date,
    purpose,
    remarks,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO business_travel_requests (
        employee_id, start_date, end_date, purpose, remarks
      ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        employee_id,
        formatToPostgresDate(start_date),
        formatToPostgresDate(end_date),
        purpose,
        remarks,
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log("Error in create  travel request :", error.message);
    return handleError(res, error, "Error in createTravelRequest");
  }
};

export const updateTravelRequest = async (req, res) => {
  const { id } = req.params;
  const {
    employee_id,
    start_date,
    end_date,
    purpose,
    remarks,
    status,
    rejectedreason,
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE business_travel_requests SET 
        employee_id = COALESCE($1, employee_id), 
        start_date = COALESCE($2, start_date), 
        end_date = COALESCE($3, end_date), 
        purpose = COALESCE($4, purpose), 
        remarks = COALESCE($5, remarks), 
        status = COALESCE($6, status), 
        rejectedreason = COALESCE($7, rejectedreason),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 RETURNING *`,
      [
        employee_id,
        start_date ? formatToPostgresDate(start_date) : null,
        end_date ? formatToPostgresDate(end_date) : null,
        purpose,
        remarks,
        status,
        rejectedreason,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Travel request not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return handleError(res, error, "Error in updateTravelRequest");
  }
};

export const bulkUpdateTravelStatus = async (req, res) => {
  const { ids, status, rejectedreason } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Invalid or empty IDs list" });
  }

  try {
    const result = await db.query(
      `UPDATE business_travel_requests SET 
        status = $1, 
        rejectedreason = COALESCE($2, rejectedreason),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($3) RETURNING *`,
      [status, rejectedreason, ids]
    );

    return res.json({ message: "Bulk update successful", count: result.rows.length, data: result.rows });
  } catch (error) {
    return handleError(res, error, "Error in bulkUpdateTravelStatus");
  }
};

export const deleteTravelRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM business_travel_requests WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Travel request not found" });
    }
    return res.json({ message: "Travel request deleted successfully" });
  } catch (error) {
    return handleError(res, error, "Error in deleteTravelRequest");
  }
};

// WFH Report
export const getWfhReport = async (req, res) => {
  try {
    const { company_id, company_enrollment_id, from_date, to_date, status } = req.query;
    console.log(req.query);

    const conditions = [];
    const params = [];

    if (company_id) {
      params.push(company_id);
      conditions.push(`e.company = CAST($${params.length} AS int)`);
    }
    if (company_enrollment_id) {
      params.push(company_enrollment_id);
      conditions.push(`w.employee_id = $${params.length}`);
    }
    if (from_date) {
      params.push(formatToPostgresDate(from_date));
      conditions.push(`w.start_date >= $${params.length}`);
    }
    if (to_date) {
      params.push(formatToPostgresDate(to_date));
      conditions.push(`w.end_date <= $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`w.status = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await db.query(
      `SELECT 
        w.*, 
        e.full_name AS employee_name,
        e.company_enrollment_id AS employee_code,
        c.name AS company_name
      FROM wfh_requests w
      LEFT JOIN employees e ON w.employee_id = e.company_enrollment_id
      LEFT JOIN companies c ON e.company = CAST(c.id AS int)
      ${whereClause}
      ORDER BY w.created_at DESC`,
      params
    );
    return res.json(result.rows);
  } catch (error) {
    return handleError(res, error, "Error in getWfhReport");
  }
};

// WFH Requests
export const getWfhRequests = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT w.*, e.full_name as employee_name, e.company_enrollment_id as "idNo"
      FROM wfh_requests w
      LEFT JOIN employees e ON w.employee_id = e.company_enrollment_id  
      ORDER BY w.created_at DESC
    `);
    return res.json(result.rows);
  } catch (error) {
    return handleError(res, error, "Error in getWfhRequests");
  }
};

export const createWfhRequest = async (req, res) => {
  const {
    employee_id,
    start_date,
    end_date,
    number_of_days,
    reason,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO wfh_requests (
        employee_id, request_date, start_date, end_date, number_of_days, reason
      ) VALUES ($1, CURRENT_DATE, $2, $3, $4, $5) RETURNING *`,
      [
        employee_id,
        formatToPostgresDate(start_date),
        formatToPostgresDate(end_date),
        number_of_days,
        reason,
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log("Error in create wfh request :", error.message);
    return handleError(res, error, "Error in createWfhRequest");
  }
};

export const updateWfhRequest = async (req, res) => {
  const { id } = req.params;
  const {
    employee_id,
    start_date,
    end_date,
    number_of_days,
    reason,
    status,
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE wfh_requests SET 
        employee_id = $1, start_date = $2, end_date = $3, number_of_days = $4, 
        reason = $5, status = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 RETURNING *`,
      [
        employee_id,
        formatToPostgresDate(start_date),
        formatToPostgresDate(end_date),
        number_of_days,
        reason,
        status,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "WFH request not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return handleError(res, error, "Error in updateWfhRequest");
  }
};

export const bulkUpdateWfhStatus = async (req, res) => {
  const { ids, status, rejectedreason } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Invalid or empty IDs list" });
  }

  try {
    const result = await db.query(
      `UPDATE wfh_requests SET 
        status = $1, 
        rejectedreason = COALESCE($2, rejectedreason),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($3) RETURNING *`,
      [status, rejectedreason, ids]
    );

    return res.json({ message: "Bulk update successful", count: result.rows.length, data: result.rows });
  } catch (error) {
    return handleError(res, error, "Error in bulkUpdateWfhStatus");
  }
};

export const deleteWfhRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM wfh_requests WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "WFH request not found" });
    }
    return res.json({ message: "WFH request deleted successfully" });
  } catch (error) {
    return handleError(res, error, "Error in deleteWfhRequest");
  }
};

// Manual Entry Report
export const getManualEntryReport = async (req, res) => {
  try {
    const { company_id, company_enrollment_id, status, location, designation_id, from_date, to_date } = req.query;
    console.log(req.query);

    const conditions = [];
    const params = [];

    if (company_id) {
      params.push(company_id);
      conditions.push(`c.id = $${params.length}`);
    }
    if (company_enrollment_id) {
      params.push(company_enrollment_id);
      conditions.push(`m.employee_id = $${params.length}`);
    }
    if (location) {
      params.push(location);
      conditions.push(`m.location = $${params.length}`);
    }
    if (designation_id) {
      params.push(designation_id);
      conditions.push(`e.designation_id = $${params.length}`);
    }
    if (from_date) {
      params.push(formatToPostgresDate(from_date));
      conditions.push(`m.created_at::date >= $${params.length}`);
    }
    if (to_date) {
      params.push(formatToPostgresDate(to_date));
      conditions.push(`m.created_at::date <= $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`m.status = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await db.query(
      `SELECT
        m.id,
        m.employee_id,
        m.location,
        gm.name                 AS location_name,
        CAST(m.in_time  AS TEXT) AS in_time,
        CAST(m.out_time AS TEXT) AS out_time,
        m.reason,
        m.remarks,
        m.rejectedreason,
        m.status,
        m.created_at,
        e.full_name             AS employee_name,
        e.company_enrollment_id AS employee_code,
        e.type                  AS employee_category,
        c.name                  AS company_name,
        c.id                    AS company_id,
        ds.name                 AS designation,
        d.name                  AS department
       FROM manual_entry_requests m
       LEFT JOIN employees e     ON m.employee_id = e.company_enrollment_id
       LEFT JOIN geofencing_masters gm ON m.location = gm.id
       LEFT JOIN companies c     ON e.company = CAST(c.id AS int)
       LEFT JOIN designations ds  ON e.designation_id = ds.id
       LEFT JOIN departments d    ON e.department_id = d.id
       ${whereClause}
       ORDER BY m.created_at DESC`,
      params
    );

    return res.json(result.rows);
  } catch (error) {
    console.log("Error in getManualEntryReport:", error.message);
    return handleError(res, error, "Error in getManualEntryReport");
  }
};

// Manual Entry Requests
export const getManualRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT 
        m.*, 
        e.full_name             AS employee_name,
        e.type                  AS employee_category,
        gm.name                 AS location_name,
        c.name                  AS company_name,
        ds.name                 AS designation_name,
        s.shift_name            AS shift_name,
        d.name                  AS department
      FROM manual_entry_requests m
      LEFT JOIN employees e     ON m.employee_id = e.company_enrollment_id
      LEFT JOIN geofencing_masters gm ON m.location = gm.id
      LEFT JOIN companies c     ON e.company = CAST(c.id AS int)
      LEFT JOIN designations ds  ON e.designation_id = ds.id
      LEFT JOIN shifts s         ON e.shift_id = s.id
      LEFT JOIN departments d    ON e.department_id = d.id
    `;
    const params = [];
    if (status) {
      query += ` WHERE m.status = $1`;
      params.push(status);
    }
    query += ` ORDER BY m.created_at DESC`;

    const result = await db.query(query, params);
    return res.json(result.rows);
  } catch (error) {
    return handleError(res, error, "Error in getManualRequests");
  }
};

export const createManualRequest = async (req, res) => {
  const {
    employee_id,
    location,
    in_time,
    out_time,
    remarks,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO manual_entry_requests (
        employee_id, location, in_time, out_time, remarks, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, 'Pending', CURRENT_TIMESTAMP) RETURNING *`,
      [
        employee_id,
        location || null,
        new Date(in_time).toISOString().split('T')[1].split('.')[0],
        new Date(out_time).toISOString().split('T')[1].split('.')[0],
        remarks,
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return handleError(res, error, "Error in createManualRequest");
  }
};

export const updateManualRequest = async (req, res) => {
  const { id } = req.params;
  const {
    employee_id,
    location,
    in_time,
    out_time,
    remarks,
    status,
    rejectedreason,
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE manual_entry_requests SET 
        employee_id = COALESCE($1, employee_id),
        location = COALESCE($2, location),
        in_time = COALESCE($3, in_time),
        out_time = COALESCE($4, out_time),
        remarks = COALESCE($5, remarks),
        status = COALESCE($6, status),
        rejectedreason = COALESCE($7, rejectedreason),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 RETURNING *`,
      [
        employee_id || null,
        location || null,
        in_time || null,
        out_time || null,
        remarks || null,
        status || null,
        rejectedreason || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Manual request not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return handleError(res, error, "Error in updateManualRequest");
  }
};

export const bulkUpdateManualStatus = async (req, res) => {
  const { ids, status, rejectedreason } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Invalid or empty IDs list" });
  }

  try {
    const result = await db.query(
      `UPDATE manual_entry_requests SET 
        status = $1, 
        rejectedreason = COALESCE($2, rejectedreason),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($3) RETURNING *`,
      [status, rejectedreason, ids]
    );

    return res.json({ message: "Bulk update successful", count: result.rows.length, data: result.rows });
  } catch (error) {
    return handleError(res, error, "Error in bulkUpdateManualStatus");
  }
};

export const deleteManualRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM manual_entry_requests WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Manual request not found" });
    }
    return res.json({ message: "Manual request deleted successfully" });
  } catch (error) {
    return handleError(res, error, "Error in deleteManualRequest");
  }
};

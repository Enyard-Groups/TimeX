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
    const result = await db.query('SELECT * FROM holidays ORDER BY holiday_date ASC');
    res.json(result.rows);
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


export const getIssueTypes = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM issue_types ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createIssueType = async (req, res) => {
  const { type_name, code, description, is_active } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO issue_types (type_name, code, description, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
      [type_name, code, description, is_active],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateIssueType = async (req, res) => {
  const { id } = req.params;
  const { type_name, code, description, is_active } = req.body;
  try {
    const result = await db.query(
      'UPDATE issue_types SET type_name=$1, code=$2, description=$3, is_active=$4 WHERE id=$5 RETURNING *',
      [type_name, code, description, is_active, id],
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
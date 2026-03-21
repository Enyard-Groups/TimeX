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

// ─── Location Groups ────────────────────────────────────────────────────────

export const getLocationGroups = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM location_groups ORDER BY created_at DESC'
    );
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createLocationGroup = async (req, res) => {
  const {
    group_name,
    description,
    time_keeper,
    site_manager,
    company,
  } = req.body;

  if (!group_name || !company) {
    return res.status(400).json({ message: 'locationgroupname and company are required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO location_groups
        (group_name, description, time_keeper, site_manager, company)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [group_name,description, time_keeper, site_manager, company]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLocationGroup = async (req, res) => {
  const { id } = req.params;
  const {
    group_name,
    description,
    time_keeper,
    site_manager,
    company,
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE location_groups
       SET group_name=$1,
           description=$2,
           time_keeper=$3,
           site_manager=$4,
           company=$5
       WHERE id=$6
       RETURNING *`,
      [group_name,description, time_keeper, site_manager, company, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Location group not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLocationGroup = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM location_groups WHERE id=$1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Location group not found' });
    }
    res.json({ message: 'Location group deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
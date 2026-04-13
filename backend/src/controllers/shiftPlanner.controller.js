import db from "../lib/db.js";

export const getRoster = async (req, res) => {
  const { employee_id, start_date, end_date } = req.query;
  try {
    let query = `
      SELECT r.*, s.shift_name, s.start_time, s.end_time, e.full_name as employee_name, g.name as location_name
      FROM shift_roster r
      LEFT JOIN shifts s ON r.shift_id = s.id
      LEFT JOIN employees e ON r.employee_id = e.id
      LEFT JOIN geofencing_masters g ON r.location_id = g.id
      WHERE 1=1
    `;
    const params = [];

    if (employee_id) {
      params.push(employee_id);
      query += ` AND r.employee_id = $${params.length}`;
    }
    if (start_date && end_date) {
      params.push(start_date);
      query += ` AND r.roster_date >= $${params.length}`;
      params.push(end_date);
      query += ` AND r.roster_date <= $${params.length}`;
    }

    query += ` ORDER BY r.roster_date ASC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error in getRoster:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const assignRoster = async (req, res) => {
  const { employee_id, location_id, roster } = req.body;
  // roster is expected to be an object: { "dd/mm/yyyy": shift_id }

  if (!employee_id || !roster) {
    return res.status(400).json({ message: "Employee ID and roster data are required" });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    for (const [dateStr, shift_id] of Object.entries(roster)) {
      if (!shift_id) continue;

      // Convert dd/mm/yyyy to yyyy-mm-dd
      const [d, m, y] = dateStr.split("/");
      const isoDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;

      await client.query(
        `INSERT INTO shift_roster (employee_id, location_id, shift_id, roster_date)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (employee_id, roster_date)
         DO UPDATE SET shift_id = EXCLUDED.shift_id, location_id = EXCLUDED.location_id`,
        [employee_id, location_id, shift_id, isoDate]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Roster assigned successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in assignRoster:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

export const bulkAssignRoster = async (req, res) => {
  const { rosters } = req.body;
  // rosters is expected to be an array of: { employee_enrollment_id, location_id, roster: { "dd/mm/yyyy": shift_id } }

  if (!rosters || !Array.isArray(rosters)) {
    return res.status(400).json({ message: "Invalid roster data" });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    for (const item of rosters) {
      const { employee_enrollment_id, location_id, roster } = item;

      // Find employee ID by enrollment ID
      const empRes = await client.query(
        "SELECT id FROM employees WHERE company_enrollment_id = $1",
        [employee_enrollment_id]
      );

      if (empRes.rows.length === 0) continue;
      const employee_id = empRes.rows[0].id;

      for (const [dateStr, shift_id] of Object.entries(roster)) {
        if (!shift_id) continue;

        // Convert dd/mm/yyyy to yyyy-mm-dd
        const [d, m, y] = dateStr.split("/");
        const isoDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;

        await client.query(
          `INSERT INTO shift_roster (employee_id, location_id, shift_id, roster_date)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (employee_id, roster_date)
           DO UPDATE SET shift_id = EXCLUDED.shift_id, location_id = EXCLUDED.location_id`,
          [employee_id, location_id, shift_id, isoDate]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Bulk roster assigned successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in bulkAssignRoster:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

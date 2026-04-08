import db from "../lib/db.js";

export const getVisitorBooking = async (req, res) => {

  try {

    const result = await db.query(`
      SELECT vb.*, e.full_name as host_full_name, c.name as company_name 
      FROM visitor_bookings vb
      LEFT JOIN employees e ON vb.host_employee_id = e.id
      LEFT JOIN companies c ON vb.company = CAST(c.id AS TEXT)
      ORDER BY vb.visit_date DESC, vb.visit_time DESC
       `);

    return res.json(result.rows);

  }
  catch (error) {

    console.log("error in getVisitorBooking", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const createVisitorBooking = async (req, res) => {
  const {
    visitor_name,
    mobile_no,
    email,
    purpose_of_visit,
    company,
    visit_date,
    visit_time,
    point_of_contact,
    cicpa_card_no,
    company_code,
    cicpa_expiry_date,
    id_type,
    id_number,
    nationality,
    id_expiry_date,
    access_card,
    is_permanent
  } = req.body;



  console.log(req.body)
  try {
    const result = await db.query(
      `INSERT INTO visitor_bookings (
        visitor_name, mobile_no, email, purpose_of_visit, company, 
        visit_date, visit_time, point_of_contact, cicpa_card_no, 
        company_code, cicpa_expiry_date, id_type, id_number, 
        nationality, id_expiry_date, access_card, is_permanent, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
      [
        visitor_name, mobile_no, email, purpose_of_visit, company,
        visit_date, visit_time, point_of_contact, cicpa_card_no,
        company_code, cicpa_expiry_date, id_type, id_number,
        nationality, id_expiry_date, access_card, is_permanent, 'booked'
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    // console.log("Erro in post visistor :", error.message)
    res.status(500).json({ message: error.message });
  }
};

export const getVisitors = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT v.*, c.name as company_name
      FROM visitors v
      LEFT JOIN companies c ON v.company = CAST(c.id AS TEXT)
      ORDER BY v.created_at DESC
    `);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateVisitorBooking = async (req, res) => {
  const { id } = req.params;
  const {
    visitor_name,
    mobile_no,
    email,
    purpose_of_visit,
    company,
    visit_date,
    visit_time,
    point_of_contact,
    cicpa_card_no,
    company_code,
    cicpa_expiry_date,
    id_type,
    id_number,
    nationality,
    id_expiry_date,
    access_card,
    is_permanent,
    status
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE visitor_bookings SET 
        visitor_name=$1, mobile_no=$2, email=$3, purpose_of_visit=$4, 
        company=$5, visit_date=$6, visit_time=$7, point_of_contact=$8, 
        cicpa_card_no=$9, company_code=$10, cicpa_expiry_date=$11, 
        id_type=$12, id_number=$13, nationality=$14, id_expiry_date=$15, 
        access_card=$16, is_permanent=$17, status=$18 
      WHERE id=$19 RETURNING *`,
      [
        visitor_name, mobile_no, email, purpose_of_visit, company,
        visit_date, visit_time, point_of_contact, cicpa_card_no,
        company_code, cicpa_expiry_date, id_type, id_number,
        nationality, id_expiry_date, access_card, is_permanent, status || 'booked', id
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Visitor booking not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteVisitorBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM visitor_bookings WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Visitor booking not found" });
    }
    res.json({ message: 'Visitor booking removed', id: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
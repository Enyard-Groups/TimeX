import db from "../lib/db.js";

export const getCompanies = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM companies ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.log("error in getcompanies",error.message);
    res.status(500).json({ message: error.message });
  }
};

export const createCompany = async (req, res) => {
  const { name, code, description, is_active } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO companies (name, code, description, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, code, description, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("error in createcompany",error.message);
  }
};

export const updateCompany = async (req, res) => {
  const { id } = req.params;
  const { name, code, description, is_active } = req.body;
  try {
    const result = await db.query(
      'UPDATE companies SET name=$1, code=$2, description=$3, is_active=$4 WHERE id=$5 RETURNING *',
      [name, code, description, is_active, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCompany = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM companies WHERE id = $1', [id]);
    res.json({ message: 'Company removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


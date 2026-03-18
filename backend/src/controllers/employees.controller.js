import db from "../lib/db.js";



export const getEmployees = async(req,res)=>{

  try{

     const result = await db.query(`
      SELECT e.*, d.name as department_name, des.name as designation_name, s.shift_name 
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations des ON e.designation_id = des.id
      LEFT JOIN shifts s ON e.shift_id = s.id
      ORDER BY e.created_at DESC
    `);
    res.json(result.rows);


  }
  catch(error){

    res.status(500).json({message: error.message});

  
  }
}

export const createEmployee = async (req, res) => {
  const { enrollment_id, first_name, last_name, email, phone, department_id, designation_id, shift_id, doj, is_active } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO employees (enrollment_id, first_name, last_name, email, phone, department_id, designation_id, shift_id, doj, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [enrollment_id, first_name, last_name, email, phone, department_id, designation_id, shift_id, doj, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { enrollment_id, first_name, last_name, email, phone, department_id, designation_id, shift_id, doj, is_active } = req.body;
  try {
    const result = await db.query(
      'UPDATE employees SET enrollment_id=$1, first_name=$2, last_name=$3, email=$4, phone=$5, department_id=$6, designation_id=$7, shift_id=$8, doj=$9, is_active=$10 WHERE id=$11 RETURNING *',
      [enrollment_id, first_name, last_name, email, phone, department_id, designation_id, shift_id, doj, is_active, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM employees WHERE id = $1', [id]);
    res.json({ message: 'Employee removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


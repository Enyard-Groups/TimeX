import db from "../lib/db.js";

export const getVisitorBooking= async(req,res)=>{

  try{

    const result=await db.query(`
       SELECT vb.*, e.first_name as host_first_name, e.last_name as host_last_name 
      FROM visitor_bookings vb
      LEFT JOIN employees e ON vb.host_employee_id = e.id
      ORDER BY vb.visit_date DESC, vb.visit_time DESC
       `);

       return res.json(result.rows);

  }
  catch(error){

    console.log("error in getVisitorBooking",error.messagae);
    return res.status(500).json({message:"Internal server error"});
  }
}

export const createVisitorBooking=async(req,res)=>{

 const { visitor_name, contact_no, host_employee_id, purpose, visit_date, visit_time, status } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO visitor_bookings (visitor_name, contact_no, host_employee_id, purpose, visit_date, visit_time, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [visitor_name, contact_no, host_employee_id, purpose, visit_date, visit_time, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  
};

export const getVisitors=async (req,res)=>{

  try{
    const result=await db.query('select*from visitors order by created_at desc');

      return res.json(result.rows);

  }
  catch(error){
  return res.status(500).json({message:"Internal server error"});


  }
};
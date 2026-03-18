import db from "../lib/db.js";

export const getleaveRequests=async(req,res)=>{

  try{

    const result=await db.query(`
      SELECT lr.*, e.first_name, e.last_name, e.enrollment_id 
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      ORDER BY lr.created_at DESC
      `);
      return res.json(result.rows);
    }

  catch(error){

    console.log("error in getLeaveRequest", error.message);
    return res.status(500).json({message})
  }
}

export const createLeaveRequest=async(req,res)=>{

  const {employee_id, leave_type, start_date, end_date, reason}= req.body;

  try{
    const result=await db.query(`
      insert into leave_requests(employee_id, leave_type, start_date, end_date, reason) values($1, $2, $3, $4, $5) returning * `,
      [employee_id, leave_type, start_date, end_date, reason]

    );
    return res.status(201).json(result.rows[0]);

  }

  catch(error){
    console.log("error in crateleaveRequest",error.message);
    return res.status(500).json({message:"Internal server errors"});
  }
}



export const getWfhRequests=async(req,res)=>{

  try{

    const result=await db.query('SELECT * FROM wfh_requests ORDER BY created_at DESC');
    return res.status(200).json(result.rows);



  }
  catch(error){
    console.log("Error in get wfh requets:",errro.message);
    return res.status(500).json({message:"Internal server error"});
  }
}

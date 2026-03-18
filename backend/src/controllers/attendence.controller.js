import db from "../lib/db.js";

export const getAttendenceLogs= async(req,res)=>{

  try{

 const result = await db.query(`
      SELECT al.*, e.first_name, e.last_name, e.enrollment_id, d.device_name 
      FROM attendance_logs al
      JOIN employees e ON al.employee_id = e.id
      LEFT JOIN devices d ON al.device_id = d.id
      ORDER BY al.log_timestamp DESC
    `);
 return res.status(200).json(result.rows);

  }

  catch(error){
    console.log("Error in get attendence:",error.message);
   return  res.status(500).json({message:"Internal server error"})
  }
}


export const createAttendenceLog = async(req,res)=>{

  const {employee_id, log_timestamp, device_id, log_type, source} = req.body;

  try{

     const result = await db.query(
      'INSERT INTO attendance_logs (employee_id, log_timestamp, device_id, log_type, source) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [employee_id, log_timestamp, device_id, log_type, source]
    );
    return res.status(201).json(result.rows[0]);
  }
  catch(error){
    console.log("Error in createAttendanceLog ",error.message);

    return res.status(500).json({message:"Internal server error"});
  }
  
}

export const getDashboardStats=async(req,res)=>{

  try{

     const totalEmployees = await db.query('SELECT COUNT(*) FROM employees');
    const presentToday = await db.query("SELECT COUNT(DISTINCT employee_id) FROM attendance_logs WHERE log_timestamp::date = CURRENT_DATE");
    const totalDevices = await db.query('SELECT COUNT(*) FROM devices');
    const pendingRequests = await db.query("SELECT COUNT(*) FROM leave_requests WHERE status = 'Pending'");

    return res.json({
       totalEmployees: totalEmployees.rows[0].count,
      presentToday: presentToday.rows[0].count,
      totalDevices: totalDevices.rows[0].count,
      pendingRequests: pendingRequests.rows[0].count,
    });


  }
  catch(error){
    console.log("error in getDashboardstatus",error.message);

    return res.status(500).json({message:"Internal server error"});

  }

}


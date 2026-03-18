import db from "../lib/db.js";

export const  getDevices = async(req,res)=>{

  try{

    const result=await db.query(`
      SELECT d.*, lg.group_name, dm.model_name 
      FROM devices d
      LEFT JOIN location_groups lg ON d.location_group_id = lg.id
      LEFT JOIN device_models dm ON d.model_id = dm.id
      ORDER BY d.created_at DESC
    `);

    return res.json(result.rows);
      
    }

  catch(error){
    console.log("error in getDevices",error.message);
return res.status(500).json({message:"Internal server error"});

  }
};

export const createDevice=async(req,res)=>{
  const {device_name, serial_number, ip_address, port, location_group_id, model_id, status}=req.body;

  try{
    const result = await db.query(`
      insert into devices (device_name, serial_number, ip_address, port, location_group_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,

      [device_name, serial_number, ip_address, port, location_group_id, model_id, status]
    );
    return res.status(201).json(result.rows[0]);

   }
  catch(error){
    console.log("error in createDevice",error.message);
    return res.status(500).json({messsage:"Internal server error"});
  }
}

export const getDeviceModels= async(req,res)=>{

try{

const result= await db.query('SELECT * FROM device_models ORDER BY created_at DESC');
return res.json(result.rows);
}
catch(error){
  console.log("error in getDevicemodel", error.message);
  return res.json(500).json({message:"Internal server error"});
}

}


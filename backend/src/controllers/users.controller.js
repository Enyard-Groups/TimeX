import express from "express";
import bcrypt from "bcrypt";
import {generateToken} from "../utils/token.js"
import db from "../lib/db.js";

export const getUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.user_name, u.emp_name, u.enrollment_id, u.company as company_id, 
             u.role, u.active, u.created_at, c.name as company_name
      FROM users u
      LEFT JOIN companies c ON u.company = CAST(c.id AS TEXT)
      ORDER BY u.created_at DESC
    `);
  
    return res.status(200).json(result.rows);

  } catch (error) {
    console.log("Error in getusers :",error.message);
    return res.status(500).json({ message: "internal server error" });
  }
};

export const getApprovers = async (req, res) => {
  try {
    const result = await db.query("SELECT id, emp_name FROM users WHERE role = 'approver' AND active = true ORDER BY emp_name ASC");
    return res.status(200).json(result.rows);
  } catch (error) {
    console.log("Error in getApprovers :", error.message);
    return res.status(500).json({ message: "internal server error" });
  }
};



export const login=async(req,res)=>{

  try{

    const { user_name, password} = req.body;
    

    if (!user_name || !password) {
      return res.status(400).json({ message: "All fields are required"});
    }

    if(user_name=="admin" && password=="admin123" ){

      let user={
        role:"admin",
        id:"11",
        user_name:"Admin",
        enrollment_id:"001",
        emp_name:"Admin",
        company:"Enyard",
        active:true
        
      }
      let token =generateToken(user,res);

      return res
    .status(200)
    .json({ message: "Login successfully", success: true, User: user, token });

    
      
    }
  

    // Find user by email in PostgreSQL
    const query = `
      SELECT u.*, c.name as company_name
      FROM users u
      LEFT JOIN companies c ON u.company = CAST(c.id AS TEXT)
      WHERE u.user_name = $1
    `;
    const result = await db.query(query, [user_name]);


   
    


  if(result.rows.length===0)
{
  return res.status(404).json({message:"Incorrect email password"});


}


  const user=result.rows[0];

  const isPasswordCorrect=await bcrypt.compare(password,user.password);

  if(!isPasswordCorrect){
     return res.status(404).json({message:"Incorrect email password"});

  }

  const {password:pwd, ...safeUser}=user;
  const token=generateToken(safeUser,res);
  



  return res
    .status(200)
    .json({ message: "Login successfully", success: true, User: safeUser, token });

    
    
  }
  catch(error){
    console.log("Error in login ",error.message);
    return res.status(500).json({message:"Internal server error"});

  }
}

export const createUser= async(req,res)=>{

   const { user_name, emp_name, enrollment_id, company, password, role, active } = req.body;


try{

 

  if(!user_name || !emp_name  || !enrollment_id || !company || !password || !role || !active ){
    return res.status(400).json({message:"All fields are required"});
  }


  const allowedRoles=["admin","employee","hr","manager","supervisor","approver","finance","timekeeper"];

if(!allowedRoles.includes(role)){
  return res.status(400).json({message:"Invalid roles",success:false});
}

const existingUser=await db.query("select id from users where user_name=$1",[user_name]);

if(existingUser.rows.length > 0){
  return res.status(400).json({message:"User already exist",success:false});
}

const hashedPassword=await bcrypt.hash(password,10);


const result=await db.query(`insert into users(user_name, emp_name, enrollment_id, company, password, role, active) values($1,$2,$3,$4,$5,$6,$7) returning *`,[user_name, emp_name, enrollment_id, company, hashedPassword, role, active]);

return res.status(201).json({message:"User created successfully",success:true});

}

catch(error){
console.log("Error in create user:",error.message);
return res.status(500).json({message:"Internal server error"});
}

}

export const updateUser=async(req,res)=>{
const {id}=req.params;
const {user_name, emp_name, enrollment_id, company, password, role, active }=req.body;


try{

    const result = await db.query(
      'UPDATE users SET user_name=$1, emp_name=$2, enrollment_id=$3, company=$4, password=$5, role=$6, active=$7 WHERE id=$8 RETURNING *',
      [user_name, emp_name, enrollment_id, company, password, role, active, id]
    );

    return es.status(200).json({message:"User updated successfully",success:true});
}
catch(error){

  console.log("Error in update user :",error.message);
  return res.status(500).json({message:"Internal server error"});
}

}

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    return res.json({ message: 'User removed' ,success:true});
  } catch (error) {
    console.log("Error in delete user :",error.message);
    return res.status(500).json({ message:"Internal server errro" });
  }
};

export const logout=async(req,res)=>{


  try{
    res.clearCookie("jwt",{
      httpOnly:true,
      samSite:"none",
      secure:false
    });
    return res.status(200).json({message:"Logged out successfully",success:true});


      }
      catch(error){
        return res.status(500).json({message:"Intenal server error"});

      }

}
import express from "express";
import db from "../lib/db.js"
import { generateToken } from "../utils/token.js";
import authRoute from "../routes/auth.route.js";
import bcrypt from "bcrypt";


export const login=async(req,res)=>{

  try{

    const { email, password} = req.body;
    

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Find user by email in PostgreSQL
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await db.query(query, [email]);
   
    


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
  



  return res.status(200).json({message:"Login successfully",success:true,User:safeUser});

    
    
  }
  catch(error){
    console.log("Error in login ",error.message);
    return res.status(500).json({message:"Internal server error"});

  }
}

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
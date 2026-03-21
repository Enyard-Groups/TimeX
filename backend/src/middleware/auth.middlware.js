import jwt from "jsonwebtoken";

 export const protectRoute=async(req,res,next)=>{


try{

  // const token=req.cookies.jwt;
  const authHeader=req.headers.authorization;
  const token=authHeader.split(" ")[1];

  if(!token){

    return res.status(401).json({message:"Unauthorized access",success:false});
  }
  const decoded=jwt.verify(token,process.env.JWT_SECRET);
 



  if(!decoded){
    return res.status(401).json({message:"Invalid token"});
  }
  req.user=decoded;

  next();

}


catch(error){
  console.log("Error in middleware ",error.message);
  return res.status(500).json({message:"Internal server error"});
  

}



 }
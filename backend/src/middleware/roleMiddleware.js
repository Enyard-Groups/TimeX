import express from 'express';


const authorizeRoles=(...roles)=>{
  


return (req,res,next)=>{
  console.log(req.user);
  if( !roles.includes(req.user.role))
  {
return res.status(403).json({message:"Access denied",Success:false});

  }

  next();
}

}

export default authorizeRoles;
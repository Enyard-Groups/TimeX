import jwt from "jsonwebtoken";

export const generateToken=(user, res)=>{
  console.log(user)

  const token=jwt.sign({id:user.id,role:user.role}, process.env.JWT_SECRET,{
    expiresIn: "7d",

  });

  res.cookie("jwt", token, {
    maxAge: 7*24*60*1000,
    httpOnly:true,
    sameSite:"none",
    secure:"false",

  });
  return token;

};
import bcrypt from "bcrypt";
const password="jiggubaby"

const hashedPassword=await bcrypt.hash(password,10);
console.log(hashedPassword)

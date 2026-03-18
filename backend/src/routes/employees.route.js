import express from "express";

import { getEmployees, createEmployee, updateEmployee, deleteEmployee} from "../controllers/employees.controller.js";



const employeesRoute = express.Router();

// const  {getEmployees,} from "../controllers/employees.controller.js";

employeesRoute.get("/", getEmployees);
employeesRoute.post("/", createEmployee);
employeesRoute.put("/", updateEmployee);
employeesRoute.delete("/:id", deleteEmployee);

export default employeesRoute;


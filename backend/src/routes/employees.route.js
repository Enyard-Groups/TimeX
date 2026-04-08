import express from "express";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getEmployeeReport } from "../controllers/employees.controller.js";

const employeesRoute = express.Router();

employeesRoute.get("/report", getEmployeeReport);
employeesRoute.get("/", getEmployees);
employeesRoute.post("/", createEmployee);
employeesRoute.put("/:id", updateEmployee);
employeesRoute.delete("/:id", deleteEmployee);

export default employeesRoute;

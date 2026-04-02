import express from "express";
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany
} from "../controllers/companies.controller.js";

const companiesRouter = express.Router();

companiesRouter.get("/", getCompanies);
companiesRouter.post("/", createCompany);
companiesRouter.put("/:id", updateCompany);
companiesRouter.delete("/:id", deleteCompany);

export default companiesRouter;

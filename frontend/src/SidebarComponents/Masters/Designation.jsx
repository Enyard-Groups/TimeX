import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";
import { FaEye, FaPen } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";
import SearchDropdown from "../SearchDropdown";
import { MdDeleteForever } from "react-icons/md";

const Designation = () => {
  const API_BASE = "http://localhost:3000/api";

  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [designation, setDesignation] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);

  const [companyOptions, setCompanyOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    company_name: "",
    code: "",
    department: "",
    description: "",
    isActive: false,
  });

  const fetchDesignations = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await axios.get(`${API_BASE}/master/designation`, {
        headers,
      });

      const data = Array.isArray(res.data) ? res.data : [];

      setDesignation(
        data.map((d) => ({
          id: d.id,
          name: d.name || "",
          code: d.code || "",
          company: d.company || "",
          company_name: d.company_name || "",
          department: d.department || "",
          description: d.description || "",
          isActive:
            d.is_active === true ||
            d.is_active === "true" ||
            d.is_active === 1 ||
            d.isActive === true,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch designations", error);
      toast.error("Unable to load designations");
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await axios.get(`${API_BASE}/master/departments`, {
        headers,
      });

      const data = Array.isArray(res.data) ? res.data : [];
      setDepartmentOptions(data || []);
    } catch (error) {
      console.error("Failed to fetch departments", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${API_BASE}/companies`);
      setCompanyOptions(res.data || []);
    } catch (error) {
      console.error("Failed to fetch companies", error);
    }
  };

  useEffect(() => {
    fetchDesignations();
    fetchCompanies();
    fetchDepartments();
  }, []);
  
  const filtereddesignation = designation.filter(
    (x) =>
      x.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.code.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      (x.company_name || "").toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentdesignation = filtereddesignation.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filtereddesignation.length / entriesPerPage),
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const { name, company, code, department, description, isActive } = formData;

    if (!name || !company || !code || !department) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      name,
      code,
      company,
      department,
      description,
      is_active: isActive,
    };

    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      if (editId) {
        const res = await axios.put(
          `${API_BASE}/master/designation/${editId}`,
          payload,
          { headers },
        );

        const updated = {
          id: res.data.id,
          name: res.data.name || "",
          code: res.data.code || "",
          company: res.data.company || "",
          company_name: res.data.company_name || "",
          department: res.data.department || "",
          description: res.data.description || "",
          isActive:
            res.data.is_active === true ||
            res.data.is_active === "true" ||
            res.data.is_active === 1 ||
            res.data.isActive === true,
        };

        setDesignation((prev) =>
          prev.map((emp) => (emp.id === editId ? updated : emp)),
        );

        toast.success("Data updated");
      } else {
        const res = await axios.post(
          `${API_BASE}/master/designation`,
          payload,
          {
            headers,
          },
        );

        const created = {
          id: res.data.id,
          name: res.data.name || "",
          code: res.data.code || "",
          company: res.data.company || "",
          company_name: res.data.company_name || "",
          department: res.data.department || "",
          description: res.data.description || "",
          isActive:
            res.data.is_active === true ||
            res.data.is_active === "true" ||
            res.data.is_active === 1 ||
            res.data.isActive === true,
        };

        setDesignation((prev) => [created, ...prev]);

        toast.success("Data Added");
      }

      setOpenModal(false);
      setEditId(null);

      setFormData({
        company: "",
        company_name: "",
        name: "",
        code: "",
        department: "",
        description: "",
        isActive: false,
      });
    } catch (error) {
      console.error("Failed to save designation", error);
      toast.error(
        error.response?.data?.message || "Unable to save designation",
      );
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      await axios.delete(`${API_BASE}/master/designation/${id}`, { headers });
      setDesignation((prev) => prev.filter((v) => v.id !== id));
      toast.success("Designation deleted");
    } catch (error) {
      console.error("Failed to delete designation", error);
      toast.error(
        error.response?.data?.message || "Unable to delete designation",
      );
    }
  };

  const handleCopy = () => {
    const header = [
      "SL.NO",
      "Designation Name",
      "Designation Code",
      "Company",
      "Department Name",
      "Active",
    ].join("\t");

    const rows = filtereddesignation
      .map((item, index) =>
        [
          index + 1,
          item.name,
          item.code,
          item.company_name || item.company,
          item.department,
          item.isActive ? "Y" : "N",
        ].join("\t"),
      )
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filtereddesignation.map((item, index) => ({
      "SL.NO": index + 1,
      "Designation Name": item.name,
      "Designation Code": item.code,
      Company: item.company_name || item.company,
      "Department Name": item.department,
      Active: item.isActive ? "Y" : "N",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Designation");

    XLSX.writeFile(workbook, "DesignationData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "SL.NO",
      "Designation Name",
      "Designation Code",
      "Company",
      "Department Name",
      "Active",
    ];

    const tableRows = [];

    filtereddesignation.forEach((item, index) => {
      const row = [
        index + 1,
        item.name,
        item.code,
        item.company_name || item.company,
        item.department,
        item.isActive ? "Y" : "N",
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("DesignationData.pdf");
  };

  return (
    <>
      <div className="mb-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center gap-2 h-[30px] text-lg font-bold text-gray-900">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-600">Masters</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div
              onClick={() => setOpenModal(false)}
              className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
            >
              Designation
            </div>
          </h1>
          {!openModal && (
            <div className="flex justify-end">
              <button
                onClick={() => (
                  setMode(""),
                  setEditId(null),
                  setFormData({
                    company: "",
                    name: "",
                    code: "",
                    department: "",
                    description: "",
                    isActive: false,
                  }),
                  setOpenModal(true)
                )}
                className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap border border-blue-400/30"
              >
                + Add New
              </button>
            </div>
          )}
        </div>

        {/* Main Container */}
        <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50/30 rounded-3xl overflow-hidden border border-blue-100/50 shadow-2xl backdrop-blur-sm">
          {/* Top Controls Bar */}
          <div className="p-6 bg-gradient-to-r from-slate-50/80 to-blue-50/50 border-b border-blue-100/40">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700">
                  Display
                </label>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border-2 border-blue-200 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 transition-all shadow-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm font-medium text-gray-700">
                  entries
                </span>
              </div>

              <div className="flex flex-wrap gap-3 items-center justify-center w-full lg:w-auto">
                <input
                  placeholder="Search designation..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-56 bg-white border-2 border-blue-200 text-gray-900 px-4 py-2.5 rounded-lg text-sm placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="bg-white hover:bg-slate-50 border-2 border-gray-200 text-gray-700 hover:text-gray-900 p-2.5 rounded-lg transition-all hover:border-gray-300 shadow-sm"
                    title="Copy to clipboard"
                  >
                    <GoCopy className="text-lg" />
                  </button>

                  <button
                    onClick={handleExcel}
                    className="bg-white hover:bg-green-50 border-2 border-green-200 text-green-600 hover:text-green-700 p-2.5 rounded-lg transition-all hover:border-green-300 shadow-sm"
                    title="Export to Excel"
                  >
                    <FaFileExcel className="text-lg" />
                  </button>

                  <button
                    onClick={handlePDF}
                    className="bg-white hover:bg-red-50 border-2 border-red-200 text-red-600 hover:text-red-700 p-2.5 rounded-lg transition-all hover:border-red-300 shadow-sm"
                    title="Export to PDF"
                  >
                    <FaFilePdf className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto min-h-[350px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 border-b-2 border-blue-200/60">
                  <th className="px-6 py-4 text-center font-bold text-blue-900 hidden sm:table-cell">
                    SL.NO
                  </th>
                  <th className="px-6 py-4 text-center font-bold text-blue-900">
                    Designation
                  </th>
                  <th className="px-6 py-4 text-center font-bold text-blue-900 hidden md:table-cell">
                    Code
                  </th>
                  <th className="px-6 py-4 text-center font-bold text-blue-900 hidden xl:table-cell">
                    Company
                  </th>
                  <th className="px-6 py-4 text-center font-bold text-blue-900 hidden xl:table-cell">
                    Department
                  </th>
                  <th className="px-6 py-4 text-center font-bold text-blue-900 hidden lg:table-cell">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center font-bold text-blue-900">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentdesignation.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="text-5xl opacity-30">📋</div>
                        <p className="text-gray-400 text-lg font-medium">
                          No Designations Found
                        </p>
                        <p className="text-gray-300 text-sm">
                          Add a new designation to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentdesignation.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-blue-100/40 bg-white/60 hover:bg-blue-50 even:bg-slate-50/40 text-[15px] hover:-translate-y-0.5 transition-all duration-300"
                    >
                      {/* SL NO (fix for pagination if needed) */}
                      <td className="px-6 py-2 text-center hidden sm:table-cell">
                        {index + 1}
                      </td>

                      {/* Name */}
                      <td className="px-6 py-2 text-center">
                        {item.name || "-"}
                      </td>

                      {/* Code */}
                      <td className="px-6 py-2 text-center hidden md:table-cell">
                        {item.code || "-"}
                      </td>

                      {/* Company */}
                      <td className="px-6 py-2 text-center hidden xl:table-cell">
                        {item.company_name || item.company || "-"}
                      </td>

                      {/* Department */}
                      <td className="px-6 py-2 text-center hidden xl:table-cell">
                        {item.department || "-"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-2 text-center hidden lg:table-cell">
                        <span
                          className={`px-4 py-1.5 rounded-full font-semibold border ${
                            item.isActive
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                          }`}
                        >
                          {item.isActive ? "✓ Active" : "○ Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-2 text-center">
                        <div className="flex justify-center gap-2">
                          {/* View */}
                          <button
                            onClick={() => {
                              setFormData({
                                ...item,
                                isActive:
                                  item.isActive ?? item.is_active ?? false,
                              });
                              setMode("view");
                              setOpenModal(true);
                            }}
                            className="p-2 text-blue-500 bg-blue-100 hover:bg-blue-200 rounded-lg transition hover:scale-110"
                          >
                            <FaEye />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setFormData({
                                ...item,
                                isActive:
                                  item.isActive ?? item.is_active ?? false,
                              });
                              setEditId(item.id);
                              setMode("edit");
                              setOpenModal(true);
                            }}
                            className="p-2 text-blue-500 bg-blue-100 hover:bg-blue-200 rounded-lg transition hover:scale-110"
                          >
                            <FaPen />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-500 bg-red-100 hover:bg-red-200 rounded-lg transition hover:scale-110"
                          >
                            <MdDeleteForever />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          <div className="p-6 bg-gradient-to-r from-slate-50/80 to-blue-50/50 border-t border-blue-100/40 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-sm text-gray-600 font-medium">
              Showing{" "}
              <span className="text-gray-900 font-bold">
                {filtereddesignation.length === 0 ? "0" : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="text-gray-900 font-bold">
                {Math.min(endIndex, filtereddesignation.length)}
              </span>{" "}
              of{" "}
              <span className="text-gray-900 font-bold">
                {filtereddesignation.length}
              </span>{" "}
              entries
            </span>

            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="bg-white hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-200 text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:border-blue-400"
              >
                First
              </button>

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="bg-white hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-200 text-blue-600 p-2 rounded-lg transition-all hover:border-blue-400"
              >
                <GrPrevious />
              </button>

              <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 border-2 border-blue-400 rounded-lg text-white font-bold min-w-[50px] text-center shadow-lg">
                {currentPage}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="bg-white hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-200 text-blue-600 p-2 rounded-lg transition-all hover:border-blue-400"
              >
                <GrNext />
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="bg-white hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-200 text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:border-blue-400"
              >
                Last
              </button>
            </div>
          </div>
        </div>

        {/* Modal */}
        {openModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div
              className="bg-gradient-to-br from-white via-slate-50 to-blue-50 rounded-3xl shadow-2xl border border-blue-200/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8"
              style={{ scrollbarWidth: "none" }}
            >
              {/* Close Button */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setOpenModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition"
                >
                  <RxCross2 className="text-2xl" />
                </button>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                {mode === "view"
                  ? "View Designation"
                  : mode === "edit"
                    ? "Edit Designation"
                    : "Add New Designation"}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {/* Name Field */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">
                    Designation Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Enter designation name"
                    className="w-full bg-white border-2 border-blue-200 text-gray-900 px-4 py-2.5 rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 transition-all shadow-sm font-medium"
                    required
                  />
                </div>

                {/* Code Field */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Enter code"
                    className="w-full bg-white border-2 border-blue-200 text-gray-900 px-4 py-2.5 rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 transition-all shadow-sm font-medium"
                    required
                  />
                </div>

                {/* Company Field */}
                <div>
                  <SearchDropdown
                    label={
                      <>
                        Company <span className="text-red-500">*</span>
                      </>
                    }
                    name="company"
                    value={formData.company}
                    displayValue={formData.company_name}
                    options={companyOptions}
                    labelKey="name"
                    valueKey="name"
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle="w-full bg-white border-2 border-blue-200 text-gray-900 px-4 py-2.5 rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 transition-all shadow-sm font-medium"
                    labelStyle="text-sm font-bold text-gray-700 mb-2 block"
                  />
                </div>

                {/* Department Field */}
                <div>
                  <SearchDropdown
                    label={
                      <>
                        Department <span className="text-red-500">*</span>
                      </>
                    }
                    name="department"
                    value={formData.department}
                    displayValue={formData.department}
                    options={departmentOptions}
                    labelKey="name"
                    valueKey="name"
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle="w-full bg-white border-2 border-blue-200 text-gray-900 px-4 py-2.5 rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 transition-all shadow-sm font-medium"
                    labelStyle="text-sm font-bold text-gray-700 mb-2 block"
                  />
                </div>

                {/* Description Field */}
                <div className="sm:col-span-2">
                  <label className="text-sm font-bold text-gray-700 mb-2 block">
                    Description
                  </label>
                  <input
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Enter description"
                    className="w-full bg-white border-2 border-blue-200 text-gray-900 px-4 py-2.5 rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 transition-all shadow-sm font-medium"
                  />
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-3 bg-blue-50/50 px-4 py-3 rounded-xl border border-blue-100">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className="w-5 h-5 cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
                  />
                  <label className="text-gray-700 font-semibold cursor-pointer">
                    Mark as Active
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              {mode !== "view" && (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setOpenModal(false)}
                    className="px-6 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50 font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-600 hover:from-blue-600 hover:via-blue-700 hover:to-blue-700 text-white font-semibold px-8 py-2.5 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 border border-blue-400/30"
                  >
                    Save Designation
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Designation;

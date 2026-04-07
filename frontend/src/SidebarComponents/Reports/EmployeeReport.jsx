import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { GrPrevious, GrNext } from "react-icons/gr";
import SearchDropdown from "../SearchDropdown";
import { FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

const API_BASE = "http://localhost:3000/api";

const EMPLOYEE_CATEGORIES = [
  "All Category",
  "Full Time Equivalent",
  "Contingent",
  "Freelence",
  "Contract",
  "Permanent",
  "User",
];

const EmployeeReport = () => {
  const [openModal, setOpenModal]                     = useState(false);
  const [selectedId, setSelectedId]                   = useState(null);
  const [modalOpenSelectedItem, setModalOpenSelectedItem] = useState(false);
  const [employeeReport, setEmployeeReport]           = useState([]);
  const [loading, setLoading]                         = useState(false);

  // Dropdown options loaded from API
  const [companyOptions, setCompanyOptions]           = useState([]);
  const [designationOptions, setDesignationOptions]   = useState([]);
  const [locationOptions, setLocationOptions]         = useState([]);

  const [searchTerm, setSearchTerm]     = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage]   = useState(1);

  const [formData, setFormData] = useState({
    employeeCategory: "",
    company: "",
    company_id: "",
    location: "",
    designation_id: "",
    designation: "",
  });

  const inputStyle =
    "w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 text-lg py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";
  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  // ─── Fetch dropdown data on mount ──────────────────────────────────────────
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [companiesRes, designationsRes, employeesRes] = await Promise.all([
          axios.get(`${API_BASE}/companies`),
          axios.get(`${API_BASE}/master/designation`),
          axios.get(`${API_BASE}/employee`),
        ]);
        setCompanyOptions(companiesRes.data);
        setDesignationOptions(designationsRes.data);

        // Build unique location list from employees
        const locs = [
          ...new Set(
            employeesRes.data
              .map((e) => e.location)
              .filter(Boolean)
          ),
        ];
        setLocationOptions(locs);
      } catch (err) {
        console.error("Failed to load dropdown options:", err);
        toast.error("Failed to load filter options");
      }
    };
    fetchDropdowns();
  }, []);

  // ─── Generate Report ────────────────────────────────────────────────────────
  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (formData.company_id)       params.company       = formData.company_id;
      if (
        formData.employeeCategory &&
        formData.employeeCategory !== "All Category"
      )                              params.type          = formData.employeeCategory;
      if (formData.location)         params.location      = formData.location;
      if (formData.designation_id)   params.designation_id = formData.designation_id;

      const res = await axios.get(`${API_BASE}/employee/report`, { params });
      setEmployeeReport(res.data);
      setCurrentPage(1);
      setOpenModal(true);
    } catch (err) {
      console.error("Failed to generate report:", err);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  // ─── Filtering & Pagination ─────────────────────────────────────────────────
  const filteredReport = employeeReport.filter((emp) =>
    (emp.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.employeeID || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const endIndex   = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentData = filteredReport.slice(startIndex, endIndex);
  const totalPages  = Math.max(1, Math.ceil(filteredReport.length / entriesPerPage));

  const selectedItem = employeeReport.find((item) => item.id === selectedId);

  // ─── Export helpers ─────────────────────────────────────────────────────────
  const handleCopy = () => {
    const header = ["Sl.No", "Employee ID", "Name", "Company", "Category", "Location", "Designation"].join("\t");
    const rows = filteredReport.map((item, i) =>
      [i + 1, item.employeeID, item.name, item.company, item.employeeCategory, item.location, item.department].join("\t")
    ).join("\n");
    navigator.clipboard.writeText(`${header}\n${rows}`);
    toast.success("Copied to clipboard");
  };

  const handleExcel = () => {
    const data = filteredReport.map((item, i) => ({
      "Sl.No": i + 1,
      "Employee ID": item.employeeID,
      Name: item.name,
      Company: item.company,
      "Employee Category": item.employeeCategory,
      Location: item.location,
      Designation: item.department,
      "Join Date": item.doj ? new Date(item.doj).toLocaleDateString() : "",
      Status: item.is_active ? "Active" : "Inactive",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "EmployeeReport");
    XLSX.writeFile(wb, "EmployeeReport.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    doc.text("Employee Report", 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [["Sl.No", "Employee ID", "Name", "Company", "Category", "Location", "Designation"]],
      body: filteredReport.map((item, i) => [
        i + 1,
        item.employeeID,
        item.name,
        item.company,
        item.employeeCategory,
        item.location,
        item.department,
      ]),
    });
    doc.save("EmployeeReport.pdf");
  };

  return (
    <>
      <div className="mb-6">
        {/* Header */}
        <div className="sm:flex sm:justify-between">
          <h1 className="flex items-center gap-2 text-[17px] font-semibold flex-wrap ml-10 lg:ml-0 mb-4 lg:mb-0">
            <FaAngleRight />
            Reports
            <FaAngleRight />
            Employee Reports
          </h1>
        </div>

        {/* Filter Panel */}
        <div
          className="flex items-center justify-center p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-white rounded-xl shadow-sm w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Company */}
              <div>
                <SearchDropdown
                  label="Company"
                  name="company"
                  value={formData.company}
                  options={companyOptions}
                  labelKey="name"
                  valueKey="id"
                  labelName="company"
                  formData={formData}
                  setFormData={(updated) =>
                    setFormData((prev) => ({
                      ...prev,
                      company: updated.company,
                      company_id: updated.company_id ?? updated.company,
                    }))
                  }
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              {/* Employee Category */}
              <div>
                <SearchDropdown
                  label="Employee Category"
                  name="employeeCategory"
                  value={formData.employeeCategory}
                  options={EMPLOYEE_CATEGORIES}
                  formData={formData}
                  setFormData={setFormData}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              {/* Location */}
              <div>
                <SearchDropdown
                  label="Location"
                  name="location"
                  value={formData.location}
                  options={locationOptions}
                  formData={formData}
                  setFormData={setFormData}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              {/* Designation */}
              <div>
                <SearchDropdown
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  options={designationOptions}
                  labelKey="name"
                  valueKey="id"
                  labelName="designation"
                  formData={formData}
                  setFormData={(updated) =>
                    setFormData((prev) => ({
                      ...prev,
                      designation: updated.designation,
                      designation_id: updated.designation_id ?? updated.designation,
                    }))
                  }
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end mt-10">
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="bg-[oklch(0.645_0.246_16.439)] text-white px-8 py-2 rounded-md disabled:opacity-60"
              >
                {loading ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>
        </div>

        {/* Report Table */}
        {openModal && (
          <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.8_0.001_106.424)] p-6">
            {/* Close */}
            <div className="flex justify-end">
              <RxCross2
                onClick={() => setOpenModal(false)}
                className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer"
              />
            </div>

            {/* Top Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
              <div>
                <label className="mr-2 text-md">Show</label>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded-full px-1 border-[oklch(0.645_0.246_16.439)]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="ml-2 text-md">entries</span>
              </div>

              <div className="flex flex-wrap gap-2 items-center justify-center">
                <input
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="shadow-sm px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]"
                />
                <div className="flex">
                  <button onClick={handleCopy} className="text-xl px-3 py-1 cursor-pointer text-gray-800">
                    <GoCopy />
                  </button>
                  <button onClick={handleExcel} className="text-xl px-3 py-1 cursor-pointer text-green-700">
                    <FaFileExcel />
                  </button>
                  <button onClick={handlePDF} className="text-xl px-3 py-1 cursor-pointer text-red-600">
                    <FaFilePdf />
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[250px]" style={{ scrollbarWidth: "none" }}>
              <h1 className="text-[oklch(0.577_0.245_27.325)] text-xl mb-4 text-center">
                Employee Report
              </h1>
              <table className="w-full text-lg border-collapse">
                <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
                  <tr>
                    <th className="p-2 font-semibold hidden sm:table-cell">Sl.No</th>
                    <th className="p-2 font-semibold hidden md:table-cell">Employee ID</th>
                    <th className="p-2 font-semibold">Name</th>
                    <th className="p-2 font-semibold hidden xl:table-cell">Company</th>
                    <th className="p-2 font-semibold hidden lg:table-cell">Category</th>
                    <th className="p-2 font-semibold hidden xl:table-cell">Location</th>
                    <th className="p-2 font-semibold hidden md:table-cell">Designation</th>
                    <th className="p-2 font-semibold hidden lg:table-cell">Status</th>
                    <th className="p-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center p-10">
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item, index) => (
                      <tr
                        key={item.id}
                        className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                      >
                        <td className="p-2 hidden sm:table-cell">{startIndex + index + 1}</td>
                        <td className="p-2 hidden md:table-cell">{item.employeeID}</td>
                        <td className="p-2">{item.name}</td>
                        <td className="p-2 hidden xl:table-cell">{item.company}</td>
                        <td className="p-2 hidden lg:table-cell">{item.employeeCategory}</td>
                        <td className="p-2 hidden xl:table-cell">{item.location}</td>
                        <td className="p-2 hidden md:table-cell">{item.department}</td>
                        <td className="p-2 hidden lg:table-cell">
                          <span
                            className={`px-2 py-1 rounded-full text-sm font-medium ${
                              item.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2 justify-center">
                            <FaEye
                              onClick={() => {
                                setSelectedId(item.id);
                                setModalOpenSelectedItem(true);
                              }}
                              className="text-blue-500 cursor-pointer text-lg mt-2 mr-2"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center md:justify-between items-center mt-4 text-sm flex-wrap gap-6">
              <span>
                Showing {filteredReport.length === 0 ? "0" : startIndex + 1} to{" "}
                {Math.min(endIndex, filteredReport.length)} of {filteredReport.length} entries
              </span>
              <div className="flex flex-row space-x-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
                >
                  First
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-3 bg-gray-200 rounded-full disabled:opacity-50"
                >
                  <GrPrevious />
                </button>
                <div className="p-3 px-4 shadow rounded-full">{currentPage}</div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-3 bg-gray-200 rounded-full disabled:opacity-50"
                >
                  <GrNext />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Detail Modal */}
        {modalOpenSelectedItem && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
            <div
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{selectedItem.name} — Details</h2>
                <RxCross2
                  onClick={() => {
                    setModalOpenSelectedItem(false);
                    setSelectedId(null);
                  }}
                  className="cursor-pointer text-xl text-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-lg">
                <div>
                  <p className={labelStyle}>Employee ID</p>
                  <p className={inputStyle}>{selectedItem.employeeID || "—"}</p>
                </div>
                <div>
                  <p className={labelStyle}>Name</p>
                  <p className={inputStyle}>{selectedItem.name || "—"}</p>
                </div>
                <div>
                  <p className={labelStyle}>Employee Category</p>
                  <p className={inputStyle}>{selectedItem.employeeCategory || "—"}</p>
                </div>
                <div>
                  <p className={labelStyle}>Designation</p>
                  <p className={inputStyle}>{selectedItem.department || "—"}</p>
                </div>
                <div>
                  <p className={labelStyle}>Department</p>
                  <p className={inputStyle}>{selectedItem.department_name || "—"}</p>
                </div>
                <div>
                  <p className={labelStyle}>Company</p>
                  <p className={inputStyle}>{selectedItem.company || "—"}</p>
                </div>
                <div>
                  <p className={labelStyle}>Location</p>
                  <p className={inputStyle}>{selectedItem.location || "—"}</p>
                </div>
                <div>
                  <p className={labelStyle}>Shift</p>
                  <p className={inputStyle}>{selectedItem.shift_name || "—"}</p>
                </div>
                <div>
                  <p className={labelStyle}>Phone</p>
                  <p className={inputStyle}>{selectedItem.phone || "—"}</p>
                </div>
                <div>
                  <p className={labelStyle}>Date of Birth</p>
                  <p className={inputStyle}>
                    {selectedItem.dob ? new Date(selectedItem.dob).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div>
                  <p className={labelStyle}>Date of Joining</p>
                  <p className={inputStyle}>
                    {selectedItem.doj ? new Date(selectedItem.doj).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div>
                  <p className={labelStyle}>Status</p>
                  <p className={inputStyle}>
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        selectedItem.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedItem.is_active ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EmployeeReport;

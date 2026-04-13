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
  const [categoryOptions, setCategoryOptions]         = useState([]);

  const [searchTerm, setSearchTerm]     = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage]   = useState(1);

  const [formData, setFormData] = useState({
    employeeCategory: "",
    company: "",
    company_id: "",
    location: "",
    location_id: "",
    designation_id: "",
    designation: "",
    finger: "",
  });

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 lg:text-base rounded-lg focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm";
  const labelStyle =
    "text-sm lg:text-base font-semibold text-gray-700 mb-2 block";

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [resComp, resDesig, resLoc, resCat] = await Promise.all([
        axios.get(`${API_BASE}/companies`),
        axios.get(`${API_BASE}/master/designation`),
        axios.get(`${API_BASE}/master/geofencing`),
        axios.get(`${API_BASE}/master/employee-categories`),
      ]);
      setCompanyOptions(resComp.data);
      setDesignationOptions(resDesig.data);
      setLocationOptions(resLoc.data || []);
      setCategoryOptions(resCat.data);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const params = {
        company: formData.company_id,
        type: formData.employeeCategory === "All Category" ? "" : formData.employeeCategory,
        location: formData.location_id,
        designation_id: formData.designation_id,
        finger: formData.finger,
      };
      const res = await axios.get(`${API_BASE}/employee/report`, { params });
      setEmployeeReport(res.data);
      setOpenModal(true);
    } catch (err) {
      console.error("Error generating report:", err);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const filteredReport = employeeReport.filter((emp) => {
    const sTerm = searchTerm.toLowerCase();
    return (
      (emp.name || "").toLowerCase().includes(sTerm) ||
      (emp.employeeID || "").toLowerCase().includes(sTerm) ||
      (emp.company || "").toLowerCase().includes(sTerm) ||
      (emp.location || "").toLowerCase().includes(sTerm) ||
      (emp.department || "").toLowerCase().includes(sTerm)
    );
  });

  const filteredemployeeReport = filteredReport;

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
      <div className="mb-6 max-w-[1920px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center h-[30px] gap-2 text-lg xl:text-xl font-semibold text-gray-900">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Reports</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div className="text-blue-600 hover:text-blue-700 transition cursor-pointer">
              Employee Reports
            </div>
          </h1>
        </div>

        {/* Filter Section */}
        <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-blue-100/50 shadow-xl mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <SearchDropdown
                label="Company"
                name="company_id"
                value={formData.company_id}
                displayValue={formData.company}
                options={companyOptions}
                labelKey="name"
                valueKey="id"
                labelName="company"
                formData={formData}
                setFormData={setFormData}
                inputStyle={inputStyle}
                labelStyle={labelStyle}
              />
            </div>

            <div>
              <SearchDropdown
                label="Employee Category"
                name="employeeCategory"
                value={formData.employeeCategory}
                options={[{ name: "All Category" }, ...categoryOptions]}
                labelKey="name"
                valueKey="name"
                formData={formData}
                setFormData={setFormData}
                inputStyle={inputStyle}
                labelStyle={labelStyle}
              />
            </div>

            <div>
              <SearchDropdown
                label="Location"
                name="location_id"
                value={formData.location_id}
                displayValue={formData.location}
                options={locationOptions}
                labelKey="name"
                valueKey="id"
                labelName="location"
                formData={formData}
                setFormData={setFormData}
                inputStyle={inputStyle}
                labelStyle={labelStyle}
              />
            </div>

            <div>
              <SearchDropdown
                label="Designation"
                name="designation_id"
                value={formData.designation_id}
                displayValue={formData.designation}
                options={designationOptions}
                labelKey="name"
                valueKey="id"
                labelName="designation"
                formData={formData}
                setFormData={setFormData}
                inputStyle={inputStyle}
                labelStyle={labelStyle}
              />
            </div>

            <div>
              <SearchDropdown
                label="Finger"
                name="finger"
                value={formData.finger}
                options={["10", "9", "8", "7", "6", "5", "4", "3", "2", "1"]}
                formData={formData}
                setFormData={setFormData}
                inputStyle={inputStyle}
                labelStyle={labelStyle}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setOpenModal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 py-2 lg:text-base  rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                {loading ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {openModal && (
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl animate-in fade-in duration-500">
            {/* Table Controls */}
            <div className="p-6 border-b border-blue-100/30">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm xl:text-base font-medium text-gray-600">
                    Display
                  </label>
                  <select
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm xl:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all"
                  >
                    {[10, 25, 50, 100].map((val) => (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm xl:text-base font-medium text-gray-600">
                    entries
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 placeholder-blue-500 focus:outline-none xl:text-base  rounded-lg focus:ring-2 focus:ring-blue-500/60 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div
              className="overflow-x-auto min-h-[350px]"
              style={{ scrollbarWidth: "none" }}
            >
              <table className="w-full text-[17px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-blue-100/50">
                    <th className="px-4 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                      SL.NO
                    </th>
                    <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                      Employee ID
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                      Company
                    </th>
                    <th className="px-4 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                      Designation
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="p-12 text-center text-gray-500 font-medium"
                      >
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/60"
                      >
                        <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell text-gray-600">
                          {item.employeeID}
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-center hidden xl:table-cell text-gray-600">
                          {item.company}
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell text-gray-600">
                          {item.employeeCategory}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell text-gray-600">
                          {item.department}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            <FaEye
                              onClick={() => {
                                setSelectedId(item.id);
                                setModalOpenSelectedItem(true);
                              }}
                              className="text-blue-500 hover:text-blue-700 xl:text-xl cursor-pointer"
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
            <div className="p-6 border-t border-blue-100/30 flex flex-col sm:flex-row justify-between items-center gap-6">
              <span className="text-sm xl:text-base text-gray-600">
                Showing{" "}
                <span className="font-bold text-gray-900">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-gray-900">
                  {Math.min(endIndex, filteredemployeeReport.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-900">
                  {filteredemployeeReport.length}
                </span>{" "}
                entries
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  First
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-2.5 border rounded-lg bg-white disabled:opacity-50"
                >
                  <GrPrevious />
                </button>
                <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-bold text-sm xl:text-base ">
                  {currentPage}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-2.5 border rounded-lg bg-white disabled:opacity-50"
                >
                  <GrNext />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm  font-medium disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selection Detail Modal */}
        {modalOpenSelectedItem && selectedItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div
              className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in duration-200"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedItem.name} Details
                </h2>
                <button
                  onClick={() => {
                    setModalOpenSelectedItem(false);
                    setSelectedId(null);
                  }}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <RxCross2 className="text-2xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { label: "Employee ID", value: selectedItem.employeeID },
                  { label: "Category", value: selectedItem.employeeCategory },
                  { label: "Designation", value: selectedItem.department },
                  { label: "Company", value: selectedItem.company },
                  { label: "Location", value: selectedItem.location },
                  { label: "Finger", value: selectedItem.finger },
                ].map((field) => (
                  <div key={field.label} className="space-y-1">
                    <p className="text-xs xl:text-sm font-bold text-gray-700">
                      {field.label}
                    </p>
                    <p className="bg-white border border-gray-200 p-3 rounded-xl text-gray-800 font-medium xl:text-lg  shadow-sm">
                      {field.value || "-"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EmployeeReport;

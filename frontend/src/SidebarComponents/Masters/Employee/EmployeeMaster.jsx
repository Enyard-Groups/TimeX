import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";
import SpinnerDatePicker from "../../SpinnerDatePicker";
import { FaEye, FaPen } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";
import SearchDropdown from "../../SearchDropdown";

const API_BASE = "http://localhost:3000/api";

const emptyForm = {
  device_enrollment_id: "",
  company_enrollment_id: "",
  full_name: "",
  mobile: "",
  dob: "",
  doj: "",
  company: "",
  location: "",
  designation: "",
  shift: "",
  first_approver: "",
  second_approver: "",
  is_manager: false,
  type: "User",
  break_hours_friday: false,
  is_active: false,
  is_mobile_user: false,
  department_id: "",
  designation_id: "",
  shift_id: "",
  leave_plan: [],
  leave_plan_name: [],
};

const EmployeeMaster = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [employeeMaster, setEmployeeMaster] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showDojPicker, setShowDojPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dropdown options fetched from backend
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [approverOptions, setApproverOptions] = useState([]);
  const [leavePlanOptions, setLeavePLanOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);

  const [formData, setFormData] = useState(emptyForm);

  const inputStyle =
    "text-lg w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  // ── Fetch employees on mount ──────────────────────────────────────────────
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/employee`);
      setEmployeeMaster(res.data);
    } catch (error) {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };
  console.log(companyOptions);

  // ── Fetch dropdown options from backend ───────────────────────────────────
  const fetchDropdowns = async () => {
    try {
      const [deptRes, desRes, shiftRes, appRes, levRes, compRes] =
        await Promise.all([
          axios.get(`${API_BASE}/master/departments`),
          axios.get(`${API_BASE}/master/designation`),
          axios.get(`${API_BASE}/master/shifts`),
          axios.get(`${API_BASE}/users/approvers`, { withCredentials: true }),
          axios.get(`${API_BASE}/master/leave-types`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE}/companies`),
        ]);
      setDepartmentOptions(deptRes.data || []);
      setDesignationOptions(desRes.data || []);
      setShiftOptions(shiftRes.data || []);
      setApproverOptions(appRes.data || []);
      setLeavePLanOptions(levRes.data || []);
      setCompanyOptions(compRes.data || []);
    } catch (error) {
      console.error("Failed to fetch dropdowns", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDropdowns();
  }, []);

  // ── Filtered / paged data ─────────────────────────────────────────────────
  const filteredemployeeMaster = employeeMaster.filter(
    (x) =>
      (x.full_name || "").toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      (x.location || "").toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      (x.department_name || "")
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase()) ||
      (x.designation_name || "")
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase()) ||
      (x.company_name || "").toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentemployeeMaster = filteredemployeeMaster.slice(
    startIndex,
    endIndex,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredemployeeMaster.length / entriesPerPage),
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const { device_enrollment_id, company_enrollment_id, full_name } = formData;

    if (!device_enrollment_id || !company_enrollment_id || !full_name) {
      toast.error("Please fill required fields");
      return;
    }

    const payload = {
      ...formData,
      leave_plan: formData.leave_plan.join(","),
    };

    try {
      if (editId) {
        const res = await axios.put(`${API_BASE}/employee/${editId}`, payload);
        setEmployeeMaster((prev) =>
          prev.map((emp) => (emp.id === editId ? res.data : emp)),
        );
        toast.success("Employee updated");
      } else {
        const res = await axios.post(`${API_BASE}/employee`, payload);
        setEmployeeMaster((prev) => [res.data, ...prev]);
        toast.success("Employee added");
      }

      setOpenModal(false);
      setEditId(null);
      setFormData(emptyForm);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/employee/${id}`);
      setEmployeeMaster((prev) => prev.filter((v) => v.id !== id));
      toast.success("Employee deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  // ── Export handlers ───────────────────────────────────────────────────────
  const handleCopy = () => {
    const header = [
      "SL.NO",
      "Device ID",
      "Company ID",
      "Location",
      "Full Name",
      "Shift",
      "Designation",
    ].join("\t");

    const rows = filteredemployeeMaster
      .map((item, index) =>
        [
          index + 1,
          item.device_enrollment_id,
          item.company_enrollment_id,
          item.location,
          item.full_name,
          item.shift_name || item.shift,
          item.designation_name || item.designation,
          item.company_name || item.company,
        ].join("\t"),
      )
      .join("\n");

    navigator.clipboard.writeText(`${header}\n${rows}`);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredemployeeMaster.map((item, index) => ({
      "SL.NO": index + 1,
      "Device ID": item.device_enrollment_id,
      "Company ID": item.company_enrollment_id,
      Location: item.location,
      "Full Name": item.full_name,
      Shift: item.shift_name || item.shift,
      Designation: item.designation_name || item.designation,
      Company: item.company_name || item.company,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "EmployeeMaster.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    const tableColumn = [
      "SL.NO",
      "Device ID",
      "Company ID",
      "Location",
      "Full Name",
      "Shift",
      "Designation",
    ];
    const tableRows = filteredemployeeMaster.map((item, index) => [
      index + 1,
      item.device_enrollment_id,
      item.company_enrollment_id,
      item.location,
      item.full_name,
      item.shift_name || item.shift,
      item.designation_name || item.designation,
      item.company_name || item.company,
    ]);

    autoTable(doc, { head: [tableColumn], body: tableRows });
    doc.save("EmployeeMaster.pdf");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mb-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-lg font-semibold text-gray-800">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Masters</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div
            onClick={() => setOpenModal(false)}
            className="cursor-pointer text-blue-600 hover:text-blue-700"
          >
            Employee Master
          </div>
        </h1>

        {!openModal && (
          <div className="flex justify-end">
            <button
              onClick={() => (
                setMode(""),
                setEditId(null),
                setFormData(emptyForm),
                setOpenModal(true)
              )}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg border border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
            >
              + Add New
            </button>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl">
        {/* Top Controls */}
        <div className="p-6 border-b border-blue-100/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">
                Display
              </label>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 transition-all"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm font-medium text-gray-600">entries</span>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-center">
              <input
                placeholder="Search Employee Master ..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 hover:text-blue-700 p-2.5 rounded-lg transition-all"
                  title="Copy to clipboard"
                >
                  <GoCopy className="text-lg" />
                </button>

                <button
                  onClick={handleExcel}
                  className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 hover:text-green-700 p-2.5 rounded-lg transition-all"
                  title="Export to Excel"
                >
                  <FaFileExcel className="text-lg" />
                </button>

                <button
                  onClick={handlePDF}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 p-2.5 rounded-lg transition-all"
                  title="Export to PDF"
                >
                  <FaFilePdf className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-[16px]">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50">
                <th className="px-6 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                  SL.NO
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden sm:table-cell">
                  Device ID
                </th>
                <th className="px-6 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                  Company ID
                </th>
                <th className="px-6 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                  Location
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">
                  Full Name
                </th>
                <th className="px-6 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                  Shift
                </th>
                <th className="px-6 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                  Designation
                </th>
                <th className="px-6 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                  Company
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : currentemployeeMaster.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-4xl opacity-40">📭</div>
                      <p className="text-gray-500 text-base">
                        No Data Available
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentemployeeMaster.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 even:bg-blue-50/60"
                  >
                    <td className="px-6 py-2 text-center hidden sm:table-cell">
                      {startIndex + index + 1}
                    </td>

                    <td className="px-6 py-2 text-center hidden sm:table-cell">
                      {item.device_enrollment_id || "-"}
                    </td>

                    <td className="px-6 py-2 text-center hidden md:table-cell">
                      {item.company_enrollment_id || "-"}
                    </td>

                    <td className="px-6 py-2 text-center hidden lg:table-cell">
                      {item.location || "-"}
                    </td>

                    <td className="px-6 py-2 text-center">
                      {item.full_name || "-"}
                    </td>

                    <td className="px-6 py-2 text-center hidden md:table-cell">
                      {item.shift_name || item.shift || "-"}
                    </td>

                    <td className="px-6 py-2 text-center hidden xl:table-cell">
                      {item.designation_name || item.designation || "-"}
                    </td>

                    <td className="px-6 py-2 text-center hidden xl:table-cell">
                      {item.company_name || item.company || "-"}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {/* View */}
                        <button
                          onClick={() => {
                            setFormData({
                              ...item,
                              department_id: item.department_id || "",
                              designation_id: item.designation_id || "",
                              shift_id: item.shift_id || "",
                              department_id_name: item.department_name || "",
                              designation_id_name: item.designation_name || "",
                              shift_id_name: item.shift_name || "",
                              company_name: item.company_name || "",
                              leave_plan_name: item.leave_plan
                                ? item.leave_plan.split(",")
                                : [],
                              leave_plan: item.leave_plan
                                ? item.leave_plan.split(",")
                                : [],
                            });
                            setMode("view");
                            setOpenModal(true);
                          }}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1.5 rounded-lg transition-all"
                          title="View"
                        >
                          <FaEye className="text-lg" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setFormData({
                              ...item,
                              department_id: item.department_id || "",
                              designation_id: item.designation_id || "",
                              shift_id: item.shift_id || "",
                              department_id_name: item.department_name || "",
                              designation_id_name: item.designation_name || "",
                              shift_id_name: item.shift_name || "",
                              company_name: item.company_name || "",
                              leave_plan_name: item.leave_plan
                                ? item.leave_plan.split(",")
                                : [],
                              leave_plan: item.leave_plan
                                ? item.leave_plan.split(",")
                                : [],
                            });
                            setEditId(item.id);
                            setMode("edit");
                            setOpenModal(true);
                          }}
                          className="text-green-500 hover:text-green-700 hover:bg-green-100 p-1.5 rounded-lg transition-all"
                          title="Edit"
                        >
                          <FaPen className="text-lg" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-lg transition-all"
                          title="Delete"
                        >
                          <MdDeleteForever className="text-xl" />
                        </button>
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
          <span className="text-sm text-gray-600">
            Showing{" "}
            <span className="text-gray-900 font-semibold">
              {filteredemployeeMaster.length === 0 ? "0" : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="text-gray-900 font-semibold">
              {Math.min(endIndex, filteredemployeeMaster.length)}
            </span>{" "}
            of{" "}
            <span className="text-gray-900 font-semibold">
              {filteredemployeeMaster.length}
            </span>{" "}
            entries
          </span>

          <div className="flex gap-2">
            <button
              disabled={currentPage == 1}
              onClick={() => setCurrentPage(1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              title="First page"
            >
              First
            </button>

            <button
              disabled={currentPage == 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
              title="Previous page"
            >
              <GrPrevious />
            </button>

            <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-semibold min-w-[45px] text-center">
              {currentPage}
            </div>

            <button
              disabled={currentPage == totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
              title="Next page"
            >
              <GrNext />
            </button>

            <button
              disabled={currentPage == totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              title="Last page"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Close Button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {mode === "view"
                ? "View Employee"
                : mode === "edit"
                  ? "Edit Employee"
                  : "Add New Employee"}
            </h2>

            {/* Section 1: Basic Information */}
            <div className="mb-8 pb-6 border-b border-blue-100/30">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Device Enrollment ID */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Device Enrollment ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="device_enrollment_id"
                    value={formData.device_enrollment_id}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Device ID"
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
                    required
                  />
                </div>

                {/* Company Enrollment ID */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Company Enrollment ID{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="company_enrollment_id"
                    value={formData.company_enrollment_id}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Company ID"
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
                    required
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Full Name"
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
                    required
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Mobile
                  </label>
                  <input
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Mobile"
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Dates & Organization */}
            <div className="mb-8 pb-6 border-b border-blue-100/30">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Organization Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Date Of Birth */}
                <div className="relative">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Date Of Birth
                  </label>
                  <input
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    onClick={() => setShowDobPicker(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
                  />
                  {showDobPicker && (
                    <SpinnerDatePicker
                      value={formData.dob}
                      onChange={(date) =>
                        setFormData({ ...formData, dob: date })
                      }
                      onClose={() => setShowDobPicker(false)}
                    />
                  )}
                </div>

                {/* Date Of Join */}
                <div className="relative">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Date Of Join
                  </label>
                  <input
                    name="doj"
                    value={formData.doj}
                    onChange={handleChange}
                    onClick={() => setShowDojPicker(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
                  />
                  {showDojPicker && (
                    <SpinnerDatePicker
                      value={formData.doj}
                      onChange={(date) =>
                        setFormData({ ...formData, doj: date })
                      }
                      onClose={() => setShowDojPicker(false)}
                    />
                  )}
                </div>

                {/* Company */}
                <div>
                  <SearchDropdown
                    label="Company"
                    name="company"
                    value={formData.company}
                    displayValue={formData.company_name}
                    options={companyOptions}
                    labelKey="name"
                    valueKey="id"
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 transition-all shadow-sm font-medium"
                    labelStyle="text-sm font-bold text-gray-700 mb-2 block"
                  />
                </div>

                {/* Location */}
                <div>
                  <SearchDropdown
                    label="Location"
                    name="location"
                    value={formData.location}
                    options={[
                      "Location1",
                      "Location2",
                      "Location3",
                      "Location4",
                      "Location5",
                      "Location6",
                    ]}
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 transition-all shadow-sm font-medium"
                    labelStyle="text-sm font-bold text-gray-700 mb-2 block"
                  />
                </div>

                {/* Department */}
                <div>
                  <SearchDropdown
                    label="Department"
                    name="department_id"
                    value={formData.department_id}
                    displayValue={formData.department_id_name}
                    options={departmentOptions}
                    labelKey="name"
                    valueKey="id"
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 transition-all shadow-sm font-medium"
                    labelStyle="text-sm font-bold text-gray-700 mb-2 block"
                  />
                </div>

                {/* Designation */}
                <div>
                  <SearchDropdown
                    label="Designation"
                    name="designation_id"
                    value={formData.designation_id}
                    displayValue={formData.designation_id_name}
                    options={designationOptions}
                    labelKey="name"
                    valueKey="id"
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 transition-all shadow-sm font-medium"
                    labelStyle="text-sm font-bold text-gray-700 mb-2 block"
                  />
                </div>

                {/* Shift */}
                <div>
                  <SearchDropdown
                    label="Shift"
                    name="shift_id"
                    value={formData.shift_id}
                    displayValue={formData.shift_id_name}
                    options={shiftOptions}
                    labelKey="shift_name"
                    valueKey="id"
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 transition-all shadow-sm font-medium"
                    labelStyle="text-sm font-bold text-gray-700 mb-2 block"
                  />
                </div>

                {/* Leave Plan */}
                <div>
                  <SearchDropdown
                    label="Leave Plan"
                    name="leave_plan"
                    value={formData.leave_plan}
                    displayValue={formData.leave_plan_name}
                    options={leavePlanOptions}
                    labelKey="name"
                    valueKey="name"
                    formData={formData}
                    setFormData={setFormData}
                    labelName="leave_plan_name"
                    disabled={mode === "view"}
                    inputStyle="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 transition-all shadow-sm font-medium"
                    labelStyle="text-sm font-bold text-gray-700 mb-2 block"
                    multiple={true}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Approvals & Settings */}
            <div className="mb-8 pb-6 border-b border-blue-100/30">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Approvals & Settings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* First Approver */}
                <div>
                  <SearchDropdown
                    label="First Approver"
                    name="first_approver"
                    value={formData.first_approver}
                    options={approverOptions}
                    labelKey="emp_name"
                    valueKey="emp_name"
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 transition-all shadow-sm font-medium"
                    labelStyle="text-sm font-bold text-gray-700 mb-2 block"
                  />
                </div>

                {/* Second Approver */}
                <div>
                  <SearchDropdown
                    label="Second Approver"
                    name="second_approver"
                    value={formData.second_approver}
                    options={approverOptions}
                    labelKey="emp_name"
                    valueKey="emp_name"
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 transition-all shadow-sm font-medium"
                    labelStyle="text-sm font-bold text-gray-700 mb-2 block"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Type
                  </label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="Card"
                        checked={formData.type === "Card"}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="w-4 h-4 accent-blue-500 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm text-gray-700">Card</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="User"
                        checked={formData.type === "User"}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="w-4 h-4 accent-blue-500 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm text-gray-700">User</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Flags & Status */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Flags & Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Is Manager */}
                <div className="flex items-center gap-3 bg-blue-50/50 px-4 py-3 rounded-xl border border-blue-100">
                  <input
                    type="checkbox"
                    name="is_manager"
                    checked={formData.is_manager}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className="w-5 h-5 cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
                  />
                  <label className="text-gray-700 font-semibold cursor-pointer">
                    Is Manager
                  </label>
                </div>

                {/* Break Hours Friday */}
                <div className="flex items-center gap-3 bg-blue-50/50 px-4 py-3 rounded-xl border border-blue-100">
                  <input
                    type="checkbox"
                    name="break_hours_friday"
                    checked={formData.break_hours_friday}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className="w-5 h-5 cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
                  />
                  <label className="text-gray-700 font-semibold cursor-pointer">
                    Break Hours (Friday)
                  </label>
                </div>

                {/* Active */}
                <div className="flex items-center gap-3 bg-blue-50/50 px-4 py-3 rounded-xl border border-blue-100">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className="w-5 h-5 cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
                  />
                  <label className="text-gray-700 font-semibold cursor-pointer">
                    Active
                  </label>
                </div>

                {/* Is Mobile User */}
                <div className="flex items-center gap-3 bg-blue-50/50 px-4 py-3 rounded-xl border border-blue-100">
                  <input
                    type="checkbox"
                    name="is_mobile_user"
                    checked={formData.is_mobile_user}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className="w-5 h-5 cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
                  />
                  <label className="text-gray-700 font-semibold cursor-pointer">
                    Is Mobile User
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {mode !== "view" && (
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setOpenModal(false)}
                  className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeMaster;

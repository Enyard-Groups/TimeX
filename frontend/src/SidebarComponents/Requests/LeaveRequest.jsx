import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";
import { FaEye, FaPen } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";
import SpinnerDatePicker from "../SpinnerDatePicker";
import SearchDropdown from "../SearchDropdown";

const API_BASE = "http://localhost:3000/api";

const emptyForm = {
  employee_id: "",
  leave_type: "",
  start_date: "",
  end_date: "",
  resume_date: "",
  number_of_days: "",
  pendingDays: "",
  leaveBalance: "",
  contact_number: "",
  email: "",
  reason: "",
  is_half_day: false,
};

const LeaveRequest = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedID] = useState(null);
  const [fromDateSpinner, setFromDateSpinner] = useState(false);
  const [toDateSpinner, setToDateSpinner] = useState(false);
  const [showResumeSpinner, setShowResumeSpinner] = useState(false);
  const [leave, setLeave] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // useEffect for localStorage removed as we use backend

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    if (dateStr.includes("-")) {
      const [y, m, d] = dateStr.split("-");
      return new Date(y, m - 1, d);
    }
    if (dateStr.includes("/")) {
      const [d, m, y] = dateStr.split("/");
      return new Date(y, m - 1, d);
    }
    return new Date(dateStr);
  };

  const inputStyle =
    "text-lg w-full  border  border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes("T")) {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  const filteredLeave = leave.filter(
    (x) =>
      (x.employee_name || "")
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase()) ||
      (x.company_name || "").toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentLeave = filteredLeave.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLeave.length / entriesPerPage),
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const from = parseDate(formData.start_date);
      const to = parseDate(formData.end_date);

      if (from && to && !isNaN(from.getTime()) && !isNaN(to.getTime())) {
        if (to >= from) {
          const diffTime = to.getTime() - from.getTime();
          let days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

          // ✅ Handle Half Day
          if (formData.is_half_day) {
            days = 0.5;
          }

          if (formData.number_of_days !== days.toString()) {
            setFormData((prev) => ({
              ...prev,
              number_of_days: days.toString(),
            }));
          }
        } else {
          if (formData.number_of_days !== "") {
            setFormData((prev) => ({
              ...prev,
              number_of_days: "",
            }));
          }
        }
      }
    }
  }, [
    formData.start_date,
    formData.end_date,
    formData.is_half_day,
    formData.number_of_days,
  ]);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [leaveRes, empRes, typeRes] = await Promise.all([
        axios.get(`${API_BASE}/requests/leave`),
        axios.get(`${API_BASE}/employee`),
        axios.get(`${API_BASE}/master/leave-types`),
      ]);
      const formattedLeave = (leaveRes.data || []).map((l) => ({
        ...l,
        start_date: formatDate(l.start_date),
        end_date: formatDate(l.end_date),
        resume_date: formatDate(l.resume_date),
      }));
      setLeave(formattedLeave);
      setEmployeeOptions(empRes.data);
      setLeaveTypeOptions(typeRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Submit
  const handleSubmit = async () => {
    const {
      employee_id,
      leave_type,
      start_date,
      end_date,
      resume_date,
      reason,
      contact_number,
      email,
      is_half_day,
      number_of_days,
    } = formData;

    if (
      !employee_id ||
      !leave_type ||
      !start_date ||
      !end_date ||
      !resume_date ||
      !contact_number ||
      !email
    ) {
      toast.error("Please fill required fields");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const from = parseDate(start_date);
    const to = parseDate(end_date);
    const resume = parseDate(resume_date);

    if (from < today) {
      toast.error("First Date cannot be in the past");
      return;
    }

    if (to < from) {
      toast.error("Last Date must be after First Date");
      return;
    }
    if (resume <= from) {
      toast.error("Resume Duty Date must be after Last Date");
      return;
    }

    try {
      if (editId) {
        const res = await axios.put(
          `${API_BASE}/requests/leave/${editId}`,
          formData,
        );
        setLeave((prev) =>
          prev.map((item) =>
            item.id === editId
              ? {
                  ...item,
                  ...res.data,
                  employee_name: employeeOptions.find(
                    (e) => e.company_enrollment_id === employee_id,
                  )?.full_name,
                }
              : item,
          ),
        );
        toast.success("Updated Successfully");
      } else {
        const res = await axios.post(`${API_BASE}/requests/leave`, formData);
        setLeave((prev) => [
          {
            ...res.data,
            employee_name: employeeOptions.find(
              (e) => e.company_enrollment_id === employee_id,
            )?.full_name,
          },
          ...prev,
        ]);
        toast.success("Submitted Successfully");
      }

      setOpenModal(false);
      setEditId(null);
      setFormData(emptyForm);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Operation failed");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/requests/leave/${id}`);
      setLeave((prev) => prev.filter((v) => v.id !== id));
      toast.success("Deleted Successfully");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Delete failed");
    }
  };

  const handleCopy = () => {
    const header = [
      "Employee",
      "Company",
      "Leave Type",
      "From Date",
      "To Date",
      "Resume On",
      "Reason",
      "Created Date",
    ].join("\t");

    const rows = filteredLeave
      .map((item) => {
        return [
          item.employee_name,
          item.company_name || "N/A",
          item.leave_type,
          item.start_date,
          item.end_date,
          item.resume_date,
          item.reason || "NIL",
          new Date(item.created_at).toLocaleDateString(),
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredLeave.map((item) => ({
      Employee: item.employee_name,
      Company: item.company_name || "N/A",
      LeaveType: item.leave_type,
      FromDate: item.start_date,
      ToDate: item.end_date,
      ResumeOn: item.resume_date,
      Reason: item.reason || "NIL",
      CreatedDate: new Date(item.created_at).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "LeaveRequest");

    XLSX.writeFile(workbook, "LeaveRequestData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "Employee",
      "Company",
      "Leave Type",
      "From Date",
      "To Date",
      "Resume On",
      "Reason",
      "Created Date",
    ];

    const tableRows = [];

    filteredLeave.forEach((item) => {
      const row = [
        item.employee_name,
        item.company_name || "N/A",
        item.leave_type,
        item.start_date,
        item.end_date,
        item.resume_date,
        item.reason || "NIL",
        new Date(item.created_at).toLocaleDateString(),
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("LeaveRequestData.pdf");
  };

  return (
    <>
      <div className="mb-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Requests</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div
              onClick={() => setOpenModal(false)}
              className="cursor-pointer text-blue-600 hover:text-blue-700"
            >
              Leave Request
            </div>
          </h1>

          {!openModal && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setMode("");
                  setEditId(null);
                  setFormData(emptyForm);
                  setOpenModal(true);
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white xl:text-lg font-semibold px-6 py-2 rounded-lg border border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
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
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
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
                  className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/60 transition-all"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm xl:text-base font-medium text-gray-600">
                  entries
                </span>
              </div>

              <div className="flex flex-wrap gap-3 items-center justify-center">
                <input
                  placeholder="Search leave request..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 xl:text-base  rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 hover:text-blue-700 p-2.5 rounded-lg transition-all"
                    title="Copy to clipboard"
                  >
                    <GoCopy className="text-lg xl:text-xl" />
                  </button>
                  <button
                    onClick={handleExcel}
                    className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 hover:text-green-700 p-2.5 rounded-lg transition-all"
                    title="Export to Excel"
                  >
                    <FaFileExcel className="text-lg xl:text-xl" />
                  </button>
                  <button
                    onClick={handlePDF}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 p-2.5 rounded-lg transition-all"
                    title="Export to PDF"
                  >
                    <FaFilePdf className="text-lg xl:text-xl" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            className="overflow-x-auto min-h-[350px]"
            style={{ scrollbarWidth: "none" }}
          >
            <table className="w-full text-[17px] text-gray-700">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50">
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-center hidden sm:table-cell font-semibold text-gray-700 whitespace-nowrap">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                    From
                  </th>
                  <th className="px-6 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                    To
                  </th>
                  <th className="px-6 py-3 text-center hidden sm:table-cell font-semibold text-gray-700 whitespace-nowrap">
                    Resume On
                  </th>
                  <th className="px-6 py-3 text-center hidden md:table-cell font-semibold text-gray-700 whitespace-nowrap">
                    Leave Reason
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
                      colSpan="7"
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span>Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentLeave.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="text-4xl opacity-40">🍃</div>
                        <p className="text-gray-500 text-base font-medium">
                          No Leave Requests
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentLeave.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 even:bg-blue-50/60"
                    >
                      <td className="px-6 py-2 text-center">
                        {item.employee_name || "-"}
                      </td>

                      <td className="px-6 py-2 text-center hidden sm:table-cell whitespace-nowrap">
                        {item.leave_type || "-"}
                      </td>

                      <td className="px-6 py-2 text-center hidden lg:table-cell whitespace-nowrap">
                        {item.start_date || "-"}
                      </td>

                      <td className="px-6 py-2 text-center hidden lg:table-cell whitespace-nowrap">
                        {item.end_date || "-"}
                      </td>

                      <td className="px-6 py-2 text-center hidden sm:table-cell whitespace-nowrap">
                        {item.resume_date || "-"}
                      </td>

                      <td className="px-6 py-2 text-center hidden md:table-cell whitespace-nowrap">
                        {item.reason
                          ? `${item.leave_type} - ${item.reason}`
                          : `${item.leave_type} - NIL`}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          {/* View */}
                          <button
                            onClick={() => {
                              setSelectedID(item.id);
                              setFormData(item);
                              setMode("view");
                              setOpenModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1.5 rounded-lg transition-all"
                            title="View"
                          >
                            <FaEye className="text-lg" />
                          </button>

                          {item.status === "Pending" && (
                            <>
                              {/* Edit */}
                              <button
                                onClick={() => {
                                  setFormData(item);
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
                            </>
                          )}
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
              <span className="text-gray-900 font-semibold">
                {filteredLeave.length === 0 ? "0" : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="text-gray-900 font-semibold">
                {Math.min(endIndex, filteredLeave.length)}
              </span>{" "}
              of{" "}
              <span className="text-gray-900 font-semibold">
                {filteredLeave.length}
              </span>{" "}
              entries
            </span>

            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              >
                First
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
              >
                <GrPrevious />
              </button>
              <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-semibold min-w-[45px] text-center">
                {currentPage}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
              >
                <GrNext />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
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
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
                <h2 className="text-xl font-bold text-gray-900">
                  {mode === "view"
                    ? "View Leave Request"
                    : mode === "edit"
                      ? "Edit Leave Request"
                      : "Add New Leave Request"}
                </h2>
                <button
                  onClick={() => setOpenModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <RxCross2 className="text-2xl" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Employee */}
                <div>
                  <SearchDropdown
                    label={
                      <>
                        Employee <span className="text-red-500">*</span>
                      </>
                    }
                    name="employee_id"
                    value={formData.employee_id}
                    displayValue={formData.employee_name || ""}
                    options={employeeOptions}
                    labelKey="full_name"
                    valueKey="company_enrollment_id"
                    labelName="employee_name"
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 xl:text-base rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 transition-all shadow-sm font-medium"
                    labelStyle="text-sm xl:text-base font-bold text-gray-700 mb-2 block"
                  />
                </div>

                {/* Leave Type */}
                <div>
                  <SearchDropdown
                    label={
                      <>
                        Leave Type <span className="text-red-500">*</span>
                      </>
                    }
                    name="leave_type"
                    value={formData.leave_type}
                    options={leaveTypeOptions}
                    labelKey="name"
                    valueKey="name"
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 xl:text-base rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 transition-all shadow-sm font-medium"
                    labelStyle="text-sm xl:text-base font-bold text-gray-700 mb-2 block"
                  />
                </div>

                {/* First Date of Absence */}
                <div>
                  <label className="text-sm xl:text-base font-semibold text-gray-700 mb-2 block">
                    First Date of Absence{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    onClick={() => setFromDateSpinner(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
                  />
                  {fromDateSpinner && (
                    <SpinnerDatePicker
                      value={formData.start_date}
                      onChange={(date) =>
                        setFormData({ ...formData, start_date: date })
                      }
                      onClose={() => setFromDateSpinner(false)}
                    />
                  )}
                </div>

                {/* Last Date of Absence */}
                <div>
                  <label className="text-sm xl:text-base font-semibold text-gray-700 mb-2 block">
                    Last Date of Absence <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    onClick={() => setToDateSpinner(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
                  />
                  {toDateSpinner && (
                    <SpinnerDatePicker
                      value={formData.end_date}
                      onChange={(date) =>
                        setFormData({ ...formData, end_date: date })
                      }
                      onClose={() => setToDateSpinner(false)}
                    />
                  )}
                </div>

                {/* Resume Duty On */}
                <div>
                  <label className="text-sm xl:text-base font-semibold text-gray-700 mb-2 block">
                    Resume Duty On
                  </label>
                  <input
                    name="resume_date"
                    value={formData.resume_date}
                    onChange={handleChange}
                    onClick={() => setShowResumeSpinner(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
                  />
                  {showResumeSpinner && (
                    <SpinnerDatePicker
                      value={formData.resume_date}
                      onChange={(date) =>
                        setFormData({ ...formData, resume_date: date })
                      }
                      onClose={() => setShowResumeSpinner(false)}
                    />
                  )}
                </div>

                {/* Number of Days */}
                <div>
                  <label className="text-sm xl:text-base font-semibold text-gray-700 mb-2 block">
                    Number of Days <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="number_of_days"
                    value={formData.number_of_days}
                    placeholder="Number of Days"
                    disabled
                    className="w-full bg-gray-100 border border-gray-200 text-gray-500 px-3 py-2 xl:text-base rounded-lg cursor-not-allowed transition-all shadow-sm"
                  />
                </div>

                {/* Leave Pending of Approvals */}
                <div>
                  <label className="text-sm xl:text-base font-semibold text-gray-700 mb-2 block">
                    Leave Pending of Approvals (No of Days)
                  </label>
                  <input
                    name="pendingDays"
                    value={formData.pendingDays}
                    onChange={handleChange}
                    placeholder="Leave Pending of Approvals (No of Days)"
                    disabled={mode === "view"}
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
                  />
                </div>

                {/* Leave Balance */}
                <div>
                  <label className="text-sm xl:text-base font-semibold text-gray-700 mb-2 block">
                    Leave Balance
                  </label>
                  <input
                    name="leaveBalance"
                    value={formData.leaveBalance}
                    onChange={handleChange}
                    placeholder="Leave Balance"
                    disabled={mode === "view"}
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
                  />
                </div>

                {/* Contact */}
                <div>
                  <label className="text-sm xl:text-base font-semibold text-gray-700 mb-2 block">
                    Contact <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    placeholder="Contact"
                    disabled={mode === "view"}
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm xl:text-base font-semibold text-gray-700 mb-2 block">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    disabled={mode === "view"}
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
                  />
                </div>

                {/* Leave Reason */}
                <div className="lg:col-span-2">
                  <label className="text-sm xl:text-base font-semibold text-gray-700 mb-2 block">
                    Leave Reason
                  </label>
                  <input
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Reason for Leave"
                    disabled={mode === "view"}
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
                  />
                </div>

                {/* Is HalfDay */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl h-fit md:mt-6">
                  <input
                    type="checkbox"
                    name="is_half_day"
                    checked={formData.is_half_day}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className="w-5 h-5 cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
                  />
                  <label className="text-gray-700 text-sm xl:text-base font-semibold cursor-pointer">
                    Is HalfDay
                  </label>
                </div>
              </div>

              {/* Approval Status (view mode only) */}
              {mode === "view" &&
                selectedId &&
                (() => {
                  const item = currentLeave.find(
                    (entry) => entry.id === selectedId,
                  );
                  return item ? (
                    <>
                      <div className="mt-8 pt-6 border-t border-blue-100/30">
                        <h3 className="text-base font-bold text-gray-700 mb-4">
                          Approval Status
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                              FA
                            </label>
                            <p
                              className={`w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm ${item.fa ? (item.fa === "✔" ? "text-green-600" : "text-red-500") : "text-gray-400"}`}
                            >
                              {item.fa || "⏳"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                              FA Name
                            </label>
                            <p className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-700">
                              {item.faname || "⏳"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                              SA
                            </label>
                            <p
                              className={`w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm ${item.sa ? (item.sa === "✔" ? "text-green-600" : "text-red-500") : "text-gray-400"}`}
                            >
                              {item.sa || "⏳"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                              SA Name
                            </label>
                            <p className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-700">
                              {item.saname || "⏳"}
                            </p>
                          </div>
                          <div className="lg:col-span-2">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                              Rejected Reason
                            </label>
                            <p className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-700">
                              {item.rejectedreason || "⏳"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null;
                })()}

              {/* Action Buttons */}
              {mode !== "view" && (
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-blue-100/30">
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
    </>
  );
};

export default LeaveRequest;

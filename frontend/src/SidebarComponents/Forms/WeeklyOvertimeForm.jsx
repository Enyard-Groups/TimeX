import React, { useEffect, useState } from "react";
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
import SignPad from "./SignPad";
import SpinnerTimePicker from "../SpinnerTimePicker";
import SearchDropdown from "../SearchDropdown";
import axios from "axios";

const API_URL = "http://localhost:3000/api/form/weeklyOvertime";

const WeeklyOvertimeForm = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [requestData, setRequestData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCheckedDateSpinner, setShowCheckedDateSpinner] = useState(false);
  const [showApprovedDatePicker, setShowApprovedDatePicker] = useState(false);
  const [showVerifiedDatePicker, setShowVerifiedDatePicker] = useState(false);
  const [activeDateIndex, setActiveDateIndex] = useState(null);
  const [activeInTimeIndex, setActiveInTimeIndex] = useState(null);
  const [activeOutTimeIndex, setActiveOutTimeIndex] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [locations, setLocations] = useState([]);

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

  const labelStyle =
    "text-sm xl:text-base focus:outline-none font-semibold text-slate-600 mb-1.5 block";

  const defaultFormData = {
    employee_name: "",
    designation: "",
    enrollment_id: "",
    site_name: "",
    rest_day: false,
    shift_extension: false,
    overtime_details: [
      {
        day: "",
        date: null,
        startTime: null,
        endTime: null,
        totalHours: null,
        reason: "",
      },
    ],
    checker_name: "",
    checkerSignMode: "",
    checker_signature: null,
    checker_signature_drawn: null,
    checkerSignaturePreview: null,
    checked_date: null,

    approver_name: "",
    approverSignMode: "",
    approver_signature: null,
    approver_signature_drawn: null,
    approverSignaturePreview: null,
    approved_date: null,

    verifier_details: {
      verified_by: "",
      verifier_name: "",
      verifierSignMode: "",
      verifier_signature: null,
      verifier_signature_drawn: null,
      verifierSignaturePreview: null,
      verified_date: null,
    },
  };

  const [formData, setFormData] = useState(defaultFormData);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setRequestData(response.data);
    } catch (error) {
      console.error("Error fetching weekly overtime data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [empRes, desRes, locRes] = await Promise.all([
        axios.get("http://localhost:3000/api/employee"),
        axios.get("http://localhost:3000/api/master/designation"),
        axios.get("http://localhost:3000/api/master/geofencing"),
      ]);
      setEmployees(empRes.data);
      setDesignations(desRes.data);
      setLocations(locRes.data);
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchOptions();
  }, []);

  useEffect(() => {
    if (formData.employee_name && mode !== "view") {
      const selectedEmp = employees.find(
        (emp) => emp.full_name === formData.employee_name,
      );
      if (selectedEmp) {
        setFormData((prev) => ({
          ...prev,
          enrollment_id: selectedEmp.company_enrollment_id || "",
          designation: selectedEmp.designation_name || prev.designation,
        }));
      }
    }
  }, [formData.employee_name, employees]);

  const getTimeDiff = (startTime, endTime) => {
    const [ih, im, is] = startTime.split(":").map(Number);
    const [oh, om, os] = endTime.split(":").map(Number);

    const inSeconds = ih * 3600 + im * 60 + is;
    const outSeconds = oh * 3600 + om * 60 + os;

    let diff = outSeconds - inSeconds;

    if (diff < 0) {
      return "00:00:00";
    }

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleRowChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedRows = [...prev.overtime_details];

      updatedRows[index][field] = value;

      const startTime = updatedRows[index].startTime;
      const endTime = updatedRows[index].endTime;

      if (startTime && endTime) {
        const startStr =
          startTime instanceof Date
            ? startTime.toLocaleTimeString([], { hour12: false })
            : startTime;
        const endStr =
          endTime instanceof Date
            ? endTime.toLocaleTimeString([], { hour12: false })
            : endTime;

        updatedRows[index].totalHours = getTimeDiff(startStr, endStr);
      }

      return {
        ...prev,
        overtime_details: updatedRows,
      };
    });
  };

  const addRow = () => {
    setFormData((prev) => ({
      ...prev,
      overtime_details: [
        ...prev.overtime_details,
        {
          day: "",
          date: null,
          startTime: null,
          endTime: null,
          totalHours: null,
          reason: "",
        },
      ],
    }));
  };

  const deleteRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      overtime_details: prev.overtime_details.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (e, section = null, subsection = null) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      if (section && subsection) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [subsection]: {
              ...prev[section][subsection],
              [name]: type === "checkbox" ? checked : value,
            },
          },
        };
      }

      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [name]: type === "checkbox" ? checked : value,
          },
        };
      }

      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentrequestData = requestData.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(requestData.length / entriesPerPage),
  );

  // Handle submit
  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        toast.success("Request Updated");
      } else {
        await axios.post(API_URL, formData);
        toast.success("Request Submitted");
      }
      fetchData();
      setOpenModal(false);
      setEditId(null);
      setFormData(defaultFormData);
    } catch (error) {
      console.error("Error submitting weekly overtime:", error);
      toast.error("Failed to submit form");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        toast.success("Deleted Successfully");
        fetchData();
      } catch (error) {
        console.error("Error deleting record:", error);
        toast.error("Failed to delete record");
      }
    }
  };

  const handleCopy = () => {
    const header = [
      "Employee Name",
      "Enrollment ID",
      "Designation",
      "Date",
    ].join("\t");

    const rows = requestData
      .map((item) => {
        return [
          item.employee_name,
          item.enrollment_id,
          item.designation,
          item.created_at,
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = requestData.map((item) => ({
      EmployeeName: item.employee_name,
      EnrollmentID: item.enrollment_id,
      Designation: item.designation,
      Date: item.created_at,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "WeeklyOvertimeFormData");

    XLSX.writeFile(workbook, "WeeklyOvertimeFormData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "Employee Name",
      "Enrollment ID",
      "Designation",
      "Date",
    ];

    const tableRows = [];

    requestData.forEach((item) => {
      const row = [
        item.employee_name,
        item.enrollment_id,
        item.designation,
        item.created_at,
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("WeeklyOvertimeFormData.pdf");
  };

  return (
    <div className="mb-6 max-w-[1920px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center h-[30px] gap-2 text-base xl:text-xl  font-semibold text-gray-900">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Forms</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div
            onClick={() => setOpenModal(false)}
            className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
          >
            Weekly Overtime Form
          </div>
        </h1>
        {!openModal && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setMode("");
                setEditId(null);
                setFormData(defaultFormData);
                setOpenModal(true);
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white xl:text-lg font-semibold px-6 py-2 rounded-lg border border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
            >
              + Add New
            </button>
          </div>
        )}
      </div>

      {/* Main Table Container */}
      {!openModal && (
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl animate-in fade-in duration-500">
          <div className="p-6 border-b border-blue-100/30">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm xl:text-base  font-medium text-gray-600">
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
                  {[10, 25, 50, 100].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <span className="text-sm xl:text-base  font-medium text-gray-600">
                  entries
                </span>
              </div>

              <div className="flex flex-wrap gap-3 items-center justify-center">
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

          <div
            className="overflow-x-auto min-h-[350px]"
            style={{ scrollbarWidth: "none" }}
          >
            <table className="w-full text-[17px]">
              <thead>
                <tr className="bg-slate-50 border-b border-blue-100/50">
                  <th className="py-3 px-6 hidden sm:table-cell font-semibold text-gray-700">
                    SL.No
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700 text-center">
                    Employee Name
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                    Enrollment Id
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                    Designation
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700 text-center">
                    Submitted Date
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span>Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentrequestData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-12 text-center text-gray-500 font-medium"
                    >
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentrequestData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/60"
                    >
                      <td className="py-3 px-6 hidden sm:table-cell text-gray-900 text-center">
                        {startIndex + index + 1}
                      </td>
                      <td className="py-3 px-6 font-medium text-gray-900 text-center">
                        {item.employee_name}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600 font-mono">
                        {item.enrollment_id}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600 font-mono text-center">
                        {item.designation}
                      </td>
                      <td className="py-3 px-6 text-gray-600 text-center">
                        {item.created_at}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex justify-center gap-3">
                          <FaEye
                            onClick={() => {
                              setFormData(item);
                              setMode("view");
                              setOpenModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 xl:text-xl  cursor-pointer transition-all"
                            title="View"
                          />
                          <FaPen
                            onClick={() => {
                              setFormData(item);
                              setEditId(item.id);
                              setMode("edit");
                              setOpenModal(true);
                            }}
                            className="text-green-500 hover:text-green-700 xl:text-xl  cursor-pointer transition-all"
                            title="Edit"
                          />
                          <MdDeleteForever
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 xl:text-xl  cursor-pointer transition-all"
                            title="Delete"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {/* Pagination */}
          <div className="p-6 border-t border-blue-100/30 flex flex-col sm:flex-row justify-between items-center gap-6">
            <span className="text-sm xl:text-base  text-gray-600">
              Showing{" "}
              <span className="text-gray-900 font-semibold">
                {requestData.length === 0 ? "0" : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="text-gray-900 font-semibold">
                {Math.min(endIndex, requestData.length)}
              </span>{" "}
              of{" "}
              <span className="text-gray-900 font-semibold">
                {requestData.length}
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
      )}

      {/* Modal Section */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-[1500px] max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in duration-200"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
              <h2 className="text-xl   font-bold text-gray-900">
                {mode === "view"
                  ? "Overtime Details"
                  : mode === "edit"
                    ? "Edit Overtime Form"
                    : "Weekly Overtime Application"}
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="border p-8 rounded-xl border-gray-400/20 shadow-inner bg-white">
              <div
                className="max-h-[75vh] overflow-y-auto pr-2 text-sm xl:text-base "
                style={{ scrollbarWidth: "none" }}
              >
                {/* Staff Information Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex flex-col gap-2">
                    <label className={labelStyle}>Employee Name</label>
                    <SearchDropdown
                      name="employee_name"
                      value={formData.employee_name}
                      options={employees}
                      labelKey="full_name"
                      valueKey="full_name"
                      formData={formData}
                      inputStyle={inputStyle}
                      setFormData={setFormData}
                      disabled={mode === "view"}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelStyle}>Employee ID</label>
                    <input
                      name="enrollment_id"
                      value={formData.enrollment_id}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelStyle}>Site Name</label>
                    <SearchDropdown
                      name="site_name"
                      value={formData.site_name}
                      options={locations}
                      labelKey="name"
                      valueKey="name"
                      inputStyle={inputStyle}
                      formData={formData}
                      setFormData={setFormData}
                      disabled={mode === "view"}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelStyle}>Designation</label>
                    <SearchDropdown
                      name="designation"
                      value={formData.designation}
                      options={designations}
                      labelKey="name"
                      valueKey="name"
                      inputStyle={inputStyle}
                      formData={formData}
                      setFormData={setFormData}
                      disabled={mode === "view"}
                    />
                  </div>
                </div>

                {/* Overtime Type and Details Table */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>{" "}
                    Overtime Type & Log
                  </h3>
                  <div className="flex gap-8 mb-4 px-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="rest_day"
                        checked={formData.rest_day}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="w-5 h-5 accent-blue-600"
                      />{" "}
                      <span className="font-bold text-gray-700">Rest Day</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="shift_extension"
                        checked={formData.shift_extension}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="w-5 h-5 accent-blue-600"
                      />{" "}
                      <span className="font-bold text-gray-700">
                        Shift Extension
                      </span>
                    </label>
                  </div>

                  <div className="rounded-xl border border-gray-200 shadow-sm">
                    <div className="hidden md:grid grid-cols-[48px_1fr_1fr_1fr_1fr_80px_1fr_60px] bg-slate-100 text-gray-700 font-bold border-b border-gray-200 text-sm">
                      <div className="p-3 text-center">#</div>
                      <div className="p-3 text-center">Day</div>
                      <div className="p-3 text-center">Date</div>
                      <div className="p-3 text-center">Start</div>
                      <div className="p-3 text-center">End</div>
                      <div className="p-3 text-center">Total</div>
                      <div className="p-3 text-center">Reason</div>
                      <div className="p-3 text-center">Action</div>
                    </div>

                    <div className="flex flex-col">
                      {formData.overtime_details.map((row, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:grid md:grid-cols-[48px_1fr_1fr_1fr_1fr_80px_1fr_60px] border-b border-gray-100 last:border-0 hover:bg-slate-50 transition-colors"
                        >
                          <div className="p-2 md:p-3 bg-slate-50 md:bg-transparent text-center text-gray-400 font-mono text-xs border-b md:border-b-0 flex justify-between md:block">
                            <span className="md:hidden font-bold text-gray-600 uppercase text-center">
                              Entry #{index + 1}
                            </span>
                            <span className="md:block">{index + 1}</span>
                          </div>

                          {/* Day & Date - Grouped for mobile space */}
                          <div className="grid grid-cols-2 md:contents">
                            <div className="p-2 md:p-3 border-r md:border-r-0 border-b md:border-b-0">
                              <span className="md:hidden text-[10px] uppercase text-gray-400 block mb-1 text-center">
                                Day
                              </span>
                              <select
                                className="w-full bg-transparent outline-none text-sm"
                                value={row.day}
                                onChange={(e) =>
                                  handleRowChange(index, "day", e.target.value)
                                }
                                disabled={mode === "view"}
                              >
                                <option value="">Select</option>
                                {[
                                  "Monday",
                                  "Tuesday",
                                  "Wednesday",
                                  "Thursday",
                                  "Friday",
                                  "Saturday",
                                  "Sunday",
                                ].map((d) => (
                                  <option key={d}>{d}</option>
                                ))}
                              </select>
                            </div>
                            <div className="p-2 md:p-3 border-b md:border-b-0 relative">
                              <span className="md:hidden text-[10px] uppercase text-gray-400 block mb-1 text-center">
                                Date
                              </span>
                              <input
                                value={row.date || ""}
                                onClick={() =>
                                  mode !== "view" && setActiveDateIndex(index)
                                }
                                readOnly
                                className="w-full bg-transparent focus:outline-none cursor-pointer  text-center text-sm"
                                placeholder="dd/mm/yyyy"
                              />
                              {activeDateIndex === index && (
                                <div className="absolute z-20 left-0">
                                  <SpinnerDatePicker
                                    value={row.date}
                                    onChange={(date) =>
                                      handleRowChange(index, "date", date)
                                    }
                                    onClose={() => setActiveDateIndex(null)}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Start & End Times */}
                          <div className="grid grid-cols-2 md:contents">
                            <div className="p-2 md:p-3 border-r md:border-r-0 border-b md:border-b-0 relative text-center">
                              <span className="md:hidden text-[10px] uppercase text-gray-400 block mb-1">
                                Start
                              </span>
                              <div
                                className="cursor-pointer text-blue-600  text-center font-mono text-sm"
                                onClick={() =>
                                  mode !== "view" && setActiveInTimeIndex(index)
                                }
                              >
                                {row.startTime instanceof Date
                                  ? row.startTime.toLocaleTimeString([], {
                                      hour12: false,
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : row.startTime || "00:00"}
                              </div>
                              {activeInTimeIndex === index && (
                                <SpinnerTimePicker
                                  value={row.startTime}
                                  onChange={(time) =>
                                    handleRowChange(index, "startTime", time)
                                  }
                                  onClose={() => setActiveInTimeIndex(null)}
                                />
                              )}
                            </div>
                            <div className="p-2 md:p-3 border-b md:border-b-0 relative text-center">
                              <span className="md:hidden text-[10px] uppercase text-gray-400 block mb-1 text-center">
                                End
                              </span>
                              <div
                                className="cursor-pointer text-blue-600  text-center font-mono text-sm"
                                onClick={() =>
                                  mode !== "view" &&
                                  setActiveOutTimeIndex(index)
                                }
                              >
                                {row.endTime instanceof Date
                                  ? row.endTime.toLocaleTimeString([], {
                                      hour12: false,
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : row.endTime || "00:00"}
                              </div>
                              {activeOutTimeIndex === index && (
                                <SpinnerTimePicker
                                  value={row.endTime}
                                  onChange={(time) =>
                                    handleRowChange(index, "endTime", time)
                                  }
                                  onClose={() => setActiveOutTimeIndex(null)}
                                />
                              )}
                            </div>
                          </div>

                          {/* Total & Action */}
                          <div className="grid grid-cols-2 md:contents">
                            <div className="p-2 md:p-3 bg-gray-50 md:bg-gray-50/50 border-r md:border-r-0 border-b md:border-b-0">
                              <span className="md:hidden text-[10px] uppercase text-gray-400 block mb-1 text-center">
                                Total
                              </span>
                              <span className="font-bold text-gray-900 text-sm">
                                {row.totalHours || "00:00"}
                              </span>
                            </div>
                            <div className="p-2 md:p-3">
                              <span className="md:hidden text-[10px] uppercase text-gray-400 block mb-1 text-center">
                                Reason
                              </span>
                              <input
                                name="reason"
                                value={row.reason}
                                onChange={(e) =>
                                  handleRowChange(
                                    index,
                                    "reason",
                                    e.target.value,
                                  )
                                }
                                disabled={mode === "view"}
                                className={`${inputStyle} text-sm`}
                                placeholder="Type reason..."
                              />
                            </div>
                            <div className="p-2 md:p-3 border-b md:border-b-0 flex items-center justify-center">
                              <button
                                onClick={() => deleteRow(index)}
                                disabled={mode === "view"}
                                className="text-red-500 hover:text-red-700 disabled:opacity-30 flex items-center gap-2 md:block"
                              >
                                <MdDeleteForever className="text-xl mx-auto" />
                                <span className="md:hidden text-xs">
                                  Delete Row
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {mode !== "view" && (
                      <button
                        onClick={addRow}
                        className="w-full py-3 bg-slate-50 text-blue-600 font-bold hover:bg-blue-50 transition-all border-t text-sm"
                      >
                        + Add Another Row
                      </button>
                    )}
                  </div>
                </div>

                {/* Verification and Approval Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                  {/* Head Guard Verification */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-gray-200">
                    <h3 className="font-bold text-gray-800 border-b-2 border-blue-500 pb-2 mb-6 w-fit">
                      Checked By: Security Head Guard
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className={labelStyle}>Name</label>
                        <input
                          name="checker_name"
                          value={formData.checker_name}
                          onChange={handleChange}
                          disabled={mode === "view"}
                          className={inputStyle}
                        />
                      </div>
                      <div className="relative">
                        <label className={labelStyle}>Date</label>
                        <input
                          value={formData.checked_date || ""}
                          onClick={() =>
                            mode !== "view" && setShowCheckedDateSpinner(true)
                          }
                          readOnly
                          disabled={mode === "view"}
                          className={inputStyle}
                          placeholder="dd/mm/yyyy"
                        />
                        {showCheckedDateSpinner && (
                          <div className="absolute z-10 shadow-2xl">
                            <SpinnerDatePicker
                              value={formData.checked_date}
                              onChange={(d) =>
                                setFormData((p) => ({ ...p, checked_date: d }))
                              }
                              onClose={() => setShowCheckedDateSpinner(false)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Signature div same */}
                    <div>
                      <label className={labelStyle}>Signature</label>

                      <div className="flex flex-col">
                        {/* Toggle Tabs */}
                        {mode !== "view" && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  checkerSignMode: "upload",
                                }))
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.checkerSignMode === "upload"
                                  ? "bg-[#0f172a] text-white border-[#0f172a]"
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Upload
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  checkerSignMode: "draw",
                                }))
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.checkerSignMode === "draw"
                                  ? "bg-[#0f172a] text-white border-[#0f172a]"
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Sign Here
                            </button>
                          </div>
                        )}

                        {/* Upload Area */}
                        {formData.checkerSignMode === "upload" && (
                          <div>
                            <input
                              type="file"
                              id="checkerSignatureUpload"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    checker_signature: file,
                                    checkerSignaturePreview:
                                      URL.createObjectURL(file),
                                  }));
                                }
                              }}
                            />

                            {/* Drag & Drop */}
                            {mode !== "view" && (
                              <label
                                htmlFor="checkerSignatureUpload"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const file = e.dataTransfer.files[0];
                                  if (file && file.type.startsWith("image/")) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      checker_signature: file,
                                      checkerSignaturePreview:
                                        URL.createObjectURL(file),
                                    }));
                                  }
                                }}
                                className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                              >
                                <svg
                                  className="w-8 h-8 text-gray-400 mb-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4"
                                  />
                                </svg>
                                <p className="text-sm text-gray-500">
                                  Drag & drop or{" "}
                                  <span className="text-[#0f172a] font-medium underline">
                                    browse
                                  </span>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  PNG, JPG, SVG supported
                                </p>
                              </label>
                            )}

                            {/* Preview */}
                            {formData.checkerSignaturePreview && (
                              <div className="mt-4 flex items-center gap-3">
                                <img
                                  src={formData.checkerSignaturePreview}
                                  alt="Signature Preview"
                                  className="h-16 border rounded bg-white p-2 shadow-sm"
                                />
                                {mode !== "view" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        checker_signature: null,
                                        checkerSignaturePreview: null,
                                      }))
                                    }
                                    className="text-xs text-red-500 hover:underline"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Draw Area */}
                        {formData.checkerSignMode === "draw" && (
                          <SignPad
                            fieldName="checker_signature_drawn"
                            formData={formData}
                            setFormData={setFormData}
                            mode={mode}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* School Manager Approval */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-gray-200">
                    <h3 className="font-bold text-gray-800 border-b-2 border-green-500 pb-2 mb-6 w-fit">
                      Approved By: Manager School Operation
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className={labelStyle}>Name</label>
                        <input
                          name="approver_name"
                          value={formData.approver_name}
                          onChange={handleChange}
                          disabled={mode === "view"}
                          className={inputStyle}
                        />
                      </div>
                      <div className="relative">
                        <label className={labelStyle}>Date</label>
                        <input
                          value={formData.approved_date || ""}
                          onClick={() =>
                            mode !== "view" && setShowApprovedDatePicker(true)
                          }
                          readOnly
                          disabled={mode === "view"}
                          className={inputStyle}
                        />
                        {showApprovedDatePicker && (
                          <div className="absolute z-10 shadow-2xl">
                            <SpinnerDatePicker
                              value={formData.approved_date}
                              onChange={(d) =>
                                setFormData((p) => ({ ...p, approved_date: d }))
                              }
                              onClose={() => setShowApprovedDatePicker(false)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Signature div same */}
                    <div>
                      <label className={labelStyle}>Signature</label>

                      <div className="flex flex-col">
                        {/* Toggle Tabs */}
                        {mode !== "view" && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  approverSignMode: "upload",
                                }))
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.approverSignMode === "upload"
                                  ? "bg-[#0f172a] text-white border-[#0f172a]"
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Upload
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  approverSignMode: "draw",
                                }))
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.approverSignMode === "draw"
                                  ? "bg-[#0f172a] text-white border-[#0f172a]"
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Sign Here
                            </button>
                          </div>
                        )}

                        {/* Upload Area */}
                        {formData.approverSignMode === "upload" && (
                          <div>
                            <input
                              type="file"
                              id="approverSignatureUpload"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    approver_signature: file,
                                    approverSignaturePreview:
                                      URL.createObjectURL(file),
                                  }));
                                }
                              }}
                            />

                            {/* Drag & Drop */}
                            {mode !== "view" && (
                              <label
                                htmlFor="approverSignatureUpload"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const file = e.dataTransfer.files[0];
                                  if (file && file.type.startsWith("image/")) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      approver_signature: file,
                                      approverSignaturePreview:
                                        URL.createObjectURL(file),
                                    }));
                                  }
                                }}
                                className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                              >
                                <svg
                                  className="w-8 h-8 text-gray-400 mb-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4"
                                  />
                                </svg>
                                <p className="text-sm text-gray-500">
                                  Drag & drop or{" "}
                                  <span className="text-[#0f172a] font-medium underline">
                                    browse
                                  </span>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  PNG, JPG, SVG supported
                                </p>
                              </label>
                            )}

                            {/* Preview */}
                            {formData.approverSignaturePreview && (
                              <div className="mt-4 flex items-center gap-3">
                                <img
                                  src={formData.approverSignaturePreview}
                                  alt="Signature Preview"
                                  className="h-16 border rounded bg-white p-2 shadow-sm"
                                />
                                {mode !== "view" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        approver_signature: null,
                                        approverSignaturePreview: null,
                                      }))
                                    }
                                    className="text-xs text-red-500 hover:underline"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Draw Area */}
                        {formData.approverSignMode === "draw" && (
                          <SignPad
                            fieldName="approver_signature_drawn"
                            formData={formData}
                            setFormData={setFormData}
                            mode={mode}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Office Use and Submit Section */}
                <div className="bg-slate-100 p-8 rounded-2xl border-2 border-dashed border-slate-300">
                  <h3 className="font-bold text-gray-500 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">
                    For Office Use Only
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <label className="w-1/3 font-bold text-gray-600">
                          Verified By:
                        </label>
                        <input
                          value={formData.verifier_details?.verified_by || ""}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              verifier_details: {
                                ...p.verifier_details,
                                verified_by: e.target.value,
                              },
                            }))
                          }
                          disabled={mode === "view"}
                          className="w-2/3 border-b-2 bg-transparent border-slate-300 outline-none focus:border-blue-500 py-1"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="w-1/3 font-bold text-gray-600">
                          Verifier Name:
                        </label>
                        <input
                          value={formData.verifier_details?.verifier_name || ""}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              verifier_details: {
                                ...p.verifier_details,
                                verifier_name: e.target.value,
                              },
                            }))
                          }
                          disabled={mode === "view"}
                          className="w-2/3 border-b-2 bg-transparent border-slate-300 outline-none focus:border-blue-500 py-1"
                        />
                      </div>
                      <div className="relative flex items-center gap-4">
                        <label className="w-1/3 font-bold text-gray-600">
                          Verified Date:
                        </label>
                        <input
                          value={formData.verifier_details?.verified_date || ""}
                          onClick={() =>
                            mode !== "view" && setShowVerifiedDatePicker(true)
                          }
                          readOnly
                          disabled={mode === "view"}
                          className="w-2/3 border-b-2 bg-transparent border-slate-300 outline-none py-1 cursor-pointer"
                          placeholder="dd/mm/yyyy"
                        />
                        {showVerifiedDatePicker && (
                          <div className="absolute top-10 left-1/3 z-20 shadow-2xl">
                            <SpinnerDatePicker
                              value={formData.verifier_details?.verified_date}
                              onChange={(d) =>
                                setFormData((p) => ({
                                  ...p,
                                  verifier_details: {
                                    ...p.verifier_details,
                                    verified_date: d,
                                  },
                                }))
                              }
                              onClose={() => setShowVerifiedDatePicker(false)}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Verifier Signature logic same */}
                    <div>
                      <label className={labelStyle}>Signature</label>

                      <div className="flex flex-col">
                        {/* Toggle Tabs */}
                        {mode !== "view" && (
                          <div className="flex gap-2 mb-4">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  verifierSignMode: "upload",
                                }))
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.verifierSignMode === "upload"
                                  ? "bg-[#0f172a] text-white border-[#0f172a]"
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Upload
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  verifierSignMode: "draw",
                                }))
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.verifierSignMode === "draw"
                                  ? "bg-[#0f172a] text-white border-[#0f172a]"
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Sign Here
                            </button>
                          </div>
                        )}

                        {/* Upload Area */}
                        {formData.verifierSignMode === "upload" && (
                          <div>
                            <input
                              type="file"
                              id="verifierSignatureUpload"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    verifier_details: {
                                      ...prev.verifier_details,
                                      verifier_signature: file,
                                    },
                                    verifierSignaturePreview:
                                      URL.createObjectURL(file),
                                  }));
                                }
                              }}
                            />

                            {/* Drag & Drop */}
                            {mode !== "view" && (
                              <label
                                htmlFor="verifierSignatureUpload"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const file = e.dataTransfer.files[0];
                                  if (file && file.type.startsWith("image/")) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      verifier_details: {
                                        ...prev.verifier_details,
                                        verifier_signature: file,
                                      },
                                      verifierSignaturePreview:
                                        URL.createObjectURL(file),
                                    }));
                                  }
                                }}
                                className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                              >
                                <svg
                                  className="w-8 h-8 text-gray-400 mb-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4"
                                  />
                                </svg>
                                <p className="text-sm text-gray-500">
                                  Drag & drop or{" "}
                                  <span className="text-[#0f172a] font-medium underline">
                                    browse
                                  </span>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  PNG, JPG, SVG supported
                                </p>
                              </label>
                            )}

                            {/* Preview */}
                            {formData.verifierSignaturePreview && (
                              <div className="mt-4 flex items-center gap-3">
                                <img
                                  src={formData.verifierSignaturePreview}
                                  alt="Signature Preview"
                                  className="h-16 border rounded bg-white p-2 shadow-sm"
                                />
                                {mode !== "view" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        verifier_details: {
                                          ...prev.verifier_details,
                                          verifier_signature: null,
                                        },
                                        verifierSignaturePreview: null,
                                      }))
                                    }
                                    className="text-xs text-red-500 hover:underline"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Draw Area */}
                        {formData.verifierSignMode === "draw" && (
                          <SignPad
                            fieldName="verifier_signature_drawn"
                            formData={formData}
                            setFormData={setFormData}
                            mode={mode}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {mode !== "view" && (
                    <div className="flex justify-end mt-12">
                      <button
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-16 py-3 rounded-xl font-bold xl:text-xl shadow-xl hover:shadow-blue-200 hover:-translate-y-1 transition-all"
                      >
                        Submit Overtime Record
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyOvertimeForm;

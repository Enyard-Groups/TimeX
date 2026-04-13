import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaAngleRight,
  FaAngleRight as FaAngleRightIcon,
} from "react-icons/fa6";
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
import SpinnerTimePicker from "../SpinnerTimePicker";
import SearchDropdown from "../SearchDropdown";

const API_BASE = "http://localhost:3000/api";

const emptyForm = {
  employee_id: "",
  enrollment_id: "",
  location: "",
  location_name: "",
  in_time: null,
  out_time: null,
  remarks: "",
  status: "Pending",
};

const ManualEntryRequest = () => {
  const [mode, setMode] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [manualEntry, setManualEntry] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [showInTimePicker, setShowInTimePicker] = useState(false);
  const [showOutTimePicker, setShowOutTimePicker] = useState(false);

  const [formData, setFormData] = useState(emptyForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [manualRes, empRes, locRes] = await Promise.all([
        axios.get(`${API_BASE}/requests/manual`),
        axios.get(`${API_BASE}/employee`),
        axios.get(`${API_BASE}/master/geofencing`),
      ]);
      console.log(manualRes.data);
      setManualEntry(manualRes.data);
      setEmployeeOptions(empRes.data);
      setLocationOptions(locRes.data || []);
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

  // Update enrollment_id when employee changes
  useEffect(() => {
    if (formData.employee_id) {
      const emp = employeeOptions.find(
        (e) => e.company_enrollment_id === formData.employee_id,
      );
      if (emp) {
        setFormData((prev) => ({
          ...prev,
          enrollment_id: emp.device_enrollment_id || "N/A",
        }));
      }
    }
  }, [formData.employee_id, employeeOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const { employee_id, location, in_time, out_time } = formData;

    if (!employee_id || !location || !in_time || !out_time) {
      toast.error("Please fill all required fields");
      return;
    }

    if (new Date(out_time) <= new Date(in_time)) {
      toast.error("Punch Out Time must be after Punch In Time");
      return;
    }

    try {
      if (editId) {
        const res = await axios.put(
          `${API_BASE}/requests/manual/${editId}`,
          formData,
        );
        setManualEntry((prev) =>
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
        const res = await axios.post(`${API_BASE}/requests/manual`, formData);
        setManualEntry((prev) => [
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`${API_BASE}/requests/manual/${id}`);
        setManualEntry((prev) => prev.filter((item) => item.id !== id));
        toast.success("Deleted Successfully");
      } catch (error) {
        toast.error(error?.response?.data?.error || "Delete failed");
      }
    }
  };

  const filteredEntry = manualEntry.filter((x) => {
    const locName =
      x.location_name ||
      locationOptions.find((l) => l.id == x.location)?.name ||
      x.location ||
      "";
    return (
      (x.employee_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      locName.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentEntry = filteredEntry.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredEntry.length / entriesPerPage),
  );

  const handleCopy = () => {
    const header = [
      "Employee",
      "Location",
      "In Time",
      "Out Time",
      "Status",
    ].join("\t");
    const rows = filteredEntry
      .map((item) =>
        [
          item.employee_name,
          item.location_name ||
          locationOptions.find((l) => l.id == item.location)?.name ||
          item.location,
          item.in_time ? new Date(item.in_time).toLocaleString() : "-",
          item.out_time ? new Date(item.out_time).toLocaleString() : "-",
          item.status,
        ].join("\t"),
      )
      .join("\n");

    const text = `${header}\n${rows}`;
    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredEntry.map((item) => ({
      Employee: item.employee_name,
      Location:
        item.location_name ||
        locationOptions.find((l) => l.id == item.location)?.name ||
        item.location,
      InTime: item.in_time ? new Date(item.in_time).toLocaleString() : "-",
      OutTime: item.out_time ? new Date(item.out_time).toLocaleString() : "-",
      Status: item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ManualEntry");
    XLSX.writeFile(workbook, "ManualEntryData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    const tableColumn = [
      "Employee",
      "Location",
      "In Time",
      "Out Time",
      "Status",
    ];
    const tableRows = filteredEntry.map((item) => [
      item.employee_name,
      item.location_name ||
      locationOptions.find((l) => l.id == item.location)?.name ||
      item.location,
      item.in_time ? new Date(item.in_time).toLocaleString() : "-",
      item.out_time ? new Date(item.out_time).toLocaleString() : "-",
      item.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("ManualEntryData.pdf");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "—";
    if (typeof timeStr === "string" && timeStr.includes(":") && !timeStr.includes("-") && !timeStr.includes("T")) {
      return timeStr;
    }
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      return date.toLocaleTimeString([], { hour12: false });
    } catch (e) {
      return timeStr;
    }
  };

  return (
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
            Manual Entry Request
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
                className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 transition-all"
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
                placeholder="Search manual entries..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 rounded-lg text-sm xl:text-base placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
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

        {/* Table Section */}
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
                <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden lg:table-cell">
                  Location
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden md:table-cell">
                  In Time
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden md:table-cell">
                  Out Time
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden sm:table-cell">
                  Status
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
                    colSpan="6"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : currentEntry.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-4xl opacity-40">✅</div>
                      <p className="text-gray-500 text-base font-medium">
                        No Mannual Requests
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentEntry.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/60"
                  >
                    <td className="px-6 py-2.5 text-center font-medium text-gray-800">
                      {item.employee_name || item.employee_id}
                    </td>
                    <td className="px-6 py-2.5 text-center text-gray-600 hidden lg:table-cell">
                      {item.location}
                    </td>
                    <td className="px-6 py-2.5 text-center text-gray-600 font-mono text-sm hidden md:table-cell">
                      {formatTime(item.in_time)}
                    </td>
                    <td className="px-6 py-2.5 text-center text-gray-600 font-mono text-sm hidden md:table-cell">
                      {formatTime(item.out_time)}
                    </td>
                    <td className="px-6 py-2.5 text-center hidden sm:table-cell">
                      <span
                        className={`px-3 py-1 rounded-full text-xs xl:text-sm font-bold ${item.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-2.5 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setFormData(item);
                            setMode("view");
                            setOpenModal(true);
                          }}
                          className="text-blue-500 hover:bg-blue-100 p-1.5 rounded-lg transition-all"
                          title="View"
                        >
                          <FaEye className="text-lg" />
                        </button>
                        {item.status === "Pending" && (
                          <>
                            <button
                              onClick={() => {
                                setEditId(item.id);
                                setFormData(item);
                                setMode("edit");
                                setOpenModal(true);
                              }}
                              className="text-green-500 hover:bg-green-100 p-1.5 rounded-lg transition-all"
                              title="Edit"
                            >
                              <FaPen className="text-lg" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition-all"
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

        {/* Pagination Section */}
        <div className="p-6 border-t border-blue-100/30 flex flex-col sm:flex-row justify-between items-center gap-6">
          <span className="text-sm xl:text-base text-gray-600">
            Showing{" "}
            <span className="text-gray-900 font-semibold">
              {filteredEntry.length === 0 ? "0" : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="text-gray-900 font-semibold">
              {Math.min(endIndex, filteredEntry.length)}
            </span>{" "}
            of{" "}
            <span className="text-gray-900 font-semibold">
              {filteredEntry.length}
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

      {/* Modal Section */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
              <h2 className="text-xl font-bold text-gray-900">
                {mode === "view"
                  ? "View Manual Entry"
                  : editId
                    ? "Edit Manual Entry"
                    : "Add New Manual Entry"}
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
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
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 xl:text-base rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 transition-all shadow-sm font-medium"
                  labelStyle="text-sm xl:text-base font-bold text-gray-700 mb-2 block"
                />
              </div>

              <div>
                <label className="text-sm xl:text-base font-bold text-gray-700 mb-2 block">
                  Enrollment ID
                </label>
                <input
                  value={formData.enrollment_id}
                  readOnly
                  className="w-full bg-gray-100 border-2 border-gray-200 text-gray-500 px-4 py-2.5 xl:text-base rounded-xl transition-all shadow-sm cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <SearchDropdown
                  label={
                    <>
                      Location <span className="text-red-500">*</span>
                    </>
                  }
                  name="location"
                  value={formData.location}
                  displayValue={formData.location_name || ""}
                  options={locationOptions}
                  labelKey="name"
                  valueKey="id"
                  labelName="location_name"
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 xl:text-base rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 transition-all shadow-sm font-medium"
                  labelStyle="text-sm xl:text-base font-bold text-gray-700 mb-2 block"
                />
              </div>

              <div className="relative">
                <label className="text-sm xl:text-base font-bold text-gray-700 mb-2 block">
                  Punch In Time <span className="text-red-500">*</span>
                </label>
                <input
                  value={
                    formData.in_time
                      ? new Date(formData.in_time).toLocaleTimeString()
                      : ""
                  }
                  onClick={() => mode !== "view" && setShowInTimePicker(true)}
                  disabled={mode === "view"}
                  readOnly
                  placeholder="HH:MM:SS"
                  className="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 xl:text-base rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/60 disabled:bg-gray-100 transition-all shadow-sm font-medium"
                />
                {showInTimePicker && (
                  <SpinnerTimePicker
                    value={formData.in_time}
                    onChange={(next) =>
                      setFormData({ ...formData, in_time: next })
                    }
                    onClose={() => setShowInTimePicker(false)}
                  />
                )}
              </div>

              <div className="relative">
                <label className="text-sm xl:text-base font-bold text-gray-700 mb-2 block">
                  Punch Out Time <span className="text-red-500">*</span>
                </label>
                <input
                  value={
                    formData.out_time
                      ? new Date(formData.out_time).toLocaleTimeString()
                      : ""
                  }
                  onClick={() => mode !== "view" && setShowOutTimePicker(true)}
                  disabled={mode === "view"}
                  readOnly
                  placeholder="HH:MM:SS"
                  className="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 xl:text-base rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/60 disabled:bg-gray-100 transition-all shadow-sm font-medium"
                />
                {showOutTimePicker && (
                  <SpinnerTimePicker
                    value={formData.out_time}
                    onChange={(next) =>
                      setFormData({ ...formData, out_time: next })
                    }
                    onClose={() => setShowOutTimePicker(false)}
                  />
                )}
              </div>

              <div className="lg:col-span-2">
                <label className="text-sm xl:text-base font-bold text-gray-700 mb-2 block">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  rows="1"
                  className="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 xl:text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/60 disabled:bg-gray-100 transition-all shadow-sm font-medium"
                  placeholder="Enter optional remarks..."
                />
              </div>
            </div>

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
  );
};

export default ManualEntryRequest;

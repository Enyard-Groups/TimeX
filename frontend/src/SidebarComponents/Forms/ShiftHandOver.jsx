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
import axios from "axios";

const API_URL = "http://localhost:3000/api/form/shiftHandOver";

const ShiftHandOver = () => {
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
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [requestData, setRequestData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDateSpinner, setShowDateSpinner] = useState(false);
  const [showInTimePicker, setShowInTimePicker] = useState(false);
  const [showOutTimePicker, setShowOutTimePicker] = useState(false);

  const defaultFormData = {
    school_name: "",
    time_in: null,
    time_out: null,
    date: null,

    guard_out: "",
    guard_in: "",
    id_out: "",
    id_in: "",
    securityRemark: "",
    maintenanceRemark: "",
    staffIssueRemark: "",
    lostFoundRemark: "",
    proceduresRemark: "",
    managementRemark: "",
    damageRemark: "",
    interestRemark: "",
    radios: "",
    tourSystem: "",
    dutyMobile: "",
    keys: "",

    preparedBySignMode: "",
    prepared_by_sign: null,
    preparedBySignPreview: null,
    preparedBySign_drawn: null,

    acknowledgedBySignMode: "",
    acknowledged_by_sign: null,
    acknowledgedBySignPreview: null,
    acknowlegedBySign_drawn: null,
  };

  const [formData, setFormData] = useState(defaultFormData);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      // Backend returns date/time as strings, need to convert to Date objects for pickers
      const data = response.data.map((item) => ({
        ...item,
        time_in: item.time_in ? new Date(`1970-01-01T${item.time_in}`) : null,
        time_out: item.time_out
          ? new Date(`1970-01-01T${item.time_out}`)
          : null,
      }));
      setRequestData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const detailsFields = [
    {
      label: "Special Events Safety And Security Issues",
      name: "securityRemark",
    },
    { label: "Maintenance Work", name: "maintenanceRemark" },
    { label: "Staff Issues", name: "staffIssueRemark" },
    {
      label: "Incident/Accident Report / Lost and Found (If Any)",
      name: "lostFoundRemark",
    },
    {
      label: "New Instructions Or Changes In Work Procedures",
      name: "proceduresRemark",
    },
    {
      label:
        "Special Assignments Instructions From School or Security Management",
      name: "managementRemark",
    },
    { label: "Damaged / Lost key details if any", name: "damageRemark" },
    {
      label: "Other Items of Interest (Fire panel, property damage, etc.)",
      name: "interestRemark",
    },
  ];

  const equipmentFields = [
    { label: "Radios", name: "radios" },
    { label: "Guard Tour System", name: "tourSystem" },
    { label: "Duty Mobile", name: "dutyMobile" },
    { label: "Keys", name: "keys" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
    const coreFields = [
      "school_name",
      "time_in",
      "time_out",
      "date",
      "guard_out",
      "guard_in",
      "id_out",
      "id_in",
      "prepared_by_sign",
      "acknowledged_by_sign",
    ];

    const remarkFields = [
      "securityRemark",
      "maintenanceRemark",
      "staffIssueRemark",
      "lostFoundRemark",
      "proceduresRemark",
      "managementRemark",
      "damageRemark",
      "interestRemark",
    ];

    const equipmentFields = ["radios", "tourSystem", "dutyMobile", "keys"];

    const payload = {};
    const remarks = {};
    const equipment_status = {};

    Object.keys(formData).forEach((key) => {
      if (coreFields.includes(key)) {
        payload[key] = formData[key];
      } else if (remarkFields.includes(key)) {
        remarks[key] = formData[key];
      } else if (equipmentFields.includes(key)) {
        equipment_status[key] = formData[key];
      }
    });

    payload.remarks = remarks;
    payload.equipment_status = equipment_status;

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, payload);
        toast.success("Request Updated");
      } else {
        await axios.post(API_URL, payload);
        toast.success("Request Submitted");
      }

      setOpenModal(false);
      setEditId(null);
      setFormData(defaultFormData);
      fetchData();
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save data");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success("Deleted Successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting data:", error);
      toast.error("Failed to delete data");
    }
  };

  const handleCopy = () => {
    const header = ["School Name", "Time In", "Time Out", "Date"].join("\t");

    const rows = requestData
      .map((item) => {
        return [
          item.school_name,
          item.time_in ? item.time_in.toLocaleTimeString() : "",
          item.time_out ? item.time_out.toLocaleTimeString() : "",
          formatDate(item.date),
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = requestData.map((item) => ({
      SchoolName: item.school_name,
      TimeIn: item.time_in ? item.time_in.toLocaleTimeString() : "",
      TimeOut: item.time_out ? item.time_out.toLocaleTimeString() : "",
      Date: formatDate(item.date),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "ShiftHandOverData");

    XLSX.writeFile(workbook, "ShiftHandOverData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = ["School Name", "Time In", "Time Out", "Date"];

    const tableRows = [];

    requestData.forEach((item) => {
      const row = [
        item.school_name,
        item.time_in ? item.time_in.toLocaleTimeString() : "",
        item.time_out ? item.time_out.toLocaleTimeString() : "",
        formatDate(item.date),
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("ShiftHandOverData.pdf");
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
            Shift Hand Over
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
                    School Name
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                    Time In
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                    Time Out
                  </th>
                  <th className="py-3 px-6 hidden lg:table-cell font-semibold text-gray-700 text-center">
                    Date
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
                      colSpan="6"
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
                      colSpan="6"
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
                        {item.school_name}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600 text-center">
                        {item.time_in
                          ? item.time_in.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                          : "-"}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600 text-center">
                        {item.time_out
                          ? item.time_out.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                          : "-"}
                      </td>
                      <td className="py-3 px-6 hidden lg:table-cell text-gray-600 text-center">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex justify-center gap-3">
                          <FaEye
                            onClick={() => {
                              /* View Logic */ setMode("view");
                              setOpenModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 xl:text-xl  cursor-pointer transition-all"
                          />
                          <FaPen
                            onClick={() => {
                              /* Edit Logic */ setMode("edit");
                              setOpenModal(true);
                            }}
                            className="text-green-500 hover:text-green-700 xl:text-xl  cursor-pointer transition-all"
                          />
                          <MdDeleteForever
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 xl:text-xl  cursor-pointer transition-all"
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
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-[1400px] max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in duration-200"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
              <h2 className="text-xl   font-bold text-gray-900">
                {mode === "view"
                  ? "Handover Record Details"
                  : mode === "edit"
                    ? "Edit Handover Form"
                    : "New Shift Handover"}
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="border p-6 rounded-xl border-gray-400/30 shadow-sm bg-white">
              <div
                className="max-h-[75vh] overflow-y-auto pr-2"
                style={{ scrollbarWidth: "none" }}
              >
                {/* Header Form Row */}
                <div className="grid sm:grid-cols-2 gap-8 mt-4 mb-8">
                  <div className="flex flex-row items-center gap-4">
                    <label
                      className={`whitespace-nowrap font-bold text-gray-700 xl:text-base `}
                    >
                      School Name
                    </label>
                    <input
                      type="text"
                      name="school_name"
                      value={formData.school_name}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className="w-full border-b-2 border-gray-200 focus:border-blue-500 px-2 py-1 outline-none xl:text-base  transition-all"
                    />
                  </div>
                  <div className="flex flex-row items-center gap-4 relative">
                    <label className="font-bold text-gray-700 xl:text-base ">
                      Date
                    </label>
                    <input
                      name="date"
                      value={formatDate(formData.date) || ""}
                      onClick={() =>
                        mode !== "view" && setShowDateSpinner(true)
                      }
                      readOnly
                      disabled={mode === "view"}
                      placeholder="dd/mm/yyyy"
                      className="w-full border-b-2 border-gray-200 focus:border-blue-500 px-2 py-1 outline-none xl:text-base  transition-all cursor-pointer"
                    />
                    {showDateSpinner && (
                      <div className="absolute z-10 top-12">
                        <SpinnerDatePicker
                          value={formData.date}
                          onChange={(d) =>
                            setFormData((p) => ({ ...p, date: d }))
                          }
                          onClose={() => setShowDateSpinner(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <p className="mb-6 p-3 bg-blue-50 text-blue-800 rounded-lg font-medium italic border-l-4 border-blue-500">
                  * Make sure that handover note is signed by both parties
                </p>

                {/* Shift Timings Table */}
                <div className="rounded-xl border border-gray-200 mb-8 shadow-sm overflow-hidden">
                  <div className="hidden md:grid grid-cols-3 bg-slate-100 text-gray-700 border-b border-gray-200">
                    <div className="p-2 border-r border-gray-200 text-center font-bold xl:text-lg ">
                      Shift Detail
                    </div>
                    <div className="p-2 border-r border-gray-200 text-center font-bold xl:text-lg ">
                      Outgoing Party
                    </div>
                    <div className="p-2 text-center font-bold xl:text-lg ">
                      Incoming Party
                    </div>
                  </div>

                  {/* Row 1: Handover Timing */}
                  <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-200">
                    <div className="p-2 bg-slate-50 md:bg-slate-50/50 font-bold text-gray-600 border-b md:border-b-0 md:border-r text-center border-gray-200 text-sm md:text-base">
                      Handover Timing
                    </div>
                    <div className="p-3 md:p-2 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col md:block">
                      <span className="md:hidden text-[10px] uppercase text-center text-gray-400 font-bold mb-1">
                        Outgoing
                      </span>
                      <div
                        className="cursor-pointer text-center font-mono text-lg md:text-xl text-blue-600 hover:bg-blue-50 p-1 rounded"
                        onClick={() =>
                          mode !== "view" && setShowOutTimePicker(true)
                        }
                      >
                        {formData.time_out
                          ? formData.time_out.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                          : "HH:MM:SS"}
                      </div>
                    </div>
                    <div className="p-3 md:p-2 flex flex-col md:block">
                      <span className="md:hidden text-[10px] uppercase text-center text-gray-400 font-bold mb-1">
                        Incoming
                      </span>
                      <div
                        className="cursor-pointer text-center font-mono text-lg md:text-xl text-blue-600 hover:bg-blue-50 p-1 rounded"
                        onClick={() =>
                          mode !== "view" && setShowInTimePicker(true)
                        }
                      >
                        {formData.time_in
                          ? formData.time_in.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                          : "HH:MM:SS"}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Guard Name */}
                  <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-200">
                    <div className="p-2 bg-slate-50 md:bg-slate-50/50 font-bold text-gray-600 border-b md:border-b-0 md:border-r text-center border-gray-200 text-sm md:text-base">
                      Guard Name
                    </div>
                    <div className="p-2 border-b md:border-b-0 md:border-r border-gray-200">
                      <input
                        type="text"
                        placeholder="Outgoing Name"
                        name="guard_out"
                        value={formData.guard_out}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="w-full text-center outline-none focus:bg-blue-50 py-1"
                      />
                    </div>
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Incoming Name"
                        name="guard_in"
                        value={formData.guard_in}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="w-full text-center outline-none focus:bg-blue-50 py-1"
                      />
                    </div>
                  </div>

                  {/* Row 3: ID Card Number */}
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="p-2 bg-slate-50 md:bg-slate-50/50 font-bold text-gray-600 border-b md:border-b-0 md:border-r text-center border-gray-200 text-sm md:text-base">
                      ID Card Number
                    </div>
                    <div className="p-2 border-b md:border-b-0 md:border-r border-gray-200">
                      <input
                        type="number"
                        placeholder="ID Out"
                        name="id_out"
                        value={formData.id_out}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="w-full text-center outline-none focus:bg-blue-50 py-1"
                      />
                    </div>
                    <div className="p-2">
                      <input
                        type="number"
                        placeholder="ID In"
                        name="id_in"
                        value={formData.id_in}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="w-full text-center outline-none focus:bg-blue-50 py-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Description/Remarks Table */}
                <div
                  className="overflow-y-auto rounded-xl border border-gray-200 mb-8 shadow-sm"
                  style={{ scrollbarWidth: "none" }}
                >
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="p-3 border border-gray-200 text-left font-bold xl:text-lg  w-1/2">
                          Key Description Items
                        </th>
                        <th className="p-3 border border-gray-200 text-left font-bold xl:text-lg  w-1/2">
                          Detailed Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailsFields.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-3 border border-gray-200 font-medium text-gray-700">
                            {item.label}
                          </td>
                          <td className="p-3 border border-gray-200">
                            <textarea
                              name={item.name}
                              value={formData[item.name]}
                              onChange={handleChange}
                              disabled={mode === "view"}
                              className="w-full p-2 outline-none focus:ring-1 focus:ring-blue-500 rounded resize-none min-h-[60px]"
                              placeholder="Provide details..."
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Equipment Section */}
                <div className="overflow-hidden rounded-xl border border-gray-200 mb-10 shadow-sm">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="p-3 border border-gray-200 text-left font-bold xl:text-lg ">
                          Security Equipment Assets
                        </th>
                        <th className="p-3 border border-gray-200 text-left font-bold xl:text-lg ">
                          Status Assessment / Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipmentFields.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-3 border border-gray-200 font-medium text-gray-700">
                            {item.label}
                          </td>
                          <td className="p-3 border border-gray-200">
                            <input
                              name={item.name}
                              value={formData[item.name]}
                              onChange={handleChange}
                              disabled={mode === "view"}
                              className="w-full p-2 outline-none focus:bg-blue-50/30 rounded"
                              placeholder="Functional/Damage details..."
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Signature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
                  <div className="flex justify-center">
                    <div>
                      <label className="block text-sm xl:text-base font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">
                        Prepared By (Outgoing Party)
                      </label>
                      <div className=" flex flex-col">
                        <div className="flex justify-center">
                          {/* Toggle Tabs — hidden in view mode */}
                          {mode !== "view" && (
                            <div className="flex gap-2 mb-4 mt-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    preparedBySignMode: "upload",
                                  }))
                                }
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                  formData.preparedBySignMode === "upload"
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
                                    preparedBySignMode: "draw",
                                  }))
                                }
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                  formData.preparedBySignMode === "draw"
                                    ? "bg-[#0f172a] text-white border-[#0f172a]"
                                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                Sign Here
                              </button>
                            </div>
                          )}
                        </div>
                        {/* Upload Area */}
                        {formData.preparedBySignMode === "upload" && (
                          <div>
                            <input
                              type="file"
                              id="preparedBySignUpload"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    prepared_by_sign: file,
                                    preparedBySignPreview:
                                      URL.createObjectURL(file),
                                  }));
                                }
                              }}
                            />

                            {/* Drag & Drop Zone */}
                            {mode !== "view" && (
                              <label
                                htmlFor="preparedBySignUpload"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const file = e.dataTransfer.files[0];
                                  if (file && file.type.startsWith("image/")) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      prepared_by_sign: file,
                                      preparedBySignPreview:
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
                            {formData.preparedBySignPreview && (
                              <div className="mt-4 flex items-center gap-3">
                                <img
                                  src={formData.preparedBySignPreview}
                                  alt="Signature Preview"
                                  className="h-16 border rounded bg-white p-2 shadow-sm"
                                />
                                {mode !== "view" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        prepared_by_sign: null,
                                        preparedBySignPreview: null,
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
                        {formData.preparedBySignMode === "draw" && (
                          <SignPad
                            fieldName="preparedBySign_drawn"
                            formData={formData}
                            setFormData={setFormData}
                            mode={mode}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div>
                      <label className="block text-sm xl:text-base font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">
                        Acknowledged By (Incoming Party)
                      </label>
                      <div className=" flex justify-center ">
                        {/* Toggle Tabs — hidden in view mode */}
                        {mode !== "view" && (
                          <div className="flex gap-2 mb-4 mt-2">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  acknowledgedBySignMode: "upload",
                                }))
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.acknowledgedBySignMode === "upload"
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
                                  acknowledgedBySignMode: "draw",
                                }))
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.acknowledgedBySignMode === "draw"
                                  ? "bg-[#0f172a] text-white border-[#0f172a]"
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Sign Here
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Upload Area */}
                      {formData.acknowledgedBySignMode === "upload" && (
                        <div>
                          <input
                            type="file"
                            id="acknowledgedBySignUpload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setFormData((prev) => ({
                                  ...prev,
                                  acknowledged_by_sign: file,
                                  acknowledgedBySignPreview:
                                    URL.createObjectURL(file),
                                }));
                              }
                            }}
                          />

                          {/* Drag & Drop Zone */}
                          {mode !== "view" && (
                            <label
                              htmlFor="acknowledgedBySignUpload"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files[0];
                                if (file && file.type.startsWith("image/")) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    acknowledged_by_sign: file,
                                    acknowledgedBySignPreview:
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
                          {formData.acknowledgedBySignPreview && (
                            <div className="mt-4 flex items-center gap-3">
                              <img
                                src={formData.acknowledgedBySignPreview}
                                alt="Signature Preview"
                                className="h-16 border rounded bg-white p-2 shadow-sm"
                              />
                              {mode !== "view" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      acknowledged_by_sign: null,
                                      acknowledgedBySignPreview: null,
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
                      {formData.acknowledgedBySignMode === "draw" && (
                        <SignPad
                          fieldName="acknowlegedBySign_drawn"
                          formData={formData}
                          setFormData={setFormData}
                          mode={mode}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                {mode !== "view" && (
                  <div className="flex justify-end mt-12 pb-6 border-t pt-8">
                    <button
                      onClick={handleSubmit}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-16 py-3 rounded-xl font-bold xl:text-xl shadow-xl hover:shadow-blue-200 hover:-translate-y-1 transition-all"
                    >
                      Complete Handover
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftHandOver;

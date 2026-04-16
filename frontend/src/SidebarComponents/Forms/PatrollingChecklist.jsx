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
import axios from "axios";
import SearchDropdown from "../SearchDropdown";
import SpinnerDatePicker from "../SpinnerDatePicker";
import SignPad from "./SignPad";
import SpinnerTimePicker from "../SpinnerTimePicker";

const API_URL = "http://localhost:3000/api/form/patrollingChecklist";

const PatrollingChecklist = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [requestData, setRequestData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDateSpinner, setShowDateSpinner] = useState(false);
  const [showInTimePicker, setShowInTimePicker] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewRow, setViewRow] = useState([]);

  // const fetchData = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await axios.get(API_URL);
  //     setRequestData(response.data);
  //     console.log(response.data);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     toast.error("Failed to fetch data");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);

   const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

  const labelStyle =
    "text-sm xl:text-base focus:outline-none font-semibold text-slate-600 mb-1.5 block";


  const defaultFormData = {
    name: "",
    staff_id: "",
    school_name: "",
    shift_timing: "",
    date: "",

    section: "",
    taskList: "",

    unattended_ok: false,
    unattended_reported_to: "",

    hazardous_ok: false,
    hazardous_reported_to: "",

    ias_ok: false,
    ias_reported_to: "",

    gems_assets_ok: false,
    gems_assets_reported_to: "",

    vehicle_parking_ok: false,
    vehicle_parking_reported_to: "",

    ptw_ok: false,
    ptw_reported_to: "",

    rows: [],

    eSignMode: "", // "draw" or "upload"
    signature: null,
    eSignaturePreview: null,
    signature_drawn: null,
  };

  const [formData, setFormData] = useState(defaultFormData);

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

  // // Handle submit
  // const handleSubmit = async () => {
  //   try {
  //     if (editId) {
  //       await axios.put(`${API_URL}/${editId}`, formData);
  //       toast.success("Request Updated");
  //     } else {
  //       await axios.post(API_URL, formData);
  //       toast.success("Request Submitted");
  //     }

  //     setOpenModal(false);
  //     setEditId(null);
  //     setFormData(defaultFormData);
  //     fetchData();
  //   } catch (error) {
  //     console.error("Error saving data:", error);
  //     toast.error("Failed to save data");
  //   }
  // };

  // // Handle delete
  // const handleDelete = async (id) => {
  //   try {
  //     await axios.delete(`${API_URL}/${id}`);
  //     toast.success("Deleted Successfully");
  //     fetchData();
  //   } catch (error) {
  //     console.error("Error deleting data:", error);
  //     toast.error("Failed to delete data");
  //   }
  // };

  // Sync with LocalStorage
  const fetchData = () => {
    setLoading(true);
    const stored = JSON.parse(localStorage.getItem("shift_hand_over") || "[]");
    setRequestData(stored);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = () => {
    const stored = JSON.parse(localStorage.getItem("shift_hand_over") || "[]");

    if (editId) {
      const updated = stored.map((item) =>
        item.id === editId ? { ...formData, id: editId } : item,
      );
      localStorage.setItem("shift_hand_over", JSON.stringify(updated));
      toast.success("Inspection Updated");
    } else {
      const newEntry = { ...formData, id: Date.now(), status: "Pending" };
      localStorage.setItem(
        "shift_hand_over",
        JSON.stringify([...stored, newEntry]),
      );
      toast.success("Inspection Submitted for Approval");
    }

    fetchData();
    setOpenModal(false);
    setEditId(null);
    setFormData(defaultFormData);
  };

  const handleDelete = (id) => {
    const stored = JSON.parse(localStorage.getItem("shift_hand_over") || "[]");
    const filtered = stored.filter((item) => item.id !== id);
    localStorage.setItem("shift_hand_over", JSON.stringify(filtered));
    fetchData();
    toast.success("Deleted Successfully");
  };
  const handleAddRow = () => {
    const newRow = {
      section: formData.section,
      taskList: formData.taskList,

      unattended_ok: formData.unattended_ok,
      unattended_reported_to: formData.unattended_reported_to,

      hazardous_ok: formData.hazardous_ok,
      hazardous_reported_to: formData.hazardous_reported_to,

      ias_ok: formData.ias_ok,
      ias_reported_to: formData.ias_reported_to,

      gems_assets_ok: formData.gems_assets_ok,
      gems_assets_reported_to: formData.gems_assets_reported_to,

      vehicle_parking_ok: formData.vehicle_parking_ok,
      vehicle_parking_reported_to: formData.vehicle_parking_reported_to,

      ptw_ok: formData.ptw_ok,
      ptw_reported_to: formData.ptw_reported_to,
    };

    setFormData((prev) => ({
      ...prev,
      rows: [...prev.rows, newRow],
    }));
  };

  const handleClear = () => {
    setFormData((prev) => ({
      ...prev,
      section: "",
      taskList: "",
      unattended_ok: false,
      unattended_reported_to: "",
      hazardous_ok: false,
      hazardous_reported_to: "",
      ias_ok: false,
      ias_reported_to: "",
      gems_assets_ok: false,
      gems_assets_reported_to: "",
      vehicle_parking_ok: false,
      vehicle_parking_reported_to: "",
      ptw_ok: false,
      ptw_reported_to: "",
    }));
  };

  const handleCopy = () => {
    const header = ["Name", "Staff Id", "School Name", "Shift Timing"].join(
      "\t",
    );

    const rows = requestData
      .map((item) => {
        return [
          item.name,
          item.staff_id,
          item.school_name,
          item.shift_timing,
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = requestData.map((item) => ({
      Name: item.name,
      Staff_Id: item.staff_id,
      School_Name: item.school_name,
      Shift_Timing: item.shift_timing,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "StaffTrainingChecklistData",
    );

    XLSX.writeFile(workbook, "StaffTrainingChecklistData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = ["Name", "Staff Id", "School Name", "Shift Timing"];

    const tableRows = [];

    requestData.forEach((item) => {
      const row = [
        item.name,
        item.staff_id,
        item.school_name,
        item.shift_timing,
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("StaffTrainingChecklistData.pdf");
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
            Patrolling Checklist
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
                  <th className="py-3 px-6 hidden sm:table-cell font-semibold text-gray-700 text-center">
                    SL.No
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700 text-center">
                    Employee Name
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                    Staff Id
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                    School Name
                  </th>
                  <th className="py-3 px-6 hidden lg:table-cell font-semibold text-gray-700 text-center">
                    Shift Timing
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
                      <td className="py-3 px-6 font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600 font-mono">
                        {item.staff_id}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600">
                        {item.school_name}
                      </td>
                      <td className="py-3 px-6 hidden lg:table-cell text-gray-600 text-center font-mono">
                        {item.shift_timing
                          ? item.shift_timing instanceof Date
                            ? item.shift_timing.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })
                            : item.shift_timing
                          : "-"}
                      </td>
                      <td className="py-3 px-6">
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
                  ? "Patrolling Record Details"
                  : mode === "edit"
                    ? "Edit Checklist"
                    : "New Patrolling Checklist"}
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="border p-8 rounded-2xl border-gray-400/20 shadow-inner bg-white">
              <div
                className="max-h-[75vh] overflow-y-auto pr-2 text-sm xl:text-base "
                style={{ scrollbarWidth: "none" }}
              >
                {/* Staff Information Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex flex-col gap-2">
                    <label className={labelStyle}>Guard Name</label>
                    <SearchDropdown
                      name="name"
                      value={formData.name}
                      options={["Employee 1", "Employee 2"]}
                      formData={formData}
                      setFormData={setFormData}
                      disabled={mode === "view"}
                      inputStyle={inputStyle}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelStyle}>Staff ID</label>
                    <input
                      name="staff_id"
                      value={formData.staff_id}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelStyle}>School Name</label>
                    <input
                      name="school_name"
                      value={formData.school_name}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div className="flex flex-col gap-2 relative">
                    <label className={labelStyle}>Shift Timing</label>
                    <div
                      className={`${inputStyle} cursor-pointer`}
                      onClick={() =>
                        mode !== "view" && setShowInTimePicker(true)
                      }
                    >
                      {formData.shift_timing
                        ? formData.shift_timing instanceof Date
                          ? formData.shift_timing.toLocaleTimeString()
                          : formData.shift_timing
                        : "HH:MM:SS"}
                    </div>

                    {showInTimePicker && (
                      <div className="absolute z-10 top-22">
                        <SpinnerTimePicker
                          value={formData.shift_timing}
                          onChange={(d) =>
                            setFormData({ ...formData, shift_timing: d })
                          }
                          onClose={() => setShowInTimePicker(false)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 relative">
                    <label className={labelStyle}>Date</label>
                    <input
                      value={formData.date || ""}
                      onClick={() =>
                        mode !== "view" && setShowDateSpinner(true)
                      }
                      readOnly
                      disabled={mode === "view"}
                      className={inputStyle}
                      placeholder="dd/mm/yyyy"
                    />
                    {showDateSpinner && (
                      <div className="absolute z-10 top-20">
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
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-900 rounded-r-xl mb-10 text-sm xl:text-base italic leading-relaxed">
                  *Proceed patrolling in the given order, category wise. If
                  everything is normal tick the "status ok" box. If you find
                  anything wrong, cross the box and report to Manager School
                  Operation/OCC Executive. Check all following categories
                  according to Work Instruction (SC001-J3-FO-014) and record in
                  Log Book (SC001-J3-LB-001).
                </div>
                {/* Patrolling Table Entry Section */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg mb-10">
                  <div className="bg-slate-100 p-6 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800 uppercase tracking-widest">
                      Entry Panel
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                      <div className="flex flex-col gap-1">
                        <label className={labelStyle}>Section</label>
                        <SearchDropdown
                          name="section"
                          value={formData.section}
                          options={[
                            "Section A - Internal Area",
                            "Section B - Common Area",
                            "Section C - External Area",
                          ]}
                          formData={formData}
                          setFormData={setFormData}
                          disabled={mode === "view"}
                          inputStyle={inputStyle}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className={labelStyle}>Task List</label>
                        <SearchDropdown
                          name="taskList"
                          value={formData.taskList}
                          options={["Task 1", "Task 2"]}
                          formData={formData}
                          setFormData={setFormData}
                          disabled={mode === "view"}
                          inputStyle={inputStyle}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      {[
                        { label: "Unattended", id: "unattended" },
                        { label: "Hazardous", id: "hazardous" },
                        { label: "IAS", id: "ias" },
                        { label: "Gems Assets", id: "gems_assets" },
                        { label: "Vehicle Parking", id: "vehicle_parking" },
                        { label: "PTW", id: "ptw" },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-4 p-2 border-r last:border-0 border-slate-100"
                        >
                          <label className="text-[15px] font-black text-gray-500">
                            {item.label}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              name={`${item.id}_ok`}
                              checked={formData[`${item.id}_ok`]}
                              onChange={handleChange}
                              disabled={mode === "view"}
                              className="w-4 h-4 accent-green-600"
                            />
                            <span className="text-sm font-bold text-gray-400">
                              OK
                            </span>
                          </div>
                          <input
                            name={`${item.id}_reported_to`}
                            value={formData[`${item.id}_reported_to`]}
                            onChange={handleChange}
                            disabled={mode === "view"}
                            placeholder="Report to..."
                            className="text-lg border-b border-gray-200 outline-none focus:border-blue-500 pb-1 italic"
                          />
                        </div>
                      ))}
                    </div>

                    {mode !== "view" && (
                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={handleAddRow}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all"
                        >
                          + Add to List
                        </button>
                        <button
                          onClick={handleClear}
                          className="bg-gray-400 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-500 transition-all"
                        >
                          Clear Form
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Table Result Display */}
                  <div
                    className="overflow-x-auto"
                    style={{ scrollbarWidth: "none" }}
                  >
                    <table className="w-full text-center text-sm xl:text-base">
                      <thead>
                        <tr className="bg-slate-50 text-gray-400 text-[16px]  tracking-tighter">
                          <th className="p-3 border-b border-r border-gray-100 hidden sm:table-cell">
                            #
                          </th>
                          <th className="p-3 border-b border-r border-gray-100">
                            Section/Task
                          </th>
                          <th
                            className="p-3 border-b border-r border-gray-100 hidden xl:table-cell"
                            colSpan="2"
                          >
                            Unattended
                          </th>
                          <th
                            className="p-3 border-b border-r border-gray-100 hidden xl:table-cell"
                            colSpan="2"
                          >
                            Hazardous
                          </th>
                          <th
                            className="p-3 border-b border-r border-gray-100 hidden xl:table-cell"
                            colSpan="2"
                          >
                            IAS
                          </th>
                          <th
                            className="p-3 border-b border-r border-gray-100 hidden xl:table-cell"
                            colSpan="2"
                          >
                            Gems Assets
                          </th>
                          <th
                            className="p-3 border-b border-r border-gray-100 hidden xl:table-cell"
                            colSpan="2"
                          >
                            Vehicle
                          </th>
                          <th
                            className="p-3 border-b border-r border-gray-100 hidden xl:table-cell"
                            colSpan="2"
                          >
                            PTW
                          </th>
                          <th className="p-3 border-b">Action</th>
                        </tr>
                        <tr className="bg-slate-50/50 text-[13px] font-black text-slate-400">
                          <th className="border-r hidden sm:table-cell"></th>
                          <th className="border-r"></th>
                          <th className="border-r hidden xl:table-cell">OK</th>
                          <th className="border-r hidden xl:table-cell">OCC</th>
                          <th className="border-r hidden xl:table-cell">OK</th>
                          <th className="border-r hidden xl:table-cell">OCC</th>
                          <th className="border-r hidden xl:table-cell">OK</th>
                          <th className="border-r hidden xl:table-cell">OCC</th>
                          <th className="border-r hidden xl:table-cell">OK</th>
                          <th className="border-r hidden xl:table-cell">OCC</th>
                          <th className="border-r hidden xl:table-cell">OK</th>
                          <th className="border-r hidden xl:table-cell">OCC</th>
                          <th className="border-r hidden xl:table-cell">OK</th>
                          <th className="border-r hidden xl:table-cell">OCC</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.rows.length === 0 ? (
                          <tr>
                            <td colSpan="16" className="p-10 text-gray-300">
                              No entries added yet
                            </td>
                          </tr>
                        ) : (
                          formData.rows.map((row, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-50 hover:bg-blue-50 transition-colors font-medium"
                            >
                              <td className="p-3 border-r border-gray-50 hidden sm:table-cell text-gray-400 font-mono">
                                {index + 1}
                              </td>
                              <td className="p-3 border-r border-gray-50 text-center">
                                <span className="text-blue-700 font-bold block text-sm">
                                  {row.section}
                                </span>
                                <span className="text-gray-900">
                                  {row.taskList}
                                </span>
                              </td>
                              <td className="border-r border-gray-50 hidden xl:table-cell">
                                {row.unattended_ok ? "✅" : "❌"}
                              </td>
                              <td className="border-r border-gray-50 hidden xl:table-cell text-sm text-gray-500 italic">
                                {row.unattended_reported_to || "-"}
                              </td>
                              <td className="border-r border-gray-50 hidden xl:table-cell">
                                {row.hazardous_ok ? "✅" : "❌"}
                              </td>
                              <td className="border-r border-gray-50 hidden xl:table-cell text-sm text-gray-500 italic">
                                {row.hazardous_reported_to || "-"}
                              </td>
                              <td className="border-r border-gray-50 hidden xl:table-cell">
                                {row.ias_ok ? "✅" : "❌"}
                              </td>
                              <td className="border-r border-gray-50 hidden xl:table-cell text-sm text-gray-500 italic">
                                {row.ias_reported_to || "-"}
                              </td>
                              <td className="border-r border-gray-50 hidden xl:table-cell">
                                {row.gems_assets_ok ? "✅" : "❌"}
                              </td>
                              <td className="border-r border-gray-50 hidden xl:table-cell text-sm text-gray-500 italic">
                                {row.gems_assets_reported_to || "-"}
                              </td>
                              <td className="border-r border-gray-50 hidden xl:table-cell">
                                {row.vehicle_parking_ok ? "✅" : "❌"}
                              </td>
                              <td className="border-r border-gray-50 hidden xl:table-cell text-sm text-gray-500 italic">
                                {row.vehicle_parking_reported_to || "-"}
                              </td>
                              <td className="border-r border-gray-50 hidden xl:table-cell">
                                {row.ptw_ok ? "✅" : "❌"}
                              </td>
                              <td className="border-r border-gray-50 hidden xl:table-cell text-sm text-gray-500 italic">
                                {row.ptw_reported_to || "-"}
                              </td>
                              <td className="p-3">
                                <FaEye
                                  className="text-blue-400 hover:text-blue-600 cursor-pointer mx-auto xl:text-xl"
                                  onClick={() => {
                                    setViewRow(row);
                                    setOpenViewModal(true);
                                  }}
                                />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Signature Area */}
                <div>
                  <div className="flex flex-col mt-4">
                    <label className="text-sm xl:text-base font-bold text-gray-500 uppercase tracking-widest mb-4">
                      Official E-Signature
                    </label>

                    {/* Toggle Tabs */}
                    {mode !== "view" && (
                      <div className="flex gap-2 mb-4 mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              eSignMode: "upload",
                            }))
                          }
                          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            formData.eSignMode === "upload"
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
                              eSignMode: "draw",
                            }))
                          }
                          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            formData.eSignMode === "draw"
                              ? "bg-[#0f172a] text-white border-[#0f172a]"
                              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          Sign Here
                        </button>
                      </div>
                    )}

                    {/* Upload Area */}
                    {formData.eSignMode === "upload" && (
                      <div>
                        <input
                          type="file"
                          id="eSignatureUpload"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setFormData((prev) => ({
                                ...prev,
                                signature: file,
                                eSignaturePreview: URL.createObjectURL(file),
                              }));
                            }
                          }}
                        />

                        {/* Drag & Drop */}
                        {mode !== "view" && (
                          <label
                            htmlFor="eSignatureUpload"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const file = e.dataTransfer.files[0];
                              if (file && file.type.startsWith("image/")) {
                                setFormData((prev) => ({
                                  ...prev,
                                  signature: file,
                                  eSignaturePreview: URL.createObjectURL(file),
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
                        {formData.eSignaturePreview && (
                          <div className="mt-4 flex items-center gap-3">
                            <img
                              src={formData.eSignaturePreview}
                              alt="Signature Preview"
                              className="h-16 border rounded bg-white p-2 shadow-sm"
                            />
                            {mode !== "view" && (
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    signature: null,
                                    eSignaturePreview: null,
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
                    {formData.eSignMode === "draw" && (
                      <SignPad
                        fieldName="signature_drawn"
                        formData={formData}
                        setFormData={setFormData}
                        mode={mode}
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  {mode !== "view" && (
                    <div className="w-full md:w-fit flex justify-end items-end">
                      <button
                        onClick={handleSubmit}
                        className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-16 py-4 rounded-2xl font-bold xl:text-xl shadow-xl hover:shadow-blue-200 hover:-translate-y-1 transition-all"
                      >
                        Submit Checklist
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Row Detail Quick View Modal */}
      {openViewModal && viewRow && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-xl  font-black text-gray-900 mb-6 border-b pb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>{" "}
              Patrolling Item Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm xl:text-lg">
              <div className="col-span-2 p-3 bg-slate-50 rounded-xl mb-2">
                <span className="text-xs font-bold text-gray-400 block uppercase">
                  Section & Task
                </span>
                <p className="font-bold text-gray-800">
                  {viewRow.section} - {viewRow.taskList}
                </p>
              </div>
              {[
                {
                  l: "Unattended",
                  k: "unattended_ok",
                  r: "unattended_reported_to",
                },
                {
                  l: "Hazardous",
                  k: "hazardous_ok",
                  r: "hazardous_reported_to",
                },
                { l: "IAS", k: "ias_ok", r: "ias_reported_to" },
                {
                  l: "Gems Assets",
                  k: "gems_assets_ok",
                  r: "gems_assets_reported_to",
                },
                {
                  l: "Vehicle Parking",
                  k: "vehicle_parking_ok",
                  r: "vehicle_parking_reported_to",
                },
                { l: "PTW", k: "ptw_ok", r: "ptw_reported_to" },
              ].map((d) => (
                <div key={d.l} className="p-3 border-b border-slate-100">
                  <span className="font-bold text-gray-500 text-sm block uppercase">
                    {d.l}
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={`font-black ${viewRow[d.k] ? "text-green-600" : "text-red-500"}`}
                    >
                      {viewRow[d.k] ? "OK" : "NOT OK"}
                    </span>
                    <span className="text-lg text-slate-400 italic">
                      {viewRow[d.r] || "N/A"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-right mt-8">
              <button
                onClick={() => setOpenViewModal(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-xl font-bold transition-all shadow-lg shadow-red-100"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatrollingChecklist;

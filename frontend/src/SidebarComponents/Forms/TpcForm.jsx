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

const API_URL = "http://localhost:3000/api/form/tpcForm";
import SearchDropdown from "../SearchDropdown";
import SpinnerDatePicker from "../SpinnerDatePicker";
import SignPad from "./SignPad";
import SpinnerTimePicker from "../SpinnerTimePicker";

const TpcForm = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [requestData, setRequestData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDateSpinner, setShowDateSpinner] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

  const labelStyle =
    "text-sm xl:text-base focus:outline-none font-semibold text-slate-600 mb-1.5 block";

  const defaultFormData = {
    employee_name: "",
    location: "",
    enrollment_id: "",
    mobile: "",
    date: "",
    comments: "",
    through_person: "",
    signatureMode: "",
    signaturePreview: null,
    signature: null,
    signature_drawn: null,
  };

  const [formData, setFormData] = useState(defaultFormData);

  // const fetchData = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await axios.get(API_URL);
  //     setRequestData(response.data);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     toast.error("Failed to fetch data");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const fetchOptions = async () => {
  //   try {
  //     const [empRes, locRes] = await Promise.all([
  //       axios.get("http://localhost:3000/api/employee"),
  //       axios.get("http://localhost:3000/api/master/geofencing"),
  //     ]);
  //     setEmployees(empRes.data);
  //     setLocations(locRes.data);
  //   } catch (error) {
  //     console.error("Error fetching options:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchData();
  //   fetchOptions();
  // }, []);

  useEffect(() => {
    if (formData.employee_name && mode !== "view") {
      const selectedEmp = employees.find(
        (emp) => emp.full_name === formData.employee_name,
      );
      if (selectedEmp) {
        setFormData((prev) => ({
          ...prev,
          enrollment_id: selectedEmp.company_enrollment_id || "",
        }));
      }
    }
  }, [formData.employee_name, employees]);

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

  const handleCopy = () => {
    const header = ["Employee Name", "Location", "EnrollmentID", "Date"].join(
      "\t",
    );

    const rows = requestData
      .map((item) => {
        return [
          item.employee_name,
          item.location,
          item.enrollment_id,
          item.date,
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
      Location: item.location,
      Date: item.date,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "TpcFormData");

    XLSX.writeFile(workbook, "TpcFormData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = ["Employee Name", "EnrollmentID", "Location", "Date"];

    const tableRows = [];

    requestData.forEach((item) => {
      const row = [
        item.employee_name,
        item.enrollment_id,
        item.location,
        item.date,
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("TpcFormData.pdf");
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
            TPC Form
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
                    Location
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                    Enrollment Id
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700 text-center">
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
                      <td className="py-3 px-6 font-medium text-gray-900">
                        {item.employee_name}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600">
                        {item.location}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600 font-mono text-center">
                        {item.enrollment_id}
                      </td>
                      <td className="py-3 px-6 text-gray-600 text-center">
                        {item.date}
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
                          />
                          <FaPen
                            onClick={() => {
                              setFormData(item);
                              setEditId(item.id);
                              setMode("edit");
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
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-[1500px] max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in duration-200"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
              <h2 className="text-xl   font-bold text-gray-900">
                {mode === "view"
                  ? "TPC Request Details"
                  : mode === "edit"
                    ? "Edit TPC Request"
                    : "New TPC Request Form"}
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
                className="max-h-[75vh] overflow-y-auto pr-2 text-[17px] leading-relaxed"
                style={{ scrollbarWidth: "none" }}
              >
                {/* Form Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-slate-50 p-4 rounded-xl border border-blue-100 flex flex-col justify-center">
                    <span className="text-gray-500 font-bold uppercase text-xs mb-2">
                      To
                    </span>
                    <span className="font-bold text-gray-800">
                      Safecor Security Personnel
                    </span>
                  </div>

                  <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-blue-100">
                    <span className="text-gray-500 font-bold uppercase text-xs mb-4 block">
                      From (Applicant Details)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1">
                        <label className={labelStyle}>
                          Staff Name <span className="text-red-500">*</span>
                        </label>
                        <div className="w-full">
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
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className={labelStyle}>Enrollment ID</label>
                        <input
                          name="enrollment_id"
                          value={formData.enrollment_id}
                          onChange={handleChange}
                          className={inputStyle}
                          disabled={mode === "view"}
                          placeholder="ID #"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className={labelStyle}>Work Location</label>
                        <SearchDropdown
                          name="location"
                          value={formData.location}
                          options={locations}
                          labelKey="name"
                          valueKey="name"
                          formData={formData}
                          inputStyle={inputStyle}
                          setFormData={setFormData}
                          disabled={mode === "view"}
                        />
                      </div>
                      <div className="flex flex-col gap-1 relative">
                        <label className={labelStyle}>Request Date</label>
                        <input
                          name="date"
                          value={formData.date || ""}
                          onClick={() =>
                            mode !== "view" && setShowDateSpinner(true)
                          }
                          readOnly
                          disabled={mode === "view"}
                          placeholder="dd/mm/yyyy"
                          className={`${inputStyle} cursor-pointer`}
                        />
                        {showDateSpinner && (
                          <div className="absolute top-20 bottom-full mb-2">
                            <SpinnerDatePicker
                              value={formData.date}
                              onChange={(date) =>
                                setFormData((prev) => ({ ...prev, date: date }))
                              }
                              onClose={() => setShowDateSpinner(false)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Body */}
                <div className="space-y-8 text-gray-700 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="flex flex-col gap-2">
                      <label className={labelStyle}>
                        Mobile Contact Number
                      </label>
                      <input
                        type="number"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className={inputStyle}
                        disabled={mode === "view"}
                        placeholder="Numbers only"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="font-bold text-gray-800">
                      1. Through Person Information
                    </label>
                    <div className="w-full max-w-md">
                      <SearchDropdown
                        name="through_person"
                        value={formData.through_person}
                        options={employees}
                        labelKey="full_name"
                        valueKey="full_name"
                        formData={formData}
                        inputStyle={inputStyle}
                        setFormData={setFormData}
                        disabled={mode === "view"}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="font-bold text-gray-800">
                      2. Request Comments / Details
                    </label>
                    <textarea
                      name="comments"
                      onChange={handleChange}
                      value={formData.comments}
                      disabled={mode === "view"}
                      rows={4}
                      className="w-full border-2 border-slate-200 rounded-xl p-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                      placeholder="Provide detailed information regarding the request..."
                    />
                  </div>

                  <div className=" gap-2 mt-3 gap-2">
                    <div className="flex flex-col">
                      <label className="font-bold text-gray-800">
                        3. Signature
                      </label>

                      {/* Toggle Tabs */}
                      {mode !== "view" && (
                        <div className="flex gap-2 mb-4 mt-2">
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                signatureMode: "upload",
                              }))
                            }
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                              formData.signatureMode === "upload"
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
                                signatureMode: "draw",
                              }))
                            }
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                              formData.signatureMode === "draw"
                                ? "bg-[#0f172a] text-white border-[#0f172a]"
                                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            Sign Here
                          </button>
                        </div>
                      )}

                      {/* Upload Area */}
                      {formData.signatureMode === "upload" && (
                        <div>
                          <input
                            type="file"
                            id="signatureUpload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setFormData((prev) => ({
                                  ...prev,
                                  signature: file,
                                  signaturePreview: URL.createObjectURL(file),
                                }));
                              }
                            }}
                          />

                          {/* Drag & Drop */}
                          {mode !== "view" && (
                            <label
                              htmlFor="signatureUpload"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files[0];
                                if (file && file.type.startsWith("image/")) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    signature: file,
                                    signaturePreview: URL.createObjectURL(file),
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
                          {formData.signaturePreview && (
                            <div className="mt-4 flex items-center gap-3">
                              <img
                                src={formData.signaturePreview}
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
                                      signaturePreview: null,
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
                      {formData.signatureMode === "draw" && (
                        <SignPad
                          fieldName="signature_drawn"
                          formData={formData}
                          setFormData={setFormData}
                          mode={mode}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer / Submit Action */}
                {mode !== "view" && (
                  <div className="flex flex-wrap justify-end mt-12 pb-6 border-t pt-8 gap-4">
                    <button
                      onClick={handleSubmit}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-16 py-3 rounded-xl font-bold xl:text-xl  shadow-xl hover:shadow-blue-200 hover:-translate-y-1 transition-all"
                    >
                      Submit Form
                    </button>
                    <button
                      onClick={() => setOpenModal(false)}
                      className="px-10 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold xl:text-lg  hover:bg-gray-50 transition-all"
                    >
                      Cancel
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

export default TpcForm;

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
import axios from "axios";

const API_URL = "http://localhost:3000/api/form/passportRequest";

const PassportRequest = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [requestData, setRequestData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [showDateSpinner, setShowDateSpinner] = useState(false);
  const [showDate2Spinner, setShowDate2Spinner] = useState(false);

  const labelStyle = "text-[16px] text-[oklch(0.147_0.004_49.25)] my-1 block";

  const defaultFormData = {
    employee_name: "",
    enrollment_id: "",
    department: "",
    position_title: "",
    mobile: "",
    passport_number: "",
    request_date: "",
    expected_return_date: "",
    reason_for_request: "",
    agreement: false,

    employeeSignatureMode: "upload",
    employee_signature: null,
    employeeSignaturePreview: null,
    signature_drawn: null,

    msoSignatureMode: "upload",
    mso_signature: null,
    msoSignaturePreview: null,
    officerSign_drawn: null,
  };

  const [formData, setFormData] = useState(defaultFormData);

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
      setRequestData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        toast.success("Request Updated");
      } else {
        await axios.post(API_URL, formData);
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
    const header = [
      "Employee",
      "Date",
      "Enrollment Id",
      "PassportPurpose",
    ].join("\t");

    const rows = requestData
      .map((item) => {
        return [
          item.employee_name,
          item.request_date,
          item.enrollment_id,
          item.reason_for_request,
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = requestData.map((item) => ({
      Employee: item.employee_name,
      Date: item.request_date,
      EnrollmentId: item.enrollment_id,
      PassportPurpose: item.reason_for_request,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "PassportRequestData");

    XLSX.writeFile(workbook, "PassportRequestData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "Employee",
      "Date",
      "Enrollment Id",
      "PassportPurpose",
    ];

    const tableRows = [];

    requestData.forEach((item) => {
      const row = [
        item.employee_name,
        item.request_date,
        item.enrollment_id,
        item.reason_for_request,
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("PassportRequestData.pdf");
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="sm:flex sm:justify-between">
        <h1 className="flex items-center gap-2 text-[17px] font-semibold flex-wrap ml-10 lg:ml-0 mb-4 lg:mb-0">
          <FaAngleRight />
          Forms
          <FaAngleRight />
          <div onClick={() => setOpenModal(false)} className="cursor-pointer">
            Passport Request
          </div>
        </h1>
        {!openModal && (
          <div className="flex justify-end">
            <button
              onClick={() => (
                setMode(""),
                setEditId(null),
                setFormData(defaultFormData),
                setOpenModal(true)
              )}
              className="bg-[oklch(0.645_0.246_16.439)] text-white px-4 py-2 rounded-md whitespace-nowrap"
            >
              + Add New
            </button>
          </div>
        )}
      </div>

      {!openModal && (
        <div className="mt-6 bg-white shadow-xl rounded-xl  border border-[oklch(0.8_0.001_106.424)] p-6">
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
                className=" border rounded-full px-1  border-[oklch(0.645_0.246_16.439)]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="ml-2 text-md">entries</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center justify-center">
              <div className="flex">
                <button
                  onClick={handleCopy}
                  className="text-xl px-3 py-1 cursor-pointer text-gray-800"
                >
                  <GoCopy />
                </button>

                <button
                  onClick={handleExcel}
                  className="text-xl px-3 py-1 cursor-pointer text-green-700"
                >
                  <FaFileExcel />
                </button>

                <button
                  onClick={handlePDF}
                  className="text-xl px-3 py-1 cursor-pointer text-red-600"
                >
                  <FaFilePdf />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            className="overflow-x-auto min-h-[250px]"
            style={{ scrollbarWidth: "none" }}
          >
            <table className="w-full text-lg border-collapse">
              <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
                <tr>
                  <th className="p-2 font-semibold hidden sm:table-cell">
                    SL.No
                  </th>

                  <th className="p-2 font-semibold">Employee Name</th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Enrollment ID
                  </th>

                  <th className="p-2 font-semibold hidden lg:table-cell">
                    Passport Purpose
                  </th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Date
                  </th>

                  <th className="p-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentrequestData.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="lg:text-center p-10 ">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentrequestData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                    >
                      <td className="p-2 whitespace-nowrap hidden sm:table-cell">
                        {index + 1}
                      </td>

                      <td className="p-2">{item.employee_name}</td>

                      <td className="p-2 hidden md:table-cell">
                        {item.enrollment_id}
                      </td>
                      <td className="p-2 hidden lg:table-cell">
                        {item.reason_for_request}
                      </td>

                      <td className="p-2 hidden md:table-cell">
                        {item.request_date}
                      </td>

                      <td className="p-2 flex flex-row space-x-3 justify-center whitespace-nowrap">
                        {" "}
                        <div className="flex flex-row space-x-3 justify-center mt-1">
                          {/* View */}{" "}
                          <FaEye
                            onClick={() => {
                              setFormData(item);

                              setMode("view");
                              setOpenModal(true);
                            }}
                            className="inline text-blue-500 cursor-pointer text-lg"
                          />{" "}
                          {/* Edit */}
                          <FaPen
                            onClick={() => {
                              setFormData(item);
                              setEditId(item.id);
                              setMode("edit");
                              setOpenModal(true);
                            }}
                            className="inline text-green-500 cursor-pointer text-lg"
                          />
                          {/* Delete */}
                          <MdDeleteForever
                            onClick={() => handleDelete(item.id)}
                            className="inline text-red-500 cursor-pointer text-xl"
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
              Showing {requestData.length === 0 ? "0" : startIndex + 1} to{" "}
              {Math.min(endIndex, requestData.length)} of {requestData.length}{" "}
              entries
            </span>

            <div className="flex flex-row space-x-1">
              <button
                disabled={currentPage == 1}
                onClick={() => setCurrentPage(1)}
                className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
              >
                First
              </button>

              <button
                disabled={currentPage == 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-3 bg-gray-200 rounded-full disabled:opacity-50"
              >
                <GrPrevious />
              </button>

              <div className="p-3 px-4 shadow rounded-full">{currentPage}</div>

              <button
                disabled={currentPage == totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-3 bg-gray-200 rounded-full disabled:opacity-50"
              >
                <GrNext />
              </button>

              <button
                disabled={currentPage == totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}

      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-[1500px] max-h-[90vh] overflow-y-auto p-6"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Close */}
            <div className="flex justify-end mb-4">
              <RxCross2
                onClick={() => setOpenModal(false)}
                className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer"
              />
            </div>

            <div className="border p-4 rounded-xl border-gray-400 shadow">
              <div className="flex justify-center">
                <div
                  className="max-h-[75vh] max-w-5xl overflow-y-auto pr-2 text-[16px]"
                  style={{ scrollbarWidth: "none" }}
                >
                  <div className="flex flex-row gap-3 mt-4">
                    <label className={`mt-2 ${labelStyle}`}>Date:</label>
                    <input
                      name="request_date"
                      value={formData.request_date || ""}
                      onChange={handleChange}
                      onClick={() => setShowDateSpinner(true)}
                      disabled={mode === "view"}
                      placeholder="dd/mm/yyyy"
                      className="w-full border border-gray-300 px-2 rounded focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                    />

                    {showDateSpinner && (
                      <div className="absolute mt-10 ml-8 sm:ml-14 md:ml-16 lg:ml-20  ">
                        <SpinnerDatePicker
                          value={formData.request_date}
                          onChange={(date) =>
                            setFormData((prev) => ({
                              ...prev,
                              request_date: date,
                            }))
                          }
                          onClose={() => setShowDateSpinner(false)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row gap-7 mt-2">
                    <span>To,</span>
                    <div>
                      The Administration officer <br />
                      Safecor Security <br /> Dubai, UAE.
                    </div>
                  </div>

                  <div className="text-[16px] leading-7 space-y-4">
                    {/* Line 1 */}
                    <p>
                      I am kindly requesting you to have my passport for the
                      purpose of
                      <input
                        type="text"
                        name="reason_for_request"
                        value={formData.reason_for_request}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="border border-gray-300 rounded px-2 w-40 mt-1 mx-1 rounded  focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                      />
                    </p>
                    <p>
                      I will return the passport to you latest by
                      <input
                        name="expected_return_date"
                        value={formData.expected_return_date}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="border border-gray-300 rounded px-2 w-32 mt-1 mx-1 rounded  focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                      />
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t pt-4">
                    <div className="flex flex-col">
                      <label>Department:</label>
                      <input
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="border border-gray-300 rounded px-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label>Position Title:</label>
                      <input
                        name="position_title"
                        value={formData.position_title}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="border border-gray-300 rounded px-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label>Mobile Number:</label>
                      <input
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="border border-gray-300 rounded px-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label>Passport Number:</label>
                      <input
                        name="passport_number"
                        value={formData.passport_number}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="border border-gray-300 rounded px-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="grid  grid-cols-1  sm:grid-cols-2 gap-4 mt-4">
                      <div className="flex flex-col">
                        <label>Name:</label>
                        <input
                          name="employee_name"
                          value={formData.employee_name}
                          onChange={handleChange}
                          disabled={mode === "view"}
                          className="border border-gray-300 rounded px-2 sm:w-36 mt-1 rounded  focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                        />
                      </div>
                      <div className="flex flex-col">
                        <label>ID #:</label>
                        <input
                          name="enrollment_id"
                          value={formData.enrollment_id}
                          onChange={handleChange}
                          disabled={mode === "view"}
                          className="border border-gray-300 rounded px-2 sm:w-36 mt-1 rounded  focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1  sm:grid-cols-2 gap-8 mt-4">
                      <div className="flex flex-col">
                        {/* Toggle Tabs — hidden in view mode */}
                        {mode !== "view" && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            <label className="block text-sm font-medium mt-1">
                              Signature :
                            </label>
                            <div className="space-x-1 space-y-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    employeeSignatureMode: "upload",
                                  }))
                                }
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                  formData.employeeSignatureMode === "upload"
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
                                    employeeSignatureMode: "draw",
                                  }))
                                }
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                  formData.employeeSignatureMode === "draw"
                                    ? "bg-[#0f172a] text-white border-[#0f172a]"
                                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                Sign Here
                              </button>
                            </div>
                          </div>
                        )}
                        {mode === "view" && (
                          <label className="block text-sm font-medium mb-2">
                            Signature :
                          </label>
                        )}

                        {/* Upload Area */}
                        {formData.employeeSignatureMode === "upload" && (
                          <div>
                            <input
                              type="file"
                              id="employeeSignatureUpload"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    employee_signature: file,
                                    employeeSignaturePreview:
                                      URL.createObjectURL(file),
                                  }));
                                }
                              }}
                            />

                            {/* Drag & Drop Zone */}
                            {mode !== "view" && (
                              <label
                                htmlFor="employeeSignatureUpload"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const file = e.dataTransfer.files[0];
                                  if (file && file.type.startsWith("image/")) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      employee_signature: file,
                                      employeeSignaturePreview:
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
                            {formData.employeeSignaturePreview && (
                              <div className="mt-4 flex items-center gap-3">
                                <img
                                  src={formData.employeeSignaturePreview}
                                  alt="Signature Preview"
                                  className="h-16 border rounded bg-white p-2 shadow-sm"
                                />
                                {mode !== "view" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        employee_signature: null,
                                        employeeSignaturePreview: null,
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
                        {formData.employeeSignatureMode === "draw" && (
                          <SignPad
                            fieldName="signature_drawn"
                            formData={formData}
                            setFormData={setFormData}
                            mode={mode}
                          />
                        )}
                      </div>

                      <div className="flex flex-col">
                        <label className="flex items-center gap-2 mt-4 cursor-pointer">
                          <input
                            type="checkbox"
                            name="agreement"
                            checked={formData.agreement}
                            onChange={handleChange}
                            disabled={mode === "view"}
                            className="w-4 h-4 accent-[oklch(0.645_0.246_16.439)]"
                          />
                          <span className="text-sm">
                            I agree to the terms and conditions
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1  sm:grid-cols-2 mt-6">
                    <h1>Signature of Administration Officer</h1>
                    <div className="flex flex-col mt-4">
                      {/* Toggle Tabs — hidden in view mode */}
                      {mode !== "view" && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          <label className="block text-sm font-medium mt-1">
                            Signature :
                          </label>
                          <div className="space-x-1 space-y-1">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  msoSignatureMode: "upload",
                                }))
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.msoSignatureMode === "upload"
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
                                  msoSignatureMode: "draw",
                                }))
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.msoSignatureMode === "draw"
                                  ? "bg-[#0f172a] text-white border-[#0f172a]"
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Sign Here
                            </button>
                          </div>
                        </div>
                      )}
                      {mode === "view" && (
                        <label className="block text-sm font-medium mb-2">
                          Signature :
                        </label>
                      )}

                      {/* Upload Area */}
                      {formData.msoSignatureMode === "upload" && (
                        <div>
                          <input
                            type="file"
                            id="msoSignatureUpload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setFormData((prev) => ({
                                  ...prev,
                                  mso_signature: file,
                                  msoSignaturePreview:
                                    URL.createObjectURL(file),
                                }));
                              }
                            }}
                          />

                          {/* Drag & Drop Zone */}
                          {mode !== "view" && (
                            <label
                              htmlFor="msoSignatureUpload"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files[0];
                                if (file && file.type.startsWith("image/")) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    mso_signature: file,
                                    msoSignaturePreview:
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
                          {formData.msoSignaturePreview && (
                            <div className="mt-4 flex items-center gap-3">
                              <img
                                src={formData.msoSignaturePreview}
                                alt="Signature Preview"
                                className="h-16 border rounded bg-white p-2 shadow-sm"
                              />
                              {mode !== "view" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      mso_signature: null,
                                      msoSignaturePreview: null,
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
                      {formData.msoSignatureMode === "draw" && (
                        <SignPad
                          fieldName="officerSign_drawn"
                          formData={formData}
                          setFormData={setFormData}
                          mode={mode}
                        />
                      )}
                    </div>
                  </div>

                  {/* Save */}
                  {mode !== "view" && (
                    <div className="flex justify-end mt-10">
                      <button
                        onClick={handleSubmit}
                        className="bg-[oklch(0.645_0.246_16.439)] text-white px-8 py-2 rounded-md mb-6"
                      >
                        Save
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

export default PassportRequest;

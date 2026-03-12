import React, { useEffect, useRef, useState } from "react";
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

const ClaimRequest = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [dateSpinner, setDateSpinner] = useState(false);
  const [claimRequest, setClaimRequest] = useState(() => {
    const stored = localStorage.getItem("claimRequests");

    if (stored) {
      return JSON.parse(stored).map((item) => ({
        ...item,
      }));
    }

    return [
      {
        id: 1,
        employee: "Employee",
        claimCategory: "Food",
        date: "23/01/2026",
        purpose: "",
        amount: "500",
        remarks: "Nothing",
        fa: "",
        faname: "",
        sa: "",
        saname: "",
        rejectedreason: "",
        status: "Pending",
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("claimRequests", JSON.stringify(claimRequest));
  }, [claimRequest]);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    employee: "",
    claimCategory: "",
    date: "",
    amount: "",
    purpose: "",
    remarks: "",
  });
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef();

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFiles = (selectedFiles) => {
    const validFiles = [];

    Array.from(selectedFiles).forEach((file) => {
      if (file.size > MAX_SIZE) {
        alert(`${file.name} exceeds 5MB`);
        return;
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
      });
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const formatSize = (size) => {
    return (size / 1024 / 1024).toFixed(2) + " MB";
  };

  const removeFile = (index) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
  };

  const inputStyle =
    "text-lg w-full  border  border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filteredClaimRequest = claimRequest.filter((x) =>
    x.employee.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentClaimRequest = filteredClaimRequest.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredClaimRequest.length / entriesPerPage),
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // handle Submit
  const handleSubmit = () => {
    const { employee, claimCategory, date, purpose, amount, remarks } =
      formData;

    if (!employee || !claimCategory || !date || !amount || !purpose) {
      toast.error("Please fill required fields");
      return;
    }

    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split("/");
      return new Date(year, month - 1, day);
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const claimdate = parseDate(date);

    if (claimdate < today) {
      toast.error("First Date cannot be in the past");
      return;
    }

    const stored = JSON.parse(localStorage.getItem("claimRequests")) || [];

    const newClaimRequest = {
      id: Date.now(),
      employee,
      claimCategory,
      date,
      amount,
      purpose,
      remarks,
      fa: "",
      faname: "",
      sa: "",
      saname: "",
      rejectedreason: "",
      status: "Pending",
    };

    if (editId) {
      const updated = stored.map((item) =>
        item.id === editId ? { ...item, ...newClaimRequest } : item,
      );

      localStorage.setItem("claimRequests", JSON.stringify(updated));

      setClaimRequest(updated);

      toast.success(" Updated");
    } else {
      const updated = [...stored, newClaimRequest];

      localStorage.setItem("claimRequests", JSON.stringify(updated));

      setClaimRequest(updated);

      toast.success(" Submitted");
    }

    setOpenModal(false);
    setEditId(null);

    setFormData({
      employee: "",
      claimCategory: "",
      date: "",
      amount: "",
      purpose: "",
      remarks: "",
    });
  };

  // Handle delete
  const handleDelete = (id) => {
    const stored = JSON.parse(localStorage.getItem("claimRequests")) || [];

    const updated = stored.filter((v) => v.id !== id);

    localStorage.setItem("claimRequests", JSON.stringify(updated));

    setClaimRequest(
      updated.map((item) => ({
        ...item,
      })),
    );

    toast.success("Deleted Successfully");
  };

  const handleCopy = () => {
    const header = [
      "Employee",
      "Claim Category",
      "Date",
      "Purpose",
      "Amount",
    ].join("\t");

    const rows = filteredClaimRequest
      .map((item) => {
        return [
          item.employee,
          item.claimCategory,
          item.date,
          item.purpose || "NIL",
          item.amount,
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredClaimRequest.map((item) => ({
      Employee: item.employee,
      ClaimCategory: item.claimCategory,
      Date: item.date,
      Purpose: item.purpose || "NIL",
      Amount: item.amount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "ClaimRequest");

    XLSX.writeFile(workbook, "ClaimRequestData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "Employee",
      "Claim Category",
      "Date",
      "Purpose",
      "Amount",
    ];

    const tableRows = [];

    filteredClaimRequest.forEach((item) => {
      const row = [
        item.employee,
        item.claimCategory,
        item.date,
        item.purpose || "NIL",
        item.amount,
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("ClaimRequestData.pdf");
  };

  return (
    <>
      <div className="mb-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
            <FaAngleRight />
            Requests
            <FaAngleRight />
            <div onClick={() => setOpenModal(false)} className="cursor-pointer">
              Claim Request
            </div>
          </h1>
          {!openModal && (
            <button
              onClick={() => setOpenModal(true)}
              className="bg-[oklch(0.645_0.246_16.439)] text-white px-4 py-2 rounded-md"
            >
              + Add New
            </button>
          )}
        </div>

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
              <input
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className=" shadow-sm px-3 py-1 rounded-full  focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]"
              />
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
                  <th className="py-2 px-6 px-6 font-semibold">Employee</th>
                  <th className="py-2 px-6 font-semibold whitespace-nowrap">Claim Category</th>
                  <th className="py-2 px-6 font-semibold">Date</th>
                  <th className="py-2 px-6 font-semibold">Purpose</th>
                  <th className="py-2 px-6 font-semibold">Amount</th>
                  <th className="py-2 px-6 font-semibold">FA</th>
                  <th className="py-2 px-6 font-semibold whitespace-nowrap">FA Name</th>

                  <th className="py-2 px-6 font-semibold">SA</th>
                  <th className="py-2 px-6 font-semibold whitespace-nowrap">SA Name</th>

                  <th className="py-2 px-6 font-semibold whitespace-nowrap">Rejected Reason</th>

                  <th className="py-2 px-6 font-semibold">FA</th>
                  <th className="py-2 px-6 font-semibold">SA</th>

                  <th className="py-2 px-6 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {currentClaimRequest.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="text-center p-10">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentClaimRequest.map((item) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                    >
                      <td className="py-2 px-6">{item.employee}</td>

                      <td className="py-2 px-6 whitespace-nowraps">
                        {item.claimCategory}
                      </td>

                      <td className="py-2 px-6 whitespace-nowrap">{item.date}</td>

                      <td className="py-2 px-6 whitespace-nowrap">
                        {item.purpose ? item.purpose : "NIL"}
                      </td>

                      <td className="py-2 px-6">{item.amount}</td>

                      {/* FA Status */}
                      {/* FA Status */}
                      <td
                        className={`py-2 px-6 text-xl  ${item.fa ? (item.fa == "✔" ? "text-green-600" : "text-red-500") : ""}`}
                      >
                        {item.fa || "⏳"}
                      </td>

                      <td className="py-2 px-6">{item.faname || "⏳"}</td>

                      {/* SA Status */}
                      <td
                        className={`py-2 px-6 text-xl  ${item.sa ? (item.sa == "✔" ? "text-green-600" : "text-red-500") : ""}`}
                      >
                        {item.sa || "⏳"}
                      </td>

                      <td className="py-2 px-6">{item.saname || "⏳"}</td>

                      <td className="py-2 px-6  whitespace-nowrap">
                        {item.rejectedreason || "-"}
                      </td>

                      <td className="py-2 px-6">
                        {item.fa ? (item.fa === "✔" ? "Y" : "N") : "⏳"}
                      </td>

                      <td className="py-2 px-6">
                        {item.sa ? (item.sa === "✔" ? "Y" : "N") : "⏳"}
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-6">
                        {" "}
                        {item.status === "Pending" ? (
                          <div className="flex flex-row space-x-3 justify-center ">
                            {" "}
                            {/* View */}{" "}
                            <FaEye
                              onClick={() => {
                                setFormData(item);
                                setMode("view");
                                setOpenModal(true);
                              }}
                              className="inline text-blue-500 cursor-pointer text-lg"
                            />{" "}
                            {/* Edit */}{" "}
                            <FaPen
                              onClick={() => {
                                setFormData(item);
                                setEditId(item.id);
                                setMode("edit");
                                setOpenModal(true);
                              }}
                              className="inline text-green-500 cursor-pointer text-lg"
                            />{" "}
                            {/* Delete */}{" "}
                            <MdDeleteForever
                              onClick={() => handleDelete(item.id)}
                              className="inline text-red-500 cursor-pointer text-xl"
                            />{" "}
                          </div>
                        ) : (
                          "No Action"
                        )}
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
              Showing {filteredClaimRequest.length === 0 ? "0" : startIndex + 1}{" "}
              to {Math.min(endIndex, filteredClaimRequest.length)} of{" "}
              {filteredClaimRequest.length} entries
            </span>

            <div className="flex flex-row space-x-1">
              <button
                disabled={currentPage == 1}
                onClick={() => setCurrentPage(1)}
                className=" p-2 bg-gray-200 rounded-full disabled:opacity-50"
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
                className=" p-2 bg-gray-200 rounded-full disabled:opacity-50"
              >
                Last
              </button>
            </div>
          </div>
        </div>

        {openModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6"
            style={{ scrollbarWidth: "none" }}>
              {/* Close */}
              <div className="flex justify-end">
                <RxCross2
                  onClick={() => setOpenModal(false)}
                  className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Employee */}
                <div>
                  <SearchDropdown
                    label={
                      <>
                        Employee <span className="text-red-500">*</span>
                      </>
                    }
                    name="employee"
                    value={formData.employee}
                    options={["Employee 1", "Employee 2", "Employee 3"]}
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />
                </div>

                {/* Claim Category */}
                <div>
                  <SearchDropdown
                    label={
                      <>
                        Claim Category <span className="text-red-500">*</span>
                      </>
                    }
                    name="claimCategory"
                    value={formData.claimCategory}
                    options={["Food", "Travel", "Trip"]}
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />
                </div>

                {/* Date */}
                <div>
                  <label className={labelStyle}>
                    Date
                    <span className="text-[oklch(0.577_0.245_27.325)]"> *</span>
                  </label>

                  <input
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    onClick={() => setDateSpinner(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
                    className={inputStyle}
                  />

                  {dateSpinner && (
                    <SpinnerDatePicker
                      value={formData.date}
                      onChange={(date) =>
                        setFormData({ ...formData, date: date })
                      }
                      onClose={() => setDateSpinner(false)}
                    />
                  )}
                </div>

                {/* Purpose */}
                <div className="md:col-span-2">
                  <label className={labelStyle}>
                    Purpose
                    <span className="text-[oklch(0.577_0.245_27.325)]"> *</span>
                  </label>

                  <input
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    placeholder="Purpose of the claim"
                    className={inputStyle}
                    disabled={mode === "view"}
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    Amount
                    <span className="text-[oklch(0.577_0.245_27.325)]"> *</span>
                  </label>

                  <input
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder="Amount"
                    disabled={mode === "view"}
                  />
                </div>

                {/* Remarks */}
                <div className="md:col-span-3">
                  <label className={labelStyle}>Remarks</label>

                  <input
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    placeholder="Additional Remarks"
                    className={inputStyle}
                    disabled={mode === "view"}
                  />
                </div>
              </div>
              <h1 className={`${labelStyle} mt-4`}>Add Attachment</h1>
              <div className="p-4 shadow-xl rounded-lg bg-white">
                {/* Info Bar */}

                <div className="bg-[oklch(0.9_0.03_16.439)] text-sm text-[oklch(0.645_0.246_16.439)] p-2 rounded mb-4">
                  Upload clear images (JPG, PNG) or PDFs of receipts. Max file
                  size: 5MB.
                </div>

                {/* Drag Drop Area */}
                <div
                  className="border-2 border-gray-300 border-dashed p-6 text-center rounded cursor-pointer hover:bg-gray-50"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current.click()}
                >
                  Drag and drop files here or click to select
                </div>

                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => handleFiles(e.target.files)}
                />

                {/* Button */}
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="mt-3 px-4 py-1 bg-[oklch(0.645_0.246_16.439)] text-white rounded"
                >
                  Add Attachment
                </button>

                {/* File List */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {files.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border border-gray-400 p-2 rounded"
                      >
                        <div className="flex items-center gap-3">
                          {/* Preview */}
                          {item.file.type.startsWith("image") ? (
                            <img
                              src={item.preview}
                              alt="preview"
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded text-sm">
                              PDF
                            </div>
                          )}

                          {/* File Details */}
                          <div>
                            <div className="text-sm font-medium">
                              {item.file.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatSize(item.file.size)}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          {item.file.type === "application/pdf" && (
                            <a
                              href={item.preview}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 text-sm"
                            >
                              Preview
                            </a>
                          )}

                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              {mode !== "view" && (
                <div className="flex justify-end mt-10">
                  <button
                    onClick={handleSubmit}
                    className="bg-[oklch(0.645_0.246_16.439)] text-white px-8 py-2 rounded-md"
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

export default ClaimRequest;

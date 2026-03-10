import React, { useState } from "react";
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

const LeaveRequest = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [fromDateSpinner, setFromDateSpinner] = useState(false);
  const [toDateSpinner, setToDateSpinner] = useState(false);
  const [showResumeSpinner, setShowResumeSpinner] = useState(false);
  const [leave, setLeave] = useState([
    {
      id: 1,
      employee: "Employee",
      leaveType: "Sick Leave",
      fromDate: "2026-01-23",
      toDate: "2026-01-24",
      resumeOn: "2026-01-25",
      reason: "Sick Leave - fever",
      createdDate: new Date(),
      requestedBy: "Drishti",
      fa: "✔",
      faname: "Manager",
      sa: "✔",
      saname: "Admin",
      rejectedreason: "-",
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    employee: "",
    leaveType: "",
    fromDate: "",
    toDate: "",
    resumeOn: "",
    numberOfDays: "",
    pendingDays: "",
    leaveBalance: "",
    contact: "",
    email: "",
    reason: "",
    isHalfDay: false,
  });

  const inputStyle =
    "text-lg w-full  border  border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filteredLeave = leave.filter((x) =>
    x.employee.toLowerCase().startsWith(searchTerm.toLowerCase()),
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

  const handleSubmit = () => {
    const {
      employee,
      leaveType,
      fromDate,
      toDate,
      resumeOn,
      reason,
      contact,
      email,
      isHalfDay,
    } = formData;

    if (
      !employee ||
      !leaveType ||
      !fromDate ||
      !toDate ||
      !resumeOn ||
      !contact ||
      !email
    ) {
      toast.error("Please fill required fields");
      return;
    }

    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split("/");
      return new Date(year, month - 1, day);
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const from = parseDate(fromDate);
    const to = parseDate(toDate);
    const resume = parseDate(resumeOn);

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

    const newLeave = {
      id: Date.now(),
      employee,
      leaveType,
      fromDate,
      toDate,
      resumeOn,
      reason,
      createdDate: new Date(),
      isHalfDay,
    };

    if (editId) {
      setLeave((prev) =>
        prev.map((x) => (x.id === editId ? { ...x, ...newLeave } : x)),
      );
      toast.success("Leave updated");
    } else {
      setLeave((prev) => [...prev, newLeave]);
      toast.success("Leave added");
    }

    setOpenModal(false);
    setEditId(null);

    setFormData({
      employee: "",
      leaveType: "",
      fromDate: "",
      toDate: "",
      resumeOn: "",
      numberOfDays: "",
      pendingDays: "",
      leaveBalance: "",
      contact: "",
      email: "",
      reason: "",
      isHalfDay: false,
    });
  };

  const handleCopy = () => {
    const header = [
      "Employee",
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
          item.employee,
          item.leaveType,
          item.fromDate,
          item.toDate,
          item.resumeOn,
          item.reason || "NIL",
          new Date(item.createdDate).toLocaleDateString(),
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredLeave.map((item) => ({
      Employee: item.employee,
      LeaveType: item.leaveType,
      FromDate: item.fromDate,
      ToDate: item.toDate,
      ResumeOn: item.resumeOn,
      Reason: item.reason || "NIL",
      CreatedDate: new Date(item.createdDate).toLocaleDateString(),
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
        item.employee,
        item.leaveType,
        item.fromDate,
        item.toDate,
        item.resumeOn,
        item.reason || "NIL",
        new Date(item.createdDate).toLocaleDateString(),
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
      <div className="mb-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
            <FaAngleRight />
            Requests
            <FaAngleRight />
            <div onClick={() => setOpenModal(false)} className="cursor-pointer">
              Leave Request
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
          <div className="overflow-x-auto min-h-[250px]"style={{ scrollbarWidth: "none" }}>
            <table className="w-full text-lg border-collapse">
              <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
                <tr>
                  <th className="py-2 px-6 px-6 font-semibold">Employee</th>
                  <th className="py-2 px-6 font-semibold">Leave Type</th>
                  <th className="py-2 px-6 font-semibold">From</th>
                  <th className="py-2 px-6 font-semibold">To</th>
                  <th className="py-2 px-6 font-semibold">Resume On</th>
                  <th className="py-2 px-6 font-semibold">Leave Reason</th>

                  <th className="py-2 px-6 font-semibold">FA</th>
                  <th className="py-2 px-6 font-semibold">FA Name</th>

                  <th className="py-2 px-6 font-semibold">SA</th>
                  <th className="py-2 px-6 font-semibold">SA Name</th>

                  <th className="py-2 px-6 font-semibold">Rejected Reason</th>

                  <th className="py-2 px-6 font-semibold">FA</th>
                  <th className="py-2 px-6 font-semibold">SA</th>

                  <th className="py-2 px-6 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {currentLeave.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="text-center p-10">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentLeave.map((item) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                    >
                      <td className="py-2 px-6">{item.employee}</td>

                      <td className="py-2 px-6 whitespace-nowraps">
                        {item.leaveType}
                      </td>

                      <td className="py-2 px-6">{item.fromDate}</td>

                      <td className="py-2 px-6">{item.toDate}</td>

                      <td className="py-2 px-6">{item.resumeOn}</td>

                      <td className="py-2 px-6 whitespace-nowrap">
                        {item.reason
                          ? `${item.leaveType} - ${item.reason}`
                          : `${item.leaveType} - NIL`}
                      </td>

                      {/* FA Status */}
                      <td className="py-2 px-6 text-xl text-green-600">
                        {item.fa}
                      </td>

                      <td className="py-2 px-6">{item.faname}</td>

                      {/* SA Status */}
                      <td className="py-2 px-6 text-xl text-green-600">
                        {item.sa}
                      </td>

                      <td className="py-2 px-6">{item.saname}</td>

                      <td className="py-2 px-6">{item.rejectedreason}</td>

                      <td className="py-2 px-6">
                        {item.fa === "✔" ? "Y" : "N"}
                      </td>

                      <td className="py-2 px-6">
                        {item.fa === "✔" ? "Y" : "N"}
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-6">
                        {" "}
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
                            onClick={() =>
                              setLeave(leave.filter((v) => v.id !== item.id))
                            }
                            className="inline text-red-500 cursor-pointer text-xl"
                          />{" "}
                        </div>{" "}
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
              Showing {filteredLeave.length === 0 ? "0" : startIndex + 1} to{" "}
              {Math.min(endIndex, filteredLeave.length)} of{" "}
              {filteredLeave.length} entries
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6">
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
                  <label className={labelStyle}>
                    Employee
                    <span className="text-[oklch(0.577_0.245_27.325)]"> *</span>
                  </label>

                  <select
                    name="employee"
                    value={formData.employee}
                    onChange={handleChange}
                    className={inputStyle}
                    disabled={mode === "view"}
                  >
                    <option>Select</option>
                    <option>Employee 1</option>
                    <option>Employee 2</option>
                    <option>Employee 3</option>
                  </select>
                </div>

                {/* Leave Type */}
                <div>
                  <label className={labelStyle}>
                    Leave Type
                    <span className="text-[oklch(0.577_0.245_27.325)]"> *</span>
                  </label>

                  <select
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleChange}
                    className={inputStyle}
                    disabled={mode === "view"}
                  >
                    <option>Select</option>
                    <option>Sick Leave</option>
                    <option>Annual Leave</option>
                    <option>Casual Leave</option>
                  </select>
                </div>

                {/* From Date */}
                <div>
                  <label className={labelStyle}>
                    First Date of Absence
                    <span className="text-[oklch(0.577_0.245_27.325)]"> *</span>
                  </label>

                  <input
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleChange}
                    onClick={() => setFromDateSpinner(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
                    className={inputStyle}
                  />

                  {fromDateSpinner && (
                    <SpinnerDatePicker
                      value={formData.fromDate}
                      onChange={(date) =>
                        setFormData({ ...formData, fromDate: date })
                      }
                      onClose={() => setFromDateSpinner(false)}
                    />
                  )}
                </div>

                {/* To Date */}
                <div>
                  <label className={labelStyle}>
                    Last Date of Absence
                    <span className="text-[oklch(0.577_0.245_27.325)]"> *</span>
                  </label>

                  <input
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleChange}
                    onClick={() => setToDateSpinner(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
                    className={inputStyle}
                  />

                  {toDateSpinner && (
                    <SpinnerDatePicker
                      value={formData.toDate}
                      onChange={(date) =>
                        setFormData({ ...formData, toDate: date })
                      }
                      onClose={() => setToDateSpinner(false)}
                    />
                  )}
                </div>

                {/* Resume On */}
                <div>
                  <label className={labelStyle}>Resume Duty On</label>

                  <input
                    name="resumeOn"
                    value={formData.resumeOn}
                    onChange={handleChange}
                    onClick={() => setShowResumeSpinner(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
                    className={inputStyle}
                  />

                  {showResumeSpinner && (
                    <SpinnerDatePicker
                      value={formData.resumeOn}
                      onChange={(date) =>
                        setFormData({ ...formData, resumeOn: date })
                      }
                      onClose={() => setShowResumeSpinner(false)}
                    />
                  )}
                </div>

                <div>
                  <label className={labelStyle}>
                    Number of Days
                    <span className="text-[oklch(0.577_0.245_27.325)]"> *</span>
                  </label>

                  <input
                    name="numberOfDays"
                    value={formData.numberOfDays}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder="Number of Days"
                    disabled={mode === "view"}
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    Leave Pending of Approvals (No of Days)
                  </label>

                  <input
                    name="pendingDays"
                    value={formData.pendingDays}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder="Leave Pending of Approvals (No of Days)"
                    disabled={mode === "view"}
                  />
                </div>

                <div>
                  <label className={labelStyle}>Leave Balance</label>

                  <input
                    name="leaveBalance"
                    value={formData.leaveBalance}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder="Leave Balance"
                    disabled={mode === "view"}
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    Contact{" "}
                    <span className="text-[oklch(0.577_0.245_27.325)]"> *</span>
                  </label>

                  <input
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder="Contact"
                    disabled={mode === "view"}
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    Email{" "}
                    <span className="text-[oklch(0.577_0.245_27.325)]"> *</span>
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder="Email"
                    disabled={mode === "view"}
                  />
                </div>

                {/* Leave Reason */}
                <div className="lg:col-span-2">
                  <label className={labelStyle}>Leave Reason</label>

                  <input
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Reason for Leave"
                    className={inputStyle}
                    disabled={mode === "view"}
                  />
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <label className={labelStyle}>Is HalfDay</label>
                  <input
                    type="checkbox"
                    name="isHalfDay"
                    checked={formData.isHalfDay}
                    onChange={handleChange}
                    disabled={mode === "view"}
                  />
                </div>
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

export default LeaveRequest;

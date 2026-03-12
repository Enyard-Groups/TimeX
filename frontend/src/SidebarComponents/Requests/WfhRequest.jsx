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

const WfhRequest = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [fromDateSpinner, setFromDateSpinner] = useState(false);
  const [toDateSpinner, setToDateSpinner] = useState(false);
  const [wfh, setWfh] = useState(() => {
    const stored = localStorage.getItem("wfhRequests");

    if (stored) {
      return JSON.parse(stored).map((item) => ({
        ...item,
        createdDate: new Date(item.createdDate),
      }));
    }

    return [
      {
        id: 1,
        employee: "Employee",
        fromDate: "23/01/2026",
        toDate: "24/01/2026",
        reason: "fever",
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
      localStorage.setItem("wfhRequests", JSON.stringify(wfh));
    }, [wfh]);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    employee: "",
    fromDate: "",
    toDate: "",
    numberOfDays: "",
    pendingDays: "",
    wfhBalance: "",
    contact: "",
    email: "",
    reason: "",
  });

  const inputStyle =
    "text-lg w-full  border  border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filteredWfh = wfh.filter((x) =>
    x.employee.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentWfh = filteredWfh.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredWfh.length / entriesPerPage),
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (updated.fromDate && updated.toDate) {
        const parseDate = (dateStr) => {
          const [day, month, year] = dateStr.split("/");
          return new Date(year, month - 1, day);
        };

        const from = parseDate(updated.fromDate);
        const to = parseDate(updated.toDate);

        const diffTime = to - from;
        const diffDays = diffTime / (1000 * 60 * 60 * 24) + 1;

        updated.numberOfDays = diffDays > 0 ? diffDays : "";
      }

      return updated;
    });
  };

  // Handle Submit
  const handleSubmit = () => {
    const { employee, fromDate, toDate, reason, contact, email } = formData;

    if (!employee || !fromDate || !toDate || !contact || !email || !reason) {
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

    if (from < today) {
      toast.error("First Date cannot be in the past");
      return;
    }

    if (to < from) {
      toast.error("Last Date must be after First Date");
      return;
    }

    const stored = JSON.parse(localStorage.getItem("wfhRequests")) || [];

    const newWfh = {
      id: Date.now(),
      employee,
      fromDate,
      toDate,
      reason,
      fa: "",
      faname: "",
      sa: "",
      saname: "",
      rejectedreason: "",
      status: "Pending",
    };

    if (editId) {
      const updated = stored.map((item) =>
        item.id === editId ? { ...item, ...newWfh } : item,
      );

      localStorage.setItem("wfhRequests", JSON.stringify(updated));

      setWfh(updated);

      toast.success(" Updated");
    } else {
      const updated = [...stored, newWfh];

      localStorage.setItem("wfhRequests", JSON.stringify(updated));

      setWfh(updated);

      toast.success(" Submitted");
    }

    setOpenModal(false);
    setEditId(null);

    setFormData({
      employee: "",
      fromDate: "",
      toDate: "",
      numberOfDays: "",
      pendingDays: "",
      wfhBalance: "",
      contact: "",
      email: "",
      reason: "",
    });
  };

  // Handle delete
  const handleDelete = (id) => {
    const stored = JSON.parse(localStorage.getItem("wfhRequests")) || [];

    const updated = stored.filter((v) => v.id !== id);

    localStorage.setItem("wfhRequests", JSON.stringify(updated));

    setWfh(
      updated.map((item) => ({
        ...item,
      })),
    );

    toast.success("Deleted Successfully");
  };

  const handleCopy = () => {
    const header = ["Employee", "From Date", "To Date", "Reason"].join("\t");

    const rows = filteredWfh
      .map((item) => {
        return [
          item.employee,
          item.fromDate,
          item.toDate,
          item.reason || "NIL",
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredWfh.map((item) => ({
      Employee: item.employee,
      FromDate: item.fromDate,
      ToDate: item.toDate,
      Reason: item.reason || "NIL",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "WfhRequest");

    XLSX.writeFile(workbook, "WfhRequestData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = ["Employee", "From Date", "To Date", "Reason"];

    const tableRows = [];

    filteredWfh.forEach((item) => {
      const row = [
        item.employee,
        item.fromDate,
        item.toDate,
        item.reason || "NIL",
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("WfhRequestData.pdf");
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
              WFT Request
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
                  <th className="py-2 px-6 font-semibold">From</th>
                  <th className="py-2 px-6 font-semibold">To</th>
                  <th className="py-2 px-6 font-semibold">Wfh Reason</th>

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
                {currentWfh.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="text-center p-10">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentWfh.map((item) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                    >
                      <td className="py-2 px-6">{item.employee}</td>

                      <td className="py-2 px-6">{item.fromDate}</td>

                      <td className="py-2 px-6">{item.toDate}</td>

                      <td className="py-2 px-6 whitespace-nowrap">
                        {item.reason}
                      </td>

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

                      <td className="py-2 px-6 whitespace-nowrap">
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
              Showing {filteredWfh.length === 0 ? "0" : startIndex + 1} to{" "}
              {Math.min(endIndex, filteredWfh.length)} of {filteredWfh.length}{" "}
              entries
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
                    disabled
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    Wfh Pending of Approvals (No of Days)
                  </label>

                  <input
                    name="pendingDays"
                    value={formData.pendingDays}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder="Wfh Pending of Approvals (No of Days)"
                    disabled={mode === "view"}
                  />
                </div>

                <div>
                  <label className={labelStyle}>Wfh Balance</label>

                  <input
                    name="wfhBalance"
                    value={formData.wfhBalance}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder="Wfh Balance"
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

                {/* Wfh Reason */}
                <div className="lg:col-span-2">
                  <label className={labelStyle}>
                    Wfh Reason{" "}
                    <span className="text-[oklch(0.577_0.245_27.325)]"> *</span>
                  </label>

                  <input
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Reason for Wfh"
                    className={inputStyle}
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

export default WfhRequest;

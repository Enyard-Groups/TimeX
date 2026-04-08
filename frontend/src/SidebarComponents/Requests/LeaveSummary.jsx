import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaAngleRight, FaEye } from "react-icons/fa6";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";
import { RxCross2 } from "react-icons/rx";

const API_BASE = "http://localhost:3000/api";

const LeaveSummary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const inputStyle =
    "w-full bg-white border text-sm xl:text-lg border-gray-200 text-gray-900 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm";

  const labelStyle = "text-sm xl:text-base font-semibold text-gray-700 mb-2 block";

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/requests/leave`);
      setLeaveData(res.data);
    } catch (error) {
      console.error("Failed to fetch leaves", error);
      toast.error("Failed to load leave summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const filteredData = leaveData.filter(
    (item) =>
      (item.employee_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.idNo || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / entriesPerPage),
  );

  const handleCopy = () => {
    const header = [
      "ID No",
      "Employee",
      "Leave Type",
      "From Date",
      "To Date",
      "Days",
      "Applied On",
      "Status",
    ].join("\t");
    const rows = filteredData
      .map((item) =>
        [
          item.idNo,
          item.employee_name,
          item.leave_type,
          item.start_date,
          item.end_date,
          item.number_of_days,
          new Date(item.created_at).toLocaleDateString(),
          item.status,
        ].join("\t"),
      )
      .join("\n");
    navigator.clipboard.writeText(`${header}\n${rows}`);
    toast.success("Copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredData.map((item) => ({
      "ID No": item.idNo,
      Employee: item.employee_name,
      "Leave Type": item.leave_type,
      "From Date": item.start_date,
      "To Date": item.end_date,
      Days: item.number_of_days,
      "Applied On": new Date(item.created_at).toLocaleDateString(),
      Status: item.status,
    }));
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leave Summary");
    XLSX.writeFile(wb, "Leave_Summary.xlsx");
    toast.success("Excel downloaded");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    autoTable(doc, {
      head: [
        [
          "ID No",
          "Employee",
          "Leave Type",
          "From Date",
          "To Date",
          "Days",
          "Applied On",
          "Status",
        ],
      ],
      body: filteredData.map((item) => [
        item.idNo,
        item.employee_name,
        item.leave_type,
        item.start_date,
        item.end_date,
        item.number_of_days,
        new Date(item.created_at).toLocaleDateString(),
        item.status,
      ]),
    });
    doc.save("Leave_Summary.pdf");
    toast.success("PDF downloaded");
  };

  return (
    <div className="mb-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-lg font-semibold text-gray-800 xl:text-xl">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Requests</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div className="text-blue-600">Leave Summary</div>
        </h1>
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
              <span className="text-sm xl:text-base font-medium text-gray-600">entries</span>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-center">
              <input
                placeholder="Search summary..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48 xl:text-base bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
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
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-[16px] xl:text-[20px] text-gray-700">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50">
                <th className="px-4 py-3 text-center font-semibold text-gray-700 hidden sm:table-cell">
                  ID No
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">
                  Employee
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 hidden md:table-cell">
                  Leave Type
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 hidden xl:table-cell">
                  From Date
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 hidden xl:table-cell">
                  To Date
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 hidden md:table-cell">
                  Days
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 hidden 2xl:table-cell">
                  Applied On
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 hidden sm:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-4xl opacity-40">🍃</div>
                      <p className="text-gray-500 text-base font-medium">
                        No Leave Summary
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 even:bg-blue-50/60"
                  >
                    <td className="px-4 py-2.5 text-center text-gray-600 whitespace-nowrap hidden sm:table-cell">
                      {item.idNo}
                    </td>
                    <td className="px-4 py-2.5 text-center font-medium text-gray-800">
                      {item.employee_name}
                    </td>
                    <td className="px-4 py-2.5 text-center text-gray-600 whitespace-nowrap hidden md:table-cell">
                      {item.leave_type}
                    </td>
                    <td className="px-4 py-2.5 text-center text-gray-600 whitespace-nowrap hidden xl:table-cell">
                      {item.start_date}
                    </td>
                    <td className="px-4 py-2.5 text-center text-gray-600 whitespace-nowrap hidden xl:table-cell">
                      {item.end_date}
                    </td>
                    <td className="px-4 py-2.5 text-center font-semibold text-blue-600 whitespace-nowrap hidden md:table-cell">
                      {item.number_of_days}
                    </td>
                    <td className="px-4 py-2.5 text-center text-gray-500 whitespace-nowrap hidden 2xl:table-cell">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-center hidden sm:table-cell">
                      <span
                        className={`px-3 py-1 rounded-full text-sm xl:text-[16px] font-semibold ${
                          item.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => {
                          (setOpenModal(true), setSelectedLeave(item));
                        }}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-2 rounded-lg transition-all"
                      >
                        <FaEye className="text-lg" />
                      </button>
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
              {filteredData.length === 0 ? "0" : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="text-gray-900 font-semibold">
              {Math.min(endIndex, filteredData.length)}
            </span>{" "}
            of{" "}
            <span className="text-gray-900 font-semibold">
              {filteredData.length}
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
      {openModal && selectedLeave && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Close Button */}
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                View Leave Summary
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <label className={labelStyle}>ID No</label>
                <input
                  value={selectedLeave.idNo}
                  disabled
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Employee Name</label>
                <input
                  value={selectedLeave.employee_name}
                  disabled
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Leave Type</label>
                <input
                  value={selectedLeave.leave_type}
                  disabled
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>From Date</label>
                <input
                  value={selectedLeave.start_date}
                  disabled
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>To Date</label>
                <input
                  value={selectedLeave.end_date}
                  disabled
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Number of Days</label>
                <input
                  value={selectedLeave.number_of_days}
                  disabled
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Applied On</label>
                <input
                  value={new Date(selectedLeave.created_at).toLocaleDateString()}
                  disabled
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Status</label>
                <input
                  value={selectedLeave.status}
                  disabled
                  className={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveSummary;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { GrPrevious, GrNext } from "react-icons/gr";
import SearchDropdown from "../SearchDropdown";
import SpinnerDatePicker from "../SpinnerDatePicker";
import { FaEye } from "react-icons/fa";
import { GoCopy } from "react-icons/go";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = "http://localhost:3000/api";

const ClaimReport = () => {
  const [openModal, setOpenModal] = useState(false);
  const [claimReport, setClaimReport] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [modalOpenSelectedItem, setModalOpenSelectedItem] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${API_BASE}/employee`);
        setEmployeeOptions(res.data || []);
      } catch (error) {
        console.error("Failed to fetch employees", error);
      }
    };
    fetchEmployees();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPunchDateSpinner, setShowPunchDateSpinner] = useState(false);
  const [showToPunchDateSpinner, setShowToPunchDateSpinner] = useState(false);

  const [formData, setFormData] = useState({
    employee: "",
    employee_name: "",
    fromdateinform: "",
    todateinform: "",
  });

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm";
  const labelStyle =
    "text-sm xl:text-base font-semibold text-gray-700 mb-2 block";

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (formData.employee)
        params.append("company_enrollment_id", formData.employee);
      if (formData.fromdateinform)
        params.append("from_date", formData.fromdateinform);
      if (formData.todateinform)
        params.append("to_date", formData.todateinform);

      const res = await axios.get(
        `${API_BASE}/requests/claim/report?${params.toString()}`,
      );
      setClaimReport(res.data || []);
      setOpenModal(true);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to generate report", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const filteredclaimReport = claimReport.filter((x) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (x.employee_name || "").toLowerCase().includes(searchLower) ||
      (x.employee_code || "").toLowerCase().includes(searchLower) ||
      (x.claim_category || "").toLowerCase().includes(searchLower) ||
      (x.purpose || "").toLowerCase().includes(searchLower)
    );
  });

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentclaimReport = filteredclaimReport.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredclaimReport.length / entriesPerPage),
  );

  const selectedItem = claimReport.find((item) => item.id === selectedId);

  const handleCopy = () => {
    const header = [
      "Sl.No",
      "Employee",
      "ID",
      "Claim Date",
      "Category",
      "Amount",
      "Purpose",
      "Status",
    ].join("\t");
    const rows = filteredclaimReport
      .map((item, i) =>
        [
          i + 1,
          item.employee_name,
          item.employee_code,
          item.date ? new Date(item.date).toLocaleDateString() : "—",
          item.claim_category,
          item.amount,
          item.purpose,
          item.status,
        ].join("\t"),
      )
      .join("\n");
    navigator.clipboard.writeText(`${header}\n${rows}`);
    toast.success("Copied to clipboard");
  };

  const handleExcel = () => {
    const data = filteredclaimReport.map((item, i) => ({
      "Sl.No": i + 1,
      Employee: item.employee_name,
      "Employee ID": item.employee_code,
      Company: item.company_name,
      "Claim Date": item.date ? new Date(item.date).toLocaleDateString() : "—",
      Category: item.claim_category,
      Amount: item.amount,
      Purpose: item.purpose,
      Status: item.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ClaimReport");
    XLSX.writeFile(wb, "ClaimReport.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    doc.text("Claim Report", 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [
        [
          "Sl.No",
          "Employee",
          "ID",
          "Claim Date",
          "Category",
          "Amount",
          "Status",
        ],
      ],
      body: filteredclaimReport.map((item, i) => [
        i + 1,
        item.employee_name,
        item.employee_code,
        item.date ? new Date(item.date).toLocaleDateString() : "—",
        item.claim_category,
        item.amount,
        item.status,
      ]),
    });
    doc.save("ClaimReport.pdf");
  };

  return (
    <>
      <div className="mb-6 max-w-[1920px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Reports</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div
              onClick={() => setOpenModal(false)}
              className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
            >
              Claim Report
            </div>
          </h1>
        </div>

        {/* Filter Section Area */}
        {!openModal && (
          <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-blue-100/50 shadow-xl mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <SearchDropdown
                  label="Employee"
                  name="employee"
                  value={formData.employee}
                  displayValue={formData.employee_name}
                  options={employeeOptions}
                  labelKey="full_name"
                  valueKey="company_enrollment_id"
                  labelName="employee_name"
                  formData={formData}
                  setFormData={setFormData}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>From Date</label>
                <input
                  name="fromdateinform"
                  value={formData.fromdateinform}
                  onClick={() => setShowPunchDateSpinner(true)}
                  readOnly
                  placeholder="dd/mm/yyyy"
                  className={inputStyle}
                />
                {showPunchDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.fromdateinform}
                    onChange={(date) =>
                      setFormData({ ...formData, fromdateinform: date })
                    }
                    onClose={() => setShowPunchDateSpinner(false)}
                  />
                )}
              </div>

              <div>
                <label className={labelStyle}>To Date</label>
                <input
                  name="todateinform"
                  value={formData.todateinform}
                  onClick={() => setShowToPunchDateSpinner(true)}
                  readOnly
                  placeholder="dd/mm/yyyy"
                  className={inputStyle}
                />
                {showToPunchDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.todateinform}
                    onChange={(date) =>
                      setFormData({ ...formData, todateinform: date })
                    }
                    onClose={() => setShowToPunchDateSpinner(false)}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end mt-10">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-2.5 rounded-lg shadow-md xl:text-lg transition-all duration-200"
              >
                {loading ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>
        )}

        {/* Results Table Section */}
        {openModal && (
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl animate-in fade-in duration-500">
            <div className="p-6 border-b border-blue-100/30">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Claim Summary View
                </h2>
                <RxCross2
                  onClick={() => setOpenModal(false)}
                  className="text-2xl text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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
                    className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/60 transition-all"
                  >
                    {[10, 25, 50, 100].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm xl:text-base font-medium text-gray-600">
                    entries
                  </span>
                </div>

                <div className="flex gap-3">
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-white border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                      title="Copy to Clipboard"
                    >
                      <GoCopy />
                    </button>
                    <button
                      onClick={handleExcel}
                      className="p-2 bg-white border border-blue-200 rounded-lg text-green-600 hover:bg-green-50 transition-all"
                      title="Export to Excel"
                    >
                      <FaFileExcel />
                    </button>
                    <button
                      onClick={handlePDF}
                      className="p-2 bg-white border border-blue-200 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                      title="Export to PDF"
                    >
                      <FaFilePdf />
                    </button>
                  </div>
                  <input
                    placeholder="Search claims..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 xl:text-base rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
                  />
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
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                      Claim Date
                    </th>
                    <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                      Purpose
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentclaimReport.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-12 text-center text-gray-500 font-medium xl:text-lg"
                      >
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    currentclaimReport.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/60"
                      >
                        <td className="px-4 py-3 text-center font-medium text-gray-900">
                          {item.employee_name}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell text-gray-600">
                          {item.date
                            ? new Date(item.date).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell text-gray-600">
                          {item.claim_category}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell font-bold text-gray-900">
                          ₹{item.amount}
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell text-gray-500 truncate max-w-xs">
                          {item.purpose}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            <FaEye
                              onClick={() => {
                                setSelectedId(item.id);
                                setModalOpenSelectedItem(true);
                              }}
                              className="text-blue-500 hover:text-blue-700 xl:text-xl cursor-pointer transition-all"
                            />
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
                  {filteredclaimReport.length === 0 ? "0" : startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-gray-900">
                  {Math.min(endIndex, filteredclaimReport.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-900">
                  {filteredclaimReport.length}
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

        {/* Selection Detail Modal */}
        {modalOpenSelectedItem && selectedItem && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div
              className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in duration-200"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
                <h2 className="text-xl  font-bold text-gray-900">
                  {selectedItem.employee_name} Claim Details
                </h2>
                <button
                  onClick={() => {
                    setModalOpenSelectedItem(false);
                    setSelectedId(null);
                  }}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <RxCross2 className="text-2xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className={labelStyle}>Name</p>
                  <p className={inputStyle}>{selectedItem.employee_name}</p>
                </div>
                <div>
                  <p className={labelStyle}>Employee ID</p>
                  <p className={inputStyle}>
                    {selectedItem.employee_code || "—"}
                  </p>
                </div>
                <div>
                  <p className={labelStyle}>Company</p>
                  <p className={inputStyle}>
                    {selectedItem.company_name || "—"}
                  </p>
                </div>
                <div>
                  <p className={labelStyle}>Claim Date</p>
                  <p className={inputStyle}>
                    {selectedItem.date
                      ? new Date(selectedItem.date).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className={labelStyle}>Claim Category</p>
                  <p className={inputStyle}>{selectedItem.claim_category}</p>
                </div>
                <div>
                  <p className={labelStyle}>Amount</p>
                  <p className={`${inputStyle} font-bold text-blue-600`}>
                    ₹{selectedItem.amount}
                  </p>
                </div>
                <div>
                  <p className={labelStyle}>Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedItem.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : selectedItem.status === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {selectedItem.status}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <p className={labelStyle}>Purpose</p>
                  <p className={`${inputStyle} min-h-[80px]`}>
                    {selectedItem.purpose || "No purpose specified"}
                  </p>
                </div>
                {selectedItem.remarks && (
                  <div className="md:col-span-3">
                    <p className={labelStyle}>Remarks</p>
                    <p className={`${inputStyle} bg-gray-50`}>
                      {selectedItem.remarks}
                    </p>
                  </div>
                )}
                {selectedItem.rejectedreason && (
                  <div className="md:col-span-3">
                    <p className={labelStyle}>Rejected Reason</p>
                    <p className={`${inputStyle} bg-red-50 text-red-700`}>
                      {selectedItem.rejectedreason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ClaimReport;

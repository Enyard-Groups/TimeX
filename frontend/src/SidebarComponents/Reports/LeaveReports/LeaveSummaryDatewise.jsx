import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { GrPrevious, GrNext } from "react-icons/gr";
import SearchDropdown from "../../SearchDropdown";
import SpinnerDatePicker from "../../SpinnerDatePicker";
import { FaEye } from "react-icons/fa";
import { GoCopy } from "react-icons/go";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = "http://localhost:3000/api";

const LeaveSummaryDatewise = () => {
  const [openModal, setOpenModal] = useState(false);
  const [leaveReport, setLeaveReport] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [modalOpenSelectedItem, setModalOpenSelectedItem] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dropdown data
  const [companyOptions, setCompanyOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFromDateSpinner, setShowFromDateSpinner] = useState(false);
  const [showToDateSpinner, setShowToDateSpinner] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    company_id: "",
    employee: "",
    employee_id: "",
    fromdateinform: "",
    todateinform: "",
  });

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 lg:text-lg 3xl:text-xl rounded-lg focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm";
  const labelStyle =
    "text-sm lg:text-base 3xl:text-xl font-semibold text-gray-700 mb-2 block";

  const filteredReport = leaveSummaryDatewise.filter((emp) => {
    const fromDate = parseDate(emp.fromDate);
    const toDate = parseDate(emp.toDate);
    const fromDateinform = parseDate(formData.fromdateinform);
    const toDateinform = parseDate(formData.todateinform);

    if (toDateinform) {
      toDateinform.setHours(23, 59, 59, 999);
    }

    return (
      (!formData.employee || emp.employee === formData.employee) &&
      (!fromDateinform || fromDate >= fromDateinform) &&
      (!toDateinform || toDate <= toDateinform)
    );
  });

  const filteredleaveSummaryDatewise = filteredReport.filter((x) =>
    x.employee.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentData = filteredReport.slice(startIndex, endIndex);
  const totalPages = Math.max(1, Math.ceil(filteredReport.length / entriesPerPage));

  const selectedItem = leaveReport.find((item) => item.id === selectedId);

  const handleCopy = () => {
    const header = ["Sl.No", "Employee", "Company", "Leave Type", "From Date", "To Date", "Days", "Status"].join("\t");
    const rows = filteredReport
      .map((item, i) =>
        [
          i + 1,
          item.employee_name,
          item.company_name,
          item.leave_type,
          item.start_date ? new Date(item.start_date).toLocaleDateString() : "—",
          item.end_date ? new Date(item.end_date).toLocaleDateString() : "—",
          item.number_of_days,
          item.status,
        ].join("\t")
      )
      .join("\n");
    navigator.clipboard.writeText(`${header}\n${rows}`);
    toast.success("Copied to clipboard");
  };

  const handleExcel = () => {
    const data = filteredReport.map((item, i) => ({
      "Sl.No": i + 1,
      Employee: item.employee_name,
      "Employee ID": item.employee_code,
      Company: item.company_name,
      "Leave Type": item.leave_type,
      "From Date": item.start_date ? new Date(item.start_date).toLocaleDateString() : "—",
      "To Date": item.end_date ? new Date(item.end_date).toLocaleDateString() : "—",
      Days: item.number_of_days,
      Status: item.status,
      Reason: item.reason,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LeaveReport");
    XLSX.writeFile(wb, "LeaveReport.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    doc.text("Leave Summary Datewise", 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [["Sl.No", "Employee", "Company", "Leave Type", "From Date", "To Date", "Days", "Status"]],
      body: filteredReport.map((item, i) => [
        i + 1,
        item.employee_name,
        item.company_name,
        item.leave_type,
        item.start_date ? new Date(item.start_date).toLocaleDateString() : "—",
        item.end_date ? new Date(item.end_date).toLocaleDateString() : "—",
        item.number_of_days,
        item.status,
      ]),
    });
    doc.save("LeaveReport.pdf");
  };

  const statusClass = (status) => {
    if (status === "Approved") return "bg-green-100 text-green-700";
    if (status === "Rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <>
      <div className="mb-6 max-w-[1920px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center h-[30px] gap-2 text-base lg:text-xl 3xl:text-4xl font-semibold text-gray-900 ">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Reports</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Leave</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div
              onClick={() => setOpenModal(false)}
              className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
            >
              Leave Summary Datewise
            </div>
          </h1>
        </div>

        {/* Filter Section Area */}
        {!openModal && (
          <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-blue-100/50 shadow-xl mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <SearchDropdown
                  label="Company"
                  name="company"
                  value={formData.company}
                  options={companyOptions}
                  labelKey="name"
                  valueKey="id"
                  labelName="company"
                  formData={formData}
                  setFormData={(updated) =>
                    setFormData((prev) => ({
                      ...prev,
                      company: updated.company,
                      company_id: updated.company_id ?? updated.company,
                    }))
                  }
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              <div>
                <SearchDropdown
                  label="Employee"
                  name="employee"
                  value={formData.employee}
                  options={employeeOptions}
                  labelKey="full_name"
                  valueKey="id"
                  labelName="employee"
                  formData={formData}
                  setFormData={(updated) =>
                    setFormData((prev) => ({
                      ...prev,
                      employee: updated.employee,
                      employee_id: updated.employee_id ?? updated.employee,
                    }))
                  }
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              <div className="relative">
                <label className={labelStyle}>From Date</label>
                <input
                  name="fromdateinform"
                  value={formData.fromdateinform}
                  onClick={() => setShowPunchDateSpinner(true)}
                  readOnly
                  placeholder="dd/mm/yyyy"
                  readOnly
                  className={`${inputStyle} cursor-pointer`}
                />
                {showPunchDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.fromdateinform}
                    onChange={(date) =>
                      setFormData((prev) => ({ ...prev, fromdateinform: date }))
                    }
                    onClose={() => setShowFromDateSpinner(false)}
                  />
                )}
              </div>

              <div className="relative">
                <label className={labelStyle}>To Date</label>
                <input
                  name="todateinform"
                  value={formData.todateinform}
                  onClick={() => setShowToPunchDateSpinner(true)}
                  readOnly
                  placeholder="dd/mm/yyyy"
                  readOnly
                  className={`${inputStyle} cursor-pointer`}
                />
                {showToPunchDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.todateinform}
                    onChange={(date) =>
                      setFormData((prev) => ({ ...prev, todateinform: date }))
                    }
                    onClose={() => setShowToDateSpinner(false)}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end mt-10">
              <button
                onClick={() => setOpenModal(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-2.5 rounded-lg shadow-md lg:text-lg 3xl:text-xl transition-all duration-200"
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
                <h2 className="text-xl lg:text-2xl 3xl:text-3xl font-bold text-gray-800">
                  Datewise Summary View
                </h2>
                <RxCross2
                  onClick={() => setOpenModal(false)}
                  className="text-2xl text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm lg:text-base 3xl:text-lg font-medium text-gray-600">
                    Display
                  </label>
                  <select
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm lg:text-base 3xl:text-xl focus:ring-2 focus:ring-blue-500/60 transition-all"
                  >
                    {[10, 25, 50, 100].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm lg:text-base 3xl:text-lg font-medium text-gray-600">
                    entries
                  </span>
                </div>

                <div className="flex gap-3">
                  <input
                    placeholder="Search employee..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 lg:text-base 3xl:text-lg rounded-lg focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div
              className="overflow-x-auto min-h-[350px]"
              style={{ scrollbarWidth: "none" }}
            >
              <table className="w-full text-[16px] lg:text-[18px] 3xl:text-[22px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-blue-100/50">
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                      Leave Type
                    </th>
                    <th className="px-4 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                      From Date
                    </th>
                    <th className="px-4 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                      To Date
                    </th>
                    <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                      Total Days
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-12 text-center text-gray-500 font-medium lg:text-lg 3xl:text-2xl"
                      >
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/60"
                      >
                        <td className="px-4 py-3 text-center font-medium text-gray-900">
                          {item.employee}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell text-gray-600">
                          {item.leaveType}
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell text-gray-600">
                          {item.fromDate}
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell text-gray-600">
                          {item.toDate}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell text-gray-900 font-bold">
                          {item.numberOfDays}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            <FaEye
                              onClick={() => {
                                setSelectedId(item.id);
                                setModalOpenSelectedItem(true);
                              }}
                              className="text-blue-500 hover:text-blue-700 lg:text-xl 3xl:text-3xl cursor-pointer transition-all"
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
              <span className="text-sm lg:text-base 3xl:text-lg text-gray-600">
                Showing{" "}
                <span className="font-bold text-gray-900">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-gray-900">
                  {Math.min(endIndex, filteredleaveSummaryDatewise.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-900">
                  {filteredleaveSummaryDatewise.length}
                </span>{" "}
                entries
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm lg:text-base 3xl:text-xl font-medium disabled:opacity-50 transition-all"
                >
                  First
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-2.5 border rounded-lg bg-white disabled:opacity-50 hover:bg-blue-50 transition-all"
                >
                  <GrPrevious />
                </button>
                <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-bold text-sm lg:text-base 3xl:text-xl min-w-[45px] text-center">
                  {currentPage}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-2.5 border rounded-lg bg-white disabled:opacity-50 hover:bg-blue-50 transition-all"
                >
                  <GrNext />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm lg:text-base 3xl:text-xl font-medium disabled:opacity-50 transition-all"
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
                <h2 className="text-xl lg:text-2xl 3xl:text-4xl font-bold text-gray-900">
                  {selectedItem.employee} Details
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
                  <p className={inputStyle}>{selectedItem.employee_code || "—"}</p>
                </div>
                <div>
                  <p className={labelStyle}>Company</p>
                  <p className={inputStyle}>{selectedItem.company_name || "—"}</p>
                </div>
                <div>
                  <p className={labelStyle}>Leave Type</p>
                  <p className={inputStyle}>{selectedItem.leave_type}</p>
                </div>
                <div>
                  <p className={labelStyle}>From Date</p>
                  <p className={inputStyle}>{selectedItem.fromDate}</p>
                </div>
                <div>
                  <p className={labelStyle}>To Date</p>
                  <p className={inputStyle}>{selectedItem.toDate}</p>
                </div>
                <div>
                  <p className={labelStyle}>Number of Days</p>
                  <p className={`${inputStyle} font-bold text-blue-600`}>
                    {selectedItem.numberOfDays}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LeaveSummaryDatewise;

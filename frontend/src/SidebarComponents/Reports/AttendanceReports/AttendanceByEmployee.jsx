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

const AttendanceByEmployee = () => {
  const [openModal, setOpenModal] = useState(false);
  const [attendanceReport, setAttendanceReport] = useState([]);
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
    fromPunchDate: "",
    toPunchDate: "",
  });

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 lg:text-lg 3xl:text-xl rounded-lg focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm";
  const labelStyle =
    "text-sm lg:text-base 3xl:text-xl font-semibold text-gray-700 mb-2 block";

  const filteredReport = attendanceByEmployee.filter((emp) => {
    const punchDate = new Date(emp.createdDate);
    const fromDate = parseDate(formData.fromPunchDate);
    const toDate = parseDate(formData.toPunchDate);

    if (toDate) {
      toDate.setHours(23, 59, 59, 999);
    }

    return (
      (!formData.company || emp.company === formData.company) &&
      (!formData.employee ||
        formData.employee === "All" ||
        emp.employee === formData.employee) &&
      (!fromDate || punchDate >= fromDate) &&
      (!toDate || punchDate <= toDate)
    );
  });

  const filteredattendanceByEmployee = filteredReport.filter(
    (x) =>
      (x.employee_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (x.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (x.employee_code || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredReport.length / entriesPerPage));
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filteredReport.slice(startIndex, startIndex + entriesPerPage);

  const selectedItem = attendanceReport.find((item) => item.id === selectedId);

  const handleCopy = () => {
    const header = ["Sl.No", "Employee", "Date", "In Time", "Out Time", "Total Hours", "Status"].join("\t");
    const rows = filteredReport.map((item, i) => {
      const dt = item.created_at ? new Date(item.created_at) : null;
      return [
        i + 1,
        item.employee_name,
        dt ? dt.toLocaleDateString() : "—",
        item.in_time || "—",
        item.out_time || "—",
        getTimeDiff(item.in_time, item.out_time),
        item.status,
      ].join("\t");
    }).join("\n");
    navigator.clipboard.writeText(`${header}\n${rows}`);
    toast.success("Copied to clipboard");
  };

  const handleExcel = () => {
    const data = filteredReport.map((item, i) => {
      const dt = item.created_at ? new Date(item.created_at) : null;
      return {
        "Sl.No": i + 1,
        Employee: item.employee_name,
        "Employee ID": item.employee_code,
        Date: dt ? dt.toLocaleDateString() : "—",
        "In Time": item.in_time || "—",
        "Out Time": item.out_time || "—",
        "Total Hours": getTimeDiff(item.in_time, item.out_time),
        Status: item.status,
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AttendanceReport");
    XLSX.writeFile(wb, "AttendanceByEmployee.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    doc.text("Attendance By Employee", 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [["Sl.No", "Employee", "Date", "In Time", "Out Time", "Total Hours", "Status"]],
      body: filteredReport.map((item, i) => {
        const dt = item.created_at ? new Date(item.created_at) : null;
        return [
          i + 1,
          item.employee_name,
          dt ? dt.toLocaleDateString() : "—",
          item.in_time || "—",
          item.out_time || "—",
          getTimeDiff(item.in_time, item.out_time),
          item.status,
        ];
      }),
    });
    doc.save("AttendanceByEmployee.pdf");
  };

  return (
    <>
      <div className="mb-6 max-w-[1920px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center h-[30px] gap-2 text-base lg:text-xl 3xl:text-4xl font-semibold text-gray-900">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Reports</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Attendance Reports</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div
              onClick={() => setOpenModal(false)}
              className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
            >
              Attendance By Employee
            </div>
          </h1>
        </div>

        {/* Filter Section */}
        {!openModal && (
          <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-blue-100/50 shadow-xl mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  name="fromPunchDate"
                  value={formData.fromPunchDate}
                  onClick={() => setShowPunchDateSpinner(true)}
                  readOnly
                  placeholder="dd/mm/yyyy"
                  readOnly
                  className={`${inputStyle} cursor-pointer`}
                />
                {showPunchDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.fromPunchDate}
                    onChange={(date) => setFormData((prev) => ({ ...prev, fromPunchDate: date }))}
                    onClose={() => setShowFromDateSpinner(false)}
                  />
                )}
              </div>
              <div className="relative">
                <label className={labelStyle}>To Date</label>
                <input
                  name="toPunchDate"
                  value={formData.toPunchDate}
                  onClick={() => setShowToPunchDateSpinner(true)}
                  readOnly
                  placeholder="dd/mm/yyyy"
                  readOnly
                  className={`${inputStyle} cursor-pointer`}
                />
                {showToPunchDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.toPunchDate}
                    onChange={(date) => setFormData((prev) => ({ ...prev, toPunchDate: date }))}
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
                  Attendance By Employee
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
                    className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm lg:text-base 3xl:text-xl focus:ring-2 focus:ring-blue-500/60"
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
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 lg:text-base 3xl:text-lg rounded-lg focus:ring-2 focus:ring-blue-500/60 transition-all"
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
                      Date
                    </th>
                    <th className="px-4 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                      Day
                    </th>
                    <th className="px-4 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                      In Time
                    </th>
                    <th className="px-4 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                      Out Time
                    </th>
                    <th className="px-4 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                      Total Hours
                    </th>
                    <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentattendanceByEmployee.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="p-12 text-center text-gray-500 font-medium"
                      >
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    currentattendanceByEmployee.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/60"
                      >
                        <td className="px-4 py-3 text-center font-medium text-gray-900">
                          {item.employee}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell text-gray-600">
                          {new Date(item.createdDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center hidden xl:table-cell text-gray-600">
                          {new Date(item.createdDate).toLocaleString("en-US", {
                            weekday: "long",
                          })}
                        </td>
                        <td className="px-4 py-3 text-center hidden xl:table-cell text-gray-600">
                          {item.intime
                            ? new Date(item.intime).toLocaleTimeString()
                            : "No Checkin"}
                        </td>
                        <td className="px-4 py-3 text-center hidden xl:table-cell text-gray-600">
                          {item.outtime
                            ? new Date(item.outtime).toLocaleTimeString()
                            : "No Checkout"}
                        </td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-600">
                          {item.outtime && item.intime
                            ? getTimeDiff(
                              new Date(item.intime).toLocaleTimeString(),
                              new Date(item.outtime).toLocaleTimeString(),
                            )
                            : "Missed Punch"}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs lg:text-sm font-semibold ${item.status === "Approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                          >
                            {item.status}
                          </span>
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
                  {Math.min(endIndex, filteredattendanceByEmployee.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-900">
                  {filteredattendanceByEmployee.length}
                </span>{" "}
                entries
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm lg:text-base 3xl:text-xl font-medium disabled:opacity-50"
                >
                  First
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-2.5 border rounded-lg bg-white disabled:opacity-50"
                >
                  <GrPrevious />
                </button>
                <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-bold text-sm lg:text-base 3xl:text-xl min-w-[45px] text-center">
                  {currentPage}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-2.5 border rounded-lg bg-white disabled:opacity-50"
                >
                  <GrNext />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm lg:text-base 3xl:text-xl font-medium disabled:opacity-50"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div
              className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in duration-200"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
                <h2 className="text-xl lg:text-2xl 3xl:text-4xl font-bold text-gray-900">
                  {selectedItem.employee} Attendance Details
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

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div>
                  <p className={labelStyle}>Name</p>
                  <p className={inputStyle}>{selectedItem.employee}</p>
                </div>
                <div>
                  <p className={labelStyle}>Employee Category</p>
                  <p className={inputStyle}>{selectedItem.employeeCategory}</p>
                </div>
                <div>
                  <p className={labelStyle}>Designation</p>
                  <p className={inputStyle}>{selectedItem.designation}</p>
                </div>
                <div>
                  <p className={labelStyle}>Punch Date</p>
                  <p className={inputStyle}>
                    {new Date(selectedItem.createdDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className={labelStyle}>Punch Day</p>
                  <p className={inputStyle}>
                    {new Date(selectedItem.createdDate).toLocaleString(
                      "en-US",
                      { weekday: "long" },
                    )}
                  </p>
                </div>
                <div>
                  <p className={labelStyle}>Check in</p>
                  <p className={inputStyle}>
                    {selectedItem.intime
                      ? new Date(selectedItem.intime).toLocaleString()
                      : "No Checkin"}
                  </p>
                </div>
                <div>
                  <p className={labelStyle}>In Location</p>
                  <p className={inputStyle}>
                    {selectedItem.intime ? selectedItem.location : "-"}
                  </p>
                </div>
                <div>
                  <p className={labelStyle}>Check out</p>
                  <p className={inputStyle}>
                    {selectedItem.outtime
                      ? new Date(selectedItem.outtime).toLocaleString()
                      : "No Checkout"}
                  </p>
                </div>
                <div>
                  <p className={labelStyle}>Out Location</p>
                  <p className={inputStyle}>
                    {selectedItem.outtime ? selectedItem.location : "-"}
                  </p>
                </div>
                <div>
                  <p className={labelStyle}>Work Hours</p>
                  <p className={inputStyle}>
                    {selectedItem.intime && selectedItem.outtime
                      ? getTimeDiff(
                        new Date(selectedItem.intime).toLocaleTimeString(),
                        new Date(selectedItem.outtime).toLocaleTimeString(),
                      )
                      : "Missed Punch"}
                  </p>
                </div>
                <div>
                  <p className={labelStyle}>Remarks</p>
                  <p className={inputStyle}>{selectedItem.remarks || "-"}</p>
                </div>
                <div>
                  <p className={labelStyle}>Status</p>
                  <p
                    className={`py-1 px-3 w-fit rounded lg:text-lg 3xl:text-xl font-semibold border ${selectedItem.status === "Approved" ? "bg-green-100 text-green-700 border-green-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"}`}
                  >
                    {selectedItem.status}
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

export default AttendanceByEmployee;

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

const MannualEntryReport = () => {
  const [openModal, setOpenModal] = useState(false);
  const [mannualEntryReport, setMannualEntryReport] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [modalOpenSelectedItem, setModalOpenSelectedItem] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dropdown data from API
  const [companyOptions, setCompanyOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, locRes, desigRes] = await Promise.all([
          axios.get(`${API_BASE}/companies`),
          axios.get(`${API_BASE}/master/geofencing`),
          axios.get(`${API_BASE}/master/designation`),
        ]);
        setCompanyOptions(compRes.data || []);
        setLocationOptions(locRes.data || []);
        setDesignationOptions(desigRes.data || []);
      } catch (error) {
        console.error("Failed to fetch dropdown data", error);
      }
    };
    fetchData();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPunchDateSpinner, setShowPunchDateSpinner] = useState(false);
  const [showToPunchDateSpinner, setShowToPunchDateSpinner] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    company_id: "",
    location: "",
    location_id: "",
    designation: "",
    designation_id: "",
    fromPunchDate: "",
    toPunchDate: "",
  });

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (formData.company_id) params.append("company_id", formData.company_id);
      if (formData.location_id) params.append("location", formData.location_id);
      if (formData.designation_id)
        params.append("designation_id", formData.designation_id);
      if (formData.fromPunchDate)
        params.append("from_date", formData.fromPunchDate);
      if (formData.toPunchDate) params.append("to_date", formData.toPunchDate);

      const res = await axios.get(
        `${API_BASE}/requests/manual/report?${params.toString()}`,
      );
      setMannualEntryReport(res.data || []);
      setOpenModal(true);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error generating report", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

  const labelStyle =
    "text-sm xl:text-base focus:outline-none font-semibold text-slate-600 mb-1.5 block";

  const filteredmannualEntryReport = mannualEntryReport.filter((x) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (x.employee_name || "").toLowerCase().includes(searchLower) ||
      (x.employee_code || "").toLowerCase().includes(searchLower) ||
      (x.company_name || "").toLowerCase().includes(searchLower) ||
      (x.location_name || "").toLowerCase().includes(searchLower)
    );
  });

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentmannualEntryReport = filteredmannualEntryReport.slice(
    startIndex,
    endIndex,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredmannualEntryReport.length / entriesPerPage),
  );

  const selectedItem = mannualEntryReport.find(
    (item) => item.id === selectedId,
  );

  // ─── Export helpers ───────────────────────────────────────────────────────
  const handleCopy = () => {
    const header = [
      "Sl.No",
      "Employee",
      "Company",
      "Location",
      "Date",
      "In Time",
      "Out Time",
      "Status",
    ].join("\t");
    const rows = filteredmannualEntryReport
      .map((item, i) =>
        [
          i + 1,
          item.employee_name,
          item.company_name,
          item.location_name,
          item.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : "—",
          item.in_time || "—",
          item.out_time || "—",
          item.status,
        ].join("\t"),
      )
      .join("\n");
    navigator.clipboard.writeText(`${header}\n${rows}`);
    toast.success("Copied to clipboard");
  };

  const handleExcel = () => {
    const data = filteredmannualEntryReport.map((item, i) => ({
      "Sl.No": i + 1,
      Employee: item.employee_name,
      "Employee ID": item.employee_code,
      Company: item.company_name,
      Location: item.location_name,
      Designation: item.designation,
      "In Time": item.in_time || "—",
      "Out Time": item.out_time || "—",
      Status: item.status,
      "Created Date": item.created_at
        ? new Date(item.created_at).toLocaleDateString()
        : "—",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ManualEntryReport");
    XLSX.writeFile(wb, "ManualEntryReport.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    doc.text("Manual Entry Report", 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [
        [
          "Sl.No",
          "Employee",
          "ID",
          "Company",
          "Location",
          "Date",
          "In Time",
          "Out Time",
          "Status",
        ],
      ],
      body: filteredmannualEntryReport.map((item, i) => [
        i + 1,
        item.employee_name,
        item.employee_code,
        item.company_name,
        item.location_name,
        item.created_at ? new Date(item.created_at).toLocaleDateString() : "—",
        item.in_time || "—",
        item.out_time || "—",
        item.status,
      ]),
    });
    doc.save("ManualEntryReport.pdf");
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
              Mannual Entry Report
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
                  value={formData.company_id}
                  displayValue={formData.company}
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
                  label="Location"
                  name="location"
                  value={formData.location_id}
                  displayValue={formData.location}
                  options={locationOptions}
                  labelKey="name"
                  valueKey="id"
                  labelName="location"
                  formData={formData}
                  setFormData={(updated) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: updated.location,
                      location_id: updated.location_id ?? updated.location,
                    }))
                  }
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              <div>
                <SearchDropdown
                  label="Designation"
                  name="designation"
                  value={formData.designation_id}
                  displayValue={formData.designation}
                  options={designationOptions}
                  labelKey="name"
                  valueKey="id"
                  labelName="designation"
                  formData={formData}
                  setFormData={(updated) =>
                    setFormData((prev) => ({
                      ...prev,
                      designation: updated.designation,
                      designation_id:
                        updated.designation_id ?? updated.designation,
                    }))
                  }
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>From Date</label>
                <input
                  name="fromPunchDate"
                  value={formData.fromPunchDate}
                  onClick={() => setShowPunchDateSpinner(true)}
                  readOnly
                  placeholder="dd/mm/yyyy"
                  className={inputStyle}
                />
                {showPunchDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.fromPunchDate}
                    onChange={(date) =>
                      setFormData({ ...formData, fromPunchDate: date })
                    }
                    onClose={() => setShowPunchDateSpinner(false)}
                  />
                )}
              </div>

              <div>
                <label className={labelStyle}>To Date</label>
                <input
                  name="toPunchDate"
                  value={formData.toPunchDate}
                  onClick={() => setShowToPunchDateSpinner(true)}
                  readOnly
                  placeholder="dd/mm/yyyy"
                  className={inputStyle}
                />
                {showToPunchDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.toPunchDate}
                    onChange={(date) =>
                      setFormData({ ...formData, toPunchDate: date })
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
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-2.5 rounded-lg shadow-md xl:text-base transition-all duration-200"
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
                  Mannual Entry Summary View
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
                    placeholder="Search..."
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
                      Sl.No
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Employee
                    </th>
                    <th className="px-4 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                      In Time
                    </th>
                    <th className="px-4 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                      Out Time
                    </th>
                    <th className="px-4 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentmannualEntryReport.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-12 text-center text-gray-500 font-medium xl:text-lg"
                      >
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    currentmannualEntryReport.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/60"
                      >
                        <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-900">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-gray-900">
                          {item.employee_name}
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell text-gray-600">
                          {item.in_time || "—"}
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell text-gray-600">
                          {item.out_time || "—"}
                        </td>
                        <td className="px-4 py-3 text-center hidden xl:table-cell text-gray-600">
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString()
                            : "—"}
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
                  {filteredmannualEntryReport.length === 0
                    ? "0"
                    : startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-gray-900">
                  {Math.min(endIndex, filteredmannualEntryReport.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-900">
                  {filteredmannualEntryReport.length}
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
              className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-[1000px] max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in duration-200"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
                <h2 className="text-xl  font-bold text-gray-900">
                  {selectedItem.employee_name} Details
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
                  <p className={labelStyle}>Employee Name</p>
                  <p className={inputStyle}>{selectedItem.employee_name}</p>
                </div>
                <div>
                  <p className={labelStyle}>Employee ID</p>
                  <p className={inputStyle}>{selectedItem.employee_code}</p>
                </div>
                <div>
                  <p className={labelStyle}>Company</p>
                  <p className={inputStyle}>{selectedItem.company_name}</p>
                </div>
                <div>
                  <p className={labelStyle}>Location</p>
                  <p className={inputStyle}>{selectedItem.location_name}</p>
                </div>
                <div>
                  <p className={labelStyle}>In Time</p>
                  <p className={inputStyle}>{selectedItem.in_time || "—"}</p>
                </div>
                <div>
                  <p className={labelStyle}>Out Time</p>
                  <p className={inputStyle}>{selectedItem.out_time || "—"}</p>
                </div>
                <div>
                  <p className={labelStyle}>Date</p>
                  <p className={inputStyle}>
                    {selectedItem.created_at
                      ? new Date(selectedItem.created_at).toLocaleDateString()
                      : "—"}
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
                  <p className={labelStyle}>Remarks</p>
                  <p className={`${inputStyle} min-h-[80px]`}>
                    {selectedItem.remarks || "No remarks"}
                  </p>
                </div>
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

export default MannualEntryReport;

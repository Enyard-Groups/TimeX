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

const MannualEntryStatus = () => {
  const [openModal, setOpenModal] = useState(false);
  const [manualReport, setManualReport] = useState([]);
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
    status: "",
    location: "",
    department: "",
    employeeCategory: "",
    fromPunchDate: "",
    toPunchDate: "",
  });

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 lg:text-lg 3xl:text-xl rounded-lg focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm";

  const labelStyle =
    "text-sm lg:text-base 3xl:text-xl font-semibold text-gray-700 mb-2 block";

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [companies, employees] = await Promise.all([
          axios.get(`${API_BASE}/companies`),
          axios.get(`${API_BASE}/employees`),
        ]);
        setCompanyOptions(companies.data);
        setEmployeeOptions(employees.data);
      } catch (err) {
        console.error("Failed to fetch dropdown options:", err);
      }
    };
    fetchOptions();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    const params = {
      company_id: formData.company_id,
      employee_id: formData.employee_id,
      status: formData.status === "All" ? "" : formData.status,
      location: formData.location,
      from_date: formData.fromPunchDate,
      to_date: formData.toPunchDate,
    };

    try {
      const res = await axios.get(`${API_BASE}/requests/manual/report`, { params });
      setManualReport(res.data);
      setCurrentPage(1);
      setOpenModal(true);
    } catch (err) {
      console.error("Failed to generate report:", err);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const filteredReport = manualReport.filter((emp) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (emp.employee_name || "").toLowerCase().includes(searchLower) ||
      (emp.company_name || "").toLowerCase().includes(searchLower) ||
      (emp.employee_code || "").toLowerCase().includes(searchLower);

    return matchesSearch;
  });

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentData = filteredReport.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredReport.length / entriesPerPage)
  );

  const selectedItem = manualReport.find((item) => item.id === selectedId);

  const handleCopy = () => {
    const header = [
      "Sl.No",
      "Employee",
      "Company",
      "In Time",
      "Out Time",
      "Date",
      "Status",
    ].join("\t");
    const rows = filteredReport
      .map((item, i) =>
        [
          i + 1,
          item.employee_name,
          item.company_name,
          item.in_time || "—",
          item.out_time || "—",
          item.created_at ? new Date(item.created_at).toLocaleDateString() : "—",
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
      "In Time": item.in_time || "—",
      "Out Time": item.out_time || "—",
      Date: item.created_at
        ? new Date(item.created_at).toLocaleDateString()
        : "—",
      Status: item.status,
      Reason: item.reason,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ManualEntryStatus");
    XLSX.writeFile(wb, "ManualEntryStatus.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    doc.text("Mannual Entry Status", 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [
        ["Sl.No", "Employee", "Company", "In Time", "Out Time", "Date", "Status"],
      ],
      body: filteredReport.map((item, i) => [
        i + 1,
        item.employee_name,
        item.company_name,
        item.in_time || "—",
        item.out_time || "—",
        item.created_at ? new Date(item.created_at).toLocaleDateString() : "—",
        item.status,
      ]),
    });
    doc.save("ManualEntryStatus.pdf");
  };

  const statusClass = (status) => {
    if (status === "Approved") return "bg-green-100 text-green-700";
    if (status === "Rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <>
      <div className="mb-6 max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center h-[30px] gap-2 text-base lg:text-xl 3xl:text-4xl font-semibold text-gray-900 ">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Reports</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Manual Reports</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div
              onClick={() => setOpenModal(false)}
              className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
            >
              Manual Entry Status
            </div>
          </h1>
        </div>

        {/* Filter Section */}
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
                  label="Employee Category"
                  name="employeeCategory"
                  value={formData.employeeCategory}
                  options={[
                    "All Category",
                    "Full Time Equivalent",
                    "Contingent",
                    "Freelance",
                    "Contract",
                    "Permanent",
                  ]}
                  formData={formData}
                  setFormData={setFormData}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              <div>
                <SearchDropdown
                  label="Location"
                  name="location"
                  value={formData.location}
                  options={["Head Office", "Location 2"]}
                  formData={formData}
                  setFormData={setFormData}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              <div>
                <SearchDropdown
                  label="Designation"
                  name="department"
                  value={formData.department}
                  options={[
                    "Regional Sales Support Manager",
                    "Operations Support Officer",
                    "Finance Assistant",
                    "Trade Finance Specialist",
                    "Banking Operations Officer",
                    "Sales Support Officer",
                    "Project Manager",
                    "Administrative Assistant",
                    "Sales Officer",
                    "Banking Officer",
                    "Sales Manager",
                    "Senior Banking Officer",
                    "Client Service Manager",
                    "Senior Director – Banking Operations",
                    "Relationship Officer",
                    "Accountant",
                    "Director – Sales Excellence",
                    "Service Sales Support Officer",
                    "HR Manager",
                    "Sales & Logistics Officer",
                    "Operation Officer",
                  ]}
                  formData={formData}
                  setFormData={setFormData}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              <div>
                <SearchDropdown
                  label="Missed"
                  name="status"
                  value={formData.status}
                  options={["All", "Pending", "Approved", "Rejected"]}
                  formData={formData}
                  setFormData={setFormData}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>From Punch Date</label>
                <input
                  name="fromPunchDate"
                  readOnly
                  value={formData.fromPunchDate}
                  onClick={() => {
                    setShowFromDateSpinner(true);
                  }}
                  placeholder="yyyy-mm-dd"
                  className={inputStyle}
                />

                {showFromDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.fromPunchDate}
                    onChange={(date) =>
                      setFormData({ ...formData, fromPunchDate: date })
                    }
                    onClose={() => setShowFromDateSpinner(false)}
                  />
                )}
              </div>

              <div>
                <label className={labelStyle}>To Punch Date</label>
                <input
                  name="toPunchDate"
                  readOnly
                  value={formData.toPunchDate}
                  onClick={() => {
                    setShowToDateSpinner(true);
                  }}
                  placeholder="yyyy-mm-dd"
                  className={inputStyle}
                />

                {showToDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.toPunchDate}
                    onChange={(date) =>
                      setFormData({ ...formData, toPunchDate: date })
                    }
                    onClose={() => setShowToDateSpinner(false)}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleGenerate}
                disabled={loading}
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
                  Manual Entry Status
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
                    className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 lg:text-base placeholder-blue-500 3xl:text-lg rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500/60 transition-all"
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
                    <th className="px-4 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                      SL.NO
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Employee Name
                    </th>
                    <th className="px-4 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                      In Time
                    </th>
                    <th className="px-4 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                      Out Time
                    </th>
                    <th className="px-4 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                      Created Date
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
                  {currentData.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="p-12 text-center text-gray-500 font-medium"
                      >
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item, index) => (
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
                          {item.in_time
                            ? new Date(item.in_time).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell text-gray-600">
                          {item.out_time
                            ? new Date(item.out_time).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-center hidden xl:table-cell text-gray-600">
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs lg:text-sm font-semibold ${item.status === "Approved" ? "bg-green-100 text-green-700" : item.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
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
                  {Math.min(endIndex, filteredReport.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-900">
                  {filteredReport.length}
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
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div
              className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in duration-200"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
                <h2 className="text-xl lg:text-2xl 3xl:text-4xl font-bold text-gray-900">
                  {selectedItem.employee_name} Entry Details
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
                {[
                  { label: "Employee Name", value: selectedItem.employee_name },
                  {
                    label: "In Time",
                    value: selectedItem.in_time
                      ? new Date(selectedItem.in_time).toLocaleString()
                      : "No Checkin",
                  },
                  {
                    label: "Out Time",
                    value: selectedItem.out_time
                      ? new Date(selectedItem.out_time).toLocaleString()
                      : "No Checkout",
                  },
                  {
                    label: "Created Date",
                    value: selectedItem.created_at
                      ? new Date(selectedItem.created_at).toLocaleDateString()
                      : "Missed Entry",
                  },
                  { label: "Remarks", value: selectedItem.remarks || "-" },
                  {
                    label: "Status",
                    value: selectedItem.status,
                    isStatus: true,
                  },
                ].map((field) => (
                  <div key={field.label} className="space-y-1">
                    <p className="text-xs lg:text-sm 3xl:text-lg font-bold text-gray-700">
                      {field.label}
                    </p>
                    {field.isStatus ? (
                      <p
                        className={`w-fit px-3 py-1 rounded-full text-sm lg:text-lg 3xl:text-xl font-semibold border ${field.value === "Approved" ? "bg-green-100 text-green-700 border-green-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"}`}
                      >
                        {field.value}
                      </p>
                    ) : (
                      <p className="bg-white border border-gray-200 p-3 rounded-xl text-gray-800 font-medium lg:text-lg 3xl:text-2xl shadow-sm">
                        {field.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MannualEntryStatus;

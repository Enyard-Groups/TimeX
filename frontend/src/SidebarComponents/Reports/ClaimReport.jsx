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
    "w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 text-lg py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [companiesRes, employeesRes] = await Promise.all([
          axios.get(`${API_BASE}/companies`),
          axios.get(`${API_BASE}/employee`),
        ]);
        setCompanyOptions(companiesRes.data);
        setEmployeeOptions(employeesRes.data);
      } catch (err) {
        console.error("Failed to load dropdown options:", err);
        toast.error("Failed to load filter options");
      }
    };
    fetchDropdowns();
  }, []);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (formData.company_id) params.company_id = formData.company_id;
      if (formData.employee_id) params.employee_id = formData.employee_id;
      if (formData.fromdateinform) params.from_date = formData.fromdateinform;
      if (formData.todateinform) params.to_date = formData.todateinform;

      const res = await axios.get(`${API_BASE}/requests/claim/report`, { params });
      setClaimReport(res.data);
      setCurrentPage(1);
      setOpenModal(true);
    } catch (err) {
      console.error("Failed to generate report:", err);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const filteredReport = claimReport.filter(
    (x) =>
      (x.employee_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (x.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (x.employee_code || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentData = filteredReport.slice(startIndex, endIndex);
  const totalPages = Math.max(1, Math.ceil(filteredReport.length / entriesPerPage));

  const selectedItem = claimReport.find((item) => item.id === selectedId);

  const handleCopy = () => {
    const header = ["Sl.No", "Employee", "Company", "Claim Date", "Category", "Amount", "Purpose", "Status"].join("\t");
    const rows = filteredReport
      .map((item, i) =>
        [
          i + 1,
          item.employee_name,
          item.company_name,
          item.date ? new Date(item.date).toLocaleDateString() : "—",
          item.claim_category,
          item.amount,
          item.purpose,
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
      "Claim Date": item.date ? new Date(item.date).toLocaleDateString() : "—",
      Category: item.claim_category,
      Amount: item.amount,
      Purpose: item.purpose,
      Status: item.status,
      Remarks: item.remarks || "—",
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
      head: [["Sl.No", "Employee", "Company", "Claim Date", "Category", "Amount", "Status"]],
      body: filteredReport.map((item, i) => [
        i + 1,
        item.employee_name,
        item.company_name,
        item.date ? new Date(item.date).toLocaleDateString() : "—",
        item.claim_category,
        item.amount,
        item.status,
      ]),
    });
    doc.save("ClaimReport.pdf");
  };

  const statusClass = (status) => {
    if (status === "Approved") return "bg-green-100 text-green-700";
    if (status === "Rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <>
      <div className="mb-6">
        {/* Header */}
        <div className="sm:flex sm:justify-between">
          <h1 className="flex items-center gap-2 text-[17px] font-semibold flex-wrap ml-10 lg:ml-0 mb-4 lg:mb-0">
            <FaAngleRight />
            Reports
            <FaAngleRight />
            Claim Report
          </h1>
        </div>

        <div
          className="flex items-center justify-center p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-white rounded-xl shadow-sm w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6"
            style={{ scrollbarWidth: "none" }}
          >
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
                  onClick={() => setShowFromDateSpinner(true)}
                  placeholder="dd/mm/yyyy"
                  readOnly
                  className={`${inputStyle} cursor-pointer`}
                />
                {showFromDateSpinner && (
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
                  onClick={() => setShowToDateSpinner(true)}
                  placeholder="dd/mm/yyyy"
                  readOnly
                  className={`${inputStyle} cursor-pointer`}
                />
                {showToDateSpinner && (
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
                onClick={handleGenerateReport}
                disabled={loading}
                className="bg-[oklch(0.645_0.246_16.439)] text-white px-8 py-2 rounded-md disabled:opacity-60"
              >
                {loading ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>
        </div>

        {openModal && (
          <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.8_0.001_106.424)] p-6 ">
            <div className="flex justify-end">
              <RxCross2
                onClick={() => setOpenModal(false)}
                className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer"
              />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
              <div>
                <label className="mr-2 text-md">Show</label>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded-full px-1 border-[oklch(0.645_0.246_16.439)]"
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
                  <button onClick={handleCopy} className="text-xl px-3 py-1 cursor-pointer text-gray-800">
                    <GoCopy />
                  </button>
                  <button onClick={handleExcel} className="text-xl px-3 py-1 cursor-pointer text-green-700">
                    <FaFileExcel />
                  </button>
                  <button onClick={handlePDF} className="text-xl px-3 py-1 cursor-pointer text-red-600">
                    <FaFilePdf />
                  </button>
                </div>
              </div>
            </div>

            <div
              className="overflow-x-auto min-h-[250px]"
              style={{ scrollbarWidth: "none" }}
            >
              <h1 className="text-[oklch(0.577_0.245_27.325)] text-xl mb-4 text-center">
                Claim Report
              </h1>
              <table className="w-full text-lg border-collapse">
                <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
                  <tr>
                    <th className="p-2 font-semibold">Name</th>
                    <th className="p-2 font-semibold whitespace-nowrap hidden md:table-cell">Claim Date</th>
                    <th className="p-2 font-semibold whitespace-nowrap hidden md:table-cell">Category</th>
                    <th className="p-2 font-semibold whitespace-nowrap hidden md:table-cell">Amount</th>
                    <th className="p-2 font-semibold whitespace-nowrap hidden lg:table-cell">Purpose</th>
                    <th className="p-2 font-semibold hidden md:table-cell">Status</th>
                    <th className="p-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="sm:text-center p-10">No Data Available</td>
                    </tr>
                  ) : (
                    currentData.map((item) => (
                      <tr
                        key={item.id}
                        className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                      >
                        <td className="p-2 whitespace-nowrap">{item.employee_name}</td>
                        <td className="p-2 hidden md:table-cell">
                          {item.date ? new Date(item.date).toLocaleDateString() : "—"}
                        </td>
                        <td className="p-2 hidden md:table-cell">{item.claim_category}</td>
                        <td className="p-2 hidden md:table-cell">{item.amount}</td>
                        <td className="p-2 hidden lg:table-cell">{item.purpose}</td>
                        <td className="p-2 hidden md:table-cell">
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${statusClass(item.status)}`}>
                            {item.status || "Pending"}
                          </span>
                        </td>
                        <td className="p-2 ">
                          <div className="flex gap-2 justify-center">
                            <FaEye
                              onClick={() => {
                                setSelectedId(item.id);
                                setModalOpenSelectedItem(true);
                              }}
                              className="text-blue-500 cursor-pointer text-lg mt-2 mr-2"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center md:justify-between items-center mt-4 text-sm flex-wrap gap-6">
              <span>
                Showing {filteredReport.length === 0 ? "0" : startIndex + 1} to{" "}
                {Math.min(endIndex, filteredReport.length)} of {filteredReport.length} entries
              </span>

              <div className="flex flex-row space-x-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
                >
                  First
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-3 bg-gray-200 rounded-full disabled:opacity-50"
                >
                  <GrPrevious />
                </button>
                <div className="p-3 px-4 shadow rounded-full">{currentPage}</div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-3 bg-gray-200 rounded-full disabled:opacity-50"
                >
                  <GrNext />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}

        {modalOpenSelectedItem && selectedItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{selectedItem.employee_name} Details</h2>
                <RxCross2
                  onClick={() => {
                    setModalOpenSelectedItem(false);
                    setSelectedId(null);
                  }}
                  className="cursor-pointer text-xl text-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-lg">
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
                  <p className={labelStyle}>Claim Date</p>
                  <p className={inputStyle}>
                    {selectedItem.date ? new Date(selectedItem.date).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div>
                  <p className={labelStyle}>Category</p>
                  <p className={inputStyle}>{selectedItem.claim_category}</p>
                </div>
                <div>
                  <p className={labelStyle}>Amount</p>
                  <p className={inputStyle}>{selectedItem.amount}</p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <p className={labelStyle}>Purpose</p>
                  <p className={inputStyle}>{selectedItem.purpose}</p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <p className={labelStyle}>Remarks</p>
                  <p className={inputStyle}>{selectedItem.remarks || "—"}</p>
                </div>
                {selectedItem.rejectedreason && (
                  <div className="col-span-1 sm:col-span-2">
                    <p className={labelStyle}>Rejected Reason</p>
                    <p className={`${inputStyle} text-red-600`}>{selectedItem.rejectedreason}</p>
                  </div>
                )}
                <div>
                  <p className={labelStyle}>Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass(selectedItem.status)}`}>
                    {selectedItem.status || "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ClaimReport;

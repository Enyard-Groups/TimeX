import React, { useState, useEffect } from "react";
import axios from "axios";
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

const API_BASE = "http://localhost:3000/api";

const emptyForm = {
  employee_id: "",
  employee_name: "",
  claim_category: "",
  date: "",
  amount: "",
  purpose: "",
  remarks: "",
  status: "Pending",
};

const ClaimRequest = () => {
  const [mode, setMode] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [claims, setClaims] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dateSpinner, setDateSpinner] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

  const labelStyle =
    "text-sm xl:text-base focus:outline-none font-semibold text-slate-600 mb-1.5 block";

  const fetchData = async () => {
    try {
      setLoading(true);
      const [claimsRes, empRes, catRes] = await Promise.all([
        axios.get(`${API_BASE}/requests/claim`),
        axios.get(`${API_BASE}/employee`),
        axios.get(`${API_BASE}/master/claim-categories`),
      ]);
      const formattedClaims = (claimsRes.data || []).map((c) => ({
        ...c,
        date: formatDate(c.date),
      }));
      setClaims(formattedClaims);
      setEmployeeOptions(empRes.data);
      setCategoryOptions(catRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes("T")) {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const { employee_id, claim_category, date, amount, purpose } = formData;

    if (!employee_id || !claim_category || !date || !amount || !purpose) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      if (editId) {
        const res = await axios.put(
          `${API_BASE}/requests/claim/${editId}`,
          formData,
        );
        setClaims((prev) =>
          prev.map((item) =>
            item.id === editId
              ? {
                  ...item,
                  ...res.data,
                  date: formatDate(res.data.date || formData.date),
                  employee_name: employeeOptions.find(
                    (e) => e.company_enrollment_id === employee_id,
                  )?.full_name,
                }
              : item,
          ),
        );
        toast.success("Updated Successfully");
      } else {
        const res = await axios.post(`${API_BASE}/requests/claim`, formData);
        setClaims((prev) => [
          {
            ...res.data,
            date: formatDate(res.data.date || formData.date),
            employee_name: employeeOptions.find(
              (e) => e.company_enrollment_id === employee_id,
            )?.full_name,
          },
          ...prev,
        ]);
        toast.success("Submitted Successfully");
      }

      setOpenModal(false);
      setEditId(null);
      setFormData(emptyForm);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        await axios.delete(`${API_BASE}/requests/claim/${id}`);
        setClaims((prev) => prev.filter((item) => item.id !== id));
        toast.success("Deleted Successfully");
      } catch (error) {
        toast.error(error?.response?.data?.error || "Delete failed");
      }
    }
  };

  const filteredClaims = claims.filter(
    (x) =>
      (x.employee_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (x.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (x.claim_category || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentClaims = filteredClaims.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredClaims.length / entriesPerPage),
  );

  const handleCopy = () => {
    const header = [
      "Employee",
      "Company",
      "Category",
      "Date",
      "Amount",
      "Purpose",
      "Created Date",
    ].join("\t");
    const rows = filteredClaims
      .map((item) =>
        [
          item.employee_name,
          item.company_name || "N/A",
          item.claim_category,
          item.date,
          item.amount,
          item.purpose,
          new Date(item.created_at).toLocaleDateString(),
        ].join("\t"),
      )
      .join("\n");

    const text = `${header}\n${rows}`;
    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredClaims.map((item) => ({
      Employee: item.employee_name,
      Company: item.company_name || "N/A",
      Category: item.claim_category,
      Date: item.date,
      Amount: item.amount,
      Purpose: item.purpose,
      CreatedDate: new Date(item.created_at).toLocaleDateString(),
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
      "Company",
      "Category",
      "Date",
      "Amount",
      "Purpose",
      "Created Date",
    ];
    const tableRows = filteredClaims.map((item) => [
      item.employee_name,
      item.company_name || "N/A",
      item.claim_category,
      item.date,
      item.amount,
      item.purpose,
      new Date(item.created_at).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("ClaimRequestData.pdf");
  };

  return (
    <div className="mb-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Requests</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div
            onClick={() => setOpenModal(false)}
            className="cursor-pointer text-blue-600 hover:text-blue-700"
          >
            Claim Request
          </div>
        </h1>

        {!openModal && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setMode("");
                setEditId(null);
                setFormData(emptyForm);
                setOpenModal(true);
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white xl:text-lg font-semibold px-6 py-2 rounded-lg border border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
            >
              + Add New
            </button>
          </div>
        )}
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
                className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/60 transition-all"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm xl:text-base font-medium text-gray-600">
                entries
              </span>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-center">
              <input
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 xl:text-base  rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 hover:text-blue-700 p-2.5 rounded-lg transition-all"
                  title="Copy to clipboard"
                >
                  <GoCopy className="text-lg xl:text-xl" />
                </button>
                <button
                  onClick={handleExcel}
                  className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 hover:text-green-700 p-2.5 rounded-lg transition-all"
                  title="Export to Excel"
                >
                  <FaFileExcel className="text-lg xl:text-xl" />
                </button>
                <button
                  onClick={handlePDF}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 p-2.5 rounded-lg transition-all"
                  title="Export to PDF"
                >
                  <FaFilePdf className="text-lg xl:text-xl" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div
          className="overflow-x-auto min-h-[350px]"
          style={{ scrollbarWidth: "none" }}
        >
          <table className="w-full text-[17px] text-gray-900">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50">
                <th className="px-6 py-3 text-center font-semibold text-gray-700">
                  Employee
                </th>
                <th className="px-6 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-6 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-6 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                  Amount
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : currentClaims.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-4xl opacity-40">💰</div>
                      <p className="text-gray-500 text-base font-medium">
                        No Claims Requests
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentClaims.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 even:bg-blue-50/60"
                  >
                    <td className="px-6 py-2 text-center">
                      {item.employee_name}
                    </td>
                    <td className="px-6 py-2 text-center hidden sm:table-cell">
                      {item.claim_category}
                    </td>
                    <td className="px-6 py-2 text-center hidden lg:table-cell">
                      {item.date}
                    </td>
                    <td className="px-6 py-2 text-center hidden xl:table-cell font-medium">
                      ₹{item.amount}
                    </td>
                    <td className="px-6 py-2 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs xl:text-sm font-bold ${
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
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setFormData(item);
                            setMode("view");
                            setOpenModal(true);
                          }}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1.5 rounded-lg transition-all"
                          title="View"
                        >
                          <FaEye className="text-lg" />
                        </button>
                        {item.status === "Pending" && (
                          <>
                            <button
                              onClick={() => {
                                setEditId(item.id);
                                setFormData(item);
                                setMode("edit");
                                setOpenModal(true);
                              }}
                              className="text-green-500 hover:text-green-700 hover:bg-green-100 p-1.5 rounded-lg transition-all"
                              title="Edit"
                            >
                              <FaPen className="text-lg" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-lg transition-all"
                              title="Delete"
                            >
                              <MdDeleteForever className="text-xl" />
                            </button>
                          </>
                        )}
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
          <span className="text-sm xl:text-base text-gray-600">
            Showing{" "}
            <span className="text-gray-900 font-semibold">
              {filteredClaims.length === 0 ? "0" : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="text-gray-900 font-semibold">
              {Math.min(endIndex, filteredClaims.length)}
            </span>{" "}
            of{" "}
            <span className="text-gray-900 font-semibold">
              {filteredClaims.length}
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

      {/* Modal */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-[1000px] max-h-[90vh] overflow-y-auto p-8"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
              <h2 className="text-xl font-bold text-gray-900">
                {mode === "view"
                  ? "View Claim Request"
                  : editId
                    ? "Edit Claim Request"
                    : "Add New Claim Request"}
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SearchDropdown
                label={
                  <>
                    Employee <span className="text-red-500">*</span>
                  </>
                }
                name="employee_id"
                value={formData.employee_id}
                displayValue={formData.employee_name || ""}
                options={employeeOptions}
                labelKey="full_name"
                valueKey="company_enrollment_id"
                labelName="employee_name"
                formData={formData}
                setFormData={setFormData}
                disabled={mode === "view"}
                inputStyle={inputStyle}
                labelStyle={labelStyle}
              />

              <SearchDropdown
                label={
                  <>
                    Claim Category <span className="text-red-500">*</span>
                  </>
                }
                name="claim_category"
                value={formData.claim_category}
                options={categoryOptions}
                labelKey="name"
                valueKey="name"
                formData={formData}
                setFormData={setFormData}
                disabled={mode === "view"}
                inputStyle={inputStyle}
                labelStyle={labelStyle}
              />

              <div>
                <label className={labelStyle}>
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  name="date"
                  value={formData.date}
                  onClick={() => mode !== "view" && setDateSpinner(true)}
                  disabled={mode === "view"}
                  readOnly
                  placeholder="dd/mm/yyyy"
                  className={inputStyle}
                />
                {dateSpinner && (
                  <SpinnerDatePicker
                    value={formData.date}
                    onChange={(date) => setFormData({ ...formData, date })}
                    onClose={() => setDateSpinner(false)}
                  />
                )}
              </div>

              <div>
                <label className={labelStyle}>
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  className={inputStyle}
                  placeholder="Enter amount"
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelStyle}>
                  Purpose <span className="text-red-500">*</span>
                </label>
                <input
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  className={inputStyle}
                  placeholder="Enter purpose of claim"
                />
              </div>

              <div className="md:col-span-3">
                <label className={labelStyle}>
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  className={inputStyle}
                  placeholder="Enter optional remarks..."
                />
              </div>
            </div>

            {mode !== "view" && (
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-blue-100/30">
                <button
                  onClick={() => setOpenModal(false)}
                  className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimRequest;

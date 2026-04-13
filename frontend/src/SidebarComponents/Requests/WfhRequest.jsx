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
  start_date: "",
  end_date: "",
  request_date: "",
  number_of_days: "",
  reason: "",
  status: "Pending",
};

const WfhRequest = () => {
  const [mode, setMode] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [wfh, setWfh] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [fromDateSpinner, setFromDateSpinner] = useState(false);
  const [toDateSpinner, setToDateSpinner] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wfhRes, empRes] = await Promise.all([
        axios.get(`${API_BASE}/requests/wfh`),
        axios.get(`${API_BASE}/employee`),
      ]);
      setWfh(wfhRes.data);
      setEmployeeOptions(empRes.data);
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

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    if (dateStr.includes("-")) {
      const [y, m, d] = dateStr.split("-");
      return new Date(y, m - 1, d);
    }
    if (dateStr.includes("/")) {
      const [d, m, y] = dateStr.split("/");
      return new Date(y, m - 1, d);
    }
    return new Date(dateStr);
  };

  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const from = parseDate(formData.start_date);
      const to = parseDate(formData.end_date);

      if (to && from && !isNaN(from.getTime()) && !isNaN(to.getTime())) {
        if (to >= from) {
          const diffTime = Math.abs(to - from);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

          if (formData.number_of_days !== diffDays.toString()) {
            setFormData((prev) => ({
              ...prev,
              number_of_days: diffDays.toString(),
            }));
          }
        } else {
          if (formData.number_of_days !== "") {
            setFormData((prev) => ({
              ...prev,
              number_of_days: "",
            }));
          }
        }
      }
    }
  }, [formData.start_date, formData.end_date, formData.number_of_days]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const { employee_id, start_date, end_date, reason } = formData;

    if (!employee_id || !start_date || !end_date || !reason) {
      toast.error("Please fill required fields");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const from = parseDate(start_date);
    const to = parseDate(end_date);

    if (from < today && !editId) {
      toast.error("First Date of Absence cannot be in the past");
      return;
    }

    if (to < from) {
      toast.error("Last Date must be after First Date");
      return;
    }

    try {
      if (editId) {
        const res = await axios.put(
          `${API_BASE}/requests/wfh/${editId}`,
          formData,
        );
        setWfh((prev) =>
          prev.map((item) =>
            item.id === editId
              ? {
                  ...item,
                  ...res.data,
                  employee_name: employeeOptions.find(
                    (e) => e.company_enrollment_id === employee_id,
                  )?.full_name,
                }
              : item,
          ),
        );
        toast.success("Updated Successfully");
      } else {
        const res = await axios.post(`${API_BASE}/requests/wfh`, formData);
        setWfh((prev) => [
          {
            ...res.data,
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
        await axios.delete(`${API_BASE}/requests/wfh/${id}`);
        setWfh((prev) => prev.filter((item) => item.id !== id));
        toast.success("Deleted Successfully");
      } catch (error) {
        toast.error(error?.response?.data?.error || "Delete failed");
      }
    }
  };

  const filteredWfh = wfh.filter(
    (x) =>
      (x.employee_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (x.reason || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentWfh = filteredWfh.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredWfh.length / entriesPerPage),
  );

  const handleCopy = () => {
    const header = [
      "Employee",
      "From Date",
      "To Date",
      "Request Date",
      "Number of Days",
      "Reason",
      "Created Date",
    ].join("\t");
    const rows = filteredWfh
      .map((item) =>
        [
          item.employee_name,
          item.start_date,
          item.end_date,
          item.request_date,  
          item.number_of_days,
          item.reason,
          new Date(item.created_at).toLocaleDateString(),
        ].join("\t"),
      )
      .join("\n");

    const text = `${header}\n${rows}`;
    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredWfh.map((item) => ({
      Employee: item.employee_name,
      FromDate: item.start_date,
      ToDate: item.end_date,
      RequestDate: item.request_date,
      NumberOfDays: item.number_of_days,
      Reason: item.reason,
      CreatedDate: new Date(item.created_at).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "WfhRequest");
    XLSX.writeFile(workbook, "WfhRequestData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    const tableColumn = [
      "Employee",
      "From Date",
      "To Date",
      "Request Date",
      "Number of Days",
      "Reason",
      "Created Date",
    ];
    const tableRows = filteredWfh.map((item) => [
      item.employee_name,
      item.start_date,
      item.end_date,
      item.request_date,
      item.number_of_days,
      item.reason,  
      new Date(item.created_at).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("WfhRequestData.pdf");
  };

  const inputStyle =
    "w-full bg-white text-sm xl:text-base border border-gray-200 text-gray-900 px-3 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm";
  const labelStyle =
    "text-sm xl:text-base font-semibold text-gray-700 mb-2 block";

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
            WFH Request
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
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg border border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
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
                className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 transition-all"
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
                placeholder="Search WFH requests..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 rounded-lg text-sm xl:text-base placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
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
        <div
          className="overflow-x-auto min-h-[350px]"
          style={{ scrollbarWidth: "none" }}
        >
          <table className="w-full text-[17px] text-gray-700">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50">
                <th className="px-6 py-3 text-center font-semibold text-gray-700">
                  Employee
                </th>
                <th className="px-6 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                  From Date
                </th>
                <th className="px-6 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                  To Date
                </th>
                <th className="px-6 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                  Days
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
              ) : currentWfh.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-4xl opacity-40">🏠</div>
                      <p className="text-gray-500 text-base font-medium">
                        No WFH Requests
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentWfh.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 even:bg-blue-50/60"
                  >
                    <td className="px-6 py-2 text-center">
                      {item.employee_name}
                    </td>
                    <td className="px-6 py-2 text-center hidden lg:table-cell whitespace-nowrap">
                      {item.start_date}
                    </td>
                    <td className="px-6 py-2 text-center hidden lg:table-cell whitespace-nowrap">
                      {item.end_date}
                    </td>
                    <td className="px-6 py-2 text-center hidden xl:table-cell font-medium">
                      {item.number_of_days}
                    </td>
                    <td className="px-6 py-2 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
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

        {/* Pagination Section */}
        <div className="p-6 border-t border-blue-100/30 flex flex-col sm:flex-row justify-between items-center gap-6">
          <span className="text-sm xl:text-base text-gray-600">
            Showing{" "}
            <span className="text-gray-900 font-semibold">
              {filteredWfh.length === 0 ? "0" : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="text-gray-900 font-semibold">
              {Math.min(endIndex, filteredWfh.length)}
            </span>{" "}
            of{" "}
            <span className="text-gray-900 font-semibold">
              {filteredWfh.length}
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

      {/* Modal */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
              <h2 className="text-xl font-bold text-gray-900">
                {mode === "view"
                  ? "View WFH Request"
                  : editId
                    ? "Edit WFH Request"
                    : "Add New WFH Request"}
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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

              <div>
                <label className={labelStyle}>
                  First Date of Absence <span className="text-red-500">*</span>
                </label>
                <input
                  name="start_date"
                  value={formData.start_date}
                  onClick={() => mode !== "view" && setFromDateSpinner(true)}
                  disabled={mode === "view"}
                  readOnly
                  placeholder="dd/mm/yyyy"
                  className={inputStyle}
                />
                {fromDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.start_date}
                    onChange={(date) =>
                      setFormData({ ...formData, start_date: date })
                    }
                    onClose={() => setFromDateSpinner(false)}
                  />
                )}
              </div>

              <div>
                <label className={labelStyle}>
                  Last Date of Absence <span className="text-red-500">*</span>
                </label>
                <input
                  name="end_date"
                  value={formData.end_date}
                  onClick={() => mode !== "view" && setToDateSpinner(true)}
                  disabled={mode === "view"}
                  readOnly
                  placeholder="dd/mm/yyyy"
                  className={inputStyle}
                />
                {toDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.end_date}
                    onChange={(date) =>
                      setFormData({ ...formData, end_date: date })
                    }
                    onClose={() => setToDateSpinner(false)}
                  />
                )}
              </div>

              <div>
                <label className={labelStyle}>Number of Days</label>
                <input
                  name="number_of_days"
                  value={formData.number_of_days}
                  readOnly
                  className={inputStyle}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelStyle}>
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  rows="1"
                  className={inputStyle}
                  placeholder="Enter reason for WFH..."
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
                  {editId ? "Update Request" : "Submit Request"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WfhRequest;

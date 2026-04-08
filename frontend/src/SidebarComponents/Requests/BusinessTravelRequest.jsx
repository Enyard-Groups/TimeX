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
  purpose: "",
  remarks: "",
  status: "Pending",
};

const BusinessTravelRequest = () => {
  const [mode, setMode] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [travel, setTravel] = useState([]);
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
      const [travelRes, empRes] = await Promise.all([
        axios.get(`${API_BASE}/requests/travel`),
        axios.get(`${API_BASE}/employee`),
      ]);
      setTravel(travelRes.data);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split("/");
    return new Date(year, month - 1, day);
  };

  const handleSubmit = async () => {
    const { employee_id, start_date, end_date, purpose } = formData;

    if (!employee_id || !start_date || !end_date || !purpose) {
      toast.error("Please fill required fields");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const from = parseDate(start_date);
    const to = parseDate(end_date);

    if (from < today && !editId) {
      toast.error("Travel Start Date cannot be in the past");
      return;
    }

    if (to < from) {
      toast.error("Travel Return Date must be after Start Date");
      return;
    }

    try {
      if (editId) {
        const res = await axios.put(
          `${API_BASE}/requests/travel/${editId}`,
          formData,
        );
        setTravel((prev) =>
          prev.map((item) =>
            item.id === editId
              ? {
                  ...item,
                  ...res.data,
                  employee_name: employeeOptions.find(
                    (e) => e.id === employee_id,
                  )?.full_name,
                }
              : item,
          ),
        );
        toast.success("Updated Successfully");
      } else {
        const res = await axios.post(`${API_BASE}/requests/travel`, formData);
        setTravel((prev) => [
          {
            ...res.data,
            employee_name: employeeOptions.find((e) => e.id === employee_id)
              ?.full_name,
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
        await axios.delete(`${API_BASE}/requests/travel/${id}`);
        setTravel((prev) => prev.filter((item) => item.id !== id));
        toast.success("Deleted Successfully");
      } catch (error) {
        toast.error(error?.response?.data?.error || "Delete failed");
      }
    }
  };

  const filteredTravel = travel.filter(
    (x) =>
      (x.employee_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (x.purpose || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentTravel = filteredTravel.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTravel.length / entriesPerPage),
  );

  const handleCopy = () => {
    const header = [
      "Employee",
      "From Date",
      "To Date",
      "Purpose",
      "Status",
      "Created Date",
    ].join("\t");
    const rows = filteredTravel
      .map((item) =>
        [
          item.employee_name,
          item.start_date,
          item.end_date,
          item.purpose,
          item.status,
          new Date(item.created_at).toLocaleDateString(),
        ].join("\t"),
      )
      .join("\n");

    const text = `${header}\n${rows}`;
    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredTravel.map((item) => ({
      Employee: item.employee_name,
      FromDate: item.start_date,
      ToDate: item.end_date,
      Purpose: item.purpose,
      Status: item.status,
      CreatedDate: new Date(item.created_at).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TravelRequest");
    XLSX.writeFile(workbook, "TravelRequestData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    const tableColumn = [
      "Employee",
      "From Date",
      "To Date",
      "Purpose",
      "Status",
      "Created Date",
    ];
    const tableRows = filteredTravel.map((item) => [
      item.employee_name,
      item.start_date,
      item.end_date,
      item.purpose,
      item.status,
      new Date(item.created_at).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("TravelRequestData.pdf");
  };

  const inputStyle =
    "text-lg w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";
  const labelStyle = "text-lg font-medium mb-1 block";

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
            Business Travel Request
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
              <span className="text-sm xl:text-base font-medium text-gray-600">entries</span>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-center">
              <input
                placeholder="Search request..."
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

        {/* Table */}
        <div
          className="overflow-x-auto min-h-[350px]"
          style={{ scrollbarWidth: "none" }}
        >
          <table className="w-full text-[16px] xl:text-[20px]">
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
                    colSpan="5"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : currentTravel.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-4xl opacity-40">✈️</div>
                      <p className="text-gray-500 text-base font-medium">
                        No Travel Requests
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentTravel.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 even:bg-blue-50/60"
                  >
                    <td className="px-6 py-2 text-center">
                      {item.employee_name || "-"}
                    </td>

                    <td className="px-6 py-2 text-center hidden lg:table-cell">
                      {item.start_date || "-"}
                    </td>

                    <td className="px-6 py-2 text-center hidden lg:table-cell">
                      {item.end_date || "-"}
                    </td>

                    <td className="px-6 py-2 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                          item.status === "Approved"
                            ? "bg-green-100 text-green-700 border-green-300"
                            : item.status === "Rejected"
                              ? "bg-red-100 text-red-700 border-red-300"
                              : "bg-yellow-100 text-yellow-700 border-yellow-300"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {/* View */}
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

                        {/* Edit - Only for Pending status */}
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

                            {/* Delete */}
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
              {filteredTravel.length === 0 ? "0" : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="text-gray-900 font-semibold">
              {Math.min(endIndex, filteredTravel.length)}
            </span>{" "}
            of{" "}
            <span className="text-gray-900 font-semibold">
              {filteredTravel.length}
            </span>{" "}
            entries
          </span>

          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              title="First page"
            >
              First
            </button>

            <button
              disabled={currentPage === 1}
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
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
              title="Next page"
            >
              <GrNext />
            </button>

            <button
              disabled={currentPage === totalPages}
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
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Close Button */}
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {mode === "view"
                  ? "View Travel Request"
                  : mode === "edit"
                    ? "Edit Travel Request"
                    : "New Travel Request"}
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {/* Employee */}
              <div>
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
                  valueKey="id"
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle="w-full bg-white border-2 border-gray-200 text-gray-900 xl:text-base px-4 py-2.5 rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 transition-all shadow-sm font-medium"
                  labelStyle="text-sm xl:text-base font-bold text-gray-700 mb-2 block"
                />
              </div>

              {/* Travel Start Date */}
              <div>
                <label className="text-sm xl:text-base font-semibold text-gray-700 mb-2 block">
                  Travel Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="start_date"
                    value={formData.start_date}
                    onClick={() => mode !== "view" && setFromDateSpinner(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
                    readOnly
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
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
              </div>

              {/* Travel Return Date */}
              <div>
                <label className="text-sm xl:text-base font-semibold text-gray-700 mb-2 block">
                  Travel Return Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="end_date"
                    value={formData.end_date}
                    onClick={() => mode !== "view" && setToDateSpinner(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
                    readOnly
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
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
              </div>

              {/* Purpose */}
              <div className="sm:col-span-2">
                <label className="text-sm xl:text-base font-semibold text-gray-700 mb-2 block">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <input
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Enter purpose of travel"
                  className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
                />
              </div>

              {/* Remarks */}
              <div className="sm:col-span-2">
                <label className="text-sm xl:text-base font-semibold text-gray-700 mb-2 block">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Enter optional remarks..."
                  rows="4"
                  className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            {mode !== "view" && (
              <div className="flex justify-end gap-3">
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

export default BusinessTravelRequest;

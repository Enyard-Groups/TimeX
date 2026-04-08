import React, { useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";
import SpinnerTimePicker from "../../SpinnerTimePicker";
import { FaEye, FaPen } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";
import SearchDropdown from "../../SearchDropdown";
import { MdDeleteForever } from "react-icons/md";

const EmployeeCategory = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [employeeCategory, setEmployeeCategory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showWorkHoursPicker, setShowWorkHoursPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    workhours: null,
    isActive: false,
  });

  const inputStyle =
    "text-lg w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filteredemployeeCategory = employeeCategory.filter(
    (x) =>
      x.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.company.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentemployeeCategory = filteredemployeeCategory.slice(
    startIndex,
    endIndex,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredemployeeCategory.length / entriesPerPage),
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    const { name, company, workhours, isActive } = formData;

    if (!name) {
      toast.error("Please fill all required fields");
      return; // stop execution
    }

    const newemployeeCategory = {
      id: Date.now(),
      name,
      company,
      workhours,
      isActive,
    };

    if (editId) {
      setEmployeeCategory((prev) =>
        prev.map((emp) => (emp.id === editId ? { ...emp, ...formData } : emp)),
      );

      toast.success("Data updated");
    } else {
      setEmployeeCategory((prev) => [...prev, newemployeeCategory]);

      toast.success("Data Added");
    }

    setOpenModal(false);
    setEditId(null);

    setFormData({
      company: "",
      name: "",
      workhours: null,
      isActive: false,
    });
  };

  const handleCopy = () => {
    const header = [
      "SL.NO",
      "Category Name",
      "Company",
      "Work Hours",
      "Active",
    ].join("\t");

    const rows = filteredemployeeCategory
      .map((item, index) =>
        [
          index + 1,
          item.name,
          item.company,
          item.workhours ? item.workhours.toLocaleTimeString([], {}) : "",
          item.isActive ? "Y" : "N",
        ].join("\t"),
      )
      .join("\n");

    navigator.clipboard.writeText(header + "\n" + rows);
    toast.success("Table copied");
  };

  const handleExcel = () => {
    const excelData = filteredemployeeCategory.map((item, index) => ({
      "SL.NO": index + 1,
      "Category Name": item.name,
      Company: item.company,
      "Work Hours": item.workhours
        ? item.workhours.toLocaleTimeString([], {})
        : "",
      Active: item.isActive ? "Y" : "N",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Category");

    XLSX.writeFile(workbook, "EmployeeCategory.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "SL.NO",
      "Category Name",
      "Company",
      "Work Hours",
      "Active",
    ];

    const tableRows = [];

    filteredemployeeCategory.forEach((item, index) => {
      tableRows.push([
        index + 1,
        item.name,
        item.company,
        item.workhours ? item.workhours.toLocaleTimeString([], {}) : "",
        item.isActive ? "Y" : "N",
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("EmployeeCategory.pdf");
  };

  return (
    <div className="mb-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-lg font-semibold text-gray-800">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Masters</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div
            onClick={() => setOpenModal(false)}
            className="cursor-pointer text-blue-600 hover:text-blue-700"
          >
            Employee Category
          </div>
        </h1>

        {!openModal && (
          <div className="flex justify-end">
            <button
              onClick={() => (
                setMode(""),
                setEditId(null),
                setFormData({
                  company: "",
                  name: "",
                  workhours: null,
                  isActive: false,
                }),
                setOpenModal(true)
              )}
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
              <label className="text-sm font-medium text-gray-600">
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
              <span className="text-sm font-medium text-gray-600">entries</span>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-center">
              <input
                placeholder="Search employee category..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 hover:text-blue-700 p-2.5 rounded-lg transition-all"
                  title="Copy to clipboard"
                >
                  <GoCopy />
                </button>
                <button
                  onClick={handleExcel}
                  className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 hover:text-green-700 p-2.5 rounded-lg transition-all"
                  title="Export to Excel"
                >
                  <FaFileExcel />
                </button>
                <button
                  onClick={handlePDF}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 p-2.5 rounded-lg transition-all"
                  title="Export to PDF"
                >
                  <FaFilePdf />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-[16px]">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50">
                <th className="px-6 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                  SL.NO
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">
                  Category Name
                </th>
                <th className="px-6 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                  Company
                </th>
                <th className="px-6 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                  Work Hours
                </th>
                <th className="px-6 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
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
                    colSpan="9"
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : currentemployeeCategory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-4xl opacity-40">📭</div>
                      <p className="text-gray-500 text-base">
                        No Data Available
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentemployeeCategory.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 even:bg-blue-50/60"
                  >
                    <td className="px-6 py-2 text-center hidden sm:table-cell">
                      {index + 1}
                    </td>

                    <td className="px-6 py-2 text-center">
                      {item.name || "-"}
                    </td>

                    <td className="px-6 py-2 text-center hidden md:table-cell">
                      {item.company || "-"}
                    </td>

                    <td className="px-6 py-2 text-center hidden md:table-cell">
                      {item.workhours
                        ? item.workhours.toLocaleTimeString([], {
                            hour12: false,
                          })
                        : "-"}
                    </td>

                    <td className="px-4 py-3 hidden lg:table-cell text-center">
                      <div className="flex justify-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                            item.isActive
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                          }`}
                        >
                          {item.isActive ? "✓ Active" : "○ Inactive"}
                        </span>
                      </div>
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

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setFormData(item);
                            setEditId(item.id);
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
                          onClick={() =>
                            setEmployeeCategory(
                              employeeCategory.filter((v) => v.id !== item.id),
                            )
                          }
                          className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-lg transition-all"
                          title="Delete"
                        >
                          <MdDeleteForever className="text-xl" />
                        </button>
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
          <span className="text-sm text-gray-600">
            Showing{" "}
            <span className="text-gray-900 font-semibold">
              {filteredemployeeCategory.length === 0 ? "0" : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="text-gray-900 font-semibold">
              {Math.min(endIndex, filteredemployeeCategory.length)}
            </span>{" "}
            of{" "}
            <span className="text-gray-900 font-semibold">
              {filteredemployeeCategory.length}
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
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Close Button */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
              <h2 className="text-xl font-bold text-gray-900">
                {mode === "view"
                  ? "View Employee Category"
                  : mode === "edit"
                    ? "Edit Employee Category"
                    : "Add New Employee Category"}
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {/* Category Name */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Enter category name"
                  className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
                  required
                />
              </div>

              {/* Company */}
              <div>
                <SearchDropdown
                  label={
                    <>
                      Company <span className="text-red-500">*</span>
                    </>
                  }
                  name="company"
                  value={formData.company}
                  options={["Company 1", "Company 2"]}
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl placeholder-gray-400 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 transition-all shadow-sm font-medium"
                  labelStyle="text-sm font-bold text-gray-700 mb-2 block"
                />
              </div>

              {/* Work Hours */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Work Hours
                </label>
                <div
                  onClick={() => {
                    if (mode !== "view") {
                      setShowWorkHoursPicker(true);
                    }
                  }}
                  className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer flex items-center justify-center"
                >
                  {formData.workhours
                    ? formData.workhours.toLocaleTimeString([], {
                        hour12: false,
                      })
                    : "HH:MM:SS"}
                </div>
                {showWorkHoursPicker && (
                  <SpinnerTimePicker
                    value={formData.workhours}
                    onChange={(date) =>
                      setFormData({ ...formData, workhours: date })
                    }
                    onClose={() => setShowWorkHoursPicker(false)}
                  />
                )}
              </div>

              {/* Active Checkbox */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl h-fit md:mt-6">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  className="w-5 h-5 cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
                />
                <label className="text-gray-700 font-semibold cursor-pointer">
                  Active
                </label>
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

export default EmployeeCategory;

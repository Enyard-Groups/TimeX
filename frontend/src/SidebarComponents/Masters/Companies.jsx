import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";
import { FaEye, FaPen } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";
import SearchDropdown from "../SearchDropdown";
import { MdDeleteForever } from "react-icons/md";

const API_BASE = "http://localhost:3000/api";

const Companies = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [company, setCompany] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    is_active: false,
  });

  const inputStyle =
    "w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 text-lg py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filteredcompany = company.filter(
    (x) =>
      (x.name || "").toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      (x.code || "").toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentcompany = filteredcompany.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredcompany.length / entriesPerPage),
  );

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/companies`);
      setCompany(res.data);
    } catch (error) {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const { name, code, description, is_active } = formData;

    if (!name || !code) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editId) {
        const res = await axios.put(
          `${API_BASE}/companies/${editId}`,
          formData,
        );
        setCompany((prev) =>
          prev.map((emp) => (emp.id === editId ? res.data : emp)),
        );
        toast.success("Data updated");
      } else {
        const res = await axios.post(`${API_BASE}/companies`, formData);
        setCompany((prev) => [res.data, ...prev]);
        toast.success("Data Added");
      }

      setOpenModal(false);
      setEditId(null);
      setFormData({
        name: "",
        code: "",
        description: "",
        is_active: false,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/companies/${id}`);
      setCompany((prev) => prev.filter((v) => v.id !== id));
      toast.success("Company deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  const handleCopy = () => {
    const header = ["SL.NO", "Company Name", "Company Code", "Active"].join(
      "\t",
    );
    const rows = filteredcompany
      .map((item, index) =>
        [index + 1, item.name, item.code, item.is_active ? "Y" : "N"].join(
          "\t",
        ),
      )
      .join("\n");
    const text = `${header}\n${rows}`;
    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredcompany.map((item, index) => ({
      "SL.NO": index + 1,
      "Company Name": item.name,
      "Company Code": item.code,
      Active: item.is_active ? "Y" : "N",
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Company");
    XLSX.writeFile(workbook, "CompanyData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    const tableColumn = ["SL.NO", "Company Name", "Company Code", "Active"];
    const tableRows = [];
    filteredcompany.forEach((item, index) => {
      const row = [index + 1, item.name, item.code, item.is_active ? "Y" : "N"];
      tableRows.push(row);
    });
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });
    doc.save("CompanyData.pdf");
  };

  return (
    <>
      <div className="mb-6 max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center h-[30px] gap-2 text-lg lg:text-xl 3xl:text-2xl font-semibold text-gray-900 ">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Masters</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div
              onClick={() => setOpenModal(false)}
              className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
            >
              Companies
            </div>
          </h1>
          {!openModal && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setMode("");
                  setEditId(null);
                  setFormData({
                    company: "",
                    name: "",
                    code: "",
                    description: "",
                    is_active: false,
                  });

                  setOpenModal(true);
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg lg:text-lg 3xl:text-xl border border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
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
                  className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 transition-all"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm lg:text-base 3xl:text-lg font-medium text-gray-600">
                  entries
                </span>
              </div>

              <div className="flex flex-wrap gap-3 items-center justify-center">
                <input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 lg:text-base 3xl:text-lg rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
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
          <div className="overflow-x-auto min-h-[350px]">
            <table className="w-full text-[16px] lg:text-[19px] 3xl:text-[22px]">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50">
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 hidden sm:table-cell">
                    SL.NO
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 whitespace-nowrap">
                    Company Name
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 whitespace-nowrap hidden sm:table-cell">
                    Company Code
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 hidden lg:table-cell">
                    Active
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">
                    Action
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
              ) : currentcompany.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="text-4xl opacity-40">🏢</div>
                        <p className="text-gray-500 text-base font-medium">
                          No Company data found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentcompany.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 even:bg-blue-50/60"
                    >
                      <td className="px-4 py-3 text-gray-900 text-center hidden sm:table-cell">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium text-center">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-600 text-center">
                        {item.code}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-center">
                        <div className="flex justify-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm lg:text-base 3xl:text-lg font-semibold border ${
                              item.is_active
                                ? "bg-green-100 text-green-700 border-green-300"
                                : "bg-gray-100 text-gray-700 border-gray-300"
                            }`}
                          >
                            {item.is_active ? "✓ Active" : "○ Inactive"}
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
                            <FaEye className="text-lg lg:text-xl  3xl:text-2xl" />
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
                            <FaPen className="text-lg lg:text-xl  3xl:text-2xl" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-lg transition-all"
                            title="Delete"
                          >
                            <MdDeleteForever className="text-lg lg:text-xl 3xl:text-2xl" />
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
            <span className="text-sm lg:text-base 3xl:text-lg text-gray-600">
              Showing{" "}
              <span className="text-gray-900 font-semibold">
                {filteredcompany.length === 0 ? "0" : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="text-gray-900 font-semibold">
                {Math.min(endIndex, filteredcompany.length)}
              </span>{" "}
              of{" "}
              <span className="text-gray-900 font-semibold">
                {filteredcompany.length}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
              {/* Close */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
                <h2 className="text-xl font-bold text-gray-900">
                  {mode === "view"
                    ? "View Company"
                    : mode === "edit"
                      ? "Edit Company"
                      : "Add New Company"}
                </h2>
                <button
                  onClick={() => setOpenModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <RxCross2 className="text-2xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="text-sm lg:text-lg 3xl:text-xl font-semibold text-gray-700 mb-2 block">
                    Company Name
                    <span className="text-red-500"> *</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Enter company name"
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg lg:text-lg 3xl:text-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm lg:text-lg 3xl:text-xl font-semibold text-gray-700 mb-2 block">
                    Company Code
                    <span className="text-red-500"> *</span>
                  </label>
                  <input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Enter company code"
                    className="w-full bg-white border border-gray-200 lg:text-lg 3xl:text-xl text-gray-900 px-3 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm lg:text-lg 3xl:text-xl font-semibold text-gray-700 mb-2 block">
                    Description
                  </label>
                  <input
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Enter description"
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg lg:text-lg 3xl:text-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className="w-5 h-5 cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
                  />
                  <label className="text-gray-700 font-medium lg:text-lg 3xl:text-xl cursor-pointer">
                    Active
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              {mode !== "view" && (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setOpenModal(false)}
                    className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 lg:text-lg 3xl:text-xl hover:bg-gray-50 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg lg:text-lg 3xl:text-xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Companies;

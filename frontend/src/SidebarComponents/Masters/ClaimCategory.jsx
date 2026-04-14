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
import SearchDropdown from "../SearchDropdown";

const ClaimCategory = () => {
  const API_BASE = "http://localhost:3000/api";

  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [category, setCategory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    company_name: "",
    description: "",
    isAttachment: false,
    isActive: false,
  });

  const fetchClaimCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await axios.get(`${API_BASE}/master/claim-categories`, {
        headers,
      });

      const data = Array.isArray(res.data) ? res.data : [];

      setCategory(
        data.map((d) => ({
          id: d.id,
          name: d.name || "",
          company: d.company || "",
          company_name: d.company_name || "",
          description: d.description || "",
          isAttachment:
            d.is_attachment === true ||
            d.is_attachment === "true" ||
            d.is_attachment === 1,
          isActive:
            d.is_active === true || d.is_active === "true" || d.is_active === 1,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch claim categories", error);
      toast.error("Unable to load claim categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/companies`);
      setCompanyOptions(res.data || []);
    } catch (error) {
      console.error("Failed to fetch companies", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimCategories();
    fetchCompanies();
  }, []);

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm";

  const labelStyle = "text-sm font-semibold text-gray-700 mb-2 block";

  const filteredcategory = category.filter(
    (x) =>
      x.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      (x.company_name || "").toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentcategory = filteredcategory.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredcategory.length / entriesPerPage),
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const { name, company, description, isAttachment, isActive } = formData;

    if (!name || !company) {
      toast.error("Please fill all required fields");
      return; // stop execution
    }

    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const payload = {
        name: formData.name,
        company: formData.company,
        description: formData.description,
        is_attachment: formData.isAttachment,
        is_active: formData.isActive,
      };

      if (editId) {
        // Update existing claim category
        await axios.put(
          `${API_BASE}/master/claim-categories/${editId}`,
          payload,
          { headers },
        );
        toast.success("Claim category updated successfully");
      } else {
        // Create new claim category
        await axios.post(`${API_BASE}/master/claim-categories`, payload, {
          headers,
        });
        toast.success("Claim category created successfully");
      }

      // Refresh the claim categories list
      fetchClaimCategories();
    } catch (error) {
      console.error("Failed to save claim category", error);
      toast.error("Failed to save claim category");
    }

    setOpenModal(false);
    setEditId(null);

    setFormData({
      company: "",
      company_name: "",
      name: "",
      description: "",
      isAttachment: false,
      isActive: false,
    });
  };
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      await axios.delete(`${API_BASE}/master/claim-categories/${id}`, {
        headers,
      });
      toast.success("Claim category deleted successfully");
      fetchClaimCategories();
    } catch (error) {
      console.error("Failed to delete claim category", error);
      toast.error("Failed to delete claim category");
    }
  };

  const handleCopy = () => {
    const header = [
      "SL.NO",
      "Category Name",
      "Company",
      "Description",
      "isAttachment",
      "Active",
    ].join("\t");

    const rows = filteredcategory
      .map((item, index) =>
        [
          index + 1,
          item.name,
          item.company_name || item.company,
          item.description,
          item.isAttachment ? "Yes" : "No",
          item.isActive ? "Y" : "N",
        ].join("\t"),
      )
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredcategory.map((item, index) => ({
      "SL.NO": index + 1,
      "Category Name": item.name,
      Company: item.company_name || item.company,
      Description: item.description,
      Attachment: item.isAttachment ? "Yes" : "No",
      Active: item.isActive ? "Y" : "N",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Category");

    XLSX.writeFile(workbook, "CategoryData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "SL.NO",
      "Category Name",
      "Company",
      "Description",
      "isAttachment",
      "Active",
    ];

    const tableRows = [];

    filteredcategory.forEach((item, index) => {
      const row = [
        index + 1,
        item.name,
        item.company_name || item.company,
        item.description,
        item.isAttachment ? "Yes" : "No",
        item.isActive ? "Y" : "N",
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("CategoryData.pdf");
  };

  return (
    <>
      <div className="mb-6 max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Masters</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div
              onClick={() => setOpenModal(false)}
              className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
            >
              Claim Category
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
                    company_name: "",
                    name: "",
                    description: "",
                    isAttachment: false,
                    isActive: false,
                  }),
                  setOpenModal(true)
                )}
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
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm xl:text-base  font-medium text-gray-600">
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
                  placeholder="Search claim category..."
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
            <table className="w-full text-[17px]">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50">
                  <th className="px-6 py-3 text-center text-gray-700 font-semibold hidden sm:table-cell">
                    SL.NO
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700 whitespace-nowrap">
                    Category Name
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden md:table-cell">
                    Company
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden md:table-cell">
                    Attachment Mandatory
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden lg:table-cell">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">
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
                ) : currentcategory.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="text-4xl opacity-40">💸</div>
                        <p className="text-gray-500 text-base font-medium">
                          No claim data
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentcategory.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-200 even:bg-blue-50/60"
                    >
                      <td className="px-6 py-3 text-center hidden sm:table-cell text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-3 text-center text-gray-900 font-medium">
                        {item.name}
                      </td>
                      <td className="px-6 py-3 text-center text-gray-600 hidden md:table-cell">
                        {item.company_name || item.company}
                      </td>
                      <td className="px-6 py-3 text-center text-gray-600 hidden md:table-cell">
                        {item.isAttachment ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-center">
                        <div className="flex justify-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm lg:text-base 3xl:text-lg font-semibold border ${item.isActive ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700 border-gray-300"}`}
                          >
                            {item.isActive ? "✓ Active" : "○ Inactive"}
                          </span>
                        </div>
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
                            <FaEye className="text-lg lg:text-xl 3xl:text-4xl" />
                          </button>
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
                            <FaPen className="text-lg lg:text-xl 3xl:text-4xl" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-lg transition-all"
                            title="Delete"
                          >
                            <MdDeleteForever className="text-xl lg:text-xl 3xl:text-4xl" />
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
            <span className="text-sm xl:text-base text-gray-600">
              Showing{" "}
              <span className="text-gray-900 font-semibold">
                {filteredcategory.length === 0 ? "0" : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="text-gray-900 font-semibold">
                {Math.min(endIndex, filteredcategory.length)}
              </span>{" "}
              of{" "}
              <span className="text-gray-900 font-semibold">
                {filteredcategory.length}
              </span>{" "}
              entries
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm lg:text-base 3xl:text-xl font-medium transition-all"
              >
                First
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
              >
                <GrPrevious />
              </button>
              <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-bold text-sm lg:text-base 3xl:text-xl min-w-[45px] text-center">
                {currentPage}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
              >
                <GrNext />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm lg:text-base 3xl:text-xl font-medium transition-all"
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
                <h2 className="text-xl lg:text-2xl 3xl:text-4xl font-bold text-gray-900">
                  {mode === "view"
                    ? "View Claim Category"
                    : mode === "edit"
                      ? "Edit Claim Category"
                      : "Add New Claim Category"}
                </h2>
                <button
                  onClick={() => setOpenModal(false)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <RxCross2 className="text-2xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="text-sm lg:text-base 3xl:text-xl font-semibold text-gray-700 mb-2 block">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Name"
                    className={inputStyle}
                    required
                  />
                </div>
                <SearchDropdown
                  label={
                    <>
                      Company <span className="text-red-500">*</span>
                    </>
                  }
                  name="company"
                  value={formData.company}
                  displayValue={formData.company_name}
                  options={companyOptions}
                  labelKey="name"
                  valueKey="id"
                  labelName="company_name"
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle="text-sm lg:text-base 3xl:text-lg font-bold text-gray-700 mb-2 block"
                />
                <div>
                  <label className="text-sm lg:text-base 3xl:text-xl font-semibold text-gray-700 mb-2 block">
                    Description
                  </label>
                  <input
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Description"
                    className={inputStyle}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isAttachment"
                    checked={formData.isAttachment}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className="w-5 h-5 cursor-pointer accent-blue-500"
                  />
                  <label className="text-gray-700 font-semibold lg:text-lg 3xl:text-xl cursor-pointer">
                    Attachment Mandatory
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className="w-5 h-5 cursor-pointer accent-blue-500"
                  />
                  <label className="text-gray-700 font-semibold lg:text-lg 3xl:text-xl cursor-pointer">
                    Active Status
                  </label>
                </div>
              </div>

              {mode !== "view" && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setOpenModal(false)}
                    className="px-6 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 lg:text-lg 3xl:text-xl hover:bg-gray-50 font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg lg:text-lg 3xl:text-xl transition-all duration-200"
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

export default ClaimCategory;

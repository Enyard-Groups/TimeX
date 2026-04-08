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
import SpinnerTimePicker from "../SpinnerTimePicker";
import SearchDropdown from "../SearchDropdown";
import { MdDeleteForever } from "react-icons/md";

const Shift = () => {
  const API_BASE = "http://localhost:3000/api";

  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [shift, setShift] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [showInTimePicker, setShowInTimePicker] = useState(false);
  const [showOutTimePicker, setShowOutTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    company_name: "",
    code: "",
    intime: null,
    outtime: null,
    isActive: false,
  });

  const formatTime = (value) => {
    if (!value) return null;
    if (value instanceof Date) {
      const h = String(value.getHours()).padStart(2, "0");
      const m = String(value.getMinutes()).padStart(2, "0");
      const s = String(value.getSeconds()).padStart(2, "0");
      return `${h}:${m}:${s}`;
    }
    const [h, m, s] = value.split(":");
    if (!h || !m) return null;
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:${(s || "00").padStart(2, "0")}`;
  };

  const parseTime = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    const parts = String(value)
      .split(":")
      .map((v) => Number(v));
    if (parts.length < 2) return null;
    const [h, m, s = 0] = parts;
    const d = new Date();
    d.setHours(h || 0, m || 0, s || 0, 0);
    return d;
  };

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await axios.get(`${API_BASE}/master/shifts`, { headers });
      const data = Array.isArray(res.data) ? res.data : [];

      setShift(
        data.map((d) => ({
          id: d.id,
          name: d.shift_name || "",
          code: d.shift_code || "",
          company: d.company || "",
          company_name: d.company_name || "",
          intime: parseTime(d.start_time),
          outtime: parseTime(d.end_time),
          isActive:
            d.is_active === true ||
            d.is_active === "true" ||
            d.is_active === 1 ||
            d.isActive === true,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch shifts", error);
      toast.error("Unable to load shifts");
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
    fetchShifts();
    fetchCompanies();
  }, []);

  const filteredshift = shift.filter(
    (x) =>
      x.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.code.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      (x.company_name || "").toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentshift = filteredshift.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredshift.length / entriesPerPage),
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const { name, company, code, intime, outtime, isActive } = formData;

    if (!name || !code || !intime || !outtime) {
      toast.error("Please fill all required fields");
      return;
    }

    if (new Date(outtime) <= new Date(intime)) {
      toast.error("Out Time must be after In Time");
      return;
    }

    const payload = {
      shift_name: name,
      shift_code: code,
      start_time: formatTime(intime),
      end_time: formatTime(outtime),
      grace_period: 0,
      is_active: isActive,
    };

    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      if (editId) {
        const res = await axios.put(
          `${API_BASE}/master/shifts/${editId}`,
          payload,
          { headers },
        );

        const updated = {
          id: res.data.id,
          name: res.data.shift_name || "",
          code: res.data.shift_code || "",
          company: res.data.company || "",
          company_name: res.data.company_name || "",
          intime: parseTime(res.data.start_time),
          outtime: parseTime(res.data.end_time),
          isActive:
            res.data.is_active === true ||
            res.data.is_active === "true" ||
            res.data.is_active === 1 ||
            res.data.isActive === true,
        };

        setShift((prev) =>
          prev.map((emp) => (emp.id === editId ? updated : emp)),
        );

        toast.success("Data updated");
      } else {
        const res = await axios.post(`${API_BASE}/master/shifts`, payload, {
          headers,
        });

        const created = {
          id: res.data.id,
          name: res.data.shift_name || "",
          code: res.data.shift_code || "",
          company: res.data.company || "",
          company_name: res.data.company_name || "",
          intime: parseTime(res.data.start_time),
          outtime: parseTime(res.data.end_time),
          isActive:
            res.data.is_active === true ||
            res.data.is_active === "true" ||
            res.data.is_active === 1 ||
            res.data.isActive === true,
        };

        setShift((prev) => [created, ...prev]);
        toast.success("Data Added");
      }

      setOpenModal(false);
      setEditId(null);

      setFormData({
        company: "",
        company_name: "",
        name: "",
        code: "",
        intime: null,
        outtime: null,
        isActive: false,
      });
    } catch (error) {
      console.error("Failed to save shift", error);
      toast.error(error.response?.data?.message || "Unable to save shift");
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      await axios.delete(`${API_BASE}/master/shifts/${id}`, { headers });
      setShift((prev) => prev.filter((v) => v.id !== id));
      toast.success("Shift deleted");
    } catch (error) {
      console.error("Failed to delete shift", error);
      toast.error(error.response?.data?.message || "Unable to delete shift");
    }
  };

  const handleCopy = () => {
    const header = [
      "SL.NO",
      "Shift Name",
      "Shift Code",
      "InTime",
      "OutTime",
      "Company",
      "Active",
    ].join("\t");

    const rows = filteredshift
      .map((item, index) => {
        return [
          index + 1,
          item.name,
          item.code,
          item.intime
            ? item.intime.toLocaleTimeString([], {
                hour12: false,
              })
            : "",
          item.outtime
            ? item.outtime.toLocaleTimeString([], {
                hour12: false,
              })
            : "",
          item.company_name || item.company,
          item.isActive ? "Y" : "N",
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;
    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredshift.map((item, index) => ({
      "SL.NO": index + 1,
      "Shift Name": item.name,
      "Shift Code": item.code,
      InTime: item.intime
        ? item.intime.toLocaleTimeString([], { hour12: false })
        : "",
      OutTime: item.outtime
        ? item.outtime.toLocaleTimeString([], { hour12: false })
        : "",
      Company: item.company_name || item.company,
      Active: item.isActive ? "Y" : "N",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shift");
    XLSX.writeFile(workbook, "ShiftData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    const tableColumn = [
      "SL.NO",
      "Shift Name",
      "Shift Code",
      "InTime",
      "OutTime",
      "Company",
      "Active",
    ];
    const tableRows = [];

    filteredshift.forEach((item, index) => {
      const row = [
        index + 1,
        item.name,
        item.code,
        item.intime
          ? item.intime.toLocaleTimeString([], { hour12: false })
          : "",
        item.outtime
          ? item.outtime.toLocaleTimeString([], { hour12: false })
          : "",
        item.company_name || item.company,
        item.isActive ? "Y" : "N",
      ];
      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("ShiftData.pdf");
  };

  return (
    <>
      <div className="mb-6 max-w-[1920px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center h-[30px] gap-2 text-base lg:text-xl 3xl:text-4xl font-semibold text-gray-900 ">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Masters</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div
              onClick={() => setOpenModal(false)}
              className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
            >
              Shift
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
                    company_name: "",
                    name: "",
                    code: "",
                    intime: null,
                    outtime: null,
                    isActive: false,
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
                  placeholder="Search shifts..."
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
                  <th className="px-6 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                    SL.NO
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">
                    Shift
                  </th>
                  <th className="px-6 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                    Code
                  </th>
                  <th className="px-6 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                    In Time
                  </th>
                  <th className="px-6 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                    Out Time
                  </th>
                  <th className="px-6 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                    Company
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
                      colSpan="8"
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span>Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentshift.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="text-4xl opacity-40">📭</div>
                        <p className="text-gray-500 text-base font-medium">
                          No Data Available
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentshift.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 even:bg-blue-50/60"
                    >
                      <td className="px-6 py-2 text-center hidden sm:table-cell text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-2 text-center font-medium text-gray-900">
                        {item.name || "-"}
                      </td>
                      <td className="px-6 py-2 text-center hidden md:table-cell text-gray-600">
                        {item.code || "-"}
                      </td>
                      <td className="px-6 py-2 text-center hidden md:table-cell text-gray-600">
                        {item.intime
                          ? item.intime.toLocaleTimeString([], {
                              hour12: false,
                            })
                          : "-"}
                      </td>
                      <td className="px-6 py-2 text-center hidden xl:table-cell text-gray-600">
                        {item.outtime
                          ? item.outtime.toLocaleTimeString([], {
                              hour12: false,
                            })
                          : "-"}
                      </td>
                      <td className="px-6 py-2 text-center hidden xl:table-cell text-gray-600">
                        {item.company_name || item.company || "-"}
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
                            <FaEye className="text-lg lg:text-xl 3xl:text-2xl" />
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
                            <FaPen className="text-lg lg:text-xl 3xl:text-2xl" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-lg transition-all"
                            title="Delete"
                          >
                            <MdDeleteForever className="text-xl lg:text-xl 3xl:text-2xl" />
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
                {filteredshift.length === 0 ? "0" : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="text-gray-900 font-semibold">
                {Math.min(endIndex, filteredshift.length)}
              </span>{" "}
              of{" "}
              <span className="text-gray-900 font-semibold">
                {filteredshift.length}
              </span>{" "}
              entries
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage == 1}
                onClick={() => setCurrentPage(1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              >
                First
              </button>
              <button
                disabled={currentPage == 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
              >
                <GrPrevious />
              </button>
              <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-semibold min-w-[45px] text-center">
                {currentPage}
              </div>
              <button
                disabled={currentPage == totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
              >
                <GrNext />
              </button>
              <button
                disabled={currentPage == totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
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
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
                <h2 className="text-xl lg:text-2xl 3xl:text-4xl font-bold text-gray-900">
                  {mode === "view"
                    ? "View Shift"
                    : mode === "edit"
                      ? "Edit Shift"
                      : "Add New Shift"}
                </h2>
                <button
                  onClick={() => setOpenModal(false)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <RxCross2 className="text-2xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="text-sm lg:text-lg 3xl:text-xl font-semibold text-gray-700 mb-2 block">
                    Shift Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Enter shift name"
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg lg:text-lg 3xl:text-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 transition-all shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm lg:text-lg 3xl:text-xl font-semibold text-gray-700 mb-2 block">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Enter code"
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg lg:text-lg 3xl:text-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 transition-all shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm lg:text-lg 3xl:text-xl font-semibold text-gray-700 mb-2 block">
                    In Time <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => mode !== "view" && setShowInTimePicker(true)}
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg lg:text-lg 3xl:text-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm cursor-pointer flex items-center justify-center"
                  >
                    {formData.intime
                      ? formData.intime.toLocaleTimeString([], {
                          hour12: false,
                        })
                      : "HH:MM:SS"}
                  </div>
                  {showInTimePicker && (
                    <SpinnerTimePicker
                      value={formData.intime}
                      onChange={(date) =>
                        setFormData({ ...formData, intime: date })
                      }
                      onClose={() => setShowInTimePicker(false)}
                    />
                  )}
                </div>

                <div>
                  <label className="text-sm lg:text-lg 3xl:text-xl font-semibold text-gray-700 mb-2 block">
                    Out Time <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() =>
                      mode !== "view" && setShowOutTimePicker(true)
                    }
                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg lg:text-lg 3xl:text-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm cursor-pointer flex items-center justify-center"
                  >
                    {formData.outtime
                      ? formData.outtime.toLocaleTimeString([], {
                          hour12: false,
                        })
                      : "HH:MM:SS"}
                  </div>
                  {showOutTimePicker && (
                    <SpinnerTimePicker
                      value={formData.outtime}
                      onChange={(date) =>
                        setFormData({ ...formData, outtime: date })
                      }
                      onClose={() => setShowOutTimePicker(false)}
                    />
                  )}
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
                  valueKey="name"
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg lg:text-lg 3xl:text-xl focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm"
                  labelStyle="text-sm lg:text-lg 3xl:text-xl font-semibold text-gray-700 mb-2 block"
                />

                <div className="flex items-center gap-3 h-fit sm:mt-8">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className="w-5 h-5 cursor-pointer accent-blue-500"
                  />
                  <label className="text-gray-700 font-medium lg:text-lg 3xl:text-xl cursor-pointer">
                    Active Status
                  </label>
                </div>
              </div>

              {mode !== "view" && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setOpenModal(false)}
                    className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:text-gray-900 lg:text-lg 3xl:text-xl hover:bg-gray-50 font-medium transition-all"
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

export default Shift;

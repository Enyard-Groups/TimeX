import React, { useState } from "react";
import axios from "axios";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";
import SpinnerDatePicker from "../SpinnerDatePicker";
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

const CardDetach = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [showCicpaExpiryPicker, setShowCicpaExpiryPicker] = useState(false);
  const [showIdExpiryPicker, setShowIdExpiryPicker] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [formData, setFormData] = useState({
    searchType: "Mobile no.",
    searchValue: "",
    visitor_name: "",
    company: "",
    company_name: "",
    mobile_no: "",
    point_of_contact: "",
    email: "",
    cicpa_card_no: "",
    company_code: "",
    cicpa_expiry_date: "",
    id_type: "EID",
    id_number: "",
    nationality: "",
    id_expiry_date: "",
    access_card: "",
    is_permanent: false,
    status: "booked",
  });

  const API_BASE = "http://localhost:3000/api";

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchVisitors = async () => {
    try {
      const response = await axios.get(`${API_BASE}/visitor/booking`, {
        headers: getHeaders(),
      });
      const payload = response?.data?.data ?? response?.data;
      const mapped = (Array.isArray(payload) ? payload : []).map((v) => ({
        ...v,
        visitorCode: `VS-${v.id}`,
        organization: v.company_name || v.company || "N/A",
        meetingPerson: v.point_of_contact || "N/A",
      }));
      setVisitors(mapped);
    } catch (error) {
      console.error("Failed to fetch visitors", error);
      toast.error("Failed to load data");
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${API_BASE}/companies`, {
        headers: getHeaders(),
      });
      setCompanyOptions(res.data || []);
    } catch (error) {
      console.error("Failed to fetch companies", error);
    }
  };

  React.useEffect(() => {
    fetchVisitors();
    fetchCompanies();
  }, []);

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 lg:text-lg 3xl:text-xl rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm";
  const labelStyle =
    "text-sm lg:text-base 3xl:text-xl focus:outline-none font-semibold text-gray-700 mb-2 block";

  const handleSearch = () => {
    const { searchType, searchValue } = formData;

    if (!searchValue) {
      toast.error("Please enter search value");
      return;
    }

    let filtered = visitors;

    switch (searchType) {
      case "Mobile no.":
        filtered = visitors.filter((v) =>
          v.mobile_no?.toLowerCase().includes(searchValue.toLowerCase()),
        );
        break;

      case "Visitor":
        filtered = visitors.filter((v) =>
          v.visitor_name?.toLowerCase().includes(searchValue.toLowerCase()),
        );
        break;

      case "CICPA no.":
        filtered = visitors.filter((v) =>
          v.cicpa_card_no?.toLowerCase().includes(searchValue.toLowerCase()),
        );
        break;

      case "EID no.":
        filtered = visitors.filter((v) =>
          v.id_number?.toLowerCase().includes(searchValue.toLowerCase()),
        );
        break;

      case "QR Code":
        filtered = visitors.filter((v) =>
          v.visitorCode?.toLowerCase().includes(searchValue.toLowerCase()),
        );
        break;

      default:
        break;
    }

    if (filtered.length === 0) {
      toast.error("No data found");
      return;
    }

    setVisitors(filtered); // Show filtered data in table
    setOpenModal(false); // Close modal
    setCurrentPage(1); // reset pagination
  };

  const filteredVisitors = visitors.filter((visitor) =>
    (visitor.visitor_name || "")
      .toLowerCase()
      .startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentVisitors = filteredVisitors.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredVisitors.length / entriesPerPage),
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const {
      visitor_name,
      company,
      mobile_no,
      point_of_contact,
      email,
      cicpa_card_no,
      company_code,
      cicpa_expiry_date,
      id_number,
      nationality,
      id_expiry_date,
      access_card,
    } = formData;

    if (
      !visitor_name ||
      !company ||
      !mobile_no ||
      !point_of_contact ||
      !email ||
      !cicpa_card_no ||
      !company_code ||
      !cicpa_expiry_date ||
      !id_number ||
      !nationality ||
      !id_expiry_date ||
      !access_card
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const formatDateForBackend = (str) => {
      if (!str || typeof str !== "string") return str;
      if (str.includes("/")) {
        const [d, m, y] = str.split("/");
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }
      return str;
    };

    const payload = {
      ...formData,
      visit_date: formatDateForBackend(formData.visit_date),
      cicpa_expiry_date: formatDateForBackend(formData.cicpa_expiry_date),
      id_expiry_date: formatDateForBackend(formData.id_expiry_date),
      status: "booked", // default status
    };

    try {
      if (editId) {
        await axios.put(`${API_BASE}/visitor/booking/${editId}`, payload, {
          headers: getHeaders(),
        });
        toast.success("Data updated");
      } else {
        await axios.post(`${API_BASE}/visitor/booking`, payload, {
          headers: getHeaders(),
        });
        toast.success("Data Added");
      }
      await fetchVisitors();
      setOpenModal(false);
      setEditId(null);
      setFormData({
        searchType: "Mobile no.",
        searchValue: "",
        visitor_name: "",
        company: "",
        company_name: "",
        mobile_no: "",
        point_of_contact: "",
        email: "",
        cicpa_card_no: "",
        company_code: "",
        cicpa_expiry_date: "",
        id_type: "EID",
        id_number: "",
        nationality: "",
        id_expiry_date: "",
        access_card: "",
        is_permanent: false,
        status: "booked",
      });
    } catch (error) {
      console.error("Failed to save visitor", error);
      toast.error(error.response?.data?.message || "Failed to save data");
    }
  };

  const handleDetach = async (id) => {
    if (!window.confirm("Are you sure you want to detach this card?")) return;
    try {
      // Detach logic: set status to 'checked-out' or 'completed' and clear access_card
      await axios.put(
        `${API_BASE}/visitor/booking/${id}`,
        { status: "checked-out", access_card: "" },
        { headers: getHeaders() },
      );
      toast.success("Card detached successfully");
      await fetchVisitors();
    } catch (error) {
      console.error("Failed to detach card", error);
      toast.error("Failed to detach card");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?"))
      return;
    try {
      await axios.delete(`${API_BASE}/visitor/booking/${id}`, {
        headers: getHeaders(),
      });
      toast.success("Booking removed");
      await fetchVisitors();
    } catch (error) {
      console.error("Failed to delete booking", error);
      toast.error("Failed to delete booking");
    }
  };

  const handleCopy = () => {
    const header =
      "SL.NO\tVisitor Code\tVisitor Name\tCompany\tPhone\tEmail\tCICPA\tCompany Code\tEID\tCard Reference\tMeeting Person";

    const rows = filteredVisitors
      .map(
        (v, i) =>
          `${i + 1}\t${v.visitorCode}\t${v.visitor_name}\t${v.organization}\t${v.mobile_no}\t${v.email}\t${v.cicpa_card_no}\t${v.company_code}\t${v.id_number}\t${v.access_card}\t${v.meetingPerson}`,
      )
      .join("\n");

    const text = header + "\n" + rows;

    navigator.clipboard.writeText(text);

    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const data = filteredVisitors.map((v, i) => ({
      "SL.NO": i + 1,
      "Visitor Code": v.visitorCode,
      "Visitor Name": v.visitor_name,
      Company: v.organization,
      Phone: v.mobile_no,
      Email: v.email,
      "CICPA Card": v.cicpa_card_no,
      "Company Code": v.company_code,
      "EID Number": v.id_number,
      "Card Reference": v.access_card,
      "Meeting Person": v.meetingPerson,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Visitors");

    XLSX.writeFile(workbook, "VisitorCardDetach.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "SL.NO",
      "Visitor Code",
      "Visitor Name",
      "Company",
      "Phone",
      "Email",
      "CICPA",
      "Company Code",
      "EID",
      "Card Ref",
      "Meeting Person",
    ];

    const tableRows = filteredVisitors.map((v, i) => [
      i + 1,
      v.visitorCode,
      v.visitor_name,
      v.organization,
      v.mobile_no,
      v.email,
      v.cicpa_card_no,
      v.company_code,
      v.id_number,
      v.access_card,
      v.meetingPerson,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("VisitorCardDetach.pdf");
  };

  return (
    <>
      <div className="mb-6 max-w-[1920px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center h-[30px] gap-2 text-base lg:text-xl 3xl:text-4xl font-semibold text-gray-900 ">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Visitor</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div
              onClick={() => setOpenModal(false)}
              className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
            >
              Card Detach
            </div>
          </h1>
          {!openModal && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setMode("add");
                  setOpenModal(true);
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg lg:text-lg 3xl:text-xl border border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
              >
                + Add New
              </button>
            </div>
          )}
        </div>

        {/* Main Table Container */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl">
          {/* Top Controls */}
          <div className="p-6 border-b border-blue-100/30">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm lg:text-base 3xl:text-lg font-medium text-gray-600">
                  Show
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

              <div className="flex flex-wrap gap-3 items-center justify-center">
                <input
                  placeholder="Search visitor code or name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 lg:text-base 3xl:text-lg rounded-lg focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 p-2.5 rounded-lg transition-all"
                    title="Copy"
                  >
                    <GoCopy className="text-lg lg:text-xl 3xl:text-3xl" />
                  </button>
                  <button
                    onClick={handleExcel}
                    className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 p-2.5 rounded-lg transition-all"
                    title="Excel"
                  >
                    <FaFileExcel className="text-lg lg:text-xl 3xl:text-3xl" />
                  </button>
                  <button
                    onClick={handlePDF}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 p-2.5 rounded-lg transition-all"
                    title="PDF"
                  >
                    <FaFilePdf className="text-lg lg:text-xl 3xl:text-3xl" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div
            className="overflow-x-auto min-h-[350px]"
            style={{ scrollbarWidth: "none" }}
          >
            <table className="w-full text-[17px]">
              <thead>
                <tr className="bg-slate-50 border-b border-blue-100/50">
                  <th className="py-3 px-6 hidden sm:table-cell font-semibold text-gray-700">
                    SL.NO
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700">
                    Visitor Code
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700 text-left">
                    Visitor Name
                  </th>
                  <th className="py-3 px-6 hidden xl:table-cell font-semibold text-gray-700">
                    Visitor Company
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700">
                    Phone
                  </th>
                  <th className="py-3 px-6 hidden lg:table-cell font-semibold text-gray-700">
                    Meeting Person
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentVisitors.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-12 text-center text-gray-500 font-medium"
                    >
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentVisitors.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/60"
                    >
                      <td className="py-3 px-6 hidden sm:table-cell text-gray-900">
                        {startIndex + index + 1}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-blue-600 font-medium">
                        {item.visitorCode}
                      </td>
                      <td className="py-3 px-6 font-medium text-gray-900 text-left">
                        {item.visitorName}
                      </td>
                      <td className="py-3 px-6 hidden xl:table-cell text-gray-600">
                        {item.organization}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600">
                        {item.mobile_no}
                      </td>
                      <td className="py-3 px-6 hidden lg:table-cell text-gray-600">
                        {item.point_of_contact}
                      </td>
                      <td className="py-3 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs lg:text-sm font-semibold whitespace-nowrap ${
                            item.status === "booked"
                              ? "bg-blue-100 text-blue-800"
                              : item.status === "checked-out"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex justify-center gap-3">
                          {item.status === "booked" && item.access_card && (
                            <button
                              onClick={() => handleDetach(item.id)}
                              title="Detach Card"
                              className="text-orange-500 hover:text-orange-700 font-bold text-sm lg:text-base"
                            >
                              Det.
                            </button>
                          )}
                          <FaEye
                            onClick={() => {
                              setFormData(item);
                              setMode("view");
                              setOpenModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 lg:text-xl 3xl:text-3xl cursor-pointer transition-all"
                            title="View"
                          />
                          <FaPen
                            onClick={() => {
                              setFormData(item);
                              setEditId(item.id);
                              setMode("edit");
                              setOpenModal(true);
                            }}
                            className="text-green-500 hover:text-green-700 lg:text-xl 3xl:text-3xl cursor-pointer transition-all"
                            title="Edit"
                          />
                          <MdDeleteForever
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 lg:text-xl 3xl:text-3xl cursor-pointer transition-all"
                            title="Delete"
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
              <span className="font-bold text-gray-900">{startIndex + 1}</span>{" "}
              to{" "}
              <span className="font-bold text-gray-900">
                {Math.min(endIndex, filteredVisitors.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-900">
                {filteredVisitors.length}
              </span>{" "}
              entries
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm lg:text-base 3xl:text-xl font-medium disabled:opacity-50 transition-all"
              >
                First
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-2.5 border rounded-lg bg-white disabled:opacity-50 hover:bg-blue-50"
              >
                <GrPrevious />
              </button>
              <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-bold text-sm lg:text-base 3xl:text-xl min-w-[45px] text-center">
                {currentPage}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2.5 border rounded-lg bg-white disabled:opacity-50 hover:bg-blue-50"
              >
                <GrNext />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm lg:text-base 3xl:text-xl font-medium disabled:opacity-50 transition-all"
              >
                Last
              </button>
            </div>
          </div>
        </div>

        {/* Modal Section */}
        {openModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div
              className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in duration-200"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
                <h2 className="text-xl lg:text-2xl 3xl:text-4xl font-bold text-gray-900">
                  {mode === "view"
                    ? "Visitor Card Details"
                    : mode === "edit"
                      ? "Edit Card Link"
                      : "Link New Visitor Card"}
                </h2>
                <button
                  onClick={() => setOpenModal(false)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <RxCross2 className="text-2xl" />
                </button>
              </div>

              {/* Search Helper Section */}
              {mode !== "view" && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-8 flex flex-col md:flex-row gap-4 items-end">
                  <div className="w-full md:w-1/4">
                    <label className={labelStyle}>Search Method</label>
                    <select
                      name="searchType"
                      value={formData.searchType}
                      onChange={handleChange}
                      className={inputStyle}
                    >
                      <option>Mobile no.</option>
                      <option>CICPA no.</option>
                      <option>EID no.</option>
                      <option>Visitor</option>
                      <option>QR Code</option>
                    </select>
                  </div>
                  <div className="w-full md:w-1/2">
                    <input
                      name="searchValue"
                      value={formData.searchValue}
                      onChange={handleChange}
                      placeholder="Enter value..."
                      className={inputStyle}
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
                  >
                    Find Visitor
                  </button>
                </div>
              )}

              {/* Section: Basic Information */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg lg:text-xl 3xl:text-3xl font-bold text-gray-800 uppercase tracking-wider">
                    Visitor Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className={labelStyle}>
                      Visitor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="visitor_name"
                      value={formData.visitor_name}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>
                      Company <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>
                      Mobile No <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="mobile_no"
                      value={formData.mobile_no}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                      required
                    />
                  </div>
                  <SearchDropdown
                    label={
                      <>
                        Meeting Person <span className="text-red-500">*</span>
                      </>
                    }
                    name="point_of_contact"
                    value={formData.point_of_contact}
                    options={["Name 1", "Name 2"]}
                    formData={formData}
                    setFormData={setFormData}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                    disabled={mode === "view"}
                  />
                </div>
              </div>

              {/* Section: CICPA */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-1 bg-teal-500 rounded-full"></div>
                  <h3 className="text-lg lg:text-xl 3xl:text-3xl font-bold text-gray-800 uppercase tracking-wider">
                    CICPA Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className={labelStyle}>
                      CICPA Card <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="cicpa_card_no"
                      value={formData.cicpa_card_no}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>
                      Company Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="company_code"
                      value={formData.company_code}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div className="relative">
                    <label className={labelStyle}>
                      CICPA Expiry <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="cicpa_expiry_date"
                      value={formData.cicpa_expiry_date}
                      onClick={() =>
                        mode !== "view" && setShowCicpaExpiryPicker(true)
                      }
                      readOnly
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                    {showCicpaExpiryPicker && (
                      <SpinnerDatePicker
                        value={formData.cicpa_expiry_date}
                        onChange={(date) =>
                          setFormData({ ...formData, cicpa_expiry_date: date })
                        }
                        onClose={() => setShowCicpaExpiryPicker(false)}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Section: ID Information */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-1 bg-purple-500 rounded-full"></div>
                  <h3 className="text-lg lg:text-xl 3xl:text-3xl font-bold text-gray-800 uppercase tracking-wider">
                    ID Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className={labelStyle}>
                      EID Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="id_number"
                      value={formData.id_number}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>
                      Nationality <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                      required
                    />
                  </div>
                  <div className="relative">
                    <label className={labelStyle}>
                      ID Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="id_expiry_date"
                      value={formData.id_expiry_date}
                      onClick={() =>
                        mode !== "view" && setShowIdExpiryPicker(true)
                      }
                      readOnly
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                    {showIdExpiryPicker && (
                      <SpinnerDatePicker
                        value={formData.id_expiry_date}
                        onChange={(date) =>
                          setFormData({ ...formData, id_expiry_date: date })
                        }
                        onClose={() => setShowIdExpiryPicker(false)}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Section: Access Card */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-1 bg-orange-500 rounded-full"></div>
                  <h3 className="text-lg lg:text-xl 3xl:text-3xl font-bold text-gray-800 uppercase tracking-wider">
                    Access Control
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <SearchDropdown
                    label={
                      <>
                        Access Card <span className="text-red-500">*</span>
                      </>
                    }
                    name="access_card"
                    value={formData.access_card}
                    options={["Card 1", "Card 2"]}
                    formData={formData}
                    setFormData={setFormData}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                    disabled={mode === "view"}
                  />
                  <div className="flex items-center gap-3 mt-8">
                    <input
                      type="checkbox"
                      name="is_permanent"
                      checked={formData.is_permanent}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className="w-5 h-5 accent-blue-600"
                    />
                    <span className="font-semibold text-gray-700 lg:text-lg">
                      Set as Permanent Visitor
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              {mode !== "view" && (
                <div className="flex justify-end gap-3 pt-6 border-t border-blue-100/30">
                  <button
                    onClick={() => setOpenModal(false)}
                    className="px-8 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-bold lg:text-lg 3xl:text-xl hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-2.5 rounded-lg font-bold lg:text-lg 3xl:text-xl shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all"
                  >
                    Save Card Link
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

export default CardDetach;

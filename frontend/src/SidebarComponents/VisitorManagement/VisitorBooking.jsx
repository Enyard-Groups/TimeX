import React, { useState, useEffect } from "react";
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

const API_BASE = "http://localhost:3000/api";

const VisitorBooking = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"

  const [openModal, setOpenModal] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [showCicpaExpiryPicker, setShowCicpaExpiryPicker] = useState(false);
  const [showIdExpiryPicker, setShowIdExpiryPicker] = useState(false);
  const now = new Date();
  const today = now.toLocaleDateString("en-GB").split("/").join("/");
  const currentTime = now.toTimeString().slice(0, 8);

  const [formData, setFormData] = useState({
    searchType: "Mobile no.",
    searchValue: "",
    visitor_name: "",
    purpose_of_visit: "",
    visit_date: today,
    visit_time: currentTime,
    company: "",
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
  });

  const inputStyle =
    "text-lg w-full  border  border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

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

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchVisitors = async () => {
    try {
      const response = await axios.get(`${API_BASE}/visitor/booking`, { headers: getHeaders() });
      const payload = response?.data?.data ?? response?.data;
      // Map backend fields to frontend state format if necessary
      const mapped = (Array.isArray(payload) ? payload : []).map((v) => ({
        ...v,
        vDateTime: `${v.visit_date} (${v.visit_time})`,
        organization: v.company || "N/A", // Default if blank
        meetingPerson: v.point_of_contact || "N/A",
        // Carry over other fields if present in DB
        visitorCode: `VS-${v.id}`,
      }));
      setVisitors(mapped);
    } catch (error) {
      console.error("Failed to fetch visitors", error);
      toast.error("Failed to load data");
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const filteredVisitors = visitors.filter((visitor) =>
    (visitor.visitor_name || "").toLowerCase().startsWith(searchTerm.toLowerCase()),
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
      purpose_of_visit,
      company,
      mobile_no,
      point_of_contact,
      access_card,
    } = formData;

    if (
      !visitor_name ||
      !purpose_of_visit ||
      !company ||
      !mobile_no ||
      !point_of_contact ||
      !access_card
    ) {
      toast.error("Please fill all required fields");
      return; // stop execution
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
        await axios.put(`${API_BASE}/visitor/booking/${editId}`, payload, { headers: getHeaders() });
        toast.success("Data updated");
      } else {
        await axios.post(`${API_BASE}/visitor/booking`, payload, { headers: getHeaders() });
        toast.success("Data Added");
      }
      await fetchVisitors();
      setOpenModal(false);
      setEditId(null);
      setFormData({
        searchType: "Mobile no.",
        searchValue: "",
        visitor_name: "",
        purpose_of_visit: "",
        visit_date: today,
        visit_time: currentTime,
        company: "",
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
      });
    } catch (error) {
      console.error("Failed to save visitor", error);
      toast.error(error.response?.data?.message || "Failed to save data");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      await axios.delete(`${API_BASE}/visitor/booking/${id}`, { headers: getHeaders() });
      toast.success("Booking removed");
      await fetchVisitors();
    } catch (error) {
      console.error("Failed to delete booking", error);
      toast.error("Failed to delete booking");
    }
  };


  const handleCopy = () => {
    const header =
      "SL.NO\tVisitor Code\tVisitor Name\tV-Phone\tCardReference\tV-Date & Time\tOrganization\tMeeting Person";

    const rows = filteredVisitors
      .map(
        (v, i) =>
          `${i + 1}\t${v.visitorCode}\t${v.visitor_name}\t${v.mobile_no}\t${v.cardReference || ""}\t${v.vDateTime}\t${v.organization}\t${v.meetingPerson}`,
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
      "V-Phone": v.mobile_no,
      CardReference: v.cardReference || "",
      "V-Date & Time": v.vDateTime,
      Organization: v.organization,
      "Meeting Person": v.meetingPerson,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Visitors");

    XLSX.writeFile(workbook, "VisitorBooking.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "SL.NO",
      "Visitor Code",
      "Visitor Name",
      "V-Phone",
      "CardReference",
      "V-Date & Time",
      "Organization",
      "Meeting Person",
    ];

    const tableRows = filteredVisitors.map((v, i) => [
      i + 1,
      v.visitorCode,
      v.visitor_name,
      v.mobile_no,
      v.cardReference || "",
      v.vDateTime,
      v.organization,
      v.meetingPerson,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("VisitorBooking.pdf");
  };

  return (
    <>
      <div className="mb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
            <FaAngleRight />
            Visitor
            <FaAngleRight />
            <div onClick={() => setOpenModal(false)} className="cursor-pointer">
              Visitor Booking
            </div>
          </h1>
          {!openModal && (
            <button
              onClick={() => setOpenModal(true)}
              className="bg-[oklch(0.645_0.246_16.439)] text-white px-4 py-2 rounded-md"
            >
              + Add New
            </button>
          )}
        </div>

        <div className="mt-6 bg-white shadow-xl rounded-xl  border border-[oklch(0.8_0.001_106.424)] p-6">
          {/* Top Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <div>
              <label className="mr-2 text-md">Show</label>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className=" border rounded-full px-1 border-[oklch(0.645_0.246_16.439)]"
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
                <button
                  onClick={handleCopy}
                  className="text-xl px-3 py-1 cursor-pointer text-gray-800"
                >
                  <GoCopy />
                </button>

                <button
                  onClick={handleExcel}
                  className="text-xl px-3 py-1 cursor-pointer text-green-700"
                >
                  <FaFileExcel />
                </button>

                <button
                  onClick={handlePDF}
                  className="text-xl px-3 py-1 cursor-pointer text-red-600"
                >
                  <FaFilePdf />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            className="overflow-x-auto min-h-[300px]"
            style={{ scrollbarWidth: "none" }}
          >
            <table className="w-full text-lg border-collapse">
              <thead className="text-md bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)] ">
                <tr>
                  <th className="py-2 px-6 hidden sm:table-cell  font-semibold">
                    SL.NO
                  </th>
                  <th className="py-2 px-6 hidden md:table-cell  font-semibold">
                    Visitor Code
                  </th>
                  <th className="py-2 px-6  font-semibold">Visitor Name</th>
                  <th className="py-2 px-6 hidden md:table-cell  font-semibold">
                    Visitor Phone
                  </th>
                  <th className="py-2 px-6 hidden xl:table-cell  font-semibold whitespace-nowrap">
                    Visitor Date&Time
                  </th>
                  <th className="py-2 px-6 hidden xl:table-cell  font-semibold">
                    Organization
                  </th>
                  <th className="py-2 px-6 hidden lg:table-cell  font-semibold whitespace-nowrap">
                    Meeting Person
                  </th>
                  <th className="py-2 px-6 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentVisitors.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="lg:text-center p-10">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentVisitors.map((item, index) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)] "
                    >
                      <td className="py-2 px-6 hidden sm:table-cell ">
                        {index + 1}
                      </td>
                      <td className="py-2 px-6 hidden md:table-cell ">
                        {item.visitorCode}
                      </td>
                      <td className="py-2 px-6">{item.visitor_name}</td>
                      <td className="py-2 px-6 hidden md:table-cell ">
                        {item.mobile_no}
                      </td>
                      <td className="py-2 px-6 hidden xl:table-cell ">
                        {item.vDateTime}
                      </td>
                      <td className="py-2 px-6 hidden xl:table-cell ">
                        {item.organization}
                      </td>
                      <td className="py-2 px-6 hidden lg:table-cell  whitespace-nowrap">
                        {item.meetingPerson}
                      </td>
                      <td className="py-2 px-6">
                        <div className="flex flex-row space-x-3 justify-center ">
                          {/* View */}
                          <FaEye
                            onClick={() => {
                              setFormData(item);
                              setMode("view");
                              setOpenModal(true);
                            }}
                            className="inline text-blue-500 cursor-pointer text-lg"
                          />

                          {/* Edit */}
                          <FaPen
                            onClick={() => {
                              setFormData(item);
                              setEditId(item.id);
                              setMode("edit");
                              setOpenModal(true);
                            }}
                            className="inline text-green-500 cursor-pointer text-lg"
                          />

                          {/* Delete */}
                          <MdDeleteForever
                            onClick={() => handleDelete(item.id)}
                            className="inline text-red-500 cursor-pointer text-xl"
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
          <div className="flex justify-center md:justify-between items-center mt-4 text-sm flex-wrap gap-6">
            <span>
              Showing {filteredVisitors.length === 0 ? "0" : startIndex + 1} to{" "}
              {Math.min(endIndex, filteredVisitors.length)} of{" "}
              {filteredVisitors.length} entries
            </span>

            <div className="flex flex-row space-x-1">
              <button
                disabled={currentPage == 1}
                onClick={() => setCurrentPage(1)}
                className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
              >
                First
              </button>

              <button
                disabled={currentPage == 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-3 bg-gray-200 rounded-full disabled:opacity-50"
              >
                <GrPrevious />
              </button>

              <div className="p-3 px-4 shadow rounded-full">{currentPage}</div>

              <button
                disabled={currentPage == totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-3 bg-gray-200 rounded-full disabled:opacity-50"
              >
                <GrNext />
              </button>

              <button
                disabled={currentPage == totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
              >
                Last
              </button>
            </div>
          </div>
        </div>

        {openModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div
              className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6"
              style={{ scrollbarWidth: "none" }}
            >
              {/* Close */}
              <div className="flex justify-end">
                <RxCross2
                  onClick={() => setOpenModal(false)}
                  className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer"
                />
              </div>

              {/* Search Section */}
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <select
                  name="searchType"
                  value={formData.searchType}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  className={inputStyle}
                >
                  <option>Mobile no.</option>
                  <option>CICPA no.</option>
                  <option>EID no.</option>
                  <option>Visitor</option>
                  <option>QR Code</option>
                </select>

                <input
                  name="searchValue"
                  value={formData.searchValue}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Value"
                  className={inputStyle}
                  required
                />

                <button
                  onClick={handleSearch}
                  className="bg-[oklch(0.645_0.246_16.439)] text-white px-4 py-2 rounded-md"
                >
                  Search
                </button>
              </div>

              {/* VISITOR INFORMATION */}
              <h2 className="text-center font-semibold mt-8 mb-4">
                VISITOR INFORMATION
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className={labelStyle}>
                    Visitor Name
                    <span className="text-[oklch(0.577_0.245_27.325)]">
                      {" "}
                      *{" "}
                    </span>
                  </label>
                  <input
                    name="visitor_name"
                    value={formData.visitor_name}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Visitor Name"
                    className={inputStyle}
                    required
                  />
                </div>

                <div>
                  <SearchDropdown
                    label={
                      <>
                        Purpose of Visit <span className="text-red-500">*</span>
                      </>
                    }
                    name="purpose_of_visit"
                    value={formData.purpose_of_visit}
                    options={[
                      "Business",
                      "Meeting",
                      "Interview",
                      "Contractor",
                      "Personal",
                      "Delivery",
                    ]}
                    formData={formData}
                    setFormData={setFormData}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />
                </div>

                <div className="grid grid-cols-2">
                  <div>
                    <label className={labelStyle}>Date</label>
                    <div
                      name="visit_date"
                      value={formData.visit_date}
                      className={inputStyle}
                    >
                      {formData.visit_date}
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>Time</label>
                    <div
                      name="visit_time"
                      value={formData.visit_time}
                      className={inputStyle}
                    >
                      {formData.visit_time}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>
                    Company
                    <span className="text-[oklch(0.577_0.245_27.325)]">
                      {" "}
                      *{" "}
                    </span>
                  </label>
                  <input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Company"
                    className={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    Mobile No
                    <span className="text-[oklch(0.577_0.245_27.325)]">
                      {" "}
                      *{" "}
                    </span>
                  </label>
                  <input
                    type="number"
                    name="mobile_no"
                    value={formData.mobile_no}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Contact No"
                    className={inputStyle}
                    required
                  />
                </div>

                <div>
                  <SearchDropdown
                    label=" F1 Point of Contact"
                    name="point_of_contact"
                    value={formData.point_of_contact}
                    options={["Name 1", "Name 2", "Name 3"]}
                    formData={formData}
                    setFormData={setFormData}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>E-Mail</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="E-Mail"
                    className={inputStyle}
                    required
                  />
                </div>
              </div>

              {/* CICPA SECTION */}
              <h2 className="text-center font-semibold mt-10 mb-4">
                CICPA INFORMATION
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className={labelStyle}>CICPA Card No</label>
                  <input
                    name="cicpa_card_no"
                    value={formData.cicpa_card_no}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="CICPA Card Number"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>Company Code</label>
                  <input
                    name="company_code"
                    value={formData.company_code}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Company Code"
                    className={inputStyle}
                  />
                </div>

                <div className="relative">
                  <label className={labelStyle}>CICPA Expiry Date</label>
                  <input
                    name="cicpa_expiry_date"
                    value={formData.cicpa_expiry_date}
                    onChange={handleChange}
                    onClick={() => setShowCicpaExpiryPicker(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
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

              {/* ID SECTION */}
              <h2 className="text-center font-semibold mt-10 mb-4">
                ID INFORMATION
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <SearchDropdown
                    label="IdType"
                    name="id_type"
                    value={formData.id_type}
                    options={["EID", "Passport", "Driving License"]}
                    formData={formData}
                    setFormData={setFormData}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>Number</label>
                  <input
                    name="id_number"
                    value={formData.id_number}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="ID Number"
                    className={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label className={labelStyle}>Nationality</label>
                  <input
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Nationality"
                    className={inputStyle}
                    required
                  />
                </div>

                <div className="relative">
                  <label className={labelStyle}>Expiry Date</label>
                  <input
                    name="id_expiry_date"
                    value={formData.id_expiry_date}
                    onChange={handleChange}
                    onClick={() => setShowIdExpiryPicker(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
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

              {/* ACCESS CARD */}
              <h2 className="text-center font-semibold mt-10 mb-4">
                ACCESS CARD INFORMATION
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <SearchDropdown
                    label={
                      <>
                        Access card <span className="text-red-500">*</span>
                      </>
                    }
                    name="access_card"
                    value={formData.access_card}
                    options={["Card 1", "Card 2"]}
                    formData={formData}
                    setFormData={setFormData}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    name="is_permanent"
                    checked={formData.is_permanent}
                    onChange={handleChange}
                    disabled={mode === "view"}
                  />
                  <span>Is Permanent</span>
                </div>
              </div>

              {/* Save */}
              {mode !== "view" && (
                <div className="flex justify-end mt-10">
                  <button
                    onClick={handleSubmit}
                    className="bg-[oklch(0.645_0.246_16.439)] text-white px-8 py-2 rounded-md"
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

export default VisitorBooking;

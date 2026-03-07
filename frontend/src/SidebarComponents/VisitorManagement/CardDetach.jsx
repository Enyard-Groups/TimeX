import React, { useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaEye, FaPen } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";

const CardDetach = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    searchType: "Mobile no.",
    searchValue: "",
    visitorName: "",
    company: "",
    mobile: "",
    contactPerson: "",
    email: "",
    cicpaCard: "",
    companyCode: "",
    cicpaExpiry: null,
    idNumber: "",
    nationality: "",
    idExpiry: null,
    accessCard: "",
    isPermanent: false,
  });

  const inputStyle =
    "text-lg w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

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
          v.phone?.toLowerCase().includes(searchValue.toLowerCase()),
        );
        break;

      case "Visitor":
        filtered = visitors.filter((v) =>
          v.visitorName?.toLowerCase().includes(searchValue.toLowerCase()),
        );
        break;

      case "CICPA no.":
        filtered = visitors.filter((v) =>
          v.cicpaCard?.toLowerCase().includes(searchValue.toLowerCase()),
        );
        break;

      case "EID no.":
        filtered = visitors.filter((v) =>
          v.idNumber?.toLowerCase().includes(searchValue.toLowerCase()),
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
    visitor.visitorName.toLowerCase().startsWith(searchTerm.toLowerCase()),
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

  const handleSubmit = () => {
    const {
      visitorName,
      company,
      mobile,
      contactPerson,
      email,
      cicpaCard,
      companyCode,
      cicpaExpiry,
      idNumber,
      nationality,
      idExpiry,
      accessCard,
    } = formData;

    if (
      !visitorName ||
      !company ||
      !mobile ||
      !contactPerson ||
      !email ||
      !cicpaCard ||
      !companyCode ||
      !cicpaExpiry ||
      !idNumber ||
      !nationality ||
      !idExpiry ||
      !accessCard
    ) {
      toast.error("Please fill all required fields");
      return; // stop execution
    }

    const newVisitor = {
      id: Date.now(),
      visitorCode: `VS-${visitors.length + 1}`,
      visitorName,
      email,
      cicpaCard,
      idNumber,
      companyCode,
      phone: mobile,
      cardReference: accessCard,
      organization: company,
      meetingPerson: contactPerson,
    };

    if (editId) {
      setVisitors((prev) =>
        prev.map((emp) => (emp.id === editId ? { ...emp, ...formData } : emp)),
      );

      toast.success("Data updated");
    } else {
      setVisitors((prev) => [...prev, newVisitor]);

      toast.success("Data Added");
    }

    setOpenModal(false);
    setEditId(null);

    setFormData({
      searchType: "Mobile no.",
      visitorName: "",
      company: "",
      mobile: "",
      contactPerson: "",
      email: "",
      cicpaCard: "",
      companyCode: "",
      cicpaExpiry: "",
      idType: "EID",
      idNumber: "",
      nationality: "",
      idExpiry: "",
      accessCard: "",
      isPermanent: false,
    });
  };

  const handleCopy = () => {
    const header =
      "SL.NO\tVisitor Code\tVisitor Name\tCompany\tPhone\tEmail\tCICPA\tCompany Code\tEID\tCard Reference\tMeeting Person";

    const rows = filteredVisitors
      .map(
        (v, i) =>
          `${i + 1}\t${v.visitorCode}\t${v.visitorName}\t${v.organization}\t${v.phone}\t${v.email}\t${v.cicpaCard}\t${v.companyCode}\t${v.idNumber}\t${v.cardReference}\t${v.meetingPerson}`,
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
      "Visitor Name": v.visitorName,
      Company: v.organization,
      Phone: v.phone,
      Email: v.email,
      "CICPA Card": v.cicpaCard,
      "Company Code": v.companyCode,
      "EID Number": v.idNumber,
      "Card Reference": v.cardReference,
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
      v.visitorName,
      v.organization,
      v.phone,
      v.email,
      v.cicpaCard,
      v.companyCode,
      v.idNumber,
      v.cardReference,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
          <FaAngleRight />
          Visitor
          <FaAngleRight />
          <div onClick={() => setOpenModal(false)} className="cursor-pointer">
            Card Detach
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

      {!openModal && (
        <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.8_0.001_106.424)] p-6">
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
                className="border rounded-full px-1 border-[oklch(0.645_0.246_16.439)]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="ml-2 text-md">entries</span>
            </div>
            <div className="flex">
              <button
                onClick={handleCopy}
                className="px-3 py-1 cursor-pointer text-gray-800"
              >
                <GoCopy />
              </button>

              <button
                onClick={handleExcel}
                className="px-3 py-1 cursor-pointer text-green-700"
              >
                <FaFileExcel />
              </button>

              <button
                onClick={handlePDF}
                className="px-3 py-1 cursor-pointer text-red-600"
              >
                <FaFilePdf />
              </button>
            </div>
            <input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className=" shadow-sm px-3 py-1 rounded-full  focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[320px]">
            <table className="w-full text-lg border-collapse">
              <thead className="bg-[oklch(0.98_0.02_16.439)]  text-[oklch(0.70_0.246_16.439)]">
                <tr>
                  <th className="py-2 px-6 font-semibold">SL.NO</th>
                  <th className="py-2 px-6 font-semibold">Visitor Code</th>
                  <th className="py-2 px-6 font-semibold">Visitor Name</th>
                  <th className="py-2 px-6 font-semibold">Visitor Company</th>
                  <th className="py-2 px-6 font-semibold">Visitor Phone</th>
                  <th className="py-2 px-6 font-semibold">Visitor Email</th>
                  <th className="py-2 px-6 font-semibold">CICPA Card No</th>
                  <th className="py-2 px-6 font-semibold">Company Code</th>
                  <th className="py-2 px-6 font-semibold">EID No</th>
                  <th className="py-2 px-6 font-semibold">Card Reference</th>
                  <th className="py-2 px-6 font-semibold">Meeting Person</th>
                  <th className="py-2 px-6 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentVisitors.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="lg:text-center p-10">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentVisitors.map((item, index) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)] "
                    >
                      <td className="py-2 px-6">{index + 1}</td>
                      <td className="py-2 px-6">{item.visitorCode}</td>
                      <td className="py-2 px-6">{item.visitorName}</td>
                      <td className="py-2 px-6">{item.organization}</td>
                      <td className="py-2 px-6">{item.phone}</td>
                      <td className="py-2 px-6">{item.email}</td>
                      <td className="py-2 px-6">{item.cicpaCard}</td>
                      <td className="py-2 px-6">{item.companyCode}</td>
                      <td className="py-2 px-6">{item.idNumber}</td>
                      <td className="py-2 px-6">{item.cardReference}</td>
                      <td className="py-2 px-6">{item.meetingPerson}</td>
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
                            onClick={() =>
                              setVisitors(
                                visitors.filter((v) => v.id !== item.id),
                              )
                            }
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
          <div className="flex justify-between items-center mt-4 text-sm">
            <span>
              Showing {filteredVisitors.length === 0 ? "0" : startIndex + 1} to{" "}
              {Math.min(endIndex, filteredVisitors.length)} of{" "}
              {filteredVisitors.length} entries
            </span>

            <div className="flex flex-row space-x-2">
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
      )}

      {openModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-start z-50 p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-6xl shadow-xl rounded-xl border border-[oklch(0.923_0.003_48.717)] p-6 relative">
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
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <input
                  name="visitorName"
                  value={formData.visitorName}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Visitor Name"
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>
                  Company
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
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
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <input
                  type="number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Contact No"
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>
                  F1 Point of Contact
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <select
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  className={inputStyle}
                  required
                >
                  <option>Select</option>
                  <option>Name1</option>
                  <option>name2</option>
                  <option>Name3</option>
                  <option>Name4</option>
                  <option>Name5</option>
                  <option>Name6</option>
                </select>
              </div>

              <div>
                <label className={labelStyle}>
                  E-Mail
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
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
                <label className={labelStyle}>
                  CICPA Card No
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <input
                  name="cicpaCard"
                  value={formData.cicpaCard}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="CICPA Card Number"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>
                  Company Code
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <input
                  name="companyCode"
                  value={formData.companyCode}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Company Code"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>
                  CICPA Expiry Date
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <DatePicker
                  placeholderText="dd/mm/yyyy"
                  selected={formData.cicpaExpiry}
                  onChange={(date) =>
                    setFormData({ ...formData, cicpaExpiry: date })
                  }
                  className={inputStyle}
                  dateFormat="dd/MM/yyyy"
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  scrollableYearDropdown
                  minDate={new Date(1950, 0, 1)}
                  maxDate={new Date(new Date().getFullYear() + 15, 11, 31)}
                />
              </div>
            </div>

            {/* ID SECTION */}
            <h2 className="text-center font-semibold mt-10 mb-4">
              ID INFORMATION
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className={labelStyle}>
                  EID Number
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <input
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="ID Number"
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>
                  Nationality
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
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

              <div>
                <label className={labelStyle}>
                  Expiry Date
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <DatePicker
                  placeholderText="dd/mm/yyyy"
                  selected={formData.idExpiry}
                  onChange={(date) =>
                    setFormData({ ...formData, idExpiry: date })
                  }
                  className={inputStyle}
                  dateFormat="dd/MM/yyyy"
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  scrollableYearDropdown
                  minDate={new Date(1950, 0, 1)}
                  maxDate={new Date(new Date().getFullYear() + 15, 11, 31)}
                />
              </div>
            </div>

            {/* ACCESS CARD */}
            <h2 className="text-center font-semibold mt-10 mb-4">
              ACCESS CARD INFORMATION
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className={labelStyle}>
                  Access Card
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <select
                  name="accessCard"
                  value={formData.accessCard}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  className={inputStyle}
                  required
                >
                  <option value="">-Select-</option>
                  <option>Card 1</option>
                  <option>Card 2</option>
                </select>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  name="isPermanent"
                  checked={formData.isPermanent}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  required
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
    </>
  );
};

export default CardDetach;

import React, { useEffect, useState } from "react";
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

const BusinessTravelRequest = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedID] = useState(null);
  const [fromDateSpinner, setFromDateSpinner] = useState(false);
  const [toDateSpinner, setToDateSpinner] = useState(false);
  const [showResumeSpinner, setShowResumeSpinner] = useState(false);
  const [businessTravel, setBusinessTravel] = useState(() => {
    const stored = localStorage.getItem("businessTravelRequests");

    if (stored) {
      return JSON.parse(stored).map((item) => ({
        ...item,
      }));
    }

    return [
      {
        id: 1,
        employee: "Employee",
        travelType: "Meeting",
        fromDate: "23/01/2026",
        toDate: "24/01/2026",
        resumeOn: "25/01/2026",
        reason: "Business",
        isHalfDayfirst: "Yes",
        isHalfDaylast: "No",
        fa: "",
        faname: "",
        sa: "",
        saname: "",
        rejectedreason: "",
        status: "Pending",
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem(
      "businessTravelRequests",
      JSON.stringify(businessTravel),
    );
  }, [businessTravel]);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    employee: "",
    travelType: "",
    fromDate: "",
    toDate: "",
    resumeOn: "",
    numberOfDays: "",
    reason: "",
    isHalfDayfirst: false,
    isHalfDaylast: false,
  });

  const inputStyle =
    "text-lg w-full  border  border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filteredBusinessTravel = businessTravel.filter((x) =>
    x.employee.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentBusinessTravel = filteredBusinessTravel.slice(
    startIndex,
    endIndex,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBusinessTravel.length / entriesPerPage),
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle Submit
  const handleSubmit = () => {
    const {
      employee,
      travelType,
      fromDate,
      toDate,
      resumeOn,
      reason,
      isHalfDayfirst,
      isHalfDaylast,
    } = formData;

    if (!employee || !travelType || !fromDate || !toDate || !resumeOn) {
      toast.error("Please fill required fields");
      return;
    }

    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split("/");
      return new Date(year, month - 1, day);
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const from = parseDate(fromDate);
    const to = parseDate(toDate);
    const resume = parseDate(resumeOn);

    if (from < today) {
      toast.error("First Date cannot be in the past");
      return;
    }

    if (to < from) {
      toast.error("Last Date must be after First Date");
      return;
    }
    if (resume <= from) {
      toast.error("Resume Duty Date must be after Last Date");
      return;
    }

    const stored =
      JSON.parse(localStorage.getItem("businessTravelRequests")) || [];

    const newBusinessTravel = {
      id: Date.now(),
      employee,
      travelType,
      fromDate,
      toDate,
      resumeOn,
      reason,
      isHalfDayfirst,
      isHalfDaylast,
      fa: "",
      faname: "",
      sa: "",
      saname: "",
      rejectedreason: "",
      status: "Pending",
    };

    if (editId) {
      const updated = stored.map((item) =>
        item.id === editId ? { ...item, ...newBusinessTravel } : item,
      );

      localStorage.setItem("businessTravelRequests", JSON.stringify(updated));

      setBusinessTravel(updated);

      toast.success(" Updated");
    } else {
      const updated = [...stored, newBusinessTravel];

      localStorage.setItem("businessTravelRequests", JSON.stringify(updated));

      setBusinessTravel(updated);

      toast.success(" Submitted");
    }

    setOpenModal(false);
    setEditId(null);

    setFormData({
      employee: "",
      travelType: "",
      fromDate: "",
      toDate: "",
      resumeOn: "",
      numberOfDays: "",
      reason: "",
      isHalfDayfirst: false,
      isHalfDaylast: false,
    });
  };

  // Handle delete
  const handleDelete = (id) => {
    const stored =
      JSON.parse(localStorage.getItem("businessTravelRequests")) || [];

    const updated = stored.filter((v) => v.id !== id);

    localStorage.setItem("businessTravelRequests", JSON.stringify(updated));

    setBusinessTravel(
      updated.map((item) => ({
        ...item,
      })),
    );

    toast.success("Deleted Successfully");
  };

  const handleCopy = () => {
    const header = [
      "Employee",
      "Travel Type",
      "From Date",
      "To Date",
      "Resume On",
      "Reason",
      "Is Halfday (First Date of Travel)",
      "Is Halfday (Last Date of Travel)",
    ].join("\t");

    const rows = filteredBusinessTravel
      .map((item) => {
        return [
          item.employee,
          item.travelType,
          item.fromDate,
          item.toDate,
          item.resumeOn,
          item.reason || "NIL",
          item.isHalfDayfirst ? "Yes" : "No",
          item.isHalfDaylast ? "Yes" : "No",
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredBusinessTravel.map((item) => ({
      Employee: item.employee,
      TravelType: item.travelType,
      FromDate: item.fromDate,
      ToDate: item.toDate,
      ResumeOn: item.resumeOn,
      Reason: item.reason || "NIL",
      IsHalfdayFirstDateofTravel: item.isHalfDayfirst ? "Yes" : "No",
      IsHalfdayLastDateofTravel: item.isHalfDaylast ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "BusinessTravelRequest");

    XLSX.writeFile(workbook, "BusinessTravelRequestData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "Employee",
      "Travel Type",
      "From Date",
      "To Date",
      "Resume On",
      "Reason",
      "Is Halfday (First Date of Travel)",
      "Is Halfday (Last Date of Travel)",
    ];

    const tableRows = [];

    filteredBusinessTravel.forEach((item) => {
      const row = [
        item.employee,
        item.travelType,
        item.fromDate,
        item.toDate,
        item.resumeOn,
        item.reason || "NIL",
        item.isHalfDayfirst ? "Yes" : "No",
        item.isHalfDaylast ? "Yes" : "No",
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("BusinessTravelRequestData.pdf");
  };

  return (
    <>
      <div className="mb-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
            <FaAngleRight />
            Requests
            <FaAngleRight />
            <div onClick={() => setOpenModal(false)} className="cursor-pointer">
              Business Travel Request
            </div>
          </h1>
          {!openModal && (
            <button
              onClick={() => (
                setMode(""),
                setEditId(null),
                setFormData({
                  employee: "",
                  travelType: "",
                  fromDate: "",
                  toDate: "",
                  resumeOn: "",
                  numberOfDays: "",
                  reason: "",
                  isHalfDayfirst: false,
                  isHalfDaylast: false,
                }),
                setOpenModal(true)
              )}
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
                className=" border rounded-full px-1  border-[oklch(0.645_0.246_16.439)]"
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
            className="overflow-x-auto min-h-[250px]"
            style={{ scrollbarWidth: "none" }}
          >
            <table className="w-full text-lg border-collapse">
              <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
                <tr>
                  <th className="p-2 px-6 font-semibold">Employee</th>
                  <th className="p-2 hidden sm:table-cell font-semibold whitespace-nowrap">
                    Travel Type
                  </th>
                  <th className="p-2 hidden md:table-cell font-semibold">
                    From
                  </th>
                  <th className="p-2 hidden md:table-cell font-semibold">To</th>
                  <th className="p-2 hidden xl:table-cell font-semibold whitespace-nowrap">
                    Resume On
                  </th>
                  <th className="p-2 hidden lg:table-cell font-semibold ">
                    Travel Reason
                  </th>
                  <th className="p-2 hidden xl:table-cell font-semibold ">
                    IsHalfDay (FirstDay)
                  </th>
                  <th className="p-2 hidden xl:table-cell font-semibold">
                    IsHalfDay (LastDay)
                  </th>

                  <th className="py-2 px-6 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {currentBusinessTravel.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="text-center p-10">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentBusinessTravel.map((item) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                    >
                      <td className="p-2">{item.employee}</td>

                      <td className="p-2 hidden sm:table-cell whitespace-nowrap">
                        {item.travelType}
                      </td>

                      <td className="p-2 hidden md:table-cell whitespace-nowrap">
                        {item.fromDate}
                      </td>

                      <td className="p-2 hidden md:table-cell whitespace-nowrap">
                        {item.toDate}
                      </td>

                      <td className="p-2 hidden xl:table-cell whitespace-nowrap">
                        {item.resumeOn}
                      </td>

                      <td className="p-2 hidden lg:table-cell whitespace-nowrap">
                        {item.reason
                          ? `${item.travelType} '${item.reason}'`
                          : `${item.travelType} 'NIL'`}
                      </td>
                      <td className="p-2 hidden xl:table-cell">
                        {item.isHalfDayfirst ? "Yes" : "No"}
                      </td>

                      <td className="p-2 hidden xl:table-cell">
                        {item.isHalfDaylast ? "Yes" : "No"}
                      </td>

                      {/* Actions */}
                      <td className="p-2 flex flex-row space-x-3 justify-center  whitespace-nowrap">
                        {" "}
                        {/* View */}{" "}
                        <FaEye
                          onClick={() => {
                            setSelectedID(item.id);
                            setFormData(item);
                            setMode("view");
                            setOpenModal(true);
                          }}
                          className="inline text-blue-500 cursor-pointer text-lg mt-1"
                        />{" "}
                        {item.status === "Pending" ? (
                          <div className="flex flex-row space-x-3 justify-center mt-1">
                            {" "}
                            {/* Edit */}{" "}
                            <FaPen
                              onClick={() => {
                                setFormData(item);
                                setEditId(item.id);
                                setMode("edit");
                                setOpenModal(true);
                              }}
                              className="inline text-green-500 cursor-pointer text-lg"
                            />{" "}
                            {/* Delete */}{" "}
                            <MdDeleteForever
                              onClick={() => handleDelete(item.id)}
                              className="inline text-red-500 cursor-pointer text-xl"
                            />{" "}
                          </div>
                        ) : (
                          <div></div>
                        )}
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
              Showing{" "}
              {filteredBusinessTravel.length === 0 ? "0" : startIndex + 1} to{" "}
              {Math.min(endIndex, filteredBusinessTravel.length)} of{" "}
              {filteredBusinessTravel.length} entries
            </span>

            <div className="flex flex-row space-x-1">
              <button
                disabled={currentPage == 1}
                onClick={() => setCurrentPage(1)}
                className=" p-2 bg-gray-200 rounded-full disabled:opacity-50"
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
                className=" p-2 bg-gray-200 rounded-full disabled:opacity-50"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Employee */}
                <div>
                  <SearchDropdown
                    label={
                      <>
                        Employee <span className="text-red-500">*</span>
                      </>
                    }
                    name="employee"
                    value={formData.employee}
                    options={[
                      "Employee 1",
                      "Employee 2",
                      "Employee 3",
                      "Employee 4",
                      "Employee 5",
                    ]}
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />
                </div>

                {/* BusinessTravel Type */}
                <div>
                  <SearchDropdown
                    label={
                      <>
                        Travel Type <span className="text-red-500">*</span>
                      </>
                    }
                    name="travelType"
                    value={formData.travelType}
                    options={["Meeting", "Conference"]}
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />
                </div>

                {/* From Date */}
                <div>
                  <label className={labelStyle}>
                    First Date of Travel
                    <span className="text-[oklch(0.577_0.245_27.325)]"> *</span>
                  </label>

                  <input
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleChange}
                    onClick={() => setFromDateSpinner(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
                    className={inputStyle}
                  />

                  {fromDateSpinner && (
                    <SpinnerDatePicker
                      value={formData.fromDate}
                      onChange={(date) =>
                        setFormData({ ...formData, fromDate: date })
                      }
                      onClose={() => setFromDateSpinner(false)}
                    />
                  )}
                </div>

                {/* To Date */}
                <div>
                  <label className={labelStyle}>
                    Last Date of Travel
                    <span className="text-[oklch(0.577_0.245_27.325)]"> *</span>
                  </label>

                  <input
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleChange}
                    onClick={() => setToDateSpinner(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
                    className={inputStyle}
                  />

                  {toDateSpinner && (
                    <SpinnerDatePicker
                      value={formData.toDate}
                      onChange={(date) =>
                        setFormData({ ...formData, toDate: date })
                      }
                      onClose={() => setToDateSpinner(false)}
                    />
                  )}
                </div>

                {/* Resume On */}
                <div>
                  <label className={labelStyle}>Resume Duty On</label>

                  <input
                    name="resumeOn"
                    value={formData.resumeOn}
                    onChange={handleChange}
                    onClick={() => setShowResumeSpinner(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
                    className={inputStyle}
                  />

                  {showResumeSpinner && (
                    <SpinnerDatePicker
                      value={formData.resumeOn}
                      onChange={(date) =>
                        setFormData({ ...formData, resumeOn: date })
                      }
                      onClose={() => setShowResumeSpinner(false)}
                    />
                  )}
                </div>

                <div>
                  <label className={labelStyle}>
                    Number of Days
                    <span className="text-[oklch(0.577_0.245_27.325)]"> *</span>
                  </label>

                  <input
                    name="numberOfDays"
                    value={formData.numberOfDays}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder="Number of Days"
                    disabled={mode === "view"}
                  />
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <label className={labelStyle}>
                    Is HalfDay (First Day Of Travel)
                  </label>
                  <input
                    type="checkbox"
                    name="isHalfDayfirst"
                    checked={formData.isHalfDayfirst}
                    onChange={handleChange}
                    disabled={mode === "view"}
                  />
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <label className={labelStyle}>
                    Is HalfDay (Last Day Of Travel)
                  </label>
                  <input
                    type="checkbox"
                    name="isHalfDaylast"
                    checked={formData.isHalfDaylast}
                    onChange={handleChange}
                    disabled={mode === "view"}
                  />
                </div>

                {/* BusinessTravel Reason */}
                <div className="md:col-span-3">
                  <label className={labelStyle}>BusinessTravel Reason</label>

                  <input
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Reason for BusinessTravel"
                    className={inputStyle}
                    disabled={mode === "view"}
                  />
                </div>
              </div>

              {/* Save Button */}
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

              {mode === "view" &&
                selectedId &&
                (() => {
                  const item = currentBusinessTravel.find(
                    (entry) => entry.id === selectedId,
                  );

                  return item ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                      <div>
                        <h1 className={labelStyle}>FA</h1>
                        <p
                          className={`${inputStyle} ${item.fa ? (item.fa == "✔" ? "text-green-600" : "text-red-500") : ""}`}
                        >
                          {item.fa || "⏳"}
                        </p>
                      </div>
                      <div>
                        <h1 className={labelStyle}>FA Name</h1>
                        <p className={`${inputStyle}`}>{item.faname || "⏳"}</p>
                      </div>

                      <div>
                        <h1 className={labelStyle}>SA</h1>
                        <p
                          className={`${inputStyle} ${item.fa ? (item.fa == "✔" ? "text-green-600" : "text-red-500") : ""}`}
                        >
                          {item.sa || "⏳"}
                        </p>
                      </div>

                      <div>
                        <h1 className={labelStyle}>SA Name</h1>
                        <p className={`${inputStyle}`}>{item.saname || "⏳"}</p>
                      </div>

                      <div className="lg:col-span-2">
                        <h1 className={labelStyle}>Rejected Reason</h1>
                        <p className={`${inputStyle}`}>
                          {item.rejectedreason || "⏳"}
                        </p>
                      </div>
                    </div>
                  ) : null;
                })()}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BusinessTravelRequest;

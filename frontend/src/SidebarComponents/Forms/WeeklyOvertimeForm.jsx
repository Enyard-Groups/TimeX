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
import SignPad from "./SignPad";
import SpinnerTimePicker from "../SpinnerTimePicker";
import SearchDropdown from "../SearchDropdown";

const WeeklyOvertimeForm = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [requestData, setRequestData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [showCheckedDateSpinner, setShowCheckedDateSpinner] = useState(false);
  const [showApprovedDatePicker, setShowApprovedDatePicker] = useState(false);
  const [showVerifiedDatePicker, setShowVerifiedDatePicker] = useState(false);
  const [activeDateIndex, setActiveDateIndex] = useState(null);
  const [activeInTimeIndex, setActiveInTimeIndex] = useState(null);
  const [activeOutTimeIndex, setActiveOutTimeIndex] = useState(null);

  const labelStyle = "text-[16px] text-[oklch(0.147_0.004_49.25)] my-1 block mx-1";

  const inputStyle =
    "text-[16px] w-full border border-[oklch(0.923_0.003_48.717)] bg-white  rounded-md px-3 py-1 pt-0.5 text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] ";

  const defaultFormData = {
    employeeName: "",
    designation: "",
    enrollmentId: "",
    siteName: "",
    restDay: false,
    shiftExtension: false,
    overtimeDetails: [
      {
        day: "",
        date: null,
        startTime: null,
        endTime: null,
        totalHours: null,
        reason: "",
      },
    ],
    checkerName: "",
    checkerSignature: null,
    checkerSignature_drawn: null,
    checkedDate: null,

    approverName: "",
    approverSignature: null,
    approverSignature_drawn: null,
    approvedDate: null,

    verifiedBy: "",
    verifierName: "",
    verifierSignature: null,
    verifierSignature_drawn: null,
    verifiedDate: null,
  };

  const [formData, setFormData] = useState(defaultFormData);

  const getTimeDiff = (startTime, endTime) => {
    const [ih, im, is] = startTime.split(":").map(Number);
    const [oh, om, os] = endTime.split(":").map(Number);

    const inSeconds = ih * 3600 + im * 60 + is;
    const outSeconds = oh * 3600 + om * 60 + os;

    let diff = outSeconds - inSeconds;

    if (diff < 0) {
      return "00:00:00";
    }

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleRowChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedRows = [...prev.overtimeDetails];

      updatedRows[index][field] = value;

      const start = new Date(updatedRows[index].startTime);
      const end = new Date(updatedRows[index].endTime);

      updatedRows[index].totalHours = getTimeDiff(
        start.toLocaleTimeString(),
        end.toLocaleTimeString(),
      );

      return {
        ...prev,
        overtimeDetails: updatedRows,
      };
    });
  };

  const addRow = () => {
    setFormData((prev) => ({
      ...prev,
      overtimeDetails: [
        ...prev.overtimeDetails,
        {
          day: "",
          date: null,
          startTime: null,
          endTime: null,
          totalHours: null,
          reason: "",
        },
      ],
    }));
  };

  const deleteRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      overtimeDetails: prev.overtimeDetails.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (e, section = null, subsection = null) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      if (section && subsection) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [subsection]: {
              ...prev[section][subsection],
              [name]: type === "checkbox" ? checked : value,
            },
          },
        };
      }

      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [name]: type === "checkbox" ? checked : value,
          },
        };
      }

      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentrequestData = requestData.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(requestData.length / entriesPerPage),
  );

  // Handle submit
  const handleSubmit = () => {
    const newEntry = {
      id: editId ? editId : Date.now(),
      ...formData,
    };

    if (editId) {
      const updated = requestData.map((item) =>
        item.id === editId ? { ...item, ...newEntry } : item,
      );

      setRequestData(updated);

      // Backend version
      // await axios.put(`/api/manual-entry/${editId}`, newEntry)

      toast.success("Request Updated");
    } else {
      const updated = [...requestData, newEntry];
      setRequestData(updated);

      // Backend version
      // await axios.post("/api/manual-entry-request", newEntry)

      toast.success("Request Submitted");
    }

    setOpenModal(false);
    setEditId(null);

    setFormData(defaultFormData);
  };

  // Handle delete
  const handleDelete = (id) => {
    const updated = requestData.filter((v) => v.id !== id);

    setRequestData(
      updated.map((item) => ({
        ...item,
      })),
    );

    toast.success("Deleted Successfully");
  };

  const handleCopy = () => {
    const header = ["Employee Name", "Enrollment ID", "Designation"].join("\t");

    const rows = requestData
      .map((item) => {
        return [item.employeeName, item.enrollmentId, item.designation].join(
          "\t",
        );
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = requestData.map((item) => ({
      EmployeeName: item.employeeName,
      EnrollmentID: item.enrollmentId,
      Designation: item.designation,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "WeeklyOvertimeFormData");

    XLSX.writeFile(workbook, "WeeklyOvertimeFormData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = ["Employee Name", "Enrollment ID", "Designation"];

    const tableRows = [];

    requestData.forEach((item) => {
      const row = [item.employeeName, item.enrollmentId, item.designation];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("WeeklyOvertimeFormData.pdf");
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
          <FaAngleRight />
          Forms
          <FaAngleRight />
          <div onClick={() => setOpenModal(false)} className="cursor-pointer">
            Weekly Overtime Form
          </div>
        </h1>
        {!openModal && (
          <button
            onClick={() => (
              setMode(""),
              setEditId(null),
              setFormData(defaultFormData),
              setOpenModal(true)
            )}
            className="bg-[oklch(0.645_0.246_16.439)] text-white px-4 py-2 rounded-md whitespace-nowrap"
          >
            + Add New
          </button>
        )}
      </div>

      {!openModal && (
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
                  <th className="p-2 font-semibold hidden sm:table-cell">
                    SL.No
                  </th>

                  <th className="p-2 font-semibold">Employee Name</th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Enrollment Id
                  </th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Designation
                  </th>

                  <th className="p-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentrequestData.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="lg:text-center p-10 ">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentrequestData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                    >
                      <td className="p-2 whitespace-nowrap hidden sm:table-cell">
                        {index + 1}
                      </td>

                      <td className="p-2">{item.employeeName}</td>

                      <td className="p-2 hidden md:table-cell">
                        {item.enrollmentId}
                      </td>

                      <td className="p-2 hidden md:table-cell">
                        {item.designation}
                      </td>

                      <td className="p-2 flex flex-row space-x-3 justify-center whitespace-nowrap">
                        {" "}
                        <div className="flex flex-row space-x-3 justify-center mt-1">
                          {/* View */}{" "}
                          <FaEye
                            onClick={() => {
                              setFormData(item);

                              setMode("view");
                              setOpenModal(true);
                            }}
                            className="inline text-blue-500 cursor-pointer text-lg"
                          />{" "}
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
              Showing {requestData.length === 0 ? "0" : startIndex + 1} to{" "}
              {Math.min(endIndex, requestData.length)} of {requestData.length}{" "}
              entries
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
      )}

      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-[1500px] max-h-[90vh] overflow-y-auto p-6"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Close */}
            <div className="flex justify-end mb-4">
              <RxCross2
                onClick={() => setOpenModal(false)}
                className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer"
              />
            </div>

            <div className="border p-4 rounded-xl border-gray-400 shadow">
              <div className="flex justify-center">
                <div
                  className="max-h-[75vh] max-w-[1200px] overflow-y-auto pr-2 text-[16px]"
                  style={{ scrollbarWidth: "none" }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="flex flex-col">
                      <label className={`whitespace-nowrap ${labelStyle}`}>
                        Name
                      </label>
                      <div className={inputStyle}>
                        <SearchDropdown
                          name="employeeName"
                          value={formData.employeeName}
                          options={["Employee 1", "Employee 2"]}
                          formData={formData}
                          setFormData={setFormData}
                          disabled={mode === "view"}
                          className={inputStyle}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className={`whitespace-nowrap ${labelStyle}`}>
                        Employee ID
                      </label>
                      <input
                        type="text"
                        name="enrollmentId"
                        value={formData.enrollmentId}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className={inputStyle}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className={`whitespace-nowrap ${labelStyle}`}>
                        Site Name
                      </label>
                      <input
                        type="text"
                        name="siteName"
                        value={formData.siteName}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className={inputStyle}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className={`whitespace-nowrap ${labelStyle}`}>
                        Designation
                      </label>
                      <SearchDropdown
                        name="designation"
                        value={formData.designation}
                        options={[
                          "Banking Officer",
                          "Service Sales manager",
                          "Finance Assistant",
                          "Trade Finance Specialist",
                          "Sales Support Officer",
                          "General",
                          "HR manager",
                          "HR Supervisor",
                          "HR Specialist",
                          "Facilities Manager",
                          "Project Manager",
                          "Team Lead – Operations",
                          "Driver",
                        ]}
                        formData={formData}
                        setFormData={setFormData}
                        disabled={mode === "view"}
                        inputStyle={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Overtime Section */}
                  <div className="mt-6">
                    <h3 className="text-[16px] font-semibold mb-2">
                      Over time Type
                    </h3>

                    <div className="flex gap-6 mb-3">
                      <label className="flex items-center gap-2">
                        <span>Rest Day:</span>
                        <input
                          type="checkbox"
                          name="restDay"
                          checked={formData.restDay}
                          onChange={handleChange}
                          disabled={mode === "view"}
                        />
                      </label>

                      <label className="flex items-center gap-2">
                        <span>Shift Extension:</span>
                        <input
                          type="checkbox"
                          name="shiftExtension"
                          checked={formData.shiftExtension}
                          onChange={handleChange}
                          disabled={mode === "view"}
                        />
                      </label>
                    </div>

                    <table className="w-full border border-gray-400 text-[16px]">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="p-2 ">SL.No.</th>
                          <th className="p-2 ">Days</th>
                          <th className="p-2 ">Date</th>
                          <th className="p-2 ">StartTime</th>
                          <th className="p-2 ">EndTime</th>
                          <th className="p-2 ">TotalHours</th>
                          <th className="p-2 ">Reason</th>
                          <th className="p-2 ">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {formData.overtimeDetails.map((row, index) => (
                          <tr
                            key={index}
                            className="text-center border-b border-gray-300"
                          >
                            <td className=" p-1">{index + 1}</td>

                            <td className="w-30 p-1">
                              <select
                                className="w-30 rounded p-1"
                                value={row.day}
                                onChange={(e) =>
                                  handleRowChange(index, "day", e.target.value)
                                }
                                disabled={mode === "view"}
                              >
                                <option value="">Select</option>
                                <option>Monday</option>
                                <option>Tuesday</option>
                                <option>Wednesday</option>
                                <option>Thursday</option>
                                <option>Friday</option>
                                <option>Saturday</option>
                                <option>Sunday</option>
                              </select>
                            </td>

                            <td className="p-1">
                              <input
                                name="date"
                                value={row.date || ""}
                                onClick={() => setActiveDateIndex(index)}
                                readOnly
                                className="text-center"
                                placeholder="dd/mm/yyyy"
                              />

                              {activeDateIndex === index && (
                                <SpinnerDatePicker
                                  value={row.date}
                                  onChange={(date) =>
                                    handleRowChange(index, "date", date)
                                  }
                                  onClose={() => setActiveDateIndex(null)}
                                />
                              )}
                            </td>

                            <td className="p-1">
                              <div
                                className="w-full p-1 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]  cursor-pointer text-center"
                                onClick={() => {
                                  if (mode !== "view") {
                                    setActiveInTimeIndex(index);
                                  }
                                }}
                              >
                                {row.startTime
                                  ? row.startTime.toLocaleTimeString([], {
                                      hour12: false,
                                    })
                                  : "HH:MM:SS"}
                              </div>
                              {activeInTimeIndex === index && (
                                <SpinnerTimePicker
                                  value={row.startTime}
                                  onChange={(time) =>
                                    handleRowChange(index, "startTime", time)
                                  }
                                  onClose={() => setActiveInTimeIndex(null)}
                                />
                              )}
                            </td>

                            <td className=" p-1">
                              <div
                                className="w-full p-1 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] cursor-pointer text-center"
                                onClick={() => {
                                  if (mode !== "view") {
                                    setActiveOutTimeIndex(index);
                                  }
                                }}
                              >
                                {row.endTime
                                  ? row.endTime.toLocaleTimeString([], {
                                      hour12: false,
                                    })
                                  : "HH:MM:SS"}
                              </div>
                              {activeOutTimeIndex === index && (
                                <SpinnerTimePicker
                                  value={row.endTime}
                                  onChange={(time) =>
                                    handleRowChange(index, "endTime", time)
                                  }
                                  onClose={() => setActiveOutTimeIndex(null)}
                                />
                              )}
                            </td>

                            <td className=" p-1">
                              <input
                                className="text-center p-1 bg-gray-100"
                                value={row.totalHours}
                                readOnly
                              />
                            </td>

                            <td className=" p-1">
                              <input
                                type="text"
                                className="border border-gray-300 p-1"
                                value={row.reason}
                                onChange={(e) =>
                                  handleRowChange(
                                    index,
                                    "reason",
                                    e.target.value,
                                  )
                                }
                                disabled={mode === "view"}
                              />
                            </td>

                            <td className=" p-1">
                              <button
                                onClick={() => deleteRow(index)}
                                className="bg-red-500 text-white px-2 py-1 rounded"
                                disabled={mode === "view"}
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}

                        <tr>
                          <td colSpan="8" className="text-right p-2">
                            <button
                              onClick={addRow}
                              className="text-blue-600 text-xl font-bold"
                              disabled={mode === "view"}
                            >
                              +
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="border border-gray-400 p-2 my-2">
                      <h1 className="border-b-2 border-[oklch(0.645_0.246_16.439)] py-1 mb-2 w-fit">
                        Checked By: Security Head Guard
                      </h1>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 ">
                        <div>
                          <label className={labelStyle}> Name</label>
                          <input
                            name="checkerName"
                            onChange={handleChange}
                            value={formData.checkerName}
                            disabled={mode === "view"}
                            className={inputStyle}
                            placeholder="Name"
                          />
                        </div>

                        <div>
                          <label className={labelStyle}>Signature</label>
                          <div className="flex flex-col">
                            <input
                              type="file"
                              name="checkerSignature"
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  checkerSignature: e.target.files[0],
                                }))
                              }
                              className={inputStyle}
                              disabled={mode === "view"}
                            />
                            <SignPad
                              fieldName="checkerSignature_drawn"
                              name="checkerSignature"
                              formData={formData}
                              setFormData={setFormData}
                              mode={mode}
                            />
                          </div>
                        </div>

                        <div className="relative">
                          <label className={labelStyle}>Date</label>
                          <input
                            name="checkedDate"
                            value={formData.checkedDate || ""}
                            onChange={handleChange}
                            onClick={() => setShowCheckedDateSpinner(true)}
                            disabled={mode === "view"}
                            placeholder="dd/mm/yyyy"
                            className={inputStyle}
                          />

                          {showCheckedDateSpinner && (
                            <div className="absolute">
                              <SpinnerDatePicker
                                value={formData.checkedDate}
                                onChange={(date) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    checkedDate: date,
                                  }))
                                }
                                onClose={() => setShowCheckedDateSpinner(false)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-400 p-2 my-2">
                      <h1 className="border-b-2 border-[oklch(0.645_0.246_16.439)] py-1 mb-2 w-fit">
                        Approved By : Manager School Operation
                      </h1>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className={labelStyle}> Name</label>
                          <input
                            name="approverName"
                            onChange={handleChange}
                            value={formData.approverName}
                            disabled={mode === "view"}
                            className={inputStyle}
                            placeholder="Name"
                          />
                        </div>

                        <div>
                          <label className={labelStyle}>Signature</label>
                          <div className="flex flex-col">
                            <input
                              type="file"
                              name="approverSignature"
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  approverSignature: e.target.files[0],
                                }))
                              }
                              className={inputStyle}
                              disabled={mode === "view"}
                            />
                            <SignPad
                              fieldName="approverSignature_drawn"
                              name="approverSignature"
                              formData={formData}
                              setFormData={setFormData}
                              mode={mode}
                            />
                          </div>
                        </div>

                        <div className="relative">
                          <label className={labelStyle}>Date</label>
                          <input
                            name="approvedDate"
                            value={formData.approvedDate || ""}
                            onChange={handleChange}
                            onClick={() => setShowApprovedDatePicker(true)}
                            disabled={mode === "view"}
                            placeholder="dd/mm/yyyy"
                            className={inputStyle}
                          />

                          {showApprovedDatePicker && (
                            <div className="absolute">
                              <SpinnerDatePicker
                                value={formData.approvedDate}
                                onChange={(date) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    approvedDate: date,
                                  }))
                                }
                                onClose={() => setShowApprovedDatePicker(false)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-400 p-2">
                    <h1 className="border-b-2 border-[oklch(0.645_0.246_16.439)] py-1 mb-2 w-fit">
                      For Office Use Only
                    </h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className={labelStyle}> Verified By</label>

                        <input
                          name="verifiedBy"
                          onChange={handleChange}
                          value={formData.verifiedBy}
                          disabled={mode === "view"}
                          className={inputStyle}
                          placeholder="Verified By"
                        />
                      </div>

                      <div>
                        <label className={labelStyle}> Name</label>
                        <input
                          name="verifierName"
                          onChange={handleChange}
                          value={formData.verifierName}
                          disabled={mode === "view"}
                          className={inputStyle}
                          placeholder="Name"
                        />
                      </div>

                      <div className="relative">
                        <label className={labelStyle}>Date</label>
                        <input
                          name="verifiedDate"
                          value={formData.verifiedDate || ""}
                          onChange={handleChange}
                          onClick={() => setShowVerifiedDatePicker(true)}
                          disabled={mode === "view"}
                          placeholder="dd/mm/yyyy"
                          className={inputStyle}
                        />

                        {showVerifiedDatePicker && (
                          <div className="absolute">
                            <SpinnerDatePicker
                              value={formData.verifiedDate}
                              onChange={(date) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  verifiedDate: date,
                                }))
                              }
                              onClose={() => setShowVerifiedDatePicker(false)}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className={labelStyle}>Signature</label>
                        <div className="flex flex-col">
                          <input
                            type="file"
                            name="verifierSignature"
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                verifierSignature: e.target.files[0],
                              }))
                            }
                            className={inputStyle}
                            disabled={mode === "view"}
                          />
                          <SignPad
                            fieldName="verifierSignature_drawn"
                            name="verifierSignature"
                            formData={formData}
                            setFormData={setFormData}
                            mode={mode}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save */}
                  {mode !== "view" && (
                    <div className="flex justify-end mt-10">
                      <button
                        onClick={handleSubmit}
                        className="bg-[oklch(0.645_0.246_16.439)] text-white px-8 py-2 rounded-md mb-6"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyOvertimeForm;

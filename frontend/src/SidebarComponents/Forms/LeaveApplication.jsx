/* eslint-disable no-unused-vars */
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
import SearchDropdown from "../SearchDropdown";
import SpinnerTimePicker from "../SpinnerTimePicker";
import SpinnerDatePicker from "../SpinnerDatePicker";
import { getNames } from "country-list";
import SignPad from "./SignPad";

const LeaveApplication = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [leaveData, setLeaveData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [showDateSpinner, setShowDateSpinner] = useState(false);
  const [showLeaveFromDateSpinner, setShowLeaveFromDateSpinner] =
    useState(false);
  const [showLeaveToDateSpinner, setShowLeaveToDateSpinner] = useState(false);
  const [showToilFromDateSpinner, setShowToilFromDateSpinner] = useState(false);
  const [showToilToDateSpinner, setShowToilToDateSpinner] = useState(false);
  const [showRejoinDateSpinner, setShowRejoinDateSpinner] = useState(false);
  const [showVisaDateSpinner, setShowVisaDateSpinner] = useState(false);
  const [showDateOfJoinDateSpinner, setShowDateOfJoinDateSpinner] =
    useState(false);
  const [showPassDateSpinner, setShowPassDateSpinner] = useState(false);
  const [showFinalDateSpinner, setShowFinalDateSpinner] = useState(false);

  const countries = getNames();
  const inputStyle =
    "text-lg w-full  border  border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] ";

  const labelStyle = "text-md text-[oklch(0.147_0.004_49.25)] my-1 block";

  const defaultFormData = {
    employee: "",
    location: "",
    enrollmentId: "",
    designation: "",
    date: null,
    nationality: "",

    natureofleave: {
      annualLeave: false,
      sickleave: false,
      toil: false,
      unpaidLeave: false,
      cpmpassionLeave: false,
      emergencyLeave: false,
      maternalLeave: false,
      paternalLeave: false,
      othersSpecify: "",
    },
    calenderDaysLeave: "",
    leaveFrom: null,
    leaveTo: null,
    toilReq: "",

    calenderDaystoil: "",
    toilFrom: null,
    toilTo: null,

    calenderDaysLeaveToil: "",
    actualDays: "",
    rejoinDate: null,
    reasonForLeave: "",
    visaExpiry: null,
    emergencyContact: "",
    signature: null,

    adminoperation: {
      dateOfJoin: null,
      leaveDays: "",
      leavenature: "",
      totalEntitlement: "",
      leaveAvailed: "",
      openingBalance: "",
      leaveGranted: "",
      newBalance: "",
      remarks: "",
      nonApproveReason: "",
    },
    leaveGranted: "",
    leaveGrantedFrom: "",
    leaveGrantedTo: "",

    finalApproval: {
      approval1Name: "",
      nonApprove1Reason: "",
      upload1: "",
      approval2Name: "",
      nonApprove2Reason: "",
      upload2: "",
    },
    passportCollection: {
      applicantName: "",
      signature: "",
      date: null,
    },

    employeeForm: {
      signature: null,
      homeCountrycontact1: "",
      name: "",
      homeCountrycontact2: "",
      idNo: "",
      emailAddress: "",
      date: "",
      countryAddress: "",
    },
    finalSignature: null,
    sign: null,
    approval1sign: null,
    approval2sign: null,
    passportsign: null,
    finalsign: null,
  };

  const [formData, setFormData] = useState(defaultFormData);

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

  const currentleaveData = leaveData.slice(startIndex, endIndex);

  const totalPages = Math.max(1, Math.ceil(leaveData.length / entriesPerPage));

  // Handle submit
  const handleSubmit = () => {
    const newEntry = {
      id: editId ? editId : Date.now(),
      ...formData,
    };

    if (editId) {
      const updated = leaveData.map((item) =>
        item.id === editId ? { ...item, ...newEntry } : item,
      );

      setLeaveData(updated);

      // Backend version
      // await axios.put(`/api/manual-entry/${editId}`, newEntry)

      toast.success("Request Updated");
    } else {
      const updated = [...leaveData, newEntry];
      setLeaveData(updated);

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
    const updated = leaveData.filter((v) => v.id !== id);

    setLeaveData(
      updated.map((item) => ({
        ...item,
      })),
    );

    toast.success("Deleted Successfully");
  };

  const handleCopy = () => {
    const header = [
      "Employee",
      "Location",
      "Enrollment Id",
      "Designation",
    ].join("\t");

    const rows = leaveData
      .map((item) => {
        return [
          item.employee,
          item.location,
          item.enrollmentId,
          item.designation,
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = leaveData.map((item) => ({
      Employee: item.employee,
      Location: item.location,
      EnrollmentId: item.enrollmentId,
      Designation: item.designation,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "LeaveApplicationData");

    XLSX.writeFile(workbook, "LeaveApplicationData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "Employee",
      "Location",
      "Enrollment Id",
      "Designation",
    ];

    const tableRows = [];

    leaveData.forEach((item) => {
      const row = [
        item.employee,
        item.location,
        item.enrollmentId,
        item.designation,
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("LeaveApplicationData.pdf");
  };

  return (
    <div className="mb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
          <FaAngleRight />
          Forms
          <FaAngleRight />
          <div onClick={() => setOpenModal(false)} className="cursor-pointer">
            Leave Application
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
            className="bg-[oklch(0.645_0.246_16.439)] text-white px-4 py-2 rounded-md"
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

                  <th className="p-2 font-semibold">Employee</th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Location
                  </th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Enrollment ID
                  </th>

                  <th className="p-2 font-semibold hidden lg:table-cell">
                    Designation
                  </th>

                  <th className="p-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentleaveData.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="lg:text-center p-10 ">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentleaveData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                    >
                      <td className="p-2 whitespace-nowrap hidden sm:table-cell">
                        {index + 1}
                      </td>

                      <td className="p-2">{item.employee}</td>

                      <td className="p-2 hidden md:table-cell">
                        {item.location}
                      </td>

                      <td className="p-2 hidden md:table-cell">
                        {item.enrollmentId}
                      </td>
                      <td className="p-2 hidden lg:table-cell">
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
              Showing {leaveData.length === 0 ? "0" : startIndex + 1} to{" "}
              {Math.min(endIndex, leaveData.length)} of {leaveData.length}{" "}
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
              <div
                className="max-h-[75vh] overflow-y-auto pr-2 text-sm"
                style={{ scrollbarWidth: "none" }}
              >
                {/*  Details  */}
                <div>
                  <h1 className="bg-gray-200 py-1 px-3 border border-gray-400 text-lg rounded">
                    I. To be filled by the Employee in Capitals
                  </h1>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-2 gap-4">
                    <div className="flex flex-row gap-2">
                      <h1 className="w-1/3 mt-2">
                        Name <span className="text-red-500">*</span>
                      </h1>
                      <div className="w-full">
                        <SearchDropdown
                          label=""
                          name="employee"
                          value={formData.employee}
                          options={["Employee 1", "Employee 2"]}
                          formData={formData}
                          setFormData={setFormData}
                          disabled={mode === "view"}
                          inputStyle={inputStyle}
                          labelStyle={labelStyle}
                        />
                      </div>
                    </div>

                    <div className="flex flex-row gap-2">
                      <label className={`${labelStyle} w-1/3`}>Id No: </label>
                      <input
                        name="enrollmentId"
                        value={formData.enrollmentId}
                        onChange={handleChange}
                        className={inputStyle}
                        disabled={mode === "view"}
                      />
                    </div>

                    <div className="flex flex-row gap-2 relative">
                      <label className={`${labelStyle}  w-1/3`}>Date: </label>
                      <input
                        name="date"
                        value={formData.date || ""}
                        onChange={handleChange}
                        onClick={() => setShowDateSpinner(true)}
                        disabled={mode === "view"}
                        placeholder="dd/mm/yyyy"
                        className={inputStyle}
                      />

                      {showDateSpinner && (
                        <div className="absolute mt-10 ml-8 sm:ml-14 md:ml-16 lg:ml-20 ">
                          <SpinnerDatePicker
                            value={formData.date}
                            onChange={(date) =>
                              setFormData((prev) => ({
                                ...prev,
                                date: date,
                              }))
                            }
                            onClose={() => setShowDateSpinner(false)}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row gap-2">
                      <h1 className="w-1/3 mt-2">
                        Desination <span className="text-red-500">*</span>
                      </h1>
                      <div className="w-full">
                        <SearchDropdown
                          label=""
                          name="designation"
                          value={formData.designation}
                          options={[
                            "Regional Sales Support Manager",
                            "Operations Support Officer",
                            "Finance Assistant",
                            "Trade Finance Specialist",
                            "Banking Operations Officer",
                            "Sales Support Officer",
                            "Banking Operations Officer",
                            "Project Manager",
                            "Administrative Assistant",
                            "Sales Officer",
                            "Banking Officer",
                            "Sales Manager",
                            "Senior Banking Officer",
                            "Client Service Manager",
                            "Senior Director – Banking Operations",
                            "Relationship Officer",
                            "Accountant",
                            "Director – Sales Excellence",
                            "Service Sales Support Officer",
                            "HR Manager",
                            "Sales & Logistics Officer",
                            "Operation Officer",
                          ]}
                          formData={formData}
                          setFormData={setFormData}
                          disabled={mode === "view"}
                          inputStyle={inputStyle}
                          labelStyle={labelStyle}
                        />
                      </div>
                    </div>

                    <div className="flex flex-row gap-2">
                      <h1 className="w-1/3 mt-2">
                        Nationality <span className="text-red-500">*</span>
                      </h1>
                      <div className="w-full">
                        <SearchDropdown
                          label=""
                          name="nationality"
                          value={formData.nationality}
                          options={countries}
                          formData={formData}
                          setFormData={setFormData}
                          disabled={mode === "view"}
                          inputStyle={inputStyle}
                          labelStyle={labelStyle}
                        />
                      </div>
                    </div>

                    <div className="flex flex-row gap-2">
                      <h1 className="w-1/3 mt-2">
                        Location <span className="text-red-500">*</span>
                      </h1>
                      <div className="w-full">
                        <SearchDropdown
                          label=""
                          name="location"
                          value={formData.location}
                          options={["Head Office"]}
                          formData={formData}
                          setFormData={setFormData}
                          disabled={mode === "view"}
                          inputStyle={inputStyle}
                          labelStyle={labelStyle}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nature of Leave */}
                <div className="mt-6 flex flex-col lg:flex-row gap-4">
                  <div className="lg:w-1/4 font-medium">Nature of Leave:</div>

                  <div className="lg:w-3/4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {[
                      { label: "Annual Leave", name: "annualLeave" },
                      { label: "Sick Leave", name: "sickleave" },
                      { label: "TOIL", name: "toil" },
                      { label: "Unpaid Leave", name: "unpaidLeave" },
                      { label: "Compassionate Leave", name: "cpmpassionLeave" },
                      { label: "Emergency Leave", name: "emergencyLeave" },
                      { label: "Maternal Leave", name: "maternalLeave" },
                      { label: "Paternal Leave", name: "paternalLeave" },
                    ].map((item) => (
                      <label
                        key={item.name}
                        className="flex items-center gap-2 text-lg"
                      >
                        <input
                          type="checkbox"
                          name={item.name}
                          checked={formData.natureofleave[item.name]}
                          onChange={(e) => handleChange(e, "natureofleave")}
                          disabled={mode === "view"}
                        />
                        {item.label}
                      </label>
                    ))}

                    {/* Others */}
                    <div className="col-span-2 flex items-center gap-2">
                      <label className="flex items-center gap-2 text-lg">
                        <input
                          type="checkbox"
                          name="othersSpecify"
                          checked={!!formData.natureofleave.othersSpecify}
                          onChange={(e) =>
                            handleChange(
                              {
                                target: {
                                  name: "othersSpecify",
                                  value: e.target.checked ? "" : "",
                                },
                              },
                              "natureofleave",
                            )
                          }
                          disabled={mode === "view"}
                        />
                        Others (specify)
                      </label>

                      <input
                        type="text"
                        name="othersSpecify"
                        value={formData.natureofleave.othersSpecify}
                        onChange={(e) => handleChange(e, "natureofleave")}
                        placeholder="Enter here"
                        className={inputStyle}
                        disabled={mode === "view"}
                      />
                    </div>
                  </div>
                </div>

                {/* Calender of Days of Leave */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-row">
                    <label className={labelStyle}>
                      Total Calender Days of Leave requested
                    </label>
                    <input
                      name="calenderDaysLeave"
                      value={formData.calenderDaysLeave}
                      onChange={handleChange}
                      className={`${inputStyle} placeholder-gray-400`}
                      disabled={mode === "view"}
                      placeholder="Number Only"
                    />
                  </div>
                  <div className="flex flex-row relative">
                    <label className={labelStyle}>
                      Period of Leave From (Start Date)
                    </label>
                    <input
                      name="leaveFrom"
                      value={formData.leaveFrom || ""}
                      onChange={handleChange}
                      onClick={() => setShowLeaveFromDateSpinner(true)}
                      disabled={mode === "view"}
                      placeholder="dd/mm/yyyy"
                      className={inputStyle}
                    />

                    {showLeaveFromDateSpinner && (
                      <div className="absolute mt-14">
                        <SpinnerDatePicker
                          value={formData.leaveFrom}
                          onChange={(date) =>
                            setFormData((prev) => ({
                              ...prev,
                              leaveFrom: date,
                            }))
                          }
                          onClose={() => setShowLeaveFromDateSpinner(false)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row relative">
                    <label className={labelStyle}>To (End Date)</label>
                    <input
                      name="leaveFrom"
                      value={formData.leaveFrom || ""}
                      onChange={handleChange}
                      onClick={() => setShowLeaveToDateSpinner(true)}
                      disabled={mode === "view"}
                      placeholder="dd/mm/yyyy"
                      className={inputStyle}
                    />

                    {showLeaveToDateSpinner && (
                      <div className="absolute mt-14">
                        <SpinnerDatePicker
                          value={formData.leaveFrom}
                          onChange={(date) =>
                            setFormData((prev) => ({
                              ...prev,
                              leaveFrom: date,
                            }))
                          }
                          onClose={() => setShowLeaveToDateSpinner(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-row gap-6">
                  <h1>TOIL (Time off in lieu) requested:</h1>
                  <label>
                    <input
                      type="radio"
                      name="toilReq"
                      value={formData.toilReq}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="toilReq"
                      value={formData.toilReq}
                    />
                    No
                  </label>
                </div>

                {/* Calender of Days of Toil */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-row">
                    <label className={labelStyle}>
                      Total Calender Days of Toil requested
                    </label>
                    <input
                      name="calenderDaystoil"
                      value={formData.calenderDaystoil}
                      onChange={handleChange}
                      className={`${inputStyle} placeholder-gray-400`}
                      disabled={mode === "view"}
                      placeholder="Number Only"
                    />
                  </div>
                  <div className="flex flex-row gap-1 relative">
                    <label className={labelStyle}>
                      Period of Toil From (Start Date)
                    </label>
                    <input
                      name="toilFrom"
                      value={formData.toilFrom || ""}
                      onChange={handleChange}
                      onClick={() => setShowToilFromDateSpinner(true)}
                      disabled={mode === "view"}
                      placeholder="dd/mm/yyyy"
                      className={inputStyle}
                    />

                    {showToilFromDateSpinner && (
                      <div className="absolute mt-14">
                        <SpinnerDatePicker
                          value={formData.toilFrom}
                          onChange={(date) =>
                            setFormData((prev) => ({
                              ...prev,
                              toilFrom: date,
                            }))
                          }
                          onClose={() => setShowToilFromDateSpinner(false)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row relative">
                    <label className={labelStyle}>To (End Date)</label>
                    <input
                      name="toilTo"
                      value={formData.toilTo || ""}
                      onChange={handleChange}
                      onClick={() => setShowToilToDateSpinner(true)}
                      disabled={mode === "view"}
                      placeholder="dd/mm/yyyy"
                      className={inputStyle}
                    />

                    {showToilToDateSpinner && (
                      <div className="absolute mt-14">
                        <SpinnerDatePicker
                          value={formData.toilTo}
                          onChange={(date) =>
                            setFormData((prev) => ({
                              ...prev,
                              toilTo: date,
                            }))
                          }
                          onClose={() => setShowToilToDateSpinner(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Calender of Days of Toil */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-row">
                    <label className={labelStyle}>
                      Total Calender Days of Leave/s reuqested = Leave + Toil
                    </label>
                    <input
                      name="calenderDaysLeaveToil"
                      value={formData.calenderDaysLeaveToil}
                      onChange={handleChange}
                      className={`${inputStyle} placeholder-gray-400`}
                      disabled={mode === "view"}
                      placeholder="Number Only"
                    />
                  </div>

                  <div className="flex flex-row">
                    <label className={labelStyle}>
                      Total Actual Days of Leave requested = Leave + Toil
                    </label>
                    <input
                      name="actualDays"
                      value={formData.actualDays}
                      onChange={handleChange}
                      className={`${inputStyle} placeholder-gray-400`}
                      disabled={mode === "view"}
                      placeholder="Number Only"
                    />
                  </div>

                  <div className="flex flex-row relative">
                    <label className={labelStyle}>Rejoining Date</label>
                    <input
                      name="rejoinDate"
                      value={formData.rejoinDate || ""}
                      onChange={handleChange}
                      onClick={() => setShowRejoinDateSpinner(true)}
                      disabled={mode === "view"}
                      placeholder="dd/mm/yyyy"
                      className={inputStyle}
                    />

                    {showRejoinDateSpinner && (
                      <div className="absolute mt-14">
                        <SpinnerDatePicker
                          value={formData.rejoinDate}
                          onChange={(date) =>
                            setFormData((prev) => ({
                              ...prev,
                              rejoinDate: date,
                            }))
                          }
                          onClose={() => setShowRejoinDateSpinner(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-row">
                    <label className={labelStyle}>
                      Reason for Leave, in case of Emergency / Unpaid Leave:
                    </label>
                    <input
                      name="reasonForLeave"
                      value={formData.reasonForLeave}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={`${inputStyle} placeholder-gray-400`}
                    />
                  </div>

                  <div className="flex flex-row relative">
                    <label className={labelStyle}>
                      VISA/SIRA License Expiry Date
                    </label>
                    <input
                      name="visaExpiry"
                      value={formData.visaExpiry || ""}
                      onChange={handleChange}
                      onClick={() => setShowVisaDateSpinner(true)}
                      disabled={mode === "view"}
                      placeholder="dd/mm/yyyy"
                      className={inputStyle}
                    />

                    {showVisaDateSpinner && (
                      <div className="absolute mt-14">
                        <SpinnerDatePicker
                          value={formData.visaExpiry}
                          onChange={(date) =>
                            setFormData((prev) => ({
                              ...prev,
                              visaExpiry: date,
                            }))
                          }
                          onClose={() => setShowVisaDateSpinner(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <h1 className={`${labelStyle} mt-4 font-medium`}>
                  Declaration
                </h1>
                <ul className="text-sm">
                  <li>
                    • I understand that given leave policies and procedures are
                    for betterment for employees and manpower planning of the
                    company
                  </li>
                  <li>
                    • I have submitted a valid return ticket and assure you that
                    I will resume my work on the indicated rejoining date
                    without fail. If not, the company has the right to take
                    disciplinary action against me, which might lead to
                    termination of my employment contract.
                  </li>
                  <li>
                    • I hereby agree that as per Article 78 of Section 2 of
                    Chapter 4 of Working hours and leaves of the UAE Labor Law,
                    I am only entitled to receive basic salary during period of
                    my annual leave.
                  </li>
                  <li>
                    • I hereby declare that I have read and understood the leave
                    overstay policies and procedures at the back hereof.
                  </li>
                  <li>
                    {" "}
                    • I hereby confirm that I have read and understood the terms
                    of leave presented and briefed to me. I have taken the time
                    to review this document and have raised, and discussed any
                    queries directly with Safecor Security management prior to
                    submitting this declaration.
                  </li>
                </ul>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>
                      Emergency Contact No. During the leave:
                    </label>
                    <input
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      className={`${inputStyle} placeholder-gray-400`}
                      disabled={mode === "view"}
                      placeholder="Numbers Only"
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>
                      Signature of the Employee:
                    </label>

                    <input
                      type="file"
                      name="signature"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          signature: e.target.files[0],
                        }))
                      }
                      className={inputStyle}
                      disabled={mode === "view"}
                    />
                    <SignPad
                      fieldName="sign"
                      formData={formData}
                      setFormData={setFormData}
                      mode={mode}
                    />
                  </div>
                </div>

                <h1 className="bg-gray-200 py-1 mt-6 px-3 border border-gray-400 text-lg rounded">
                  II. To be filled by the Admin Operations
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
                  <div className="flex flex-row relative">
                    <label className={`${labelStyle} md:w-2/3`}>
                      Employee's Date of Joining
                    </label>
                    <input
                      name="dateOfJoin"
                      value={formData.adminoperation.dateOfJoin || ""}
                      onChange={handleChange}
                      onClick={() => setShowDateOfJoinDateSpinner(true)}
                      disabled={mode === "view"}
                      placeholder="dd/mm/yyyy"
                      className={inputStyle}
                    />

                    {showDateOfJoinDateSpinner && (
                      <div className="absolute mt-14">
                        <SpinnerDatePicker
                          value={formData.adminoperation.dateOfJoin}
                          onChange={(date) =>
                            setFormData((prev) => ({
                              ...prev,
                              adminoperation: {
                                ...prev.adminoperation,
                                dateOfJoin: date,
                              },
                            }))
                          }
                          onClose={() => setShowDateOfJoinDateSpinner(false)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row">
                    <label className={`${labelStyle} md:w-2/3`}>
                      Leave Days Due up to:
                    </label>
                    <input
                      name="leaveDays"
                      value={formData.adminoperation.leaveDays}
                      onChange={handleChange}
                      className={`${inputStyle} placeholder-gray-400`}
                      disabled={mode === "view"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mt-4 gap-2">
                  <div>
                    <h1 className={labelStyle}>Nature of Leave</h1>
                    <div className="w-full">
                      {" "}
                      <SearchDropdown
                        label=""
                        name="leavenature"
                        value={formData.adminoperation.leavenature}
                        options={[
                          "Annual Leave",
                          "Carry Forward",
                          "Sick Leave",
                          "Unpaid Leave",
                          "Maternity Leave",
                          "Paternity Leave",
                          "Compensatory Leave",
                          "Compassionate / Bereavement Leave",
                        ]}
                        formData={formData}
                        setFormData={setFormData}
                        disabled={mode === "view"}
                        inputStyle={inputStyle}
                        labelStyle={labelStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelStyle}>Total Entitltment(Nos)</label>
                    <input
                      name="totalEntitlement"
                      value={formData.adminoperation.totalEntitlement}
                      onChange={handleChange}
                      className={`${inputStyle} placeholder-gray-400`}
                      disabled={mode === "view"}
                      placeholder="Number only"
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Leave Availed(Nos)</label>
                    <input
                      name="leaveAvailed"
                      value={formData.adminoperation.leaveAvailed}
                      onChange={handleChange}
                      className={`${inputStyle} placeholder-gray-400`}
                      disabled={mode === "view"}
                      placeholder="Number only"
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Opening Balance (Nos)</label>
                    <input
                      name="openingBalance"
                      value={formData.adminoperation.openingBalance}
                      onChange={handleChange}
                      className={`${inputStyle} placeholder-gray-400`}
                      disabled={mode === "view"}
                      placeholder="Number only"
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Leave Granted (Nos)</label>
                    <input
                      name="leaveGranted"
                      value={formData.adminoperation.leaveGranted}
                      onChange={handleChange}
                      className={`${inputStyle} placeholder-gray-400`}
                      disabled={mode === "view"}
                      placeholder="Number only"
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>New Balance (Nos)</label>
                    <input
                      name="newBalance"
                      value={formData.adminoperation.newBalance}
                      onChange={handleChange}
                      className={`${inputStyle} placeholder-gray-400`}
                      disabled={mode === "view"}
                      placeholder="Number only"
                    />
                  </div>
                </div>

                <div className="flex flex-row md:w-7/12 mt-4">
                  <label className={`${labelStyle} md:w-1/3`}>
                    Remarks if any :
                  </label>
                  <input
                    name="remarks"
                    value={formData.adminoperation.remarks}
                    onChange={handleChange}
                    className={`${inputStyle} placeholder-gray-400`}
                    disabled={mode === "view"}
                  />
                </div>

                <div className="flex flex-row mt-4">
                  <label className={`${labelStyle} md:w-3/5`}>
                    Reason for non-approval? (only if leave request rejected)
                  </label>
                  <input
                    name="nonApproveReason"
                    value={formData.adminoperation.nonApproveReason}
                    onChange={handleChange}
                    className={`${inputStyle} placeholder-gray-400`}
                    disabled={mode === "view"}
                  />
                </div>

                {/* LEave granted*/}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-row gap-4">
                    <h1 className={labelStyle}> Leave Granted ?</h1>

                    <label className="mt-1">
                      <input
                        type="radio"
                        name="leaveGranted"
                        value={formData.adminoperation.leaveGranted}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />{" "}
                      Yes
                    </label>
                    <label className="mt-1">
                      <input
                        type="radio"
                        name="leaveGranted"
                        value={formData.leaveGranted}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />
                      No
                    </label>
                  </div>

                  <div className="flex flex-row relative gap-4">
                    <label className={labelStyle}>From</label>
                    <input
                      name="leaveGrantedFrom"
                      value={formData.leaveGrantedFrom || ""}
                      onChange={handleChange}
                      onClick={() => setShowLeaveFromDateSpinner(true)}
                      disabled={mode === "view"}
                      placeholder="dd/mm/yyyy"
                      className={inputStyle}
                    />

                    {showLeaveFromDateSpinner && (
                      <div className="absolute mt-14">
                        <SpinnerDatePicker
                          value={formData.leaveGrantedFrom}
                          onChange={(date) =>
                            setFormData((prev) => ({
                              ...prev,
                              leaveGrantedFrom: date,
                            }))
                          }
                          onClose={() => setShowLeaveFromDateSpinner(false)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row relative gap-4">
                    <label className={labelStyle}>To</label>
                    <input
                      name="leaveGrantedTo"
                      value={formData.leaveGrantedTo || ""}
                      onChange={handleChange}
                      onClick={() => setShowLeaveToDateSpinner(true)}
                      disabled={mode === "view"}
                      placeholder="dd/mm/yyyy"
                      className={inputStyle}
                    />

                    {showLeaveToDateSpinner && (
                      <div className="absolute mt-14">
                        <SpinnerDatePicker
                          value={formData.leaveGrantedTo}
                          onChange={(date) =>
                            setFormData((prev) => ({
                              ...prev,
                              leaveGrantedTo: date,
                            }))
                          }
                          onClose={() => setShowLeaveToDateSpinner(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <h1 className="bg-gray-200 py-1 mt-6 px-3 border border-gray-400 text-lg rounded">
                  III. Final Approvals
                </h1>

                <div className="md:flex md:flex-row gap-6 mt-4">
                  <div>
                    <h1 className="text-lg font-medium">Approval - 1</h1>
                    <div className="flex flex-row gap-2 mt-2">
                      <label className={labelStyle}>
                        Ops Representative (Name/ Signature/Date)
                      </label>
                      <input
                        className={inputStyle}
                        name="approval1Name"
                        value={formData.finalApproval.approval1Name}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />
                    </div>
                    <div className="flex flex-row gap-2 mt-2">
                      <label className={labelStyle}>
                        Reason for non-approval?
                      </label>
                      <input
                        className={inputStyle}
                        name="nonApprove1Reason"
                        value={formData.finalApproval.nonApprove1Reason}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />
                    </div>
                    <div className="mt-2">
                      <input
                        type="file"
                        name="upload1"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            finalApproval: {
                              ...prev.finalApproval,
                              upload1: e.target.files[0],
                            },
                          }))
                        }
                        className={inputStyle}
                        disabled={mode === "view"}
                      />
                      <SignPad
                        fieldName="approval1sign"
                        formData={formData}
                        setFormData={setFormData}
                        mode={mode}
                      />
                    </div>
                  </div>

                  <div>
                    <h1 className="text-lg font-medium">Approval - 2</h1>
                    <div className="flex flex-row gap-2 mt-2">
                      <label className={labelStyle}>
                        HR Representative (Name/ Signature/Date)
                      </label>
                      <input
                        className={inputStyle}
                        name="approval2Name"
                        value={formData.finalApproval.approval2Name}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />
                    </div>
                    <div className="flex flex-row gap-2 mt-2">
                      <label className={labelStyle}>
                        Reason for non-approval?
                      </label>
                      <input
                        className={inputStyle}
                        name="nonApprove2Reason"
                        value={formData.finalApproval.nonApprove2Reason}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />
                    </div>
                    <div className="mt-2">
                      <input
                        type="file"
                        name="upload2"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            finalApproval: {
                              ...prev.finalApproval,
                              upload2: e.target.files[0],
                            },
                          }))
                        }
                        className={inputStyle}
                        disabled={mode === "view"}
                      />
                      <SignPad
                        fieldName="approval2sign"
                        formData={formData}
                        setFormData={setFormData}
                        mode={mode}
                      />
                    </div>
                  </div>
                </div>

                <h1 className="bg-gray-200 py-1 mt-6 px-3 border border-gray-400 text-lg rounded">
                  III. Passport Collection
                </h1>

                <p className=" mt-2">
                  Only to be issued if leave has approved and a valid return
                  ticket is available I have collected my passport from the HR
                  Department.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-row gap-2 mt-2">
                    <label className={`whitespace-nowrap ${labelStyle}`}>
                      Applicant's Name
                    </label>
                    <input
                      className={inputStyle}
                      name="applicantName"
                      value={formData.passportCollection.applicantName}
                      onChange={handleChange}
                      disabled={mode === "view"}
                    />
                  </div>
                  <div>
                    <div className="flex flex-row gap-2 mt-2">
                      <label className={labelStyle}>Signature</label>
                      <input
                        type="file"
                        name="signature"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            passportCollection: {
                              ...prev.passportCollection,
                              signature: e.target.files[0],
                            },
                          }))
                        }
                        className={inputStyle}
                        disabled={mode === "view"}
                      />
                    </div>
                    <SignPad
                      fieldName="passportsign"
                      formData={formData}
                      setFormData={setFormData}
                      mode={mode}
                    />
                  </div>

                  <div className="flex flex-row relative gap-2 mt-2">
                    <label className={labelStyle}>Date</label>
                    <input
                      name="date"
                      value={formData.passportCollection.date || ""}
                      onChange={handleChange}
                      onClick={() => setShowPassDateSpinner(true)}
                      disabled={mode === "view"}
                      placeholder="dd/mm/yyyy"
                      className={inputStyle}
                    />

                    {showPassDateSpinner && (
                      <div className="absolute mt-14">
                        <SpinnerDatePicker
                          value={formData.passportCollection.date}
                          onChange={(date) =>
                            setFormData((prev) => ({
                              ...prev,
                              date: date,
                            }))
                          }
                          onClose={() => setShowPassDateSpinner(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <h1 className="font-medium mt-6"> Policies </h1>
                <ol className="list-decimal ml-5 mt-2">
                  <li>
                    All employees are responsible for their health and safety
                    during the leave period.
                  </li>
                  <li>
                    {" "}
                    All employees must return from vacation/leave on the date
                    specified in their Leave Application Form.
                  </li>{" "}
                  <li>
                    All employees must report to quarantine facility upon return
                    at their own cost, and stays there unless tested negative
                    for COVID-19.
                  </li>{" "}
                  <li>
                    {" "}
                    In case of tested positive for COVID-19, you will be on
                    unpaid leave (LOP) unless tested negative or quarantine is
                    over (DHA directives will be followed for quarantine period
                    and covid-19 positive cases etc.)
                  </li>{" "}
                  <li>
                    The operations department should be directly contacted at
                    resource.planner@safecorsecurity.ae and
                    ops.supervisor@safecorsecurity.ae CC
                    ops.admin@safecorsecurity.ae (via email only) to make any
                    communication during annual leave. Note: It is the
                    responsibility of the employee to confirm that the
                    authorized person has been contacted. A communication made
                    through any other means of media will not be considered
                    valid e.g. whats app messages, text messages, BOTIM calls or
                    messages etc.
                  </li>{" "}
                  <li>
                    {" "}
                    The employee’s name and signature should be an exact match
                    as in the passport, any discrepancies found may lead to
                    rejection of the leave request
                  </li>{" "}
                  <li>
                    The given return tickets should be valid and will further be
                    confirmed with airlines before issuing approval for the
                    requested leave days
                  </li>{" "}
                  <li>
                    It is the sole responsibility of the employee to apply for
                    the COVID test and return permits (if applicable) to rejoin
                    the work in time. Leave extension demanded by giving
                    reference of these both will be considered invalid, and
                    subject to the following disciplinary action/s. The
                    employees must submit GDRFA/ICA return permits before
                    leaving for home country.{" "}
                  </li>
                  <li>
                    Any employee who extends their absence beyond the specified
                    rejoining date will be subject to disciplinary action, which
                    might lead to termination of the employment contract, unless
                    stated otherwise. An unjustified Leave overstay will receive
                    the following disciplinary action:
                    <ol className="list-[lower-roman]">
                      <li className="ml-4">
                        {" "}
                        The company reserve the right to terminate the
                        employee’s contract without notice and deprive the
                        employee of his end of service gratuity as per article
                        120 of UAE Labor Law or
                      </li>
                      <li className="ml-4">
                        {" "}
                        The company may decide to impose the following fines at
                        its sole discretion, to recover the cost of employing an
                        outsource staff to cover the position due to leave
                        extension, even if the reason of is justified:
                      </li>
                      <div className="flex justify-center text-center">
                        <table className="border">
                          <thead className="border ">
                            <th className="border py-1 px-3">Sno</th>
                            <th className="border p-1 px-3">Date Overstayed</th>
                            <th className="border p-1 px-3">
                              Fine Imposed AED /day
                            </th>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border">1</td>
                              <td className="border">1 - 15</td>
                              <td className="border">50</td>
                            </tr>
                            <tr>
                              <td className="border">2</td>
                              <td className="border">16 - 30</td>
                              <td className="border">70</td>
                            </tr>
                            <tr>
                              <td className="border">3</td>
                              <td className="border">31 - 45</td>
                              <td className="border">75</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <li className="ml-4">
                        The company reserve the right to evaluate employees’
                        request and categorise into justified or unjustified.
                      </li>
                      <li className="ml-4">
                        The employee shall acknowledge the overstay policy.
                      </li>
                    </ol>
                  </li>{" "}
                </ol>
                <p className="mt-4 font-medium">
                  “I hereby declare that I have read and understood the leave
                  overstay policy. I acknowledge that if I overstay my leave
                  date without prior approval by the management for any reason,
                  the company may consider the same as resignation and will have
                  the right to terminate my contract and deport me to my home
                  country on my own cost.”
                </p>

                <h1 className="bg-gray-200 py-1 mt-6 px-3 border border-gray-400 text-lg rounded">
                  I.TO BE FILLED BY THE EMPLOYEE IN CAPITALS
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
                  <div className="flex flex-row gap-2">
                    <label className={labelStyle}>Signature</label>
                    <input
                      type="file"
                      name="signature"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          employeeForm: {
                            ...prev.employeeForm,
                            signature: e.target.files[0],
                          },
                        }))
                      }
                      className={inputStyle}
                      disabled={mode === "view"}
                    />
                  </div>

                  <div className="flex flex-row gap-2">
                    <label className={labelStyle}>
                      Home country contact no. 1:
                    </label>
                    <input
                      className={inputStyle}
                      name="homeCountrycontact1"
                      value={formData.employeeForm.homeCountrycontact1}
                      onChange={handleChange}
                      disabled={mode === "view"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
                  <div className="flex flex-row gap-2">
                    <label className={labelStyle}>Name:</label>
                    <input
                      className={inputStyle}
                      name="name"
                      value={formData.employeeForm.name}
                      onChange={handleChange}
                      disabled={mode === "view"}
                    />
                  </div>
                  <div className="flex flex-row gap-2">
                    <label className={labelStyle}>
                      Home country contact no. 2:
                    </label>
                    <input
                      className={inputStyle}
                      name="homeCountrycontact2"
                      value={formData.employeeForm.homeCountrycontact2}
                      onChange={handleChange}
                      disabled={mode === "view"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
                  <div className="flex flex-row gap-2">
                    <label className={labelStyle}>ID No.:</label>
                    <input
                      className={inputStyle}
                      name="idNo"
                      value={formData.employeeForm.idNo}
                      onChange={handleChange}
                      disabled={mode === "view"}
                    />
                  </div>
                  <div className="flex flex-row gap-2">
                    <label className={labelStyle}>Valid Email address :</label>
                    <input
                      className={inputStyle}
                      name="emailAddress"
                      value={formData.employeeForm.emailAddress}
                      onChange={handleChange}
                      disabled={mode === "view"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="flex flex-row gap-2 mt-4 relative">
                    <label className={labelStyle}>Date</label>
                    <input
                      name="date"
                      value={formData.employeeForm.date || ""}
                      onChange={handleChange}
                      onClick={() => setShowFinalDateSpinner(true)}
                      disabled={mode === "view"}
                      placeholder="dd/mm/yyyy"
                      className={inputStyle}
                    />

                    {showFinalDateSpinner && (
                      <div className="absolute mt-14">
                        <SpinnerDatePicker
                          value={formData.employeeForm.date}
                          onChange={(date) =>
                            setFormData((prev) => ({
                              ...prev,
                              employeeForm: {
                                ...prev.employeeForm,
                                date: date,
                              },
                            }))
                          }
                          onClose={() => setShowFinalDateSpinner(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="gap-2 mt-4 ">
                  <label className={labelStyle}>
                    {" "}
                    A valid Home Country Address : (House No, Street No, Area
                    Name, City Name, State/Province Name, Country Name, Postal
                    Code)
                  </label>
                  <textarea
                    className={inputStyle}
                    name="countryAddress"
                    value={formData.employeeForm.countryAddress}
                    onChange={handleChange}
                    disabled={mode === "view"}
                  />
                </div>

                <div className="mt-4 flex flex-row gap-2">
                  <label className={labelStyle}>Signature</label>
                  <input
                    type="file"
                    name="finalSignature"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        finalSignature: e.target.files[0],
                      }))
                    }
                    className={inputStyle}
                    disabled={mode === "view"}
                  />
                </div>
                <SignPad
                  fieldName="finalsign"
                  formData={formData}
                  setFormData={setFormData}
                  mode={mode}
                />

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
      )}
    </div>
  );
};

export default LeaveApplication;

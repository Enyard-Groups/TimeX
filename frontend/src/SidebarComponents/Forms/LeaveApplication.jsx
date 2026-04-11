/* eslint-disable no-prototype-builtins */
import React, { useEffect, useState } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
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
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base  rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm";
  const labelStyle =
    "text-sm xl:text-base  focus:outline-none font-semibold text-gray-700 mb-2 block";

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
    signatureMode: "", // "draw" | "upload"
    signaturehere: null,
    signaturePreview: null,

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
      upload1signature: null,
      upload1signaturePreview: null,
      upload1signaturehere: null,
      upload1signatureMode: "",
      approval2Name: "",
      nonApprove2Reason: "",
      upload2signature: null,
      upload2signaturePreview: null,
      upload2signaturehere: null,
      upload2signatureMode: "",
    },
    passportCollection: {
      applicantName: "",
      signature: null,
      signaturehere: null,
      signatureMode: "",
      signaturePreview: null,
      date: null,
    },

    employeeForm: {
      signature: null,
      signaturehere: null,
      signatureMode: "",
      signaturePreview: null,
      homeCountrycontact1: "",
      name: "",
      homeCountrycontact2: "",
      idNo: "",
      emailAddress: "",
      date: "",
      countryAddress: "",
    },
    finalSignature: null,
    finalSignatureHere: null,
    finalSignatureMode: "",
    finalSignaturePreview: null,
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

  const filteredleaveData = leaveData.filter(
    (x) =>
      x.employee.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.location.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentleaveData = filteredleaveData.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredleaveData.length / entriesPerPage),
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3000/api/form/leaveApplication",
      );
      setLeaveData(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle submit
  const handleSubmit = async () => {
    const newEntry = {
      ...formData,
    };

    try {
      if (editId) {
        await axios.put(
          `http://localhost:3000/api/form/leaveApplication/${editId}`,
          newEntry,
        );
        toast.success("Request Updated");
      } else {
        await axios.post(
          "http://localhost:3000/api/form/leaveApplication",
          newEntry,
        );
        toast.success("Request Submitted");
      }
      fetchData();
      setOpenModal(false);
      setEditId(null);
      setFormData(defaultFormData);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:3000/api/form/leaveApplication/${id}`,
      );
      fetchData();
      toast.success("Deleted Successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete");
    }
  };

  const handleCopy = () => {
    const header = [
      "Employee",
      "Location",
      "Enrollment Id",
      "Designation",
    ].join("\t");

    const rows = filteredleaveData
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
    const excelData = filteredleaveData.map((item) => ({
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

    filteredleaveData.forEach((item) => {
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
    <div className="mb-6 max-w-[1920px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center h-[30px] gap-2 text-base xl:text-xl  font-semibold text-gray-900">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Forms</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div
            onClick={() => setOpenModal(false)}
            className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
          >
            Leave Application
          </div>
        </h1>
        {!openModal && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setMode("");
                setEditId(null);
                setFormData(defaultFormData);
                setOpenModal(true);
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg xl:text-lg  border border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
            >
              + Add New
            </button>
          </div>
        )}
      </div>

      {/* Main Table Container */}
      {!openModal && (
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl animate-in fade-in duration-500">
          {/* Top Controls */}
          <div className="p-6 border-b border-blue-100/30">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm xl:text-base  font-medium text-gray-600">
                  Show
                </label>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm xl:text-base  focus:ring-2 focus:ring-blue-500/60 transition-all"
                >
                  {[10, 25, 50, 100].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <span className="text-sm xl:text-base  font-medium text-gray-600">
                  entries
                </span>
              </div>

              <div className="flex flex-wrap gap-3 items-center justify-center">
                <input
                  placeholder="Search employee..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 xl:text-base  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 p-2.5 rounded-lg transition-all"
                    title="Copy"
                  >
                    <GoCopy className="text-lg xl:text-xl " />
                  </button>
                  <button
                    onClick={handleExcel}
                    className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 p-2.5 rounded-lg transition-all"
                    title="Excel"
                  >
                    <FaFileExcel className="text-lg xl:text-xl " />
                  </button>
                  <button
                    onClick={handlePDF}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 p-2.5 rounded-lg transition-all"
                    title="PDF"
                  >
                    <FaFilePdf className="text-lg xl:text-xl " />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="overflow-x-auto min-h-[350px]"
            style={{ scrollbarWidth: "none" }}
          >
            <table className="w-full text-[17px]">
              <thead>
                <tr className="bg-slate-50 border-b border-blue-100/50">
                  <th className="py-3 px-6 hidden sm:table-cell font-semibold text-gray-700">
                    SL.No
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700 text-center">
                    Employee
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700">
                    Location
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700">
                    Enrollment ID
                  </th>
                  <th className="py-3 px-6 hidden lg:table-cell font-semibold text-gray-700">
                    Designation
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700">
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
                ) : currentleaveData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-12 text-center text-gray-500 font-medium"
                    >
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentleaveData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/60"
                    >
                      <td className="py-3 px-6 hidden sm:table-cell text-gray-900">
                        {startIndex + index + 1}
                      </td>
                      <td className="py-3 px-6 font-medium text-gray-900 text-center">
                        {item.employee}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600">
                        {item.location}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600 font-mono">
                        {item.enrollmentId}
                      </td>
                      <td className="py-3 px-6 hidden lg:table-cell text-gray-600">
                        {item.designation}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex justify-center gap-3">
                          <FaEye
                            onClick={() => {
                              setFormData(item);
                              setMode("view");
                              setOpenModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 xl:text-xl  cursor-pointer"
                            title="View"
                          />
                          <FaPen
                            onClick={() => {
                              setFormData(item);
                              setEditId(item.id);
                              setMode("edit");
                              setOpenModal(true);
                            }}
                            className="text-green-500 hover:text-green-700 xl:text-xl  cursor-pointer"
                            title="Edit"
                          />
                          <MdDeleteForever
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 xl:text-xl  cursor-pointer"
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

          {/* Pagination Footer */}
          <div className="p-6 border-t border-blue-100/30 flex flex-col sm:flex-row justify-between items-center gap-6">
            <span className="text-sm xl:text-base  text-gray-600">
              Showing{" "}
              <span className="text-gray-900 font-semibold">
                {filteredleaveData.length === 0 ? "0" : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="text-gray-900 font-semibold">
                {Math.min(endIndex, filteredleaveData.length)}
              </span>{" "}
              of{" "}
              <span className="text-gray-900 font-semibold">
                {filteredleaveData.length}
              </span>{" "}
              entries
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm xl:text-base  font-medium disabled:opacity-50 transition-all"
              >
                First
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-2.5 border rounded-lg bg-white disabled:opacity-50"
              >
                <GrPrevious />
              </button>
              <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-bold text-sm xl:text-base  min-w-[45px] text-center">
                {currentPage}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2.5 border rounded-lg bg-white disabled:opacity-50"
              >
                <GrNext />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm xl:text-base  font-medium disabled:opacity-50"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Section */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-[1300px] max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in duration-200"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
              <h2 className="text-xl   font-bold text-gray-900">
                {mode === "view"
                  ? "Leave Application Details"
                  : mode === "edit"
                    ? "Edit Leave Request"
                    : "New Leave Application"}
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Section I: Employee Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="bg-slate-100 py-2 px-4 border-l-4 border-blue-500 font-bold text-gray-800 xl:text-lg  rounded-r mb-6 uppercase tracking-wide">
                  I. To be filled by the Employee in Capitals
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className={labelStyle}>
                      Employee Name <span className="text-red-500">*</span>
                    </label>
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
                  <div>
                    <label className={labelStyle}>Enrollment Id</label>
                    <input
                      name="enrollmentId"
                      value={formData.enrollmentId}
                      onChange={handleChange}
                      className={inputStyle}
                      disabled={mode === "view"}
                    />
                  </div>
                  <div className="relative">
                    <label className={labelStyle}>Application Date</label>
                    <input
                      name="date"
                      value={formData.date}
                      onClick={() =>
                        mode !== "view" && setShowDateSpinner(true)
                      }
                      readOnly
                      disabled={mode === "view"}
                      className={inputStyle}
                      placeholder="dd/mm/yyyy"
                    />
                    {showDateSpinner && (
                      <SpinnerDatePicker
                        value={formData.date}
                        onChange={(date) =>
                          setFormData((p) => ({ ...p, date }))
                        }
                        onClose={() => setShowDateSpinner(false)}
                      />
                    )}
                  </div>
                  <SearchDropdown
                    label={
                      <>
                        Designation <span className="text-red-500">*</span>
                      </>
                    }
                    name="designation"
                    value={formData.designation}
                    options={[
                      "Regional Manager",
                      "Finance Assistant",
                      "Operations Officer",
                    ]}
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />
                  <SearchDropdown
                    label={
                      <>
                        Nationality <span className="text-red-500">*</span>
                      </>
                    }
                    name="nationality"
                    value={formData.nationality}
                    options={countries}
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />
                  <SearchDropdown
                    label={
                      <>
                        Location <span className="text-red-500">*</span>
                      </>
                    }
                    name="location"
                    value={formData.location}
                    options={["Head Office", "UAE"]}
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />
                </div>

                {/* Nature of Leave Checkboxes */}
                <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-gray-100">
                  <p className="font-bold text-gray-700 mb-4 xl:text-lg">
                    Nature of Leave:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Annual Leave", name: "annualLeave" },
                      { label: "Sick Leave", name: "sickleave" },
                      { label: "TOIL", name: "toil" },
                      { label: "Unpaid Leave", name: "unpaidLeave" },
                      { label: "Compassionate", name: "cpmpassionLeave" },
                      { label: "Emergency", name: "emergencyLeave" },
                      { label: "Maternal", name: "maternalLeave" },
                      { label: "Paternal", name: "paternalLeave" },
                    ].map((item) => (
                      <label
                        key={item.name}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          name={item.name}
                          checked={formData.natureofleave[item.name]}
                          onChange={(e) => handleChange(e, "natureofleave")}
                          disabled={mode === "view"}
                          className="w-5 h-5 accent-blue-600 rounded"
                        />
                        <span className="text-gray-700 xl:text-base  group-hover:text-blue-600 transition-colors">
                          {item.label}
                        </span>
                      </label>
                    ))}
                    <div className="col-span-2 flex items-center gap-3">
                      <label className="flex items-center gap-3 whitespace-nowrap">
                        <input
                          type="checkbox"
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
                          className="w-5 h-5 accent-blue-600"
                        />
                        <span className="text-gray-700 xl:text-base">
                          Others:
                        </span>
                      </label>
                      <input
                        type="text"
                        name="othersSpecify"
                        value={formData.natureofleave.othersSpecify}
                        onChange={(e) => handleChange(e, "natureofleave")}
                        placeholder="Specify reason"
                        className={`${inputStyle} h-9`}
                        disabled={
                          mode === "view" ||
                          !formData.natureofleave.hasOwnProperty(
                            "othersSpecify",
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Leave Dates Grid */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelStyle}>Requested Days</label>
                    <input
                      type="number"
                      name="calenderDaysLeave"
                      value={formData.calenderDaysLeave}
                      onChange={handleChange}
                      className={inputStyle}
                      disabled={mode === "view"}
                      placeholder="0"
                    />
                  </div>
                  <div className="relative">
                    <label className={labelStyle}>Start Date</label>
                    <input
                      value={formData.leaveFrom}
                      onClick={() =>
                        mode !== "view" && setShowLeaveFromDateSpinner(true)
                      }
                      readOnly
                      disabled={mode === "view"}
                      placeholder="dd/mm/yyyy"
                      className={inputStyle}
                    />
                    {showLeaveFromDateSpinner && (
                      <SpinnerDatePicker
                        value={formData.leaveFrom}
                        onChange={(date) =>
                          setFormData((p) => ({ ...p, leaveFrom: date }))
                        }
                        onClose={() => setShowLeaveFromDateSpinner(false)}
                      />
                    )}
                  </div>
                  <div className="relative">
                    <label className={labelStyle}>End Date</label>
                    <input
                      value={formData.leaveTo}
                      onClick={() =>
                        mode !== "view" && setShowLeaveToDateSpinner(true)
                      }
                      readOnly
                      disabled={mode === "view"}
                      placeholder="dd/mm/yyyy"
                      className={inputStyle}
                    />
                    {showLeaveToDateSpinner && (
                      <SpinnerDatePicker
                        value={formData.leaveTo}
                        onChange={(date) =>
                          setFormData((p) => ({ ...p, leaveTo: date }))
                        }
                        onClose={() => setShowLeaveToDateSpinner(false)}
                      />
                    )}
                  </div>
                </div>

                {/* TOIL Logic */}
                <div className="mt-8 p-6 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-6 mb-6">
                    <span className="font-bold text-gray-800 xl:text-lg">
                      TOIL Requested?
                    </span>
                    <div className="flex gap-4">
                      {["Yes", "No"].map((val) => (
                        <label
                          key={val}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="toilReq"
                            value={val}
                            checked={formData.toilReq === val}
                            onChange={handleChange}
                            disabled={mode === "view"}
                            className="w-4 h-4 accent-blue-600"
                          />
                          <span className="font-semibold">{val}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={labelStyle}>TOIL Days</label>
                      <input
                        name="calenderDaystoil"
                        value={formData.calenderDaystoil}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className={inputStyle}
                      />
                    </div>
                    <div className="relative">
                      <label className={labelStyle}>TOIL From</label>
                      <input
                        value={formData.toilFrom}
                        onClick={() =>
                          mode !== "view" && setShowToilFromDateSpinner(true)
                        }
                        readOnly
                        disabled={mode === "view"}
                        className={inputStyle}
                        placeholder="dd/mm/yyyy"
                      />
                      {showToilFromDateSpinner && (
                        <SpinnerDatePicker
                          value={formData.toilFrom}
                          onChange={(date) =>
                            setFormData((p) => ({ ...p, toilFrom: date }))
                          }
                          onClose={() => setShowToilFromDateSpinner(false)}
                        />
                      )}
                    </div>
                    <div className="relative">
                      <label className={labelStyle}>TOIL To</label>
                      <input
                        value={formData.toilTo}
                        onClick={() =>
                          mode !== "view" && setShowToilToDateSpinner(true)
                        }
                        readOnly
                        disabled={mode === "view"}
                        className={inputStyle}
                        placeholder="dd/mm/yyyy"
                      />
                      {showToilToDateSpinner && (
                        <SpinnerDatePicker
                          value={formData.toilTo}
                          onChange={(date) =>
                            setFormData((p) => ({ ...p, toilTo: date }))
                          }
                          onClose={() => setShowToilToDateSpinner(false)}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary Row */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelStyle}>
                      Grand Total (Leave + TOIL)
                    </label>
                    <input
                      name="calenderDaysLeaveToil"
                      value={formData.calenderDaysLeaveToil}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Actual Working Days</label>
                    <input
                      name="actualDays"
                      value={formData.actualDays}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div className="relative">
                    <label className={labelStyle}>Rejoining Date</label>
                    <input
                      value={formData.rejoinDate}
                      onClick={() =>
                        mode !== "view" && setShowRejoinDateSpinner(true)
                      }
                      readOnly
                      disabled={mode === "view"}
                      className={inputStyle}
                      placeholder="dd/mm/yyyy"
                    />
                    {showRejoinDateSpinner && (
                      <SpinnerDatePicker
                        value={formData.rejoinDate}
                        onChange={(date) =>
                          setFormData((p) => ({ ...p, rejoinDate: date }))
                        }
                        onClose={() => setShowRejoinDateSpinner(false)}
                      />
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelStyle}>
                      Emergency Reason / Remarks
                    </label>
                    <textarea
                      name="reasonForLeave"
                      value={formData.reasonForLeave}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className="w-full border border-gray-400 rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="relative">
                    <label className={labelStyle}>VISA / SIRA Expiry</label>
                    <input
                      value={formData.visaExpiry}
                      onClick={() =>
                        mode !== "view" && setShowVisaDateSpinner(true)
                      }
                      readOnly
                      disabled={mode === "view"}
                      className={inputStyle}
                      placeholder="dd/mm/yyyy"
                    />
                    {showVisaDateSpinner && (
                      <SpinnerDatePicker
                        value={formData.visaExpiry}
                        onChange={(date) =>
                          setFormData((p) => ({ ...p, visaExpiry: date }))
                        }
                        onClose={() => setShowVisaDateSpinner(false)}
                      />
                    )}
                  </div>
                </div>

                {/* Declaration & Final Signature */}
                <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 underline xl:text-lg">
                    Declaration
                  </h4>
                  <ul className="space-y-2 text-sm xl:text-base text-gray-600 mb-8 list-disc pl-5">
                    <li>
                      I understand that leave policies and procedures are for
                      betterment for employees and manpower planning of the
                      company
                    </li>
                    <li>
                      I have submitted a valid return ticket and assure you that
                      I will resume my work on the indicated rejoining date
                      without fail. If not, the company has the right to take
                      disciplinary action against me, which might lead to
                      termination of my employment contract.
                    </li>
                    <li>
                      I hereby agree that as per Article 78 of Section 2 of
                      Chapter 4 of Working hours and leaves of the UAE Labor
                      Law, I am only entitled to receive basic salary during
                      period of my annual leave.
                    </li>
                    <li>
                      {" "}
                      I hereby declare that I have read and understood the leave
                      overstay policies and procedures at the back hereof.
                    </li>
                    <li>
                      I hereby confirm that I have read and understood the terms
                      of leave presented and briefed to me. I have taken the
                      time to review this document and have raised, and
                      discussed any queries directly with Safecor Security
                      management prior to submitting this declaration.
                    </li>
                  </ul>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-[16px]">
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

                    {/* Signature */}
                    <div>
                      {/* Toggle Tabs */}
                      {mode !== "view" && (
                        <div className=" gap-2 mb-4">
                          <label className={labelStyle}>Signature :</label>
                          <div className="space-x-1 space-y-1">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  signatureMode: "upload",
                                })
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.signatureMode === "upload"
                                  ? "bg-[#0f172a] text-white border-[#0f172a]"
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Upload
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  signatureMode: "draw",
                                })
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.signatureMode === "draw"
                                  ? "bg-[#0f172a] text-white border-[#0f172a]"
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Sign Here
                            </button>
                          </div>
                        </div>
                      )}

                      {mode === "view" && (
                        <label className="block text-sm font-medium mb-2">
                          Signature :
                        </label>
                      )}

                      {/* Upload Area */}
                      {formData.signatureMode === "upload" && (
                        <div>
                          <input
                            type="file"
                            id="signatureUpload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setFormData({
                                  ...formData,
                                  signature: file,
                                  signaturePreview: URL.createObjectURL(file),
                                });
                              }
                            }}
                          />

                          {/* Drag & Drop Zone */}
                          {mode !== "view" && (
                            <label
                              htmlFor="signatureUpload"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files[0];
                                if (file && file.type.startsWith("image/")) {
                                  setFormData({
                                    ...formData,
                                    signature: file,
                                    signaturePreview: URL.createObjectURL(file),
                                  });
                                }
                              }}
                              className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                            >
                              <svg
                                className="w-8 h-8 text-gray-400 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4"
                                />
                              </svg>
                              <p className="text-sm text-gray-500">
                                Drag & drop or{" "}
                                <span className="text-[#0f172a] font-medium underline">
                                  browse
                                </span>
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                PNG, JPG, SVG supported
                              </p>
                            </label>
                          )}

                          {/* Preview */}
                          {formData.signaturePreview && (
                            <div className="mt-4 flex items-center gap-3">
                              <img
                                src={formData.signaturePreview}
                                alt="Signature Preview"
                                className="h-16 border rounded bg-white p-2 shadow-sm"
                              />
                              {mode !== "view" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      signature: null,
                                      signaturePreview: null,
                                    })
                                  }
                                  className="text-xs text-red-500 hover:underline"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Draw Area */}
                      {formData.signatureMode === "draw" && (
                        <SignPad
                          fieldName="signhere"
                          formData={formData}
                          setFormData={setFormData}
                          mode={mode}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section II: Admin Operations */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="bg-slate-100 py-2 px-4 border-l-4 border-teal-500 font-bold text-gray-800 xl:text-lg rounded-r mb-6 uppercase tracking-wide">
                  II. To be filled by the Admin Operations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="relative">
                    <label className={labelStyle}>
                      Employee's Date of Joining
                    </label>
                    <input
                      value={formData.adminoperation.dateOfJoin}
                      onClick={() =>
                        mode !== "view" && setShowDateOfJoinDateSpinner(true)
                      }
                      readOnly
                      disabled={mode === "view"}
                      className={inputStyle}
                      placeholder="dd/mm/yyyy"
                    />
                    {showDateOfJoinDateSpinner && (
                      <SpinnerDatePicker
                        value={formData.adminoperation.dateOfJoin}
                        onChange={(d) =>
                          setFormData((p) => ({
                            ...p,
                            adminoperation: {
                              ...p.adminoperation,
                              dateOfJoin: d,
                            },
                          }))
                        }
                        onClose={() => setShowDateOfJoinDateSpinner(false)}
                      />
                    )}
                  </div>
                  <div>
                    <label className={labelStyle}>Leave Days Due up to</label>
                    <input
                      name="leaveDays"
                      value={formData.adminoperation.leaveDays}
                      onChange={(e) => handleChange(e, "adminoperation")}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Nature of Leave</label>
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
                      setFormData={(updateFn) => {
                        if (typeof updateFn === "function") {
                          setFormData((prev) => {
                            const newState = updateFn(prev);
                            return {
                              ...prev,
                              adminoperation: {
                                ...prev.adminoperation,
                                leavenature: newState.leavenature,
                              },
                            };
                          });
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            adminoperation: {
                              ...prev.adminoperation,
                              leavenature: updateFn.leavenature,
                            },
                          }));
                        }
                      }}
                      disabled={mode === "view"}
                      inputStyle={inputStyle}
                      labelStyle={labelStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>
                      Total Entitlement (Nos)
                    </label>
                    <input
                      name="totalEntitlement"
                      value={formData.adminoperation.totalEntitlement}
                      onChange={(e) => handleChange(e, "adminoperation")}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Leave Availed (Nos)</label>
                    <input
                      name="leaveAvailed"
                      value={formData.adminoperation.leaveAvailed}
                      onChange={(e) => handleChange(e, "adminoperation")}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Opening Balance (Nos)</label>
                    <input
                      name="openingBalance"
                      value={formData.adminoperation.openingBalance}
                      onChange={(e) => handleChange(e, "adminoperation")}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Leave Granted (Nos)</label>
                    <input
                      name="leaveGranted"
                      value={formData.adminoperation.leaveGranted}
                      onChange={(e) => handleChange(e, "adminoperation")}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>New Balance (Nos)</label>
                    <input
                      name="newBalance"
                      value={formData.adminoperation.newBalance}
                      onChange={(e) => handleChange(e, "adminoperation")}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className={labelStyle}>Remarks if any</label>
                    <input
                      name="remarks"
                      value={formData.adminoperation.remarks}
                      onChange={(e) => handleChange(e, "adminoperation")}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className={labelStyle}>
                      Reason for non-approval? (if rejected)
                    </label>
                    <input
                      name="nonApproveReason"
                      value={formData.adminoperation.nonApproveReason}
                      onChange={(e) => handleChange(e, "adminoperation")}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-[16px]">
                  <div>
                    <h1 className={labelStyle}> Leave Granted ?</h1>

                    <div className="space-x-4">
                      <label className="mt-1">
                        <input
                          type="radio"
                          name="leaveGranted"
                          value={formData.adminoperation.leaveGranted}
                          onChange={(e) => handleChange(e, "adminoperation")}
                          disabled={mode === "view"}
                        />{" "}
                        <span className="ml-2">Yes</span>
                      </label>
                      <label className="mt-1">
                        <input
                          type="radio"
                          name="leaveGranted"
                          value={formData.leaveGranted}
                          onChange={handleChange}
                          disabled={mode === "view"}
                        />
                        <span className="ml-2">No</span>
                      </label>
                    </div>
                  </div>

                  <div className="relative">
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

                  <div className="relative ">
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
              </div>

              {/* Section III: Final Approvals */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
                <h3 className="bg-slate-100 py-2 px-4 border-l-4 border-orange-500 font-bold text-gray-800 xl:text-lg rounded-r mb-6 uppercase tracking-wide">
                  III. Final Approvals
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Approval 1 */}
                  <div className="space-y-4 p-5 border border-gray-300 rounded-xl bg-slate-50/50">
                    <p className="font-bold text-blue-600 border-b pb-2">
                      Approval - 1 (Ops Representative)
                    </p>
                    <label className={labelStyle}>Name/Signature/Date</label>
                    <input
                      name="approval1Name"
                      value={formData.finalApproval.approval1Name}
                      onChange={(e) => handleChange(e, "finalApproval")}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                    <label className={labelStyle}>
                      Reason for non-approval?
                    </label>
                    <input
                      name="nonApprove1Reason"
                      value={formData.finalApproval.nonApprove1Reason}
                      onChange={(e) => handleChange(e, "finalApproval")}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />

                    {/* Signature div same */}
                    <div>
                      {mode !== "view" && (
                        <div className=" gap-2 mb-4">
                          <label className={labelStyle}>Signature :</label>
                          <div className="space-x-1 space-y-1">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  finalApproval: {
                                    ...formData.finalApproval,
                                    upload1signatureMode: "upload",
                                  },
                                })
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${formData.finalApproval.upload1signatureMode === "upload" ? "bg-[#0f172a] text-white border-[#0f172a]" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}
                            >
                              Upload
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  finalApproval: {
                                    ...formData.finalApproval,
                                    upload1signatureMode: "draw",
                                  },
                                })
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${formData.finalApproval.upload1signatureMode === "draw" ? "bg-[#0f172a] text-white border-[#0f172a]" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}
                            >
                              Sign Here
                            </button>
                          </div>
                        </div>
                      )}
                      {mode === "view" && (
                        <label className="block text-sm font-medium mb-2">
                          Signature :
                        </label>
                      )}
                      {formData.finalApproval.upload1signatureMode ===
                        "upload" && (
                        <div>
                          <input
                            type="file"
                            id="upload1signatureUpload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              e.target.files[0] &&
                              setFormData({
                                ...formData,
                                finalApproval: {
                                  ...formData.finalApproval,
                                  upload1signature: e.target.files[0],
                                  upload1signaturePreview: URL.createObjectURL(
                                    e.target.files[0],
                                  ),
                                },
                              })
                            }
                          />
                          {mode !== "view" && (
                            <label
                              htmlFor="upload1signatureUpload"
                              className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                            >
                              <p className="text-sm text-gray-500">
                                Drag & drop or{" "}
                                <span className="text-[#0f172a] font-medium underline">
                                  browse
                                </span>
                              </p>
                            </label>
                          )}
                          {formData.finalApproval.upload1signaturePreview && (
                            <div className="mt-4 flex items-center gap-3">
                              <img
                                src={
                                  formData.finalApproval.upload1signaturePreview
                                }
                                className="h-16 border rounded bg-white p-2 shadow-sm"
                                alt="Preview"
                              />
                            </div>
                          )}
                        </div>
                      )}
                      {formData.finalApproval.upload1signatureMode ===
                        "draw" && (
                        <SignPad
                          fieldName="upload1signaturehere"
                          formData={formData.finalApproval}
                          setFormData={(updater) =>
                            setFormData((p) => ({
                              ...p,
                              finalApproval: {
                                ...p.finalApproval,
                                ...(typeof updater === "function"
                                  ? updater(p.finalApproval)
                                  : updater),
                              },
                            }))
                          }
                          mode={mode}
                        />
                      )}
                    </div>
                  </div>

                  {/* Approval 2 */}
                  <div className="space-y-4 p-5 border border-gray-300 rounded-xl bg-slate-50/50">
                    <p className="font-bold text-teal-600 border-b pb-2">
                      Approval - 2 (HR Representative)
                    </p>
                    <label className={labelStyle}>Name/Signature/Date</label>
                    <input
                      name="approval2Name"
                      value={formData.finalApproval.approval2Name}
                      onChange={(e) => handleChange(e, "finalApproval")}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                    <label className={labelStyle}>
                      Reason for non-approval?
                    </label>
                    <input
                      name="nonApprove2Reason"
                      value={formData.finalApproval.nonApprove2Reason}
                      onChange={(e) => handleChange(e, "finalApproval")}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />

                    {/* Signature div same */}
                    <div>
                      {mode !== "view" && (
                        <div className=" gap-2 mb-4">
                          <label className={labelStyle}>Signature :</label>
                          <div className="space-x-1 space-y-1">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  finalApproval: {
                                    ...formData.finalApproval,
                                    upload2signatureMode: "upload",
                                  },
                                })
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${formData.finalApproval.upload2signatureMode === "upload" ? "bg-[#0f172a] text-white border-[#0f172a]" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}
                            >
                              Upload
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  finalApproval: {
                                    ...formData.finalApproval,
                                    upload2signatureMode: "draw",
                                  },
                                })
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${formData.finalApproval.upload2signatureMode === "draw" ? "bg-[#0f172a] text-white border-[#0f172a]" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}
                            >
                              Sign Here
                            </button>
                          </div>
                        </div>
                      )}
                      {mode === "view" && (
                        <label className="block text-sm font-medium mb-2">
                          Signature :
                        </label>
                      )}
                      {formData.finalApproval.upload2signatureMode ===
                        "upload" && (
                        <div>
                          <input
                            type="file"
                            id="upload2signatureUpload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              e.target.files[0] &&
                              setFormData({
                                ...formData,
                                finalApproval: {
                                  ...formData.finalApproval,
                                  upload2signature: e.target.files[0],
                                  upload2signaturePreview: URL.createObjectURL(
                                    e.target.files[0],
                                  ),
                                },
                              })
                            }
                          />
                          {mode !== "view" && (
                            <label
                              htmlFor="upload2signatureUpload"
                              className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                            >
                              <p className="text-sm text-gray-500">
                                Drag & drop or{" "}
                                <span className="text-[#0f172a] font-medium underline">
                                  browse
                                </span>
                              </p>
                            </label>
                          )}
                          {formData.finalApproval.upload2signaturePreview && (
                            <div className="mt-4 flex items-center gap-3">
                              <img
                                src={
                                  formData.finalApproval.upload2signaturePreview
                                }
                                className="h-16 border rounded bg-white p-2 shadow-sm"
                                alt="Preview"
                              />
                            </div>
                          )}
                        </div>
                      )}
                      {formData.finalApproval.upload2signatureMode ===
                        "draw" && (
                        <SignPad
                          fieldName="upload2signaturehere"
                          formData={formData.finalApproval}
                          setFormData={(updater) =>
                            setFormData((p) => ({
                              ...p,
                              finalApproval: {
                                ...p.finalApproval,
                                ...(typeof updater === "function"
                                  ? updater(p.finalApproval)
                                  : updater),
                              },
                            }))
                          }
                          mode={mode}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Passport Collection */}
                <div className="mt-10 p-6 border-2 border-dashed border-orange-200 rounded-2xl bg-orange-50/30">
                  <h4 className="font-bold text-orange-800 mb-2 uppercase tracking-wide">
                    III. Passport Collection
                  </h4>
                  <p className="text-sm text-orange-700 mb-6 font-medium">
                    Only to be issued if leave has approved and a valid return
                    ticket is available. I have collected my passport from the
                    HR Department.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={labelStyle}>Applicant's Name</label>
                      <input
                        name="applicantName"
                        value={formData.passportCollection.applicantName}
                        onChange={(e) => handleChange(e, "passportCollection")}
                        disabled={mode === "view"}
                        className={inputStyle}
                      />
                    </div>
                    <div className="relative">
                      <label className={labelStyle}>Collection Date</label>
                      <input
                        value={formData.passportCollection.date}
                        onClick={() =>
                          mode !== "view" && setShowPassDateSpinner(true)
                        }
                        disabled={mode === "view"}
                        className={inputStyle}
                        placeholder="dd/mm/yyyy"
                      />
                      {showPassDateSpinner && (
                        <SpinnerDatePicker
                          value={formData.passportCollection.date}
                          onChange={(d) =>
                            setFormData((p) => ({
                              ...p,
                              passportCollection: {
                                ...p.passportCollection,
                                date: d,
                              },
                            }))
                          }
                          onClose={() => setShowPassDateSpinner(false)}
                        />
                      )}
                    </div>
                    {/* Signature */}
                    <div className="relative">
                      {/* Toggle Tabs — hidden in view mode */}
                      {mode !== "view" && (
                        <div>
                          <label className={labelStyle}>Signature :</label>
                          <div className="space-x-1 space-y-1 py-1">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  passportCollection: {
                                    ...prev.passportCollection,
                                    signatureMode: "upload",
                                  },
                                }))
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.passportCollection.signatureMode ===
                                "upload"
                                  ? "bg-[#0f172a] text-white border-[#0f172a]"
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Upload
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  passportCollection: {
                                    ...prev.passportCollection,
                                    signatureMode: "draw",
                                  },
                                }))
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.passportCollection.signatureMode ===
                                "draw"
                                  ? "bg-[#0f172a] text-white border-[#0f172a]"
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Sign Here
                            </button>
                          </div>
                        </div>
                      )}
                      {mode === "view" && (
                        <label className={labelStyle}>Signature :</label>
                      )}

                      {/* Upload Area */}
                      {formData.passportCollection.signatureMode ===
                        "upload" && (
                        <div>
                          <input
                            type="file"
                            id="passportSignatureUpload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setFormData((prev) => ({
                                  ...prev,
                                  passportCollection: {
                                    ...prev.passportCollection,
                                    signature: file,
                                    signaturePreview: URL.createObjectURL(file),
                                  },
                                }));
                              }
                            }}
                          />

                          {/* Drag & Drop Zone */}
                          {mode !== "view" && (
                            <label
                              htmlFor="passportSignatureUpload"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files[0];
                                if (file && file.type.startsWith("image/")) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    passportCollection: {
                                      ...prev.passportCollection,
                                      signature: file,
                                      signaturePreview:
                                        URL.createObjectURL(file),
                                    },
                                  }));
                                }
                              }}
                              className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                            >
                              <svg
                                className="w-8 h-8 text-gray-400 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4"
                                />
                              </svg>
                              <p className="text-sm text-gray-500">
                                Drag & drop or{" "}
                                <span className="text-[#0f172a] font-medium underline">
                                  browse
                                </span>
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                PNG, JPG, SVG supported
                              </p>
                            </label>
                          )}

                          {/* Preview */}
                          {formData.passportCollection.signaturePreview && (
                            <div className="mt-4 flex items-center gap-3">
                              <img
                                src={
                                  formData.passportCollection.signaturePreview
                                }
                                alt="Signature Preview"
                                className="h-16 border rounded bg-white p-2 shadow-sm"
                              />
                              {mode !== "view" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      passportCollection: {
                                        ...prev.passportCollection,
                                        signature: null,
                                        signaturePreview: null,
                                      },
                                    }))
                                  }
                                  className="text-xs text-red-500 hover:underline"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Draw Area */}
                      {formData.passportCollection.signatureMode === "draw" && (
                        <SignPad
                          fieldName="signaturehere"
                          formData={formData.passportCollection}
                          setFormData={(updater) =>
                            setFormData((prev) => ({
                              ...prev,
                              passportCollection: {
                                ...prev.passportCollection,
                                ...(typeof updater === "function"
                                  ? updater(prev.passportCollection)
                                  : updater),
                              },
                            }))
                          }
                          mode={mode}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/*Section IV: To be filled by Employee */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-12">
                <h1 className="font-medium"> Policies </h1>
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
                <h3 className="bg-slate-100 py-2 px-4 border-l-4 border-blue-500 font-bold text-gray-800 xl:text-lg  rounded-r mb-6 uppercase tracking-wide mt-4">
                  IV.TO BE FILLED BY THE EMPLOYEE IN CAPITALS
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4 gap-4 text-[16px]">
                  <div>
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

                  <div>
                    <label className={labelStyle}>
                      Home country contact no. 1:
                    </label>
                    <input
                      className={inputStyle}
                      name="homeCountrycontact1"
                      value={formData.employeeForm.homeCountrycontact1}
                      onChange={(e) => handleChange(e, "employeeForm")}
                      disabled={mode === "view"}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Name:</label>
                    <input
                      className={inputStyle}
                      name="name"
                      value={formData.employeeForm.name}
                      onChange={(e) => handleChange(e, "employeeForm")}
                      disabled={mode === "view"}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>
                      Home country contact no. 2:
                    </label>
                    <input
                      className={inputStyle}
                      name="homeCountrycontact2"
                      value={formData.employeeForm.homeCountrycontact2}
                      onChange={(e) => handleChange(e, "employeeForm")}
                      disabled={mode === "view"}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>ID No.:</label>
                    <input
                      className={inputStyle}
                      name="idNo"
                      value={formData.employeeForm.idNo}
                      onChange={(e) => handleChange(e, "employeeForm")}
                      disabled={mode === "view"}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Valid Email address :</label>
                    <input
                      className={inputStyle}
                      name="emailAddress"
                      value={formData.employeeForm.emailAddress}
                      onChange={(e) => handleChange(e, "employeeForm")}
                      disabled={mode === "view"}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Date</label>
                    <input
                      name="date"
                      value={formData.employeeForm.date || ""}
                      onChange={(e) => handleChange(e, "employeeForm")}
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

                  <div className="lg:col-span-2">
                    <label className={labelStyle}>
                      {" "}
                      Valid Home Address:
                      <span className="text-xs text-blue-500">
                        {" "}
                        * House No, Street No, Area Name, City Name,
                        State/Province Name, Country Name, Postal Code
                      </span>
                    </label>
                    <textarea
                      className={inputStyle}
                      name="countryAddress"
                      value={formData.employeeForm.countryAddress}
                      onChange={(e) => handleChange(e, "employeeForm")}
                      disabled={mode === "view"}
                    />
                  </div>
                </div>

                {/* Signature */}
                <div className="mt-4 text-[16px]">
                  {/* Toggle Tabs — hidden in view mode */}
                  {mode !== "view" && (
                    <div className=" gap-2 mb-4">
                      <label className={labelStyle}>Signature :</label>
                      <div className="space-x-1 space-y-1">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              finalSignatureMode: "upload",
                            }))
                          }
                          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            formData.finalSignatureMode === "upload"
                              ? "bg-[#0f172a] text-white border-[#0f172a]"
                              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          Upload
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              finalSignatureMode: "draw",
                            }))
                          }
                          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            formData.finalSignatureMode === "draw"
                              ? "bg-[#0f172a] text-white border-[#0f172a]"
                              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          Sign Here
                        </button>
                      </div>
                    </div>
                  )}
                  {mode === "view" && (
                    <label className={labelStyle}>Signature :</label>
                  )}

                  {/* Upload Area */}
                  {formData.finalSignatureMode === "upload" && (
                    <div>
                      <input
                        type="file"
                        id="finalSignatureUpload"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData((prev) => ({
                              ...prev,
                              finalSignature: file,
                              finalSignaturePreview: URL.createObjectURL(file),
                            }));
                          }
                        }}
                      />

                      {/* Drag & Drop Zone */}
                      {mode !== "view" && (
                        <label
                          htmlFor="finalSignatureUpload"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file && file.type.startsWith("image/")) {
                              setFormData((prev) => ({
                                ...prev,
                                finalSignature: file,
                                finalSignaturePreview:
                                  URL.createObjectURL(file),
                              }));
                            }
                          }}
                          className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                        >
                          <svg
                            className="w-8 h-8 text-gray-400 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4"
                            />
                          </svg>
                          <p className="text-sm text-gray-500">
                            Drag & drop or{" "}
                            <span className="text-[#0f172a] font-medium underline">
                              browse
                            </span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG, SVG supported
                          </p>
                        </label>
                      )}

                      {/* Preview */}
                      {formData.finalSignaturePreview && (
                        <div className="mt-4 flex items-center gap-3">
                          <img
                            src={formData.finalSignaturePreview}
                            alt="Signature Preview"
                            className="h-16 border rounded bg-white p-2 shadow-sm"
                          />
                          {mode !== "view" && (
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  finalSignature: null,
                                  finalSignaturePreview: null,
                                }))
                              }
                              className="text-xs text-red-500 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Draw Area */}
                  {formData.finalSignatureMode === "draw" && (
                    <SignPad
                      fieldName="finalSignatureHere"
                      formData={formData}
                      setFormData={setFormData}
                      mode={mode}
                    />
                  )}
                </div>
              </div>
              {/* Footer Actions */}
              {mode !== "view" && (
                <div className="flex flex-wrap justify-end gap-3 mt-12 pt-6 border-t">
                  <button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-2 rounded-lg font-bold shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    Submit Application
                  </button>
                  <button
                    onClick={() => setOpenModal(false)}
                    className="px-8 py-2 border-2 border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApplication;

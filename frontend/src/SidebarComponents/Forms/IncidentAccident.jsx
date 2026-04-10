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
import axios from "axios";
import SpinnerTimePicker from "../SpinnerTimePicker";
import SpinnerDatePicker from "../SpinnerDatePicker";
import SignPad from "./SignPad";

const API_URL = "http://localhost:3000/api/form/incident";

const IncidentAccident = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [incidentData, setIncidentData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [loading , setLoading ] = useState(false)
  const [searchTerm, setSearchTerm] = useState("");
  const [showDateSpinner, setShowDateSpinner] = useState(false);
  const [showMsoDateSpinner, setShowMsoDateSpinner] = useState(false);
  const [showSignatureDateSpinner, setShowSignatureDateSpinner] =
    useState(false);
  const [showDateAckSpinner, setShowAckDateSpinner] = useState(false);
  const [showTimeSpinner, setShowTimeSpinner] = useState(false);
  const [showTimeSpinner2, setShowTimeSpinner2] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_URL);
      setIncidentData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 lg:text-lg 3xl:text-xl rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm";
  const labelStyle =
    "text-sm lg:text-base 3xl:text-xl focus:outline-none font-semibold text-gray-700 mb-2 block";

  const filteredincidentData = incidentData.filter(
    (x) =>
      x.employee.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.location.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const defaultFormData = {
    date_of_incident: null,
    time_of_incident: null,
    location: "",
    building: "",
    other_details: "",
    type_of_incident: "",
    person_affected: "",
    specify_other_details: "",
    incident_timeline: "",
    action_taken: "",
    injury_details: {
      illness: "",
      name_of_person: "",
      age: "",
      gender: "",
      category: "",
      description: "",
      first_aid: "",
      taken_to_hospital: "",
      first_aider_name: "",
      first_aider_designation: "",
      first_aider_detail: "",
    },
    mso_occ: {
      time: null,
      date: null,
      mso_name: "",
      occ_staff_name: "",
    },
    signature: {
      reported_by: "",
      reporter_designation: "",
      filled_by: "",
      filler_designation: "",
      date_of_filling_form: null,
    },
    report_acknowledge: {
      assistant_name: "",
      date_time: null,
    },
    signatureMode: "",
    upload_sign: null,
    signhere: null,
    signaturePreview: null,
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

  const currentincidentData = filteredincidentData.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredincidentData.length / entriesPerPage),
  );

  // Handle submit
  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        toast.success("Request Updated");
      } else {
        await axios.post(API_URL, formData);
        toast.success("Request Submitted");
      }
      fetchData();
      setOpenModal(false);
      setEditId(null);
      setFormData(defaultFormData);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        toast.success("Deleted Successfully");
        fetchData();
      } catch (error) {
        console.error("Error deleting record:", error);
        toast.error("Failed to delete record");
      }
    }
  };

  const handleCopy = () => {
    const header = ["Location", "Building Name", "Date"].join("\t");

    const rows = filteredincidentData
      .map((item) => {
        return [item.location, item.building, item.date_of_incident].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredincidentData.map((item) => ({
      Location: item.location,
      BuildingName: item.building,
      Date: item.date_of_incident,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "incidentAccidentData");

    XLSX.writeFile(workbook, "Incident/AccidentData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = ["Location", "Building Name", "Date"];

    const tableRows = [];

    filteredincidentData.forEach((item) => {
      const row = [item.location, item.building, item.date_of_incident];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("Incident/AccidentData.pdf");
  };

  return (
    <div className="mb-6 max-w-[1920px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center h-[30px] gap-2 text-base lg:text-xl 3xl:text-4xl font-semibold text-gray-900">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Forms</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div
            onClick={() => setOpenModal(false)}
            className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
          >
            Incident / Accident
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
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg lg:text-lg 3xl:text-xl border border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
            >
              + Add New
            </button>
          </div>
        )}
      </div>

      {/* Main Table View */}
      {!openModal && (
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl animate-in fade-in duration-500">
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
              <div className="flex items-center gap-3">
                <input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 lg:text-base 3xl:text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm"
                />
                <div className="flex gap-2 text-xl lg:text-2xl 3xl:text-4xl">
                  <GoCopy
                    onClick={handleCopy}
                    className="cursor-pointer text-gray-600 hover:text-blue-600 transition-colors"
                  />
                  <FaFileExcel
                    onClick={handleExcel}
                    className="cursor-pointer text-green-600 hover:text-green-700 transition-colors"
                  />
                  <FaFilePdf
                    onClick={handlePDF}
                    className="cursor-pointer text-red-600 hover:text-red-700 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="overflow-x-auto min-h-[350px]"
            style={{ scrollbarWidth: "none" }}
          >
            <table className="w-full text-[16px] lg:text-[18px] 3xl:text-[22px]">
              <thead>
                <tr className="bg-slate-50 border-b border-blue-100/50">
                  <th className="py-3 px-6 hidden sm:table-cell font-semibold text-gray-700">
                    SL.No
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700">
                    Date of Incident
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700">
                    Location
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700">
                    Building
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
                      colSpan="5"
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span>Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentincidentData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-12 text-center text-gray-500 font-medium"
                    >
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentincidentData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/60"
                    >
                      <td className="py-3 px-6 hidden sm:table-cell text-gray-900">
                        {startIndex + index + 1}
                      </td>
                      <td className="py-3 px-6 font-medium text-gray-900">
                        {item.date_of_incident}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600">
                        {item.location}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600">
                        {item.building}
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex justify-center gap-3">
                          <FaEye
                            onClick={() => {
                              setFormData(item);
                              setMode("view");
                              setOpenModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 lg:text-xl 3xl:text-3xl cursor-pointer"
                          />
                          <FaPen
                            onClick={() => {
                              setFormData(item);
                              setEditId(item.id);
                              setMode("edit");
                              setOpenModal(true);
                            }}
                            className="text-green-500 hover:text-green-700 lg:text-xl 3xl:text-3xl cursor-pointer"
                          />
                          <MdDeleteForever
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 lg:text-xl 3xl:text-3xl cursor-pointer"
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
            <span className="text-sm lg:text-base 3xl:text-lg text-gray-600">
              Showing{" "}
              <span className="text-gray-900 font-semibold">
                {filteredincidentData.length === 0 ? "0" : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="text-gray-900 font-semibold">
                {Math.min(endIndex, filteredincidentData.length)}
              </span>{" "}
              of{" "}
              <span className="text-gray-900 font-semibold">
                {filteredincidentData.length}
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
                className="p-2.5 border rounded-lg bg-white disabled:opacity-50"
              >
                <GrPrevious />
              </button>
              <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-bold text-sm lg:text-base 3xl:text-xl min-w-[45px] text-center">
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
                className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm lg:text-base 3xl:text-xl font-medium disabled:opacity-50"
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
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-[1500px] max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in duration-200"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
              <h2 className="text-xl lg:text-2xl 3xl:text-4xl font-bold text-gray-900">
                {mode === "view"
                  ? "Incident Report Details"
                  : mode === "edit"
                    ? "Edit Incident Report"
                    : "New Incident / Accident Report"}
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="space-y-10">
              {/* Section: General Details */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6 bg-slate-100 p-2 rounded-lg border-l-4 border-blue-500">
                  <h3 className="text-lg lg:text-xl 3xl:text-2xl font-bold text-gray-800 uppercase tracking-wide">
                    1. Incident General Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  <div className="relative">
                    <label className={labelStyle}>Date of Incident</label>
                    <input
                      name="date_of_incident"
                      value={formData.date_of_incident}
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
                        value={formData.date_of_incident}
                        onChange={(date) =>
                          setFormData((prev) => ({
                            ...prev,
                            date_of_incident: date,
                          }))
                        }
                        onClose={() => setShowDateSpinner(false)}
                      />
                    )}
                  </div>
                  <div className="relative">
                    <label className={`${labelStyle}  w-1/3`}>
                      Time of Incident:{" "}
                    </label>
                    <div
                      className={`${inputStyle} cursor-pointer`}
                      onClick={() => {
                        setShowTimeSpinner(true);
                      }}
                      disabled={mode === "view"}
                    >
                      {formData.time_of_incident
                        ? formData.time_of_incident instanceof Date
                          ? formData.time_of_incident.toLocaleTimeString([], {
                              hour12: false,
                            })
                          : formData.time_of_incident
                        : "HH:MM:SS"}
                    </div>
                    {showTimeSpinner && (
                      <div className="absolute mt-8 ml-8 sm:ml-14 md:ml-16 lg:ml-20 ">
                        <SpinnerTimePicker
                          value={formData.time_of_incident}
                          onChange={(date) =>
                            setFormData((prev) => ({
                              ...prev,
                              time_of_incident: date,
                            }))
                          }
                          onClose={() => setShowTimeSpinner(false)}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={labelStyle}>Location</label>
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Building / Room</label>
                    <input
                      name="building"
                      value={formData.building}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Type of Incident</label>
                    <input
                      name="type_of_incident"
                      value={formData.type_of_incident}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                      placeholder="Fire, Theft, etc."
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Other Details:</label>
                    <input
                      name="other_details"
                      value={formData.other_details}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className={labelStyle}>Person Affected</label>
                    <input
                      name="person_affected"
                      value={formData.person_affected}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className={labelStyle}>
                      Other Details / Specifics
                    </label>
                    <input
                      name="specify_other_details"
                      value={formData.specify_other_details}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Timeline & Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <label className="text-lg lg:text-xl font-bold text-gray-800 mb-3 block">
                    2. Incident Timeline
                  </label>
                  <p className="text-xs text-blue-500 mb-4">
                    * Record events in order of occurrence
                  </p>
                  <textarea
                    name="incident_timeline"
                    value={formData.incident_timeline}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className="w-full border border-gray-300 rounded-xl h-64 p-4 lg:text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Describe the flow of events..."
                  />
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <label className="text-lg lg:text-xl font-bold text-gray-800 mb-3 block">
                    3. Immediate Action Taken
                  </label>
                  <p className="text-xs text-blue-500 mb-4">
                    * Actions taken at the incident scene
                  </p>
                  <textarea
                    name="action_taken"
                    value={formData.action_taken}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className="w-full border border-gray-300 rounded-xl h-64 p-4 lg:text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="First response details..."
                  />
                </div>
              </div>

              {/* Section: Injury Details */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h3 className="text-lg lg:text-xl 3xl:text-2xl font-bold text-gray-800 uppercase tracking-wide">
                    4. Injury / Illness Details
                  </h3>
                  <div className="flex items-center gap-6">
                    <span className="font-semibold lg:text-lg">
                      Anyone injured?
                    </span>
                    <div className="flex gap-4">
                      {["Yes", "No"].map((choice) => (
                        <label
                          key={choice}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="illness"
                            value={choice}
                            checked={formData.injury_details.illness === choice}
                            disabled={mode === "view"}
                            onChange={(e) => handleChange(e, "injury_details")}
                            className="w-5 h-5 accent-red-600"
                          />
                          <span className="font-bold">{choice}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div>
                    <label className={labelStyle}>Injured Person Name</label>
                    <input
                      name="name_of_person"
                      value={formData.injury_details.name_of_person}
                      onChange={(e) => handleChange(e, "injury_details")}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Age</label>
                    <input
                      name="age"
                      value={formData.injury_details.age}
                      onChange={(e) => handleChange(e, "injury_details")}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Gender</label>
                    <div className="flex gap-4 mt-2">
                      {["M", "F"].map((g) => (
                        <label key={g} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="gender"
                            value={g}
                            checked={formData.injury_details.gender === g}
                            disabled={mode === "view"}
                            onChange={(e) => handleChange(e, "injury_details")}
                            className="accent-blue-600"
                          />{" "}
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelStyle}>Category</label>
                    <input
                      name="category"
                      value={formData.injury_details.category}
                      onChange={(e) => handleChange(e, "injury_details")}
                      disabled={mode === "view"}
                      className={inputStyle}
                      placeholder="Staff/Public/Student"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 bg-slate-50 rounded-xl border border-gray-100">
                  <div className="lg:col-span-1">
                    <label className={labelStyle}>Description of Injury</label>
                    <textarea
                      name="description"
                      value={formData.injury_details.description}
                      onChange={(e) => handleChange(e, "injury_details")}
                      disabled={mode === "view"}
                      className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-blue-500"
                    />
                  </div>
                  <div className="lg:col-span-2 space-y-4">
                    <p className="font-bold text-gray-700 underline mb-4">
                      Treatment Provided
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="font-medium">First Aid Provided?</span>
                        <div className="flex gap-3">
                          {["Yes", "No"].map((c) => (
                            <label key={c} className="flex items-center gap-1">
                              <input
                                type="radio"
                                name="first_aid"
                                value={c}
                                checked={
                                  formData.injury_details.first_aid === c
                                }
                                disabled={mode === "view"}
                                onChange={(e) =>
                                  handleChange(e, "injury_details")
                                }
                              />{" "}
                              {c}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="font-medium">Hospitalized?</span>
                        <div className="flex gap-3">
                          {["Yes", "No"].map((c) => (
                            <label key={c} className="flex items-center gap-1">
                              <input
                                type="radio"
                                name="taken_to_hospital"
                                value={c}
                                checked={
                                  formData.injury_details.taken_to_hospital ===
                                  c
                                }
                                disabled={mode === "view"}
                                onChange={(e) =>
                                  handleChange(e, "injury_details")
                                }
                              />{" "}
                              {c}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase text-gray-500">
                            First Aider Name
                          </label>
                          <input
                            name="first_aider_name"
                            value={formData.injury_details.first_aider_name}
                            onChange={(e) => handleChange(e, "injury_details")}
                            disabled={mode === "view"}
                            className={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-gray-500">
                            Aider Designation
                          </label>
                          <input
                            name="first_aider_designation"
                            value={
                              formData.injury_details.first_aider_designation
                            }
                            onChange={(e) => handleChange(e, "injury_details")}
                            disabled={mode === "view"}
                            className={inputStyle}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs font-bold uppercase text-gray-500">
                            First Aid Details
                          </label>
                          <input
                            name="first_aider_detail"
                            value={formData.injury_details.first_aider_detail}
                            onChange={(e) => handleChange(e, "injury_details")}
                            disabled={mode === "view"}
                            className={inputStyle}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Reporting Log */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6 bg-slate-100 p-2 rounded-lg border-l-4 border-orange-500">
                  <h3 className="text-lg lg:text-xl 3xl:text-2xl font-bold text-gray-800 uppercase tracking-wide">
                    5. Communication Log (MSO & OCC)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="relative">
                    <label className={labelStyle}>MSO Report Date</label>
                    <input
                      name="date"
                      value={formData.mso_occ.date}
                      onClick={() =>
                        mode !== "view" && setShowMsoDateSpinner(true)
                      }
                      readOnly
                      disabled={mode === "view"}
                      className={inputStyle}
                      placeholder="dd/mm/yyyy"
                    />
                    {showMsoDateSpinner && (
                      <SpinnerDatePicker
                        value={formData.mso_occ.date}
                        onChange={(date) =>
                          setFormData((p) => ({
                            ...p,
                            mso_occ: { ...p.mso_occ, date },
                          }))
                        }
                        onClose={() => setShowMsoDateSpinner(false)}
                      />
                    )}
                  </div>
                  <div className="relative">
                    <label className={labelStyle}>MSO Report Time</label>
                    <div
                      className={`${inputStyle} cursor-pointer`}
                      onClick={() => {
                        setShowTimeSpinner2(true);
                      }}
                    >
                      {formData.mso_occ.time
                        ? formData.mso_occ.time instanceof Date
                          ? formData.mso_occ.time.toLocaleTimeString([], {
                              hour12: false,
                            })
                          : formData.mso_occ.time
                        : "HH:MM:SS"}
                    </div>
                    {showTimeSpinner2 && (
                      <SpinnerTimePicker
                        value={formData.mso_occ.time}
                        disabled={mode === "view"}
                        onChange={(time) =>
                          setFormData((prev) => ({
                            ...prev,
                            mso_occ: {
                              ...prev.mso_occ,
                              time: time,
                            },
                          }))
                        }
                        onClose={() => setShowTimeSpinner2(false)}
                      />
                    )}
                  </div>
                  <div>
                    <label className={labelStyle}>MSO Name</label>
                    <input
                      name="mso_name"
                      value={formData.mso_occ.mso_name}
                      onChange={(e) => handleChange(e, "mso_occ")}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>OCC Staff Name</label>
                    <input
                      name="occ_staff_name"
                      value={formData.mso_occ.occ_staff_name}
                      onChange={(e) => handleChange(e, "mso_occ")}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Signatures */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6 bg-slate-100 p-2 rounded-lg border-l-4 border-purple-500">
                  <h3 className="text-lg lg:text-xl 3xl:text-2xl font-bold text-gray-800 uppercase tracking-wide">
                    6. Authentication & Acknowledgement
                  </h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <p className="font-bold text-blue-600 border-b pb-2">
                      Reporter Information
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelStyle}>Reported By</label>
                        <input
                          name="reported_by"
                          value={formData.signature.reported_by}
                          onChange={(e) => handleChange(e, "signature")}
                          disabled={mode === "view"}
                          className={inputStyle}
                        />
                      </div>
                      <div>
                        <label className={labelStyle}>Designation</label>
                        <input
                          name="reporter_designation"
                          value={formData.signature.reporter_designation}
                          onChange={(e) => handleChange(e, "signature")}
                          disabled={mode === "view"}
                          className={inputStyle}
                        />
                      </div>
                      <div>
                        <label className={labelStyle}>Form Filled By</label>
                        <input
                          name="filled_by"
                          value={formData.signature.filled_by}
                          onChange={(e) => handleChange(e, "signature")}
                          disabled={mode === "view"}
                          className={inputStyle}
                        />
                      </div>
                      <div>
                        <label className={labelStyle}>Filled By (Desig.)</label>
                        <input
                          name="filler_designation"
                          value={formData.signature.filler_designation}
                          onChange={(e) => handleChange(e, "signature")}
                          disabled={mode === "view"}
                          className={inputStyle}
                        />
                      </div>
                      <div className="relative">
                        <label className={labelStyle}>Filing Date</label>
                        <input
                          name="date_of_filling_form"
                          value={formData.signature.date_of_filling_form}
                          onClick={() =>
                            mode !== "view" && setShowSignatureDateSpinner(true)
                          }
                          readOnly
                          disabled={mode === "view"}
                          className={inputStyle}
                          placeholder="dd/mm/yyyy"
                        />
                        {showSignatureDateSpinner && (
                          <SpinnerDatePicker
                            value={formData.signature.date_of_filling_form}
                            onChange={(date) =>
                              setFormData((p) => ({
                                ...p,
                                signature: {
                                  ...p.signature,
                                  date_of_filling_form: date,
                                },
                              }))
                            }
                            onClose={() => setShowSignatureDateSpinner(false)}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="font-bold text-orange-600 border-b pb-2">
                      MSO Acknowledgement
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className={labelStyle}>MSO/Asst. MSO Name</label>
                        <input
                          name="assistant_name"
                          value={formData.report_acknowledge.assistant_name}
                          onChange={(e) =>
                            handleChange(e, "report_acknowledge")
                          }
                          disabled={mode === "view"}
                          className={inputStyle}
                        />
                      </div>
                      <div className="relative sm:col-span-2">
                        <label className={labelStyle}>
                          Acknowledgement Date
                        </label>
                        <input
                          name="date_time"
                          value={formData.report_acknowledge.date_time}
                          onClick={() =>
                            mode !== "view" && setShowAckDateSpinner(true)
                          }
                          readOnly
                          disabled={mode === "view"}
                          className={inputStyle}
                          placeholder="dd/mm/yyyy"
                        />
                        {showDateAckSpinner && (
                          <SpinnerDatePicker
                            value={formData.report_acknowledge.date_time}
                            onChange={(date) =>
                              setFormData((p) => ({
                                ...p,
                                report_acknowledge: {
                                  ...p.report_acknowledge,
                                  date_time: date,
                                },
                              }))
                            }
                            onClose={() => setShowAckDateSpinner(false)}
                          />
                        )}
                      </div>

                      {/* Signature */}
                      <div>
                        <div>
                          {/* Toggle Tabs */}
                          {mode !== "view" && (
                            <div className="flex flex-wrap gap-2 mb-4">
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
                                      upload_sign: file,
                                      signaturePreview:
                                        URL.createObjectURL(file),
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
                                    if (
                                      file &&
                                      file.type.startsWith("image/")
                                    ) {
                                      setFormData({
                                        ...formData,
                                        upload_sign: file,
                                        signaturePreview:
                                          URL.createObjectURL(file),
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
                                          upload_sign: null,
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
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            {mode !== "view" && (
              <div className="flex flex-wrap justify-end gap-3 mt-12 pt-6 border-t border-blue-100/30">
                <button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-12 py-3 rounded-xl font-bold lg:text-lg 3xl:text-2xl shadow-lg hover:shadow-blue-200 hover:-translate-y-1 transition-all"
                >
                  Submit Report
                </button>
                <button
                  onClick={() => setOpenModal(false)}
                  className="px-10 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold lg:text-lg 3xl:text-2xl hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentAccident;

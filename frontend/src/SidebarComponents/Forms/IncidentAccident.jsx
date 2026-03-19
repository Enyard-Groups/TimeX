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
import SignPad from "./SignPad";

const IncidentAccident = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [incidentData, setIncidentData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [showDateSpinner, setShowDateSpinner] = useState(false);
  const [showMsoDateSpinner, setShowMsoDateSpinner] = useState(false);
  const [showSignatureDateSpinner, setShowSignatureDateSpinner] =
    useState(false);
  const [showDateAckSpinner, setShowAckDateSpinner] = useState(false);
  const [showTimeSpinner, setShowTimeSpinner] = useState(false);
  const [showTimeSpinner2, setShowTimeSpinner2] = useState(false);

  const inputStyle =
    "text-lg w-full  border  border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] ";

  const labelStyle = "text-md text-[oklch(0.147_0.004_49.25)] my-1 block";

  const defaultFormData = {
    dateOfIncident: null,
    timeOfIncident: null,
    location: "",
    building: "",
    otherdetails: "",
    typeofincident: "",
    personAffected: "",
    specifyOtherDetails: "",
    incidentTimeline: "",
    actionTaken: "",
    injuryDetails: {
      illness: "",
      nameofperson: "",
      age: "",
      gender: "",
      category: "",
      description: "",
      firstaid: "",
      takentohospital: "",
      firstAiderName: "",
      firstAiderDesignation: "",
      firstAiderDetail: "",
    },
    msoOcc: {
      time: null,
      date: null,
      msoName: "",
      occStaffName: "",
    },
    signature: {
      reportedBy: "",
      reporterDesignation: "",
      filledBy: "",
      fillerDesignation: "",
      dateOfFillingForm: null,
    },
    reportAcknowledge: {
      assitantName: "",
      dateTime: null,
      uploadSign: null,
    },
    signhere: null,
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

  const currentincidentData = incidentData.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(incidentData.length / entriesPerPage),
  );

  // Handle submit
  const handleSubmit = () => {
    const newEntry = {
      id: editId ? editId : Date.now(),
      ...formData,
    };

    if (editId) {
      const updated = incidentData.map((item) =>
        item.id === editId ? { ...item, ...newEntry } : item,
      );

      setIncidentData(updated);

      // Backend version
      // await axios.put(`/api/manual-entry/${editId}`, newEntry)

      toast.success("Request Updated");
    } else {
      const updated = [...incidentData, newEntry];
      setIncidentData(updated);

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
    const updated = incidentData.filter((v) => v.id !== id);

    setIncidentData(
      updated.map((item) => ({
        ...item,
      })),
    );

    toast.success("Deleted Successfully");
  };

  const handleCopy = () => {
    const header = ["Location", "Building Name", "Date"].join("\t");

    const rows = incidentData
      .map((item) => {
        return [item.location, item.building, item.dateOfIncident].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = incidentData.map((item) => ({
      Location: item.location,
      BuildingName: item.building,
      Date: item.dateOfIncident,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "inspectionData");

    XLSX.writeFile(workbook, "inspectionDataData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = ["Location", "Building Name", "Date"];

    const tableRows = [];

    incidentData.forEach((item) => {
      const row = [item.location, item.building, item.dateOfIncident];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("inspectionDataData.pdf");
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
            Incident / Accident
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

                  <th className="p-2 font-semibold">Date of Incident</th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Location
                  </th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Building Name
                  </th>

                  <th className="p-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentincidentData.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="lg:text-center p-10 ">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentincidentData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                    >
                      <td className="p-2 whitespace-nowrap hidden sm:table-cell">
                        {index + 1}
                      </td>

                      <td className="p-2">{item.dateOfIncident}</td>

                      <td className="p-2 hidden md:table-cell">
                        {item.location}
                      </td>

                      <td className="p-2 hidden md:table-cell">
                        {item.building}
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
              Showing {incidentData.length === 0 ? "0" : startIndex + 1} to{" "}
              {Math.min(endIndex, incidentData.length)} of {incidentData.length}{" "}
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
            <div className="flex justify-end">
              <RxCross2
                onClick={() => setOpenModal(false)}
                className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer mb-3"
              />
            </div>

            <div className="border p-4 rounded-xl border-gray-400 shadow">
              <div
                className="max-h-[75vh] overflow-y-auto pr-2 text-sm"
                style={{ scrollbarWidth: "none" }}
              >
                {/* Incident Details  */}
                <div>
                  <h1 className="bg-gray-200 py-1 px-3 border border-gray-400 text-lg rounded">
                    Incident Details
                  </h1>

                  <div className="grid grid-cols-1 sm:grid-cols-2 mt-2 gap-4">
                    <div className="flex flex-row gap-2">
                      <label className={`${labelStyle}  w-1/3`}>
                        Date of Incident:{" "}
                      </label>
                      <input
                        name="dateOfIncident"
                        value={formData.dateOfIncident || ""}
                        onChange={handleChange}
                        onClick={() => setShowDateSpinner(true)}
                        disabled={mode === "view"}
                        placeholder="dd/mm/yyyy"
                        className={inputStyle}
                      />

                      {showDateSpinner && (
                        <div className="absolute mt-8 ml-8 sm:ml-14 md:ml-16 lg:ml-20 ">
                          <SpinnerDatePicker
                            value={formData.dateOfIncident}
                            onChange={(date) =>
                              setFormData((prev) => ({
                                ...prev,
                                dateOfIncident: date,
                              }))
                            }
                            onClose={() => setShowDateSpinner(false)}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row gap-2">
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
                        {formData.timeOfIncident
                          ? formData.timeOfIncident.toLocaleTimeString([], {
                              hour12: false,
                            })
                          : "HH:MM:SS"}
                      </div>
                      {showTimeSpinner && (
                        <div className="absolute mt-8 ml-8 sm:ml-14 md:ml-16 lg:ml-20 ">
                          <SpinnerTimePicker
                            value={formData.timeOfIncident}
                            onChange={(date) =>
                              setFormData((prev) => ({
                                ...prev,
                                timeOfIncident: date,
                              }))
                            }
                            onClose={() => setShowTimeSpinner(false)}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 mt-2 gap-4">
                    <div className="flex flex-row gap-2">
                      <label className={`${labelStyle} w-1/3`}>
                        Location:{" "}
                      </label>
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className={inputStyle}
                        disabled={mode === "view"}
                      />
                    </div>

                    <div className="flex flex-row gap-2">
                      <label className={`${labelStyle} w-1/3`}>
                        Building / Room:{" "}
                      </label>
                      <input
                        type="text"
                        name="building"
                        value={formData.building}
                        onChange={handleChange}
                        className={inputStyle}
                        disabled={mode === "view"}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 mt-2 gap-4">
                    <div className="flex flex-row gap-2">
                      <label className={`${labelStyle}  w-1/3`}>
                        Other Details:{" "}
                      </label>
                      <input
                        type="text"
                        name="otherdetails"
                        value={formData.otherdetails}
                        onChange={handleChange}
                        className={inputStyle}
                        disabled={mode === "view"}
                      />
                    </div>
                    <div className="flex flex-row gap-2">
                      <label className={`${labelStyle}  w-1/3`}>
                        Type of the incident:{" "}
                      </label>
                      <input
                        type="text"
                        name="typeofincident"
                        value={formData.typeofincident}
                        onChange={handleChange}
                        className={inputStyle}
                        disabled={mode === "view"}
                      />
                    </div>
                  </div>
                  <h1 className="mt-2">
                    (Assult, Verbal Abuse, Security Threat,Fire, Theft, Robbery,
                    Fraud, injury, Illness, damage, etc)
                  </h1>
                  <div className="grid grid-cols-1 sm:grid-cols-2 mt-2 gap-4">
                    <div className="flex flex-row gap-2">
                      <label className={`${labelStyle}  w-1/3`}>
                        Person Affected:{" "}
                      </label>
                      <input
                        type="text"
                        name="personAffected"
                        value={formData.personAffected}
                        onChange={handleChange}
                        className={inputStyle}
                        disabled={mode === "view"}
                      />
                    </div>
                    <div className="flex flex-row gap-2">
                      <label className={`${labelStyle}  w-1/3`}>
                        Others (Please Specify):{" "}
                      </label>
                      <input
                        type="text"
                        name="specifyOtherDetails"
                        value={formData.specifyOtherDetails}
                        onChange={handleChange}
                        className={inputStyle}
                        disabled={mode === "view"}
                      />
                    </div>
                  </div>
                </div>

                {/* Incident Timeline */}
                <div>
                  <h1 className="bg-gray-200 py-1 px-3 border border-gray-400 text-lg mt-4 rounded">
                    Incident Timeline{" "}
                  </h1>
                  <p>
                    * ((Record the details of the incident /accident in the
                    below section as per the timeline of occurence of events))
                  </p>
                  <textarea
                    name="incidentTimeline"
                    value={formData.incidentTimeline}
                    disabled={mode === "view"}
                    onChange={handleChange}
                    className="w-full border border-gray-400 h-[300px] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] p-2 rounded"
                  />
                </div>

                {/* Action Taken */}
                <div>
                  <h1 className="bg-gray-200 py-1 px-3 border border-gray-400 text-lg mt-4 rounded">
                    Action Taken At Incident Scene (Details){" "}
                  </h1>
                  <textarea
                    name="actionTaken"
                    value={formData.actionTaken}
                    disabled={mode === "view"}
                    onChange={handleChange}
                    className="w-full mt-2 border border-gray-400 h-[200px] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] p-2 rounded"
                  />
                </div>

                {/* Injury Details */}

                <h1 className="bg-gray-200 mb-2 py-1 px-3 border border-gray-400 text-lg mt-4 rounded">
                  Injury Details{" "}
                </h1>

                <div className="border border-gray-400 rounded p-4 mb-4">
                  {/* Yes / No */}
                  <div className="flex items-center gap-4 mb-3">
                    <span>
                      Was anyone injured or ill due to or as part of the
                      incident?
                    </span>
                    <label>
                      <input
                        type="radio"
                        name="illness"
                        value="Yes"
                        checked={formData.injuryDetails.illness === "Yes"}
                        onChange={(e) => handleChange(e, "injuryDetails")}
                      />{" "}
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="illness"
                        value="No"
                        checked={formData.injuryDetails.illness === "No"}
                        onChange={(e) => handleChange(e, "injuryDetails")}
                      />{" "}
                      No
                    </label>
                  </div>

                  {/* Table Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className={labelStyle}>
                        Name of injured/ ill Person
                      </label>
                      <input
                        name="nameofperson"
                        value={formData.injuryDetails.nameofperson}
                        disabled={mode === "view"}
                        onChange={(e) => handleChange(e, "injuryDetails")}
                        className={inputStyle}
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>Age</label>
                      <input
                        name="age"
                        value={formData.injuryDetails.age}
                        disabled={mode === "view"}
                        onChange={(e) => handleChange(e, "injuryDetails")}
                        className={inputStyle}
                      />
                    </div>

                    <div>
                      <h1 className={labelStyle}>Gender</h1>
                      <div className="flex items-center gap-2">
                        <label>
                          <input
                            type="radio"
                            name="gender"
                            value="M"
                            checked={formData.injuryDetails.gender === "M"}
                            onChange={(e) => handleChange(e, "injuryDetails")}
                          />{" "}
                          M
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="gender"
                            value="F"
                            checked={formData.injuryDetails.gender === "F"}
                            onChange={(e) => handleChange(e, "injuryDetails")}
                          />{" "}
                          F
                        </label>
                      </div>
                    </div>

                    <div>
                      <h1 className={labelStyle}>Was First Aid Provided?</h1>
                      <div className="space-x-2">
                        <label>
                          <input
                            type="radio"
                            name="firstaid"
                            value="Yes"
                            checked={formData.injuryDetails.firstaid === "Yes"}
                            onChange={(e) => handleChange(e, "injuryDetails")}
                          />{" "}
                          Yes
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="firstaid"
                            value="No"
                            checked={formData.injuryDetails.firstaid === "No"}
                            onChange={(e) => handleChange(e, "injuryDetails")}
                          />{" "}
                          No
                        </label>
                      </div>
                    </div>

                    <div>
                      <h1 className={labelStyle}>Taken to Hospital</h1>

                      <div className="space-x-2">
                        <label>
                          <input
                            type="radio"
                            name="takentohospital"
                            value="Yes"
                            checked={
                              formData.injuryDetails.takentohospital === "Yes"
                            }
                            onChange={(e) => handleChange(e, "injuryDetails")}
                          />{" "}
                          Yes
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="takentohospital"
                            value="No"
                            checked={
                              formData.injuryDetails.takentohospital === "No"
                            }
                            onChange={(e) => handleChange(e, "injuryDetails")}
                          />{" "}
                          No
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className={labelStyle}>
                        Category ( Contractor, third party, public, staff,
                        student etc)
                      </label>
                      <input
                        name="category"
                        value={formData.injuryDetails.category}
                        disabled={mode === "view"}
                        onChange={(e) => handleChange(e, "injuryDetails")}
                        className={inputStyle}
                      />
                    </div>

                    <div className="col-span-2">
                      <label className={`${labelStyle} text-center`}>
                        Description of Injury/ Illness
                      </label>
                      <textarea
                        name="description"
                        value={formData.injuryDetails.description}
                        disabled={mode === "view"}
                        onChange={(e) => handleChange(e, "injuryDetails")}
                        className={`${inputStyle}col-span-2`}
                      />
                    </div>
                  </div>

                  <h2 className="font-semibold mb-2">First Aid Details</h2>

                  <div className="md:w-3/4">
                    <div className="flex flex-row mt-2">
                      <label
                        className={`${labelStyle} sm:whitespace-nowrap mr-2 w-1/2`}
                      >
                        Name of First Aider :
                      </label>
                      <input
                        name="firstAiderName"
                        value={formData.injuryDetails.firstAiderName}
                        disabled={mode === "view"}
                        onChange={(e) => handleChange(e, "injuryDetails")}
                        className={inputStyle}
                      />
                    </div>
                    <div className="flex flex-row mt-2">
                      <label
                        className={`${labelStyle} whitespace-nowrap mr-2  w-1/2`}
                      >
                        Designation :
                      </label>
                      <input
                        name="firstAiderDesignation"
                        value={formData.injuryDetails.firstAiderDesignation}
                        disabled={mode === "view"}
                        onChange={(e) => handleChange(e, "injuryDetails")}
                        className={inputStyle}
                      />
                    </div>
                    <div className="flex flex-row mt-2">
                      <label
                        className={`${labelStyle} sm:whitespace-nowrap mr-2  w-1/2`}
                      >
                        Details of First Aid Provided :
                      </label>
                      <input
                        name="firstAiderDetail"
                        value={formData.injuryDetails.firstAiderDetail}
                        disabled={mode === "view"}
                        onChange={(e) => handleChange(e, "injuryDetails")}
                        className={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Reporting Section */}

                <h1 className="bg-gray-200 mb-2 py-1 px-3 border border-gray-400 text-lg mt-4 rounded">
                  Reporting to MSO & Safecor OCC
                </h1>

                <div className="border border-gray-400 rounded p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className=" mt-2">
                      <label
                        className={`${labelStyle} whitespace-nowrap mr-2 w-1/2`}
                      >
                        Time
                      </label>
                      <div
                        className={`${inputStyle} cursor-pointer`}
                        onClick={() => {
                          setShowTimeSpinner2(true);
                        }}
                      >
                        {formData.msoOcc.time
                          ? formData.msoOcc.time.toLocaleTimeString([], {
                              hour12: false,
                            })
                          : "HH:MM:SS"}
                      </div>
                      {showTimeSpinner2 && (
                        <SpinnerTimePicker
                          value={formData.msoOcc.time}
                          disabled={mode === "view"}
                          onChange={(time) =>
                            setFormData((prev) => ({
                              ...prev,
                              msoOcc: {
                                ...prev.msoOcc,
                                time: time,
                              },
                            }))
                          }
                          onClose={() => setShowTimeSpinner2(false)}
                        />
                      )}
                    </div>

                    <div className=" mt-2">
                      <label
                        className={`${labelStyle} whitespace-nowrap mr-2 w-1/2`}
                      >
                        Date
                      </label>

                      <input
                        name="date"
                        value={formData.msoOcc.date || ""}
                        onChange={(e) => handleChange(e, "msoOcc")}
                        onClick={() => setShowMsoDateSpinner(true)}
                        disabled={mode === "view"}
                        placeholder="dd/mm/yyyy"
                        className={inputStyle}
                      />

                      {showMsoDateSpinner && (
                        <SpinnerDatePicker
                          value={formData.msoOcc.date}
                          onChange={(date) =>
                            setFormData((prev) => ({
                              ...prev,
                              msoOcc: {
                                ...prev.msoOcc,
                                date: date,
                              },
                            }))
                          }
                          onClose={() => setShowMsoDateSpinner(false)}
                        />
                      )}
                    </div>

                    <div className=" mt-2">
                      <label
                        className={`${labelStyle} whitespace-nowrap mr-2 w-1/2`}
                      >
                        Reported to MSO Name
                      </label>
                      <input
                        name="msoName"
                        value={formData.msoOcc.msoName}
                        disabled={mode === "view"}
                        onChange={(e) => handleChange(e, "msoOcc")}
                        className={inputStyle}
                      />
                    </div>

                    <div className=" mt-2">
                      <label
                        className={`${labelStyle} whitespace-nowrap mr-2 w-1/2`}
                      >
                        Safecor OCC Staff Name
                      </label>
                      <input
                        name="occStaffName"
                        value={formData.msoOcc.occStaffName}
                        disabled={mode === "view"}
                        onChange={(e) => handleChange(e, "msoOcc")}
                        className={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Signature */}

                <h1 className="bg-gray-200 mb-2 py-1 px-3 border border-gray-400 text-lg mt-4 rounded">
                  Signature
                </h1>
                <div className="border border-gray-400 rounded p-4 mb-4">
                  <h2 className="font-semibold mb-2">Signature</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-row mt-2">
                      <label
                        className={`${labelStyle} sm:whitespace-nowrap mr-2 w-1/2`}
                      >
                        Incident Reported By
                      </label>
                      <input
                        name="reportedBy"
                        value={formData.signature.reportedBy}
                        disabled={mode === "view"}
                        onChange={(e) => handleChange(e, "signature")}
                        className={inputStyle}
                      />
                    </div>
                    <div className="flex flex-row mt-2">
                      <label
                        className={`${labelStyle} whitespace-nowrap mr-2 w-1/2`}
                      >
                        Designation
                      </label>
                      <input
                        name="reporterDesignation"
                        value={formData.signature.reporterDesignation}
                        disabled={mode === "view"}
                        onChange={(e) => handleChange(e, "signature")}
                        className={inputStyle}
                      />
                    </div>

                    <div className="flex flex-row mt-2">
                      <label
                        className={`${labelStyle} sm:whitespace-nowrap mr-2 w-1/2`}
                      >
                        Form Filled By
                      </label>
                      <input
                        name="filledBy"
                        value={formData.signature.filledBy}
                        disabled={mode === "view"}
                        onChange={(e) => handleChange(e, "signature")}
                        className={inputStyle}
                      />
                    </div>

                    <div className="flex flex-row mt-2">
                      <label
                        className={`${labelStyle} whitespace-nowrap mr-2 w-1/2`}
                      >
                        Designation
                      </label>
                      <input
                        name="fillerDesignation"
                        value={formData.signature.fillerDesignation}
                        disabled={mode === "view"}
                        onChange={(e) => handleChange(e, "signature")}
                        className={inputStyle}
                      />
                    </div>

                    <div className="flex flex-row mt-2">
                      <label
                        className={`${labelStyle} whitespace-nowrap mr-2 w-1/2`}
                      >
                        Date
                      </label>
                      <input
                        name="dateOfFillingForm"
                        value={formData.signature.dateOfFillingForm || ""}
                        onChange={(e) => handleChange(e, "signature")}
                        onClick={() => setShowSignatureDateSpinner(true)}
                        disabled={mode === "view"}
                        placeholder="dd/mm/yyyy"
                        className={inputStyle}
                      />

                      {showSignatureDateSpinner && (
                        <div className="absolute mt-8 ml-8 sm:ml-14 md:ml-16 lg:ml-20 ">
                          <SpinnerDatePicker
                            value={formData.signature.dateOfFillingForm}
                            onChange={(date) =>
                              setFormData((prev) => ({
                                ...prev,
                                signature: {
                                  ...prev.signature,
                                  dateOfFillingForm: date,
                                },
                              }))
                            }
                            onClose={() => setShowSignatureDateSpinner(false)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Report Acknowledged By */}
                <h1 className="bg-gray-200 mb-2 py-1 px-3 border border-gray-400 text-lg mt-4 rounded">
                  Report Acknowledged By
                </h1>
                <div className="border border-gray-400 rounded p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-row mt-2">
                      <label
                        className={`${labelStyle} sm:whitespace-nowrap mr-2 w-1/2`}
                      >
                        MSO/Assistant MSO Name
                      </label>
                      <input
                        name="assitantName"
                        value={formData.reportAcknowledge.assitantName}
                        disabled={mode === "view"}
                        onChange={(e) => handleChange(e, "reportAcknowledge")}
                        className={inputStyle}
                      />
                    </div>

                    <div className="flex flex-row mt-2">
                      <label
                        className={`${labelStyle} whitespace-nowrap mr-2 w-1/2`}
                      >
                        Signature
                      </label>
                      <input
                        name="uploadSign"
                        type="file"
                        disabled={mode === "view"}
                        onChange={(e) => {
                          const file = e.target.files[0];

                          setFormData((prev) => ({
                            ...prev,
                            reportAcknowledge: {
                              ...prev.reportAcknowledge,
                              uploadSign: file,
                            },
                          }));
                        }}
                        className={inputStyle}
                      />
                    </div>

                    <div className="flex flex-row mt-2">
                      <label
                        className={`${labelStyle} whitespace-nowrap mr-2 w-1/2`}
                      >
                        Date
                      </label>
                      <input
                        name="dateTime"
                        value={formData.reportAcknowledge.dateTime || ""}
                        onChange={(e) => handleChange(e, "reportAcknowledge")}
                        onClick={() => setShowAckDateSpinner(true)}
                        disabled={mode === "view"}
                        placeholder="dd/mm/yyyy"
                        className={`${inputStyle} h-10`}
                      />

                      {showDateAckSpinner && (
                        <div className="absolute mt-8 ml-8 sm:ml-14 md:ml-16 lg:ml-20 ">
                          <SpinnerDatePicker
                            value={formData.reportAcknowledge.dateTime}
                            onChange={(date) =>
                              setFormData((prev) => ({
                                ...prev,
                                reportAcknowledge: {
                                  ...prev.reportAcknowledge,
                                  dateTime: date,
                                },
                              }))
                            }
                            onClose={() => setShowAckDateSpinner(false)}
                          />
                        </div>
                      )}
                    </div>

                    <div className="sm:flex sm:flex-row">
                      <h1 className="mt-3 w-1/3">Sign Here:</h1>
                      <SignPad
                        fieldName="signhere"
                        formData={formData}
                        setFormData={setFormData}
                        mode={mode}
                      />
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
      )}
    </div>
  );
};

export default IncidentAccident;

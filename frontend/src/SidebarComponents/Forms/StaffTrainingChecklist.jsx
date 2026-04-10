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

const API_URL = "http://localhost:3000/api/form/staffTraining";
import SearchDropdown from "../SearchDropdown";
import SpinnerDatePicker from "../SpinnerDatePicker";
import SignPad from "./SignPad";

const StaffTrainingChecklist = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [requestData, setRequestData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDateSpinner, setShowDateSpinner] = useState(false);

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 lg:text-lg 3xl:text-xl rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm";
  const labelStyle =
    "text-sm lg:text-base 3xl:text-xl focus:outline-none font-semibold text-gray-700 mb-2 block";

  const defaultFormData = {
    employee_name: "",
    enrollment_id: "",
    trainer_name: "",
    date: null,
    position_title: "",
    location: "",

    smokeDetect: "",
    fireAlarm: "",
    encounteringIncidentAccident: "",
    suspiciousObject: "",
    unattented: "",
    hazardousMaterial: "",
    evacuation: "",
    standardResponseProtocol: "",

    emergencyEscape: "",
    equipmentLocation: "",
    lockdownProcedure: "",
    lvRoom: "",
    gemsPremises: "",

    fireEquipment: "",
    securityEquipment: "",
    dangerousEquipment: "",

    operationHandbook: "",
    keymanagement: "",
    cctv: "",
    safeguarding: "",
    fm200: "",
    schoolEntrance: "",
    managetraffic: "",
    schoolReception: "",
    arrangement: "",
    externalEnvironment: "",
    mso: "",
    patrollingChecklist: "",
    keyAvailability: "",

    evacuationPlan: "",
    lockdown: "",
    incidentReport: "",
    patrolling: "",
    logbook: "",
    contractor: "",
    handoverForm: "",
    briefingForm: "",
    outSource: "",
    keyLogbook: "",
    damageKey: "",
    outgoingDelivery: "",
    searchRecord: "",
    traineeSignMode: "",
    signature: null,
    traineeSignPreview: null,
    signature_drawn: null,

    traineeSign2Mode: "",
    signature2: null,
    traineeSign2Preview: null,
    signature2_drawn: null,
  };

  const [formData, setFormData] = useState(defaultFormData);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setRequestData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const data = {
    Safety_Familiarisation: [
      {
        label: "Fire or smoke is detected at school and other GEMS facilities.",
        name: "smokeDetect",
      },
      { label: "Response to Fire alarm", name: "fireAlarm" },
      {
        label: "Encountering an incident/accident",
        name: "encounteringIncidentAccident",
      },
      {
        label: "Suspicious object has been found",
        name: "suspiciousObject",
      },
      {
        label: "Unattended item has been found",
        name: "unattented",
      },
      {
        label: "Flammable or hazardous materials have been found",
        name: "hazardousMaterial",
      },
      { label: "Damaged / Lost key details if any", name: "damageRemark" },
      {
        label: "School evacuation has been declared",
        name: "evacuation",
      },
      {
        label:
          "School lock down, lock out, shelter in place have been declared (Standard Response Protocols)",
        name: "standardResponseProtocol",
      },
    ],
    Emergency_Familiarisation: [
      {
        label: "Familiarization to emergency escape routes",
        name: "emergencyEscape",
      },
      {
        label: "Identify the fire equipments location",
        name: "equipmentLocation",
      },
      {
        label: "Be aware of school evacuation and lock down procedure",
        name: "lockdownProcedure",
      },
      {
        label: "Identify the location of dangerous equipments (i.e. LV Room)",
        name: "dangerousEquipment",
      },
      {
        label:
          "Must know who should and who should not access to GEMS premises",
        name: "gemsPremises",
      },
    ],
    Equipment_Familiarisation: [
      { label: "Must know how to use fire equipments", name: "fireEquipment" },
      {
        label:
          "Must have knowledge of security equipment (Guard Tour System, Radios, and Mega Phone etc.)",
        name: "securityEquipment",
      },
      {
        label:
          "Must have familiarization to dangerous equipment (LV, Pump, FM200 & Chiller Rooms etc.) to respond in case of emergency",
        name: "dangerousEquipment",
      },
    ],
    Security_Familiarisation: [
      {
        label: "Understand school security operation handbook",
        name: "operationHandbook",
      },
      {
        label: "Understand the key management process at school",
        name: "keymanagement",
      },
      { label: "Identify the coverage area of the CCTV", name: "cctv" },
      { label: "Child Safeguarding Policy", name: "safeguarding" },
      {
        label:
          "Know the location of external electrical rooms e.g. LV room, Plant room. FM200 etc.",
        name: "fm200",
      },
      {
        label:
          "Know the location and the number of school entrances and exits.",
        name: "schoolEntrance",
      },
      {
        label: "Know how to manage the traffic at the front of the school",
        name: "managetraffic",
      },
      {
        label:
          "Be familiarized with school reception and other common areas e.g. play grounds, bus parking etc.",
        name: "schoolReception",
      },
      { label: "Access control arrangements", name: "arrangement" },
      {
        label: "Be familiarised with school external environment",
        name: "externalEnvironment",
      },
      {
        label:
          ".Know the location of MSO, Principle & Assistant Principle office, cash room etc.",
        name: "mso",
      },
      {
        label: "Know how to complete “security patrolling checklist.",
        name: "patrollingChecklist",
      },
      { label: "Know how to check “key availability", name: "keyAvailability" },
    ],
    Security_and_safety_document_Familiarisation: [
      { label: "School evacuation plan", name: "evacuationPlan" },
      { label: "School Lockdown procedure", name: "lockdown" },
      { label: "Incident/Accident report form", name: "incidentReport" },
      { label: "School security patrolling checklist", name: "patrolling" },
      { label: "Security logbook", name: "logbook" },
      { label: "Visitor and contractor record sheet", name: "contractor" },
      { label: "Shift hand over form", name: "handoverForm" },
      { label: "Sign on and briefing form", name: "briefingForm" },
      { label: "Outsource company KPIs", name: "outSource" },
      { label: "Key logbook", name: "keyLogbook" },
      { label: "Lost and damage key report form", name: "damageKey" },
      {
        label: "Gate pass for incoming and outgoing delivery",
        name: "outgoingDelivery",
      },
      {
        label: "Staff, visitor and contractor search record form",
        name: "searchRecord",
      },
    ],
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentrequestData = requestData.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(requestData.length / entriesPerPage),
  );

  // Handle submit
  const handleSubmit = async () => {
    const coreFields = [
      "employee_name",
      "enrollment_id",
      "trainer_name",
      "date",
      "position_title",
      "location",
    ];
    const signatureFields = [
      "signature",
      "signature_drawn",
      "signature2",
      "signature_drawn2",
    ];

    const payload = {};
    const training_data = {};
    const signatures = {};

    Object.keys(formData).forEach((key) => {
      if (coreFields.includes(key)) {
        payload[key] = formData[key];
      } else if (signatureFields.includes(key)) {
        signatures[key] = formData[key];
      } else {
        training_data[key] = formData[key];
      }
    });

    payload.training_data = training_data;
    payload.signatures = signatures;

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, payload);
        toast.success("Request Updated");
      } else {
        await axios.post(API_URL, payload);
        toast.success("Request Submitted");
      }

      setOpenModal(false);
      setEditId(null);
      setFormData(defaultFormData);
      fetchData();
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save data");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success("Deleted Successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting data:", error);
      toast.error("Failed to delete data");
    }
  };

  const handleCopy = () => {
    const header = [
      "Employee Name",
      "EnrollmentID",
      "TrainerName",
      "Date",
    ].join("\t");

    const rows = requestData
      .map((item) => {
        return [
          item.employee_name,
          item.enrollment_id,
          item.trainer_name,
          item.date,
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = requestData.map((item) => ({
      EmployeeName: item.employee_name,
      EnrollmentID: item.enrollment_id,
      TrainerName: item.trainer_name,
      Date: item.date,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "StaffTrainingChecklistData",
    );

    XLSX.writeFile(workbook, "StaffTrainingChecklistData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "Employee Name",
      "EnrollmentID",
      "TrainerName",
      "Date",
    ];

    const tableRows = [];

    requestData.forEach((item) => {
      const row = [
        item.employee_name,
        item.enrollment_id,
        item.trainer_name,
        item.date,
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("StaffTrainingChecklistData.pdf");
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
            Staff Training Checklist
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

      {/* Main Table Container */}
      {!openModal && (
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl animate-in fade-in duration-500">
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
                  className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm lg:text-base 3xl:text-xl focus:ring-2 focus:ring-blue-500/60 transition-all"
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
                  <th className="py-3 px-6 font-semibold text-gray-700 text-center">
                    Employee Name
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                    Enrollment Id
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                    Trainer Name
                  </th>
                  <th className="py-3 px-6 hidden lg:table-cell font-semibold text-gray-700">
                    Date
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
                ) : currentrequestData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-12 text-center text-gray-500 font-medium"
                    >
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentrequestData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/60"
                    >
                      <td className="py-3 px-6 hidden sm:table-cell text-gray-900 text-center">
                        {startIndex + index + 1}
                      </td>
                      <td className="py-3 px-6 font-medium text-gray-900 text-center">
                        {item.employee_name}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600 font-mono">
                        {item.enrollment_id}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600">
                        {item.trainer_name}
                      </td>
                      <td className="py-3 px-6 hidden lg:table-cell text-gray-600 text-center">
                        {item.date}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex justify-center gap-3">
                          <FaEye
                            onClick={() => {
                              /* View logic */ setMode("view");
                              setOpenModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 lg:text-xl 3xl:text-3xl cursor-pointer transition-all"
                          />
                          <FaPen
                            onClick={() => {
                              /* Edit logic */ setMode("edit");
                              setOpenModal(true);
                            }}
                            className="text-green-500 hover:text-green-700 lg:text-xl 3xl:text-3xl cursor-pointer transition-all"
                          />
                          <MdDeleteForever
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 lg:text-xl 3xl:text-3xl cursor-pointer transition-all"
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
            <span className="text-sm lg:text-base 3xl:text-xl text-gray-600">
              Showing{" "}
              <span className="text-gray-900 font-semibold">
                {requestData.length === 0 ? "0" : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="text-gray-900 font-semibold">
                {Math.min(endIndex, requestData.length)}
              </span>{" "}
              of{" "}
              <span className="text-gray-900 font-semibold">
                {requestData.length}
              </span>{" "}
              entries
            </span>

            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                title="First page"
              >
                First
              </button>

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
                title="Previous page"
              >
                <GrPrevious />
              </button>

              <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-semibold min-w-[45px] text-center">
                {currentPage}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
                title="Next page"
              >
                <GrNext />
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                title="Last page"
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
                  ? "Checklist Details"
                  : mode === "edit"
                    ? "Edit Training Checklist"
                    : "New Staff Training Checklist"}
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="border p-6 rounded-xl border-gray-400/20 shadow-sm bg-white">
              <div
                className="max-h-[75vh] overflow-y-auto pr-2 text-sm lg:text-base 3xl:text-xl"
                style={{ scrollbarWidth: "none" }}
              >
                {/* Form Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm lg:text-base 3xl:text-xl focus:outline-none font-semibold text-gray-700  block">
                      Staff Full Name <span className="text-red-500">*</span>
                    </label>
                    <SearchDropdown
                      name="employee_name"
                      value={formData.employee_name}
                      options={["Employee 1", "Employee 2"]}
                      formData={formData}
                      setFormData={setFormData}
                      disabled={mode === "view"}
                      inputStyle={inputStyle}
                      labelStyle={labelStyle}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelStyle}>Staff ID</label>
                    <input
                      name="enrollment_id"
                      value={formData.enrollment_id}
                      onChange={handleChange}
                      className={inputStyle}
                      disabled={mode === "view"}
                      placeholder="Enrollment ID"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelStyle}>Trainer Name</label>
                    <input
                      name="trainer_name"
                      value={formData.trainer_name}
                      onChange={handleChange}
                      className={inputStyle}
                      disabled={mode === "view"}
                      placeholder="Enter trainer name"
                    />
                  </div>
                  <div className="flex flex-col gap-2 relative">
                    <label className={labelStyle}>Training Date</label>
                    <input
                      name="date"
                      value={formData.date || ""}
                      onClick={() =>
                        mode !== "view" && setShowDateSpinner(true)
                      }
                      readOnly
                      disabled={mode === "view"}
                      placeholder="dd/mm/yyyy"
                      className={inputStyle}
                    />
                    {showDateSpinner && (
                      <div className="absolute z-10 top-16 shadow-2xl">
                        <SpinnerDatePicker
                          value={formData.date}
                          onChange={(date) =>
                            setFormData((p) => ({ ...p, date }))
                          }
                          onClose={() => setShowDateSpinner(false)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelStyle}>
                      Staff(Trainee) Position Title
                    </label>
                    <input
                      name="positionTitle"
                      value={formData.positionTitle}
                      onChange={handleChange}
                      className={inputStyle}
                      disabled={mode === "view"}
                      placeholder="Position"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm lg:text-base 3xl:text-xl focus:outline-none font-semibold text-gray-700  block">
                      Location Name
                    </label>
                    <SearchDropdown
                      name="location"
                      value={formData.location}
                      options={["Location 1", "Location 2"]}
                      formData={formData}
                      setFormData={setFormData}
                      disabled={mode === "view"}
                      inputStyle={inputStyle}
                      labelStyle={labelStyle}
                    />
                  </div>
                </div>

                {/* Instruction Notes */}
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-8">
                  <h4 className="font-bold text-blue-900 mb-3 underline">
                    Assessment Criteria Notes:
                  </h4>
                  <div className="grid md:grid-cols-2 gap-8 text-sm lg:text-base 3xl:text-lg text-blue-800">
                    <div>
                      <p className="mb-2">
                        <b>Training Status:</b> Acknowledgment that staff has
                        been briefed on mentioned items.
                      </p>
                      <ul className="pl-4 italic">
                        <li>• Completed (√)</li>
                        <li>• Incompleted (x)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2">
                        <b>Assessment Level:</b> Skill rating given by trainer
                        (Excellent, Very Good, Good, Fair, Poor).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checklist Tables */}
                {Object.entries(data).map(([key, value], index) => (
                  <div
                    key={key}
                    className="mb-10 rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                  >
                    <div className="hidden md:grid grid-cols-[64px_1fr_25%_25%] bg-slate-100 text-gray-700 font-bold border-b border-gray-200">
                      <div className="p-4 text-center">#{index + 1}</div>
                      <div className="p-4 uppercase tracking-wider">{key}</div>
                      <div className="p-4 text-center">Training Status</div>
                      <div className="p-4 text-center">Assessment Level</div>
                    </div>

                    {/* Table Body / Mobile Cards */}
                    <div className="flex flex-col">
                      {value.map((item, i) => (
                        <div
                          key={item.name}
                          className="flex flex-col md:grid md:grid-cols-[64px_1fr_25%_25%] border-b border-gray-100 last:border-0 hover:bg-slate-50 transition-colors"
                        >
                          {/* Index Row: On mobile, acts as a sub-header */}
                          <div className="p-2 md:p-4 bg-slate-50 md:bg-transparent text-center text-gray-400 font-mono text-xs md:text-base border-b md:border-b-0">
                            {index + 1}.{i + 1}
                          </div>

                          {/* Label Row */}
                          <div className="p-3 md:p-4 font-medium text-gray-700 text-sm md:text-base border-b md:border-b-0">
                            <span className="md:hidden text-[10px] uppercase text-gray-400 block mb-1">
                              Task
                            </span>
                            {item.label}
                          </div>

                          {/* Training Status Dropdown */}
                          <div className="p-3 md:p-2 border-b md:border-b-0">
                            <span className="md:hidden text-[10px] uppercase text-gray-400 block mb-1 px-1">
                              Training Status
                            </span>
                            <SearchDropdown
                              name={`${item.name}_status`}
                              value={formData[`${item.name}_status`]}
                              displayValue={
                                formData[`${item.name}_status`] || "Select"
                              }
                              options={["Completed (√)", "Incompleted (x)"]}
                              formData={formData}
                              inputStyle={inputStyle}
                              setFormData={setFormData}
                              disabled={mode === "view"}
                            />
                          </div>

                          {/* Assessment Level Dropdown */}
                          <div className="p-3 md:p-2">
                            <span className="md:hidden text-[10px] uppercase text-gray-400 block mb-1 px-1">
                              Assessment Level
                            </span>
                            <SearchDropdown
                              name={`${item.name}_level`}
                              value={formData[`${item.name}_level`]}
                              displayValue={
                                formData[`${item.name}_level`] || "Select"
                              }
                              options={[
                                "Excellent",
                                "Very Good",
                                "Good",
                                "Fair",
                                "Poor",
                              ]}
                              formData={formData}
                              inputStyle={inputStyle}
                              setFormData={setFormData}
                              disabled={mode === "view"}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
                  <div className="flex justify-center">
                    <div>
                      <label className="block text-sm lg:text-base font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">
                        Signature by Trainee
                      </label>
                      <div className="flex flex-col">
                        {/* Toggle Tabs — hidden in view mode */}
                        {mode !== "view" && (
                          <div className="flex gap-2 mb-4 mt-2">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  traineeSignMode: "upload",
                                }))
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.traineeSignMode === "upload"
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
                                  traineeSignMode: "draw",
                                }))
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.traineeSignMode === "draw"
                                  ? "bg-[#0f172a] text-white border-[#0f172a]"
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Sign Here
                            </button>
                          </div>
                        )}

                        {/* Upload Area */}
                        {formData.traineeSignMode === "upload" && (
                          <div>
                            <input
                              type="file"
                              id="traineeSignUpload"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    signature: file,
                                    traineeSignPreview:
                                      URL.createObjectURL(file),
                                  }));
                                }
                              }}
                            />

                            {/* Drag & Drop Zone */}
                            {mode !== "view" && (
                              <label
                                htmlFor="traineeSignUpload"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const file = e.dataTransfer.files[0];
                                  if (file && file.type.startsWith("image/")) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      signature: file,
                                      traineeSignPreview:
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
                            {formData.traineeSignPreview && (
                              <div className="mt-4 flex items-center gap-3">
                                <img
                                  src={formData.traineeSignPreview}
                                  alt="Signature Preview"
                                  className="h-16 border rounded bg-white p-2 shadow-sm"
                                />
                                {mode !== "view" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        signature: null,
                                        traineeSignPreview: null,
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
                        {formData.traineeSignMode === "draw" && (
                          <SignPad
                            fieldName="signature_drawn"
                            formData={formData}
                            setFormData={setFormData}
                            mode={mode}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div>
                      <label className="block text-sm lg:text-base font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">
                        Signature by Trainee
                      </label>
                      <div className="flex flex-col">
                        {/* Toggle Tabs — hidden in view mode */}
                        {mode !== "view" && (
                          <div className="flex gap-2 mb-4 mt-2">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  traineeSign2Mode: "upload",
                                }))
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.traineeSign2Mode === "upload"
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
                                  traineeSign2Mode: "draw",
                                }))
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.traineeSign2Mode === "draw"
                                  ? "bg-[#0f172a] text-white border-[#0f172a]"
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Sign Here
                            </button>
                          </div>
                        )}

                        {/* Upload Area */}
                        {formData.traineeSign2Mode === "upload" && (
                          <div>
                            <input
                              type="file"
                              id="traineeSign2Upload"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    signature2: file,
                                    traineeSign2Preview:
                                      URL.createObjectURL(file),
                                  }));
                                }
                              }}
                            />

                            {/* Drag & Drop Zone */}
                            {mode !== "view" && (
                              <label
                                htmlFor="traineeSign2Upload"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const file = e.dataTransfer.files[0];
                                  if (file && file.type.startsWith("image/")) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      signature2: file,
                                      traineeSign2Preview:
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
                            {formData.traineeSign2Preview && (
                              <div className="mt-4 flex items-center gap-3">
                                <img
                                  src={formData.traineeSign2Preview}
                                  alt="Signature Preview"
                                  className="h-16 border rounded bg-white p-2 shadow-sm"
                                />
                                {mode !== "view" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        signature2: null,
                                        traineeSign2Preview: null,
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
                        {formData.traineeSign2Mode === "draw" && (
                          <SignPad
                            fieldName="signature2_drawn"
                            formData={formData}
                            setFormData={setFormData}
                            mode={mode}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                {mode !== "view" && (
                  <div className="flex justify-end mt-12 pb-6 border-t pt-8">
                    <button
                      onClick={handleSubmit}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-16 py-3 rounded-xl font-bold lg:text-xl shadow-xl hover:shadow-blue-200 hover:-translate-y-1 transition-all"
                    >
                      Save Training Record
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

export default StaffTrainingChecklist;

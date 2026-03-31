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
  const [showDateSpinner, setShowDateSpinner] = useState(false);

  const labelStyle =
    "whitespace-nowrap text-[16px] text-[oklch(0.147_0.004_49.25)] my-1 block w-1/2";

  const inputStyle =
    "text-[16px] w-full border border-[oklch(0.923_0.003_48.717)] bg-white  rounded-md px-3 pt-0.5 text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] ";

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
      const response = await axios.get(API_URL);
      setRequestData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
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
    <div className="mb-6">
      {/* Header */}
      <div className="sm:flex sm:justify-between">
        <h1 className="flex items-center gap-2 text-[17px] font-semibold flex-wrap ml-10 lg:ml-0 mb-4 lg:mb-0">
          <FaAngleRight />
          Forms
          <FaAngleRight />
          <div onClick={() => setOpenModal(false)} className="cursor-pointer">
            Staff Training Checklist
          </div>
        </h1>
        {!openModal && (
          <div className="flex justify-end">
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
          </div>
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
                    Trainer Name
                  </th>

                  <th className="p-2 font-semibold hidden lg:table-cell">
                    Date
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

                      <td className="p-2">{item.employee_name}</td>

                      <td className="p-2 hidden md:table-cell">
                        {item.enrollment_id}
                      </td>
                      <td className="p-2 hidden md:table-cell">
                        {item.trainer_name}
                      </td>

                      <td className="p-2 hidden lg:table-cell">{item.date}</td>

                      <td className="p-2 flex flex-row space-x-3 justify-center whitespace-nowrap">
                        {" "}
                        <div className="flex flex-row space-x-3 justify-center mt-1">
                          {/* View */}{" "}
                          <FaEye
                            onClick={() => {
                              const flatData = {
                                ...item,
                                ...(item.training_data || {}),
                                ...(item.signatures || {}),
                              };
                              delete flatData.training_data;
                              delete flatData.signatures;
                              setFormData(flatData);

                              setMode("view");
                              setOpenModal(true);
                            }}
                            className="inline text-blue-500 cursor-pointer text-lg"
                          />{" "}
                          {/* Edit */}
                          <FaPen
                            onClick={() => {
                              const flatData = {
                                ...item,
                                ...(item.training_data || {}),
                                ...(item.signatures || {}),
                              };
                              delete flatData.training_data;
                              delete flatData.signatures;
                              setFormData(flatData);
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
                  <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
                    <div className="flex flex-row gap-4">
                      <label className={labelStyle}>Staff Full Name</label>
                      <div className={inputStyle}>
                        <SearchDropdown
                          name="employee_name"
                          value={formData.employee_name}
                          options={["Employee 1", "Employee 2"]}
                          formData={formData}
                          setFormData={setFormData}
                          disabled={mode === "view"}
                          className={inputStyle}
                        />
                      </div>
                    </div>

                    <div className="flex flex-row gap-4">
                      <label className={labelStyle}>Staff ID</label>

                      <input
                        name="enrollment_id"
                        value={formData.enrollment_id}
                        onChange={handleChange}
                        className={inputStyle}
                        disabled={mode === "view"}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
                    <div className="flex flex-row gap-4">
                      <label className={labelStyle}>Trainer Name</label>

                      <input
                        name="trainer_name"
                        value={formData.trainer_name}
                        onChange={handleChange}
                        className={inputStyle}
                        disabled={mode === "view"}
                      />
                    </div>

                    <div className="flex flex-row gap-4 ">
                      <label className={labelStyle}>Date</label>
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
                        <div className="absolute mt-10 ml-8 sm:ml-14 md:ml-16 lg:ml-20  ">
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
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
                    <div className="flex flex-row gap-4">
                      <label className={labelStyle}>
                        Staff(Trainee) Position Title
                      </label>

                      <input
                        name="positionTitle"
                        value={formData.positionTitle}
                        onChange={handleChange}
                        className={inputStyle}
                        disabled={mode === "view"}
                      />
                    </div>
                    <div className="flex flex-row gap-4">
                      <label className={labelStyle}>Location Name</label>
                      <div className={inputStyle}>
                        <SearchDropdown
                          name="location"
                          value={formData.location}
                          options={["location 1", "location 2"]}
                          formData={formData}
                          setFormData={setFormData}
                          disabled={mode === "view"}
                          className={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                  <h1 className="text-lg font-medium underline mt-4">Note:</h1>*{" "}
                  <b>Training Status:</b> For the confirmation and
                  acknowledgment purpose that staff has been well briefed with
                  the mentioned items <br /> * <b>Assessment Level: </b>Is the
                  rating given by trainer/facilitator to the trainee for their
                  skills in mentioned areas;
                  <p className="ml-3">Assessment Levels are:</p>
                  <ol className="ml-8">
                    <li>• Excellent</li>
                    <li>• Very Good</li>
                    <li>• Good</li>
                    <li>• Fair</li>
                    <li>• Poor</li>
                  </ol>
                  <h1 className="text-lg font-medium underline mt-4">
                    Training Status:
                  </h1>
                  <ol className="ml-8">
                    <li>• Completed (√)</li>
                    <li>• Incompleted (x)</li>
                  </ol>
                  {Object.entries(data).map(([key, value], index) => (
                    <table
                      key={key}
                      className="w-full border border-gray-400 mt-6"
                    >
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border border-gray-400 p-2 w-1/12 text-center">
                            {index + 1}
                          </th>

                          <th className="border border-gray-400 p-2 w-7/12">
                            {key}
                          </th>

                          <th className="border border-gray-400 p-2 w-1/6">
                            Training Status
                          </th>

                          <th className="border border-gray-400 p-2 w-1/6">
                            Assessment Level
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {value.map((item, i) => (
                          <tr key={item.name}>
                            <td className="border border-gray-400 p-2 text-center">
                              {index + 1}.{i + 1}
                            </td>

                            <td className="border border-gray-400 p-2">
                              {item.label}
                            </td>

                            <td className="border border-gray-400 p-2">
                              <SearchDropdown
                                name={`${item.name}_status`}
                                value={formData[`${item.name}_status`]}
                                options={["Completed (√)", "Incompleted (x)"]}
                                formData={formData}
                                setFormData={setFormData}
                                disabled={mode === "view"}
                              />
                            </td>

                            <td className="border border-gray-400 p-2">
                              <SearchDropdown
                                name={`${item.name}_level`}
                                value={formData[`${item.name}_level`]}
                                options={[
                                  "Excellent",
                                  "Very Good",
                                  "Good",
                                  "Fair",
                                  "Poor",
                                ]}
                                formData={formData}
                                setFormData={setFormData}
                                disabled={mode === "view"}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ))}
                  <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
                    <div>
                      <label className={`${labelStyle} bg-gray-100 p-2 w-fit`}>
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

                    <div>
                      <label className={`${labelStyle} bg-gray-100 p-2 w-fit`}>
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

export default StaffTrainingChecklist;

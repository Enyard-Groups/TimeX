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
import SpinnerDatePicker from "../SpinnerDatePicker";
import SignPad from "./SignPad";

const MonthlyFireSafetyInspections = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [inspectionData, setInspectionData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [showDateSpinner, setShowDateSpinner] = useState(false);
  const defaultFormData = {
    employee: "",
    location: "",
    createdDate: "",

    fireHazards: {
      flammableMaterialCleared: "",
      nakedFlamesUsed: "",
      damagedWires: "",
      housekeeping: "",
      electricalPanelsClear: "",
      remarks: {
        flammableMaterialCleared: "",
        nakedFlamesUsed: "",
        damagedWires: "",
        housekeeping: "",
        electricalPanelsClear: "",
      },
    },

    fireAlarm: {
      panelWorking: "",
      mimicPanel: "",
      repeaterPanel: "",
      smokeDetectorsBlinking: "",
      detectorsNormal: "",
      manualCallPoints: "",
      testLast2Months: "",
      remarks: {
        panelWorking: "",
        mimicPanel: "",
        repeaterPanel: "",
        smokeDetectorsBlinking: "",
        detectorsNormal: "",
        manualCallPoints: "",
        testLast2Months: "",
      },
    },

    extinguishers: {
      gaugeGreen: "",
      properlyHung: "",
      safetySeal: "",
      inspectionLabel: "",
      remarks: {
        gaugeGreen: "",
        properlyHung: "",
        safetySeal: "",
        inspectionLabel: "",
      },
    },

    fireHose: {
      unobstructed: "",
      hoseProper: "",
      doorsWorking: "",
      remarks: {
        unobstructed: "",
        hoseProper: "",
        doorsWorking: "",
      },
    },

    fm200: {
      cylinderGauge: "",
      solenoidConnected: "",
      signagePosted: "",
      panelPowerOnly: "",
      systemNormalLED: "",
      remarks: {
        cylinderGauge: "",
        solenoidConnected: "",
        signagePosted: "",
        panelPowerOnly: "",
        systemNormalLED: "",
      },
    },

    fireExits: {
      exitSignage: "",
      exitsClear: "",
      remarks: {
        exitSignage: "",
        exitsClear: "",
      },
    },

    noticeSigns: {
      clealysigned: "",
      illuminated: "",
      assemblepoint: "",
      clearlyMasked: "",
      remarks: {
        clealysigned: "",
        illuminated: "",
        assemblepoint: "",
        clearlyMasked: "",
      },
    },

    paSystem: {
      working: "",
      weeklyChecked: "",
      remarks: {
        working: "",
        weeklyChecked: "",
      },
    },

    pumps: {
      autoMode: "",
      testedMonthly: "",
      remarks: {
        autoMode: "",
        testedMonthly: "",
      },
    },

    smokeExtraction: {
      working: "",
      remarks: {
        working: "",
      },
    },

    remarks: [
      {
        area: "",
        observation: "",
        actionRequired: "",
        actionBy: "",
        targetDate: "",
      },
    ],
    signature: null,
    signaturePreview: null,
    signhere: null,
  };
  const [formData, setFormData] = useState(defaultFormData);

  const checklistConfig = [
    {
      title: "Fire Hazards",
      section: "fireHazards",
      fields: [
        {
          key: "flammableMaterialCleared",
          label:
            "Are accumulations of flammable material regularly cleared away?",
          mark: "If No, details*:",
        },
        {
          key: "nakedFlamesUsed",
          label: "Are naked flames being used for any purpose?",
          mark: "If Yes, where:",
        },
        {
          key: "damagedWires",
          label: "Are there any naked wires or damaged plugs/sockets in use?",
          mark: "If Yes, where:",
        },
        {
          key: "housekeeping",
          label: " Is proper housekeeping maintained in all areas?",
          mark: "If No, where:",
        },
        {
          key: "electricalPanelsClear",
          label:
            "Are electrical panels’ unobstructed and separated from combustible material?",
          mark: "If No, Details*:",
        },
      ],
    },
    {
      title: "Fire Alarm",
      section: "fireAlarm",
      fields: [
        {
          key: "panelWorking",
          label:
            " Is the Fire Alarm panel working? (Check for alarm, fault, disable, warning etc)",
          mark: "If No, Fault no:",
        },
        {
          key: "mimicPanel",
          label: "Is mimic panel working?",
          mark: "If No, Fault details:",
        },
        {
          key: "repeaterPanel",
          label: "Is repeater panel working?",
          mark: "If No, details*:",
        },
        {
          key: "smokeDetectorsBlinking",
          label: "Are smoke detectors in FM200 protected rooms blinking?",
          mark: "If No, Fault details*:",
        },
        {
          key: "detectorsNormal",
          label: "Are all smoke detectors uncovered and normal (not blinking)?",
          mark: "If No, details*:",
        },
        {
          key: "manualCallPoints",
          label: " Are manual call points visible, accessible and blinking?",
          mark: "If No, details*:",
        },
        {
          key: "testLast2Months",
          label: "Has fire alarm test been carried out in last two month?",
          mark: "On Date :",
        },
      ],
    },
    {
      title: "Portable Fire Extinguisher",
      section: "extinguishers",
      fields: [
        {
          key: "gaugeGreen",
          label:
            "s the needle of gauge of all DCP/Foam fire extinguishers in green zone?",
          mark: "If No, details*:",
        },
        {
          key: "properlyHung",
          label:
            "Are fire extinguishers properly hanged and having no physical damage?",
          mark: "If No, when last checked:",
        },
        {
          key: "safetySeal",
          label: " Are fire extinguishers having safety seal?",
          mark: "If No, when last checked:",
        },
        {
          key: "inspectionLabel",
          label: "Are fire extinguishers having valid inspection label?",
          mark: "If No, when last checked:",
        },
      ],
    },
    {
      title: "Fire Hose Cabin",
      section: "fireHose",
      fields: [
        {
          key: "unobstructed",
          label: "Are Fire Hydrant Cabins unobstructed and unlocked?",
          mark: "If No, details*:",
        },
        {
          key: "hoseProper",
          label:
            "Are the hose, hose reel and branch stored properly in fire hose cabin?",
          mark: "If No, details*:",
        },
        {
          key: "doorsWorking",
          label:
            "Are the doors of Fire Hose Cabinets are easy to open and close?",
          mark: "If Yes, when:",
        },
      ],
    },
    {
      title: "FM200",
      section: "fm200",
      fields: [
        {
          key: "cylinderGauge",
          label:
            "Are all FM200 cylinders having the needle of gauge in the green zone?",
          mark: "If No, details*:",
        },
        {
          key: "solenoidConnected",
          label: "Is solenoid valve is connected to cylinder?",
          mark: "If No, details*:",
        },
        {
          key: "signagePosted",
          label:
            "Is FM200 caution signage posted on the protected room’s either sides of the door?",
          mark: "If No, details*:",
        },
        {
          key: "panelPowerOnly",
          label: "FM200 panel has only power LED on?",
          mark: "If No, details*:",
        },
        {
          key: "systemNormalLED",
          label:
            " Is the ‘System normal’ LED on for dual action (Abort and release buttons combo) device?",
          mark: "If No, details*:",
        },
      ],
    },
    {
      title: "Fire Exits",
      section: "fireExits",
      fields: [
        {
          key: "exitSignage",
          label: "Do all parts of the floors have exit signage?",
          mark: "If No, details*:",
        },
        {
          key: "exitsClear",
          label:
            " Are all fire exits clear of obstruction on both sides and not locked?",
          mark: "If No, details*:",
        },
      ],
    },
    {
      title: "Notices and Signs",
      section: "noticeSigns",
      fields: [
        {
          key: "clealysigned",
          label: " Are all exits clearly signed?",
          mark: "If No, details*:",
        },
        {
          key: "illuminated",
          label:
            "Are Exit Signs clearly displayed and illuminated (if powered)?",
          mark: "If No, when last checked:",
        },
        {
          key: "assemblepoint",
          label: "Are exit signs leading to Assembly point?",
          mark: "If No, details*:",
        },
        {
          key: "clearlyMasked",
          label:
            " Is Assembly point signage clearly marked? (Not applicable to stations)",
          mark: "If No, details*:",
        },
      ],
    },
    {
      title: "Public Announcement System",
      section: "paSystem",
      fields: [
        {
          key: "working",
          label:
            " Is PA system (including Emergency Voice Evacuation System in stations) working?",
          mark: "If No, when checked last:",
        },
        {
          key: "weeklyChecked",
          label: "Has PA system been checked weekly?",
          mark: "If Yes/No, when tested/checked last:",
        },
      ],
    },
    {
      title: "Fire Pumps",
      section: "pumps",
      fields: [
        {
          key: "autoMode",
          label: "Are all the pumps ‘On’ and in Auto mode?",
          mark: "If Yes/No, when tested/checked last:",
        },
        {
          key: "testedMonthly",
          label: " Have fire pumps been tested monthly?",
          mark: "If Yes/No, when tested/checked last:",
        },
      ],
    },

    {
      title: "Smoke Extraction",
      section: "smokeExtraction",
      fields: [
        {
          key: "working",
          label:
            "Are smoke extraction/tunnel ventilation fans in working condition?",
          mark: "If Yes/No, when tested/checked last:",
        },
      ],
    },
  ];

  const inputStyle =
    " text-[16px] w-full  border  border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    " text-[16px] font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filteredinspectionData = inspectionData.filter(
    (x) =>
      x.employee.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.location.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentinspectionData = filteredinspectionData.slice(
    startIndex,
    endIndex,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredinspectionData.length / entriesPerPage),
  );

  const handleChecklistChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleRemarkChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        remarks: {
          ...prev[section].remarks,
          [field]: value,
        },
      },
    }));
  };

  const handleRemarkDetailChange = (field, value) => {
    const updated = [...formData.remarks];
    updated[0][field] = value;

    setFormData((prev) => ({
      ...prev,
      remarks: updated,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  useEffect(() => {
    return () => {
      if (formData.signaturePreview) {
        URL.revokeObjectURL(formData.signaturePreview);
      }
    };
  }, [formData.signaturePreview]);

  // Handle submit
  const handleSubmit = () => {
    const { employee, location, createdDate, signature } = formData;

    if (!employee || !location || !createdDate || !signature) {
      toast.error("Please fill all required fields");
      return;
    }

    const newEntry = {
      id: editId ? editId : Date.now(),
      ...formData,
    };

    if (editId) {
      const updated = inspectionData.map((item) =>
        item.id === editId ? { ...item, ...newEntry } : item,
      );

      setInspectionData(updated);

      // Backend version
      // await axios.put(`/api/manual-entry/${editId}`, newEntry)

      toast.success("Request Updated");
    } else {
      const updated = [...inspectionData, newEntry];
      setInspectionData(updated);

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
    const updated = inspectionData.filter((v) => v.id !== id);

    setInspectionData(
      updated.map((item) => ({
        ...item,
      })),
    );

    toast.success("Deleted Successfully");
  };

  const handleCopy = () => {
    const header = ["Location", "Inspected By", "Date"].join("\t");

    const rows = filteredinspectionData
      .map((item) => {
        return [item.location, item.employee, item.createdDate].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredinspectionData.map((item) => ({
      Location: item.location,
      InspectedBy: item.employee,
      Date: item.createdDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "inspectionData");

    XLSX.writeFile(workbook, "inspectionDataData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = ["Location", "Inspected By", "Date"];

    const tableRows = [];

    filteredinspectionData.forEach((item) => {
      const row = [item.location, item.employee, item.createdDate];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("inspectionDataData.pdf");
  };

  return (
    <>
      <div className="mb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
            <FaAngleRight />
            Forms
            <FaAngleRight />
            <div onClick={() => setOpenModal(false)} className="cursor-pointer">
              Monthly Fire Safety Inspections
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
                  <th className="p-2 font-semibold hidden sm:table-cell">
                    SL.No
                  </th>

                  <th className="p-2 font-semibold">Location</th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Date
                  </th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Inspected By
                  </th>

                  <th className="p-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentinspectionData.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="lg:text-center p-10 ">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentinspectionData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                    >
                      <td className="p-2 whitespace-nowrap hidden sm:table-cell">
                        {index + 1}
                      </td>

                      <td className="p-2">{item.location}</td>

                      <td className="p-2 hidden md:table-cell">
                        {item.createdDate ? item.createdDate : "Missed Entry"}
                      </td>

                      <td className="p-2 hidden md:table-cell">
                        {item.employee}
                      </td>

                      <td className="p-2 flex flex-row space-x-3 justify-center whitespace-nowrap">
                        {" "}
                        <div className="flex flex-row space-x-3 justify-center mt-1">
                          {/* View */}{" "}
                          <FaEye
                            onClick={() => {
                              const preview = item.signature
                                ? URL.createObjectURL(item.signature)
                                : null;

                              setFormData({
                                ...defaultFormData,
                                ...item,
                                signaturePreview: preview,
                              });

                              setMode("view");
                              setOpenModal(true);
                            }}
                            className="inline text-blue-500 cursor-pointer text-lg"
                          />{" "}
                          {/* Edit */}
                          <FaPen
                            onClick={() => {
                              const preview = item.signature
                                ? URL.createObjectURL(item.signature)
                                : null;

                              setFormData({
                                ...defaultFormData,
                                ...item,
                                signaturePreview: preview,
                              });
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
              Showing{" "}
              {filteredinspectionData.length === 0 ? "0" : startIndex + 1} to{" "}
              {Math.min(endIndex, filteredinspectionData.length)} of{" "}
              {filteredinspectionData.length} entries
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
                {/* Form data  */}
                <div
                  className="max-h-[75vh] overflow-y-auto pr-2 text-[16px]"
                  style={{ scrollbarWidth: "none" }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div>
                      <SearchDropdown
                        label={
                          <>
                            Location <span className="text-red-500">*</span>
                          </>
                        }
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

                    <div>
                      <label className={labelStyle}>
                        {" "}
                        Inspected By <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className={inputStyle}
                        name="employee"
                        value={formData.employee}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />
                    </div>

                    <div>
                      <label className={labelStyle}>
                        Date <span className="text-red-500">*</span>
                      </label>

                      <input
                        name="createdDate"
                        value={formData.createdDate}
                        onChange={handleChange}
                        onClick={() => setShowDateSpinner(true)}
                        disabled={mode === "view"}
                        placeholder="dd/mm/yyyy"
                        className={inputStyle}
                      />

                      {showDateSpinner && (
                        <SpinnerDatePicker
                          value={formData.createdDate}
                          onChange={(date) =>
                            setFormData({ ...formData, createdDate: date })
                          }
                          onClose={() => setShowDateSpinner(false)}
                        />
                      )}
                    </div>
                  </div>

                  {/* HEADER ROW */}
                  <div className="grid grid-cols-12 bg-gray-200 font-semibold">
                    <div className="col-span-5 p-2">Checklist</div>
                    <div className="col-span-1 text-center p-2">Yes</div>
                    <div className="col-span-1 text-center p-2">No</div>
                    <div className="col-span-5 p-2 text-center">Remarks</div>
                  </div>

                  {checklistConfig.map((sectionItem) => (
                    <div key={sectionItem.section}>
                      {/* Section Title */}
                      <div className="bg-gray-100 font-semibold p-2 mt-4">
                        {sectionItem.title}
                      </div>

                      {/* Fields */}
                      {sectionItem.fields.map((field) => (
                        <div
                          key={field.key}
                          className="grid grid-cols-12 border-b items-center"
                        >
                          {/* Label */}
                          <div className="col-span-5 p-2">{field.label}</div>

                          {/* YES */}
                          <div className="col-span-1 text-center">
                            <input
                              type="radio"
                              name={`${sectionItem.section}-${field.key}`}
                              checked={
                                formData[sectionItem.section][field.key] ===
                                "yes"
                              }
                              disabled={mode === "view"}
                              onChange={() =>
                                handleChecklistChange(
                                  sectionItem.section,
                                  field.key,
                                  "yes",
                                )
                              }
                            />
                          </div>

                          {/* NO */}
                          <div className="col-span-1 text-center">
                            <input
                              type="radio"
                              name={`${sectionItem.section}-${field.key}`}
                              checked={
                                formData[sectionItem.section][field.key] ===
                                "no"
                              }
                              disabled={mode === "view"}
                              onChange={() =>
                                handleChecklistChange(
                                  sectionItem.section,
                                  field.key,
                                  "no",
                                )
                              }
                            />
                          </div>

                          {/* REMARK */}
                          <div className="col-span-5 p-2 md:flex md:flex-row gap-2">
                            <label className="w-1/2 mt-1">{field.mark}</label>
                            <input
                              type="text"
                              placeholder="Enter remarks"
                              className="w-full border rounded px-2 py-1"
                              value={
                                formData[sectionItem.section].remarks[
                                  field.key
                                ] || ""
                              }
                              disabled={mode === "view"}
                              onChange={(e) =>
                                handleRemarkChange(
                                  sectionItem.section,
                                  field.key,
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Remark Details */}
                  <div className="mt-8">
                    <p className="font-semibold mb-2">
                      Remarks or any other details:
                    </p>

                    <table className="w-full border border-gray-500 text-sm focus:outline-none">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="border p-2">Area</th>
                          <th className="border p-2">Observation</th>
                          <th className="border p-2">Action Required</th>
                          <th className="border p-2">Action By</th>
                          <th className="border p-2">Target Date</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr>
                          <td className="border border-gray-500 p-2">
                            <input
                              type="text"
                              className="w-full border border-gray-400 px-2 py-1 focus:outline-none"
                              value={formData.remarks[0]?.area || ""}
                              disabled={mode === "view"}
                              onChange={(e) =>
                                handleRemarkDetailChange("area", e.target.value)
                              }
                            />
                          </td>

                          <td className="border border-gray-500 p-2">
                            <textarea
                              className="w-full border border-gray-400 px-2 py-1 focus:outline-none"
                              value={formData.remarks[0]?.observation || ""}
                              disabled={mode === "view"}
                              onChange={(e) =>
                                handleRemarkDetailChange(
                                  "observation",
                                  e.target.value,
                                )
                              }
                            />
                          </td>

                          <td className="border border-gray-500 p-2">
                            <input
                              type="text"
                              className="w-full border border-gray-400 px-2 py-1 focus:outline-none"
                              value={formData.remarks[0]?.actionRequired || ""}
                              disabled={mode === "view"}
                              onChange={(e) =>
                                handleRemarkDetailChange(
                                  "actionRequired",
                                  e.target.value,
                                )
                              }
                            />
                          </td>

                          <td className="border border-gray-500 p-2">
                            <input
                              type="text"
                              className="w-full border border-gray-400 px-2 py-1 focus:outline-none"
                              value={formData.remarks[0]?.actionBy || ""}
                              disabled={mode === "view"}
                              onChange={(e) =>
                                handleRemarkDetailChange(
                                  "actionBy",
                                  e.target.value,
                                )
                              }
                            />
                          </td>

                          <td className="border border-gray-500 p-2">
                            <input
                              type="text"
                              className="w-full border border-gray-400 px-2 py-1 focus:outline-none"
                              value={formData.remarks[0]?.targetDate || ""}
                              disabled={mode === "view"}
                              onChange={(e) =>
                                handleRemarkDetailChange(
                                  "targetDate",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Signature  */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-2">
                      Signature :
                    </label>

                    <div className="flex items-center gap-3 border rounded-md px-3 py-2 w-full max-w-md bg-gray-50">
                      {/* Hidden File Input */}
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

                      {/* Button */}
                      <label
                        htmlFor="signatureUpload"
                        className="cursor-pointer bg-white border px-3 py-1 rounded shadow-sm hover:bg-gray-100"
                      >
                        Choose File
                      </label>

                      {/* File Name */}
                      <span className="text-gray-600 text-sm truncate">
                        {formData.signature
                          ? formData.signature.name
                          : "No file chosen"}
                      </span>
                    </div>

                    {formData.signaturePreview && (
                      <div className="mt-4">
                        <p className="text-sm mb-1 text-gray-600">Preview:</p>

                        <img
                          src={formData.signaturePreview}
                          alt="Signature Preview"
                          className="h-24 border rounded bg-white p-2 shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                  <h1 className="mt-2">Sign Here:</h1>
                  <SignPad
                    fieldName="signhere"
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
    </>
  );
};

export default MonthlyFireSafetyInspections;

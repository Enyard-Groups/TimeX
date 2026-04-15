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
  const [loading, setLoading] = useState(false);
  const [showDateSpinner, setShowDateSpinner] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
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
    signatureMode: "",
    signature: null,
    signhere: null,
    signaturePreview: null,
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
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

  const labelStyle =
    "text-sm xl:text-base focus:outline-none font-semibold text-slate-600 mb-1.5 block";

  const filteredinspectionData = inspectionData.filter(
    (x) =>
      x.employee.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      (x.location || "").toLowerCase().startsWith(searchTerm.toLowerCase()),
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3000/api/form/monthlyFireSafety",
      );
      setInspectionData(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [empRes, locRes] = await Promise.all([
        axios.get("http://localhost:3000/api/employee"),
        axios.get("http://localhost:3000/api/master/geofencing"),
      ]);
      setEmployees(empRes.data);
      setLocations(locRes.data);
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchOptions();
  }, []);

  useEffect(() => {
    return () => {
      if (formData.signaturePreview) {
        URL.revokeObjectURL(formData.signaturePreview);
      }
    };
  }, [formData.signaturePreview]);

  // Handle submit
  const handleSubmit = async () => {
    const { employee, location, createdDate, signature, signhere } = formData;

    if (!employee || !location || !createdDate || (!signature && !signhere)) {
      toast.error("Please fill all required fields");
      return;
    }

    const newEntry = {
      ...formData,
    };

    try {
      if (editId) {
        await axios.put(
          `http://localhost:3000/api/form/monthlyFireSafety/${editId}`,
          newEntry,
        );
        toast.success("Request Updated");
      } else {
        await axios.post(
          "http://localhost:3000/api/form/monthlyFireSafety",
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
        `http://localhost:3000/api/form/monthlyFireSafety/${id}`,
      );
      fetchData();
      toast.success("Deleted Successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete");
    }
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
              Monthly Fire Safety Inspections
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
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white xl:text-lg font-semibold px-6 py-2 rounded-lg border border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
              >
                + Add New
              </button>
            </div>
          )}
        </div>

        {/* Main Table Container */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl">
          {/* Top Controls */}
          <div className="p-6 border-b border-blue-100/30">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm xl:text-base  font-medium text-gray-600">
                  Display
                </label>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm  focus:ring-2 focus:ring-blue-500/60"
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
                  placeholder="Search inspections..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 xl:text-base  rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
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

          {/* Table Content */}
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
                    Location
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700">
                    Inspected By
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
                ) : currentinspectionData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-12 text-center text-gray-500 font-medium"
                    >
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentinspectionData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/60"
                    >
                      <td className="py-3 px-6 hidden sm:table-cell text-gray-900">
                        {startIndex + index + 1}
                      </td>
                      <td className="py-3 px-6 font-medium text-gray-900">
                        {item.location}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600">
                        {item.createdDate}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600">
                        {item.employee}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex justify-center gap-3">
                          <FaEye
                            onClick={() => {
                              setFormData({
                                ...item,
                                signaturePreview: item.signature
                                  ? URL.createObjectURL(item.signature)
                                  : null,
                              });
                              setMode("view");
                              setOpenModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 xl:text-xl  cursor-pointer transition-all"
                          />
                          <FaPen
                            onClick={() => {
                              setFormData({
                                ...item,
                                signaturePreview: item.signature
                                  ? URL.createObjectURL(item.signature)
                                  : null,
                              });
                              setEditId(item.id);
                              setMode("edit");
                              setOpenModal(true);
                            }}
                            className="text-green-500 hover:text-green-700 xl:text-xl  cursor-pointer transition-all"
                          />
                          <MdDeleteForever
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 xl:text-xl  cursor-pointer transition-all"
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
            <span className="text-sm xl:text-base  text-gray-600">
              Showing{" "}
              <span className="text-gray-900 font-semibold">
                {filteredinspectionData.length === 0 ? "0" : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="text-gray-900 font-semibold">
                {Math.min(endIndex, filteredinspectionData.length)}
              </span>{" "}
              of{" "}
              <span className="text-gray-900 font-semibold">
                {filteredinspectionData.length}
              </span>{" "}
              entries
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage == 1}
                onClick={() => setCurrentPage(1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                title="First page"
              >
                First
              </button>

              <button
                disabled={currentPage == 1}
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
                disabled={currentPage == totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
                title="Next page"
              >
                <GrNext />
              </button>

              <button
                disabled={currentPage == totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                title="Last page"
              >
                Last
              </button>
            </div>
          </div>
        </div>

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
                <h2 className="text-xl   font-bold text-gray-900">
                  {mode === "view"
                    ? "Inspection Details"
                    : mode === "edit"
                      ? "Edit Inspection"
                      : "New Safety Inspection"}
                </h2>
                <button
                  onClick={() => setOpenModal(false)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <RxCross2 className="text-2xl" />
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                {/* Top Form Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                  <SearchDropdown
                    label={
                      <>
                        Location <span className="text-red-500">*</span>
                      </>
                    }
                    name="location"
                    value={formData.location}
                    options={locations}
                    labelKey="name"
                    valueKey="name"
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />
                  <div>
                    <label className={labelStyle}>
                      Inspected By <span className="text-red-500">*</span>
                    </label>
                    <SearchDropdown
                      label=""
                      name="employee"
                      value={formData.employee}
                      options={employees}
                      labelKey="full_name"
                      valueKey="full_name"
                      formData={formData}
                      setFormData={setFormData}
                      disabled={mode === "view"}
                      inputStyle={inputStyle}
                      labelStyle={labelStyle}
                    />
                  </div>
                  <div className="relative">
                    <label className={labelStyle}>
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="createdDate"
                      value={formData.createdDate}
                      onClick={() =>
                        mode !== "view" && setShowDateSpinner(true)
                      }
                      placeholder="dd/mm/yyyy"
                      readOnly
                      disabled={mode === "view"}
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

                {/* Checklist Table */}
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
                  <div className="grid grid-cols-12 bg-slate-100 font-bold text-gray-700 xl:text-lg ">
                    <div className="col-span-5 p-4">
                      Checklist Category & Item
                    </div>
                    <div className="col-span-1 text-center p-4">Yes</div>
                    <div className="col-span-1 text-center p-4">No</div>
                    <div className="col-span-5 p-4 text-center">Remarks</div>
                  </div>

                  <div
                    className="max-h-[50vh] overflow-y-auto"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {checklistConfig.map((sectionItem) => (
                      <div
                        key={sectionItem.section}
                        className="border-t border-gray-100"
                      >
                        <div className="bg-blue-50/50 font-bold p-3 px-4 text-blue-800 xl:text-base  uppercase tracking-wide">
                          {sectionItem.title}
                        </div>
                        {sectionItem.fields.map((field) => (
                          <div
                            key={field.key}
                            className="grid grid-cols-12 border-b border-gray-50 items-center hover:bg-slate-50 transition-colors"
                          >
                            <div className="col-span-5 p-4 text-gray-700 xl:text-base ">
                              {field.label}
                            </div>
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
                                className="w-5 h-5 accent-green-600 cursor-pointer"
                              />
                            </div>
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
                                className="w-5 h-5 accent-red-600 cursor-pointer"
                              />
                            </div>
                            <div className="col-span-5 p-4 flex flex-col md:flex-row gap-3 items-center">
                              <span className="text-xs font-bold text-blue-400 min-w-[60px]">
                                {field.mark}
                              </span>
                              <input
                                type="text"
                                placeholder="Enter specific details..."
                                className="w-full border-gray-200 rounded-lg xl:text-base  focus:ring-blue-500"
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
                  </div>
                </div>

                {/* Action Summary Table */}
                <div className="mb-8">
                  <h3 className="font-bold mb-4 text-gray-800 xl:text-xl ">
                    Required Corrective Actions
                  </h3>
                  <div
                    className="overflow-x-auto rounded-xl border border-gray-200"
                    style={{ scrollbarWidth: "none" }}
                  >
                    <table className="w-full text-sm xl:text-base ">
                      <thead className="bg-slate-50 text-gray-600">
                        <tr>
                          <th className="border-b p-3 text-left">Area</th>
                          <th className="border-b p-3 text-left">
                            Observation
                          </th>
                          <th className="border-b p-3 text-left">
                            Action Required
                          </th>
                          <th className="border-b p-3 text-left">Action By</th>
                          <th className="border-b p-3 text-left">
                            Target Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="p-2 border-r">
                            <input
                              type="text"
                              className={inputStyle}
                              value={formData.remarks[0]?.area || ""}
                              disabled={mode === "view"}
                              onChange={(e) =>
                                handleRemarkDetailChange("area", e.target.value)
                              }
                            />
                          </td>
                          <td className="p-2 border-r">
                            <textarea
                              rows="1"
                              className={inputStyle}
                              value={formData.remarks[0]?.observation || ""}
                              disabled={mode === "view"}
                              onChange={(e) =>
                                handleRemarkDetailChange(
                                  "observation",
                                  e.target.value,
                                )
                              }
                              style={{ scrollbarWidth: "none" }}
                            />
                          </td>
                          <td className="p-2 border-r">
                            <input
                              type="text"
                              className={inputStyle}
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
                          <td className="p-2 border-r">
                            <input
                              type="text"
                              className={inputStyle}
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
                          <td className="p-2">
                            <input
                              type="text"
                              className={inputStyle}
                              value={formData.remarks[0]?.targetDate}
                              placeholder="dd/mm/yyyy"
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
                </div>

                {/* Signature */}

                <div className="mt-6 ml-2">
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

                {/* Footer Actions */}
                {mode !== "view" && (
                  <div className="flex flex-wrap justify-end gap-3 mt-12 pt-6 border-t border-blue-100/30">
                    <button
                      onClick={handleSubmit}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-12 py-3 rounded-xl font-bold xl:text-lg  shadow-lg hover:shadow-blue-200 hover:-translate-y-1 transition-all"
                    >
                      Submit Report
                    </button>
                    <button
                      onClick={() => setOpenModal(false)}
                      className="px-10 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold xl:text-lg  hover:bg-gray-100 transition-all"
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
    </>
  );
};

export default MonthlyFireSafetyInspections;

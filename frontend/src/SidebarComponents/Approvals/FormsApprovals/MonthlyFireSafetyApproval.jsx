import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaAngleRight, FaEye } from "react-icons/fa6";
import { GrNext, GrPrevious } from "react-icons/gr";
import { RxCross2 } from "react-icons/rx";

const MonthlyFireSafetyApproval = () => {
  const [requests, setRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

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

  const fetchPendingRequests = () => {
    setLoading(true);
    const stored = JSON.parse(
      localStorage.getItem("fire_safety_inspections") || "[]",
    );
    setRequests(stored.filter((item) => item.status === "Pending"));
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const updateStatus = (id, newValue) => {
    const stored = JSON.parse(
      localStorage.getItem("fire_safety_inspections") || "[]",
    );
    const updated = stored.map((item) =>
      item.id === id ? { ...item, status: newValue } : item,
    );
    localStorage.setItem("fire_safety_inspections", JSON.stringify(updated));
    toast.success(`Request ${newValue}`);
    setOpenModal(false);
    fetchPendingRequests();
  };

  // Selecting Ids
  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const bulkAction = (value) => {
    if (selectedIds.length === 0) return toast.error("Please select a Request");
    const stored = JSON.parse(
      localStorage.getItem("fire_safety_inspections") || "[]",
    );
    const updated = stored.map((item) =>
      selectedIds.includes(item.id) ? { ...item, status: value } : item,
    );
    localStorage.setItem("fire_safety_inspections", JSON.stringify(updated));
    setSelectedIds([]);
    toast.success(`Bulk ${value}`);
    fetchPendingRequests();
  };

  const filteredData = requests.filter(
    (x) =>
      (x.employee || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (x.location || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + entriesPerPage,
  );
  const selectedItem = requests.find((item) => item.id === selectedId);

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Approvals</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div className="text-blue-600">Monthly Fire Safety Approval</div>
        </h1>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl">
        {/* Bulk Action Header */}
        <div className="m-6 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <span className="bg-blue-500 w-2 h-2 rounded-full animate-pulse"></span>
              Bulk Approve / Reject
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => bulkAction("Approved")}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-1.5 rounded-lg font-semibold transition-all active:scale-95"
              >
                Approve Selected
              </button>
              <button
                onClick={() => bulkAction("Rejected")}
                className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-1.5 rounded-lg font-semibold transition-all active:scale-95"
              >
                Reject Selected
              </button>
            </div>
          </div>
        </div>

        {/* Top Controls */}
        <div className="p-6 pt-0 border-b border-blue-100/30">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm xl:text-base font-medium text-gray-600">
                Display
              </label>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm xl:text-base font-medium text-gray-600">
                entries
              </span>
            </div>

            <div className="w-full sm:w-64">
              <input
                placeholder="Search pending entries..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 xl:text-base  rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
              />
            </div>
          </div>
        </div>
        {/* Table Section */}
        <div
          className="overflow-x-auto min-h-[350px]"
          style={{ scrollbarWidth: "none" }}
        >
          <table className="w-full text-[17px] text-gray-700">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50">
                <th className="px-6 py-3 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                    checked={
                      currentData.length > 0 &&
                      currentData.every((emp) => selectedIds.includes(emp.id))
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(currentData.map((x) => x.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
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
                    colSpan="8"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-4xl opacity-40">✅</div>
                      <p className="text-gray-500 text-base font-medium">
                        No Pending Requests
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/40"
                  >
                    <td className="px-6 py-2 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelect(item.id)}
                      />
                    </td>
                    <td className="py-3 px-6 font-medium text-gray-900 text-center">
                      {item.location}
                    </td>
                    <td className="py-3 px-6 hidden md:table-cell text-gray-600 text-center">
                      {item.createdDate}
                    </td>
                    <td className="py-3 px-6 hidden md:table-cell text-gray-600 text-center">
                      {item.employee}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedId(item.id);
                            setOpenModal(true);
                          }}
                          className="text-blue-500 hover:bg-blue-100 p-2 rounded-lg"
                        >
                          <FaEye className="text-lg" />
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, "Approved")}
                          className="bg-emerald-500 text-white px-3 py-1 rounded text-sm font-bold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, "Rejected")}
                          className="bg-rose-500 text-white px-3 py-1 rounded text-sm font-bold"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openModal && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[1100px] max-h-[90vh] overflow-y-auto p-8"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h2 className="text-xl font-bold">Inspection Details</h2>
              <button onClick={() => setOpenModal(false)}>
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8 bg-slate-50 p-4 rounded-xl border">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Employee
                </p>
                <p className="font-semibold">{selectedItem.employee}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Location
                </p>
                <p className="font-semibold">{selectedItem.location}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Date
                </p>
                <p className="font-semibold">{selectedItem.createdDate}</p>
              </div>
            </div>

            <div className="border rounded-xl overflow-hidden mb-8">
              <div className="grid grid-cols-12 bg-slate-800 text-white font-bold text-sm">
                <div className="col-span-6 p-4">Checklist Item</div>
                <div className="col-span-2 text-center p-4">Status</div>
                <div className="col-span-4 p-4">Remarks</div>
              </div>
              {checklistConfig.map((section) => (
                <div key={section.section}>
                  <div className="bg-blue-50 p-2 font-bold text-blue-800 uppercase text-[10px] tracking-widest">
                    {section.title}
                  </div>
                  {section.fields.map((field) => (
                    <div
                      key={field.key}
                      className="grid grid-cols-12 border-b items-center text-sm"
                    >
                      <div className="col-span-6 p-4">{field.label}</div>
                      <div className="col-span-2 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${selectedItem[section.section]?.[field.key] === "yes" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {selectedItem[section.section]?.[field.key] || "No"}
                        </span>
                      </div>
                      <div className="col-span-4 p-4 italic text-gray-500">
                        {selectedItem[section.section]?.remarks?.[field.key] ||
                          "—"}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <h3 className="font-bold mb-3">Corrective Actions</h3>
            <table className="w-full border rounded-xl text-sm mb-8">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 border-b  text-center">Area</th>
                  <th className="p-3 border-b  text-center">Observation</th>
                  <th className="p-3 border-b  text-center">Action</th>
                  <th className="p-3 border-b  text-center">Action By</th>
                  <th className="p-3 border-b  text-center">Target Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border-b text-center">
                    {selectedItem.remarks?.[0]?.area || "—"}
                  </td>
                  <td className="p-3 border-b text-center">
                    {selectedItem.remarks?.[0]?.observation || "—"}
                  </td>
                  <td className="p-3 border-b text-center">
                    {selectedItem.remarks?.[0]?.actionRequired || "—"}
                  </td>
                  <td className="p-3 border-b text-center">
                    {selectedItem.remarks?.[0]?.actionBy || "—"}
                  </td>
                  <td className="p-3 border-b text-center">
                    {selectedItem.remarks?.[0]?.targetDate || "—"}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-end gap-4 mt-8 border-t pt-6">
              <button
                onClick={() => updateStatus(selectedItem.id, "Rejected")}
                className="px-6 py-2 border-2 border-red-200 text-red-600 rounded-xl font-bold"
              >
                Reject
              </button>
              <button
                onClick={() => updateStatus(selectedItem.id, "Approved")}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyFireSafetyApproval;

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaAngleRight, FaEye } from "react-icons/fa6";
import { GrNext, GrPrevious } from "react-icons/gr";
import { RxCross2 } from "react-icons/rx";

const StaffTrainingChecklistApproval = () => {
  const [requests, setRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const checklistData = {
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

  const fetchPendingRequests = () => {
    setLoading(true);
    const stored = JSON.parse(
      localStorage.getItem("staff_training_checklist") || "[]",
    );
    setRequests(stored.filter((item) => item.status === "Pending"));
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const updateStatus = (id, newValue) => {
    const stored = JSON.parse(
      localStorage.getItem("staff_training_checklist") || "[]",
    );
    const updated = stored.map((item) =>
      item.id === id ? { ...item, status: newValue } : item,
    );
    localStorage.setItem("staff_training_checklist", JSON.stringify(updated));
    toast.success(`Request ${newValue}`);
    setOpenModal(false);
    fetchPendingRequests();
  };

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
      localStorage.getItem("staff_training_checklist") || "[]",
    );
    const updated = stored.map((item) =>
      selectedIds.includes(item.id) ? { ...item, status: value } : item,
    );
    localStorage.setItem("staff_training_checklist", JSON.stringify(updated));
    setSelectedIds([]);
    toast.success(`Bulk ${value}`);
    fetchPendingRequests();
  };

  const filteredData = requests.filter(
    (x) =>
      (x.employee_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (x.trainer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (x.location || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / entriesPerPage),
  );

  const selectedItem = requests.find((item) => item.id === selectedId);

  const getStatusBadge = (val) => {
    if (!val) return <span className="text-gray-400 text-xs italic">—</span>;
    const isCompleted =
      val.toLowerCase().includes("completed") &&
      !val.toLowerCase().includes("in");
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
          isCompleted
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {val}
      </span>
    );
  };

  const getLevelBadge = (val) => {
    if (!val) return <span className="text-gray-400 text-xs italic">—</span>;
    const colors = {
      Excellent: "bg-purple-100 text-purple-700",
      "Very Good": "bg-blue-100 text-blue-700",
      Good: "bg-green-100 text-green-700",
      Fair: "bg-yellow-100 text-yellow-700",
      Poor: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${colors[val] || "bg-gray-100 text-gray-600"}`}
      >
        {val}
      </span>
    );
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Approvals</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div className="text-blue-600">Staff Training Checklist Approval</div>
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
                {[10, 25, 50, 100].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
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
                className="w-full bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 xl:text-base rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table */}
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
                      currentData.every((item) => selectedIds.includes(item.id))
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
                <th className="py-3 px-6 hidden sm:table-cell font-semibold text-gray-700 text-center">
                  SL.No
                </th>
                <th className="py-3 px-6 font-semibold text-gray-700 text-center">
                  Employee Name
                </th>
                <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                  Enrollment ID
                </th>
                <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                  Trainer Name
                </th>
                <th className="py-3 px-6 hidden lg:table-cell font-semibold text-gray-700 text-center">
                  Date
                </th>
                <th className="py-3 px-6 font-semibold text-gray-700 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
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
                  <td colSpan="7" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <p className="text-gray-500 text-base font-medium">
                        No Pending Requests
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => (
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
                    <td className="py-3 px-6 hidden sm:table-cell text-gray-900 text-center">
                      {startIndex + index + 1}
                    </td>
                    <td className="py-3 px-6 font-medium text-gray-900 text-center">
                      {item.employee_name || "—"}
                    </td>
                    <td className="py-3 px-6 hidden md:table-cell text-gray-600  text-center">
                      {item.enrollment_id || "—"}
                    </td>
                    <td className="py-3 px-6 hidden md:table-cell text-gray-600 text-center">
                      {item.trainer_name || "—"}
                    </td>
                    <td className="py-3 px-6 hidden lg:table-cell text-gray-600 text-center">
                      {item.date || "—"}
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
                          className="bg-emerald-500 hidden sm:table-cell text-white px-3 py-1 rounded text-sm font-bold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, "Rejected")}
                          className="bg-rose-500 hidden sm:table-cell text-white px-3 py-1 rounded text-sm font-bold"
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

        {/* Pagination Footer */}
        <div className="p-6 border-t border-blue-100/30 flex flex-col sm:flex-row justify-between items-center gap-6">
          <span className="text-sm xl:text-base text-gray-600">
            Showing{" "}
            <span className="text-gray-900 font-semibold">
              {filteredData.length === 0 ? "0" : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="text-gray-900 font-semibold">
              {Math.min(endIndex, filteredData.length)}
            </span>{" "}
            of{" "}
            <span className="text-gray-900 font-semibold">
              {filteredData.length}
            </span>{" "}
            entries
          </span>

          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            >
              First
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
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
            >
              <GrNext />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {openModal && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[1100px] max-h-[90vh] overflow-y-auto p-8"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b  border-gray-400 ">
              <h2 className="text-xl font-bold text-gray-900">
                Training Checklist Details
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            {/* Summary Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border  border-gray-400 ">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Employee Name
                </p>
                <p className="font-semibold text-gray-800">
                  {selectedItem.employee_name || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Enrollment ID
                </p>
                <p className="font-semibold text-gray-800 ">
                  {selectedItem.enrollment_id || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Trainer Name
                </p>
                <p className="font-semibold text-gray-800">
                  {selectedItem.trainer_name || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Training Date
                </p>
                <p className="font-semibold text-gray-800">
                  {selectedItem.date || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Position Title
                </p>
                <p className="font-semibold text-gray-800">
                  {selectedItem.positionTitle || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Location
                </p>
                <p className="font-semibold text-gray-800">
                  {selectedItem.location || "—"}
                </p>
              </div>
            </div>
            {/* Checklist Tables */}
            {Object.entries(checklistData).map(
              ([sectionKey, fields], sectionIndex) => (
                <div
                  key={sectionKey}
                  className="mb-8 border border-gray-400  rounded-xl overflow-hidden shadow-sm"
                >
                  {/* Desktop Header: Hidden on mobile (hidden), shown on md and up (md:grid) */}
                  <div className="hidden md:grid grid-cols-12 bg-slate-800 text-white font-bold text-sm">
                    <div className="col-span-1 p-3 text-center">
                      #{sectionIndex + 1}
                    </div>
                    <div className="col-span-5 p-3">
                      {sectionKey.replace(/_/g, " ")}
                    </div>
                    <div className="col-span-3 p-3 text-center">
                      Training Status
                    </div>
                    <div className="col-span-3 p-3 text-center">
                      Assessment Level
                    </div>
                  </div>

                  {/* Mobile Section Header: Only shown on small screens */}
                  <div className="md:hidden bg-slate-800 text-white p-3 font-bold text-sm uppercase tracking-wider">
                    Section {sectionIndex + 1}: {sectionKey.replace(/_/g, " ")}
                  </div>

                  {fields.map((field, i) => (
                    <div
                      key={field.name}
                      className="flex flex-col md:grid md:grid-cols-12 border-b border-gray-400  last:border-b-0 items-center text-sm hover:bg-slate-50 transition-colors"
                    >
                      {/* Index Row */}
                      <div className="hidden md:block col-span-1 p-3 text-center text-gray-400  text-xs">
                        {sectionIndex + 1}.{i + 1}
                      </div>

                      {/* Label Field */}
                      <div className="w-full md:col-span-5 p-3 text-gray-700 font-medium md:font-normal bg-slate-50 md:bg-transparent border-b border-gray-400  md:border-b-0">
                        <span className="md:hidden text-gray-400 mr-2  text-xs">
                          {sectionIndex + 1}.{i + 1}
                        </span>
                        {field.label}
                      </div>

                      {/* Status Field */}
                      <div className="w-full md:col-span-3 p-3 flex justify-between items-center md:justify-center border-b border-gray-400  md:border-b-0">
                        <span className="md:hidden text-xs font-bold text-slate-400 uppercase">
                          Training Status
                        </span>
                        {getStatusBadge(selectedItem[`${field.name}_status`])}
                      </div>

                      {/* Level Field */}
                      <div className="w-full md:col-span-3 p-3 flex justify-between items-center md:justify-center">
                        <span className="md:hidden text-xs font-bold text-slate-400 uppercase">
                          Assessment Level
                        </span>
                        {getLevelBadge(selectedItem[`${field.name}_level`])}
                      </div>
                    </div>
                  ))}
                </div>
              ),
            )}

            {/* Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-gray-400 r rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Signature by Trainee
                </p>
                {selectedItem.traineeSignPreview ? (
                  <img
                    src={selectedItem.traineeSignPreview}
                    alt="Trainee Signature"
                    className="h-16 mx-auto border border-gray-400  rounded bg-white p-2 shadow-sm"
                  />
                ) : selectedItem.signature_drawn ? (
                  <img
                    src={selectedItem.signature_drawn}
                    alt="Trainee Signature"
                    className="h-16 mx-auto border border-gray-400  rounded bg-white p-2 shadow-sm"
                  />
                ) : (
                  <p className="text-gray-400 italic text-sm">
                    No signature provided
                  </p>
                )}
              </div>

              <div className="border border-gray-400 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Signature by Trainer
                </p>
                {selectedItem.traineeSign2Preview ? (
                  <img
                    src={selectedItem.traineeSign2Preview}
                    alt="Trainer Signature"
                    className="h-16 mx-auto border border-gray-400  rounded bg-white p-2 shadow-sm"
                  />
                ) : selectedItem.signature2_drawn ? (
                  <img
                    src={selectedItem.signature2_drawn}
                    alt="Trainer Signature"
                    className="h-16 mx-auto border border-gray-400  rounded bg-white p-2 shadow-sm"
                  />
                ) : (
                  <p className="text-gray-400 italic text-sm">
                    No signature provided
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 pt-6">
              <button
                onClick={() => updateStatus(selectedItem.id, "Rejected")}
                className="px-6 py-2 border-2 border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all"
              >
                Reject
              </button>
              <button
                onClick={() => updateStatus(selectedItem.id, "Approved")}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
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

export default StaffTrainingChecklistApproval;

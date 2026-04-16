import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaAngleRight, FaEye } from "react-icons/fa6";
import { GrNext, GrPrevious } from "react-icons/gr";
import { RxCross2 } from "react-icons/rx";

const ShiftHandOverApproval = () => {
  const [requests, setRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const detailsFields = [
    {
      label: "Special Events Safety And Security Issues",
      name: "securityRemark",
    },
    { label: "Maintenance Work", name: "maintenanceRemark" },
    { label: "Staff Issues", name: "staffIssueRemark" },
    {
      label: "Incident/Accident Report / Lost and Found (If Any)",
      name: "lostFoundRemark",
    },
    {
      label: "New Instructions Or Changes In Work Procedures",
      name: "proceduresRemark",
    },
    {
      label:
        "Special Assignments Instructions From School or Security Management",
      name: "managementRemark",
    },
    { label: "Damaged / Lost key details if any", name: "damageRemark" },
    {
      label: "Other Items of Interest (Fire panel, property damage, etc.)",
      name: "interestRemark",
    },
  ];

  const equipmentFields = [
    { label: "Radios", name: "radios" },
    { label: "Guard Tour System", name: "tourSystem" },
    { label: "Duty Mobile", name: "dutyMobile" },
    { label: "Keys", name: "keys" },
  ];

  const fetchPendingRequests = () => {
    setLoading(true);
    const stored = JSON.parse(localStorage.getItem("shift_hand_over") || "[]");
    setRequests(stored.filter((item) => item.status === "Pending"));
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const updateStatus = (id, newValue) => {
    const stored = JSON.parse(localStorage.getItem("shift_hand_over") || "[]");
    const updated = stored.map((item) =>
      item.id === id ? { ...item, status: newValue } : item,
    );
    localStorage.setItem("shift_hand_over", JSON.stringify(updated));
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
    const stored = JSON.parse(localStorage.getItem("shift_hand_over") || "[]");
    const updated = stored.map((item) =>
      selectedIds.includes(item.id) ? { ...item, status: value } : item,
    );
    localStorage.setItem("shift_hand_over", JSON.stringify(updated));
    setSelectedIds([]);
    toast.success(`Bulk ${value}`);
    fetchPendingRequests();
  };

  const filteredData = requests.filter(
    (x) =>
      (x.school_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (x.guard_in || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (x.guard_out || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + entriesPerPage,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / entriesPerPage),
  );
  const endIndex = startIndex + entriesPerPage;

  const selectedItem = requests.find((item) => item.id === selectedId);

  const formatTime = (timeVal) => {
    if (!timeVal) return "—";
    return new Date(timeVal).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Approvals</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div className="text-blue-600">Shift Hand Over Approval</div>
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
                  School Name
                </th>
                <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                  Time In
                </th>
                <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                  Time Out
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
                      {item.school_name || "—"}
                    </td>
                    <td className="py-3 px-6 hidden md:table-cell text-gray-600 text-center">
                      {item.time_in
                        ? new Date(
                            item.time_in,
                          ).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          })
                        : "-"}
                    </td>
                    <td className="py-3 px-6 hidden md:table-cell text-gray-600 text-center">
                      {item.time_out
                        ? new Date(
                            item.time_out,
                          ).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          })
                        : "-"}
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
            <div className="flex justify-between items-center mb-6 pb-4 border-b  border-gray-400">
              <h2 className="text-xl font-bold text-gray-900 ">
                Shift Handover Details
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            {/* Summary Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-gray-400">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  School Name
                </p>
                <p className="font-semibold text-gray-800">
                  {selectedItem.school_name || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Date
                </p>
                <p className="font-semibold text-gray-800">
                  {selectedItem.date || "—"}
                </p>
              </div>
            </div>

            {/* Guard Info */}
            <div className="border border-gray-400 rounded-xl overflow-hidden mb-8">
              <div className="grid grid-cols-3 bg-slate-800 text-white font-bold text-sm">
                <div className="p-3 text-center">Detail</div>
                <div className="p-3 text-center border-l border-slate-600">
                  Outgoing Party
                </div>
                <div className="p-3 text-center border-l border-slate-600">
                  Incoming Party
                </div>
              </div>
              <div className="grid grid-cols-3 border-b border-gray-400 text-sm">
                <div className="p-3 bg-slate-50 font-medium text-gray-700 text-center">
                  Handover Timing
                </div>
                <div className="p-3 text-center text-gray-800 border-l border-gray-100">
                  {selectedItem.time_out
                    ? new Date(selectedItem.time_out).toLocaleTimeString(
                        "en-GB",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        },
                      )
                    : "-"}
                </div>
                <div className="p-3 text-center text-gray-800 border-l border-gray-100">
                  {selectedItem.time_in
                    ? new Date(selectedItem.time_in).toLocaleTimeString(
                        "en-GB",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        },
                      )
                    : "-"}
                </div>
              </div>
              <div className="grid grid-cols-3 border-b border-gray-400 text-sm">
                <div className="p-3 bg-slate-50 font-medium text-gray-700 text-center">
                  Guard Name
                </div>
                <div className="p-3 text-center text-gray-800 border-l border-gray-100">
                  {selectedItem.guard_out || "—"}
                </div>
                <div className="p-3 text-center text-gray-800 border-l border-gray-100">
                  {selectedItem.guard_in || "—"}
                </div>
              </div>
              <div className="grid grid-cols-3 text-sm">
                <div className="p-3 bg-slate-50 font-medium text-gray-700 text-center">
                  ID Card Number
                </div>
                <div className="p-3 text-center text-gray-800 border-l border-gray-100">
                  {selectedItem.id_out || "—"}
                </div>
                <div className="p-3 text-center text-gray-800 border-l border-gray-100">
                  {selectedItem.id_in || "—"}
                </div>
              </div>
            </div>

            {/* Remarks Table */}
            <div className="border border-gray-400 rounded-xl overflow-hidden mb-8">
              <div className="grid grid-cols-2 bg-slate-100 text-gray-700 font-bold text-sm border-b">
                <div className="p-3">Key Description Items</div>
                <div className="p-3 border-l border-gray-200">
                  Detailed Remarks
                </div>
              </div>
              {detailsFields.map((field, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 border-b border-gray-400 last:border-b-0 text-sm hover:bg-slate-50"
                >
                  <div className="p-3 font-medium text-gray-700">
                    {field.label}
                  </div>
                  <div className="p-3 text-gray-600 border-l border-gray-100 italic">
                    {selectedItem[field.name] || "—"}
                  </div>
                </div>
              ))}
            </div>

            {/* Equipment Table */}
            <div className="border border-gray-400 rounded-xl overflow-hidden mb-8">
              <div className="grid grid-cols-2 bg-slate-100 text-gray-700 font-bold text-sm border-b border-gray-400">
                <div className="p-3">Security Equipment Assets</div>
                <div className="p-3 border-l border-gray-200">
                  Status / Notes
                </div>
              </div>
              {equipmentFields.map((field, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 border-b border-gray-400 last:border-b-0 text-sm hover:bg-slate-50"
                >
                  <div className="p-3 font-medium text-gray-700">
                    {field.label}
                  </div>
                  <div className="p-3 text-gray-600 border-l border-gray-100 italic">
                    {selectedItem[field.name] || "—"}
                  </div>
                </div>
              ))}
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Prepared By */}
              <div className="border border-gray-400 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Prepared By (Outgoing Party)
                </p>
                {selectedItem.preparedBySignPreview ? (
                  <img
                    src={selectedItem.preparedBySignPreview}
                    alt="Prepared By Signature"
                    className="h-16 mx-auto border border-gray-400 rounded bg-white p-2 shadow-sm"
                  />
                ) : selectedItem.preparedBySign_drawn ? (
                  <img
                    src={selectedItem.preparedBySign_drawn}
                    alt="Prepared By Signature"
                    className="h-16 mx-auto border border-gray-400 rounded bg-white p-2 shadow-sm"
                  />
                ) : (
                  <p className="text-gray-400 italic text-sm">
                    No signature provided
                  </p>
                )}
              </div>

              {/* Acknowledged By */}
              <div className="border border-gray-400 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Acknowledged By (Incoming Party)
                </p>
                {selectedItem.acknowledgedBySignPreview ? (
                  <img
                    src={selectedItem.acknowledgedBySignPreview}
                    alt="Acknowledged By Signature"
                    className="h-16 mx-auto border border-gray-400 rounded bg-white p-2 shadow-sm"
                  />
                ) : selectedItem.acknowlegedBySign_drawn ? (
                  <img
                    src={selectedItem.acknowlegedBySign_drawn}
                    alt="Acknowledged By Signature"
                    className="h-16 mx-auto border border-gray-400 rounded bg-white p-2 shadow-sm"
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

export default ShiftHandOverApproval;

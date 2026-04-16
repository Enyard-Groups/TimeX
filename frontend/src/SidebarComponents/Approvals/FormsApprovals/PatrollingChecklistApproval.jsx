import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaAngleRight, FaEye } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";

const PatrollingChecklistApproval = () => {
  const [requests, setRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch pending records from localStorage
  const fetchPendingRequests = () => {
    setLoading(true);
    const stored = JSON.parse(
      localStorage.getItem("patrolling_checklist") || "[]",
    );
    // Filter only those that are 'Pending'
    setRequests(stored.filter((item) => item.status === "Pending"));
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const updateStatus = (id, newValue) => {
    const stored = JSON.parse(
      localStorage.getItem("patrolling_checklist") || "[]",
    );
    const updated = stored.map((item) =>
      item.id === id ? { ...item, status: newValue } : item,
    );
    localStorage.setItem("patrolling_checklist", JSON.stringify(updated));
    toast.success(`Patrolling Record ${newValue}`);
    setOpenModal(false);
    fetchPendingRequests();
  };

  const bulkAction = (value) => {
    if (selectedIds.length === 0)
      return toast.error("Please select at least one record");
    const stored = JSON.parse(
      localStorage.getItem("patrolling_checklist") || "[]",
    );
    const updated = stored.map((item) =>
      selectedIds.includes(item.id) ? { ...item, status: value } : item,
    );
    localStorage.setItem("patrolling_checklist", JSON.stringify(updated));
    setSelectedIds([]);
    toast.success(`Selected records ${value}`);
    fetchPendingRequests();
  };

  const filteredData = requests.filter(
    (x) =>
      (x.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (x.school_name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + entriesPerPage,
  );
  const selectedItem = requests.find((item) => item.id === selectedId);

  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Approvals</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div className="text-blue-600">Patrolling Checklist Approval</div>
        </h1>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl">
        {/* Bulk Action Header */}
        <div className="m-6 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <span className="bg-blue-500 w-2 h-2 rounded-full animate-pulse"></span>
              Bulk Management
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

        {/* Filters */}
        <div className="p-6 pt-0 border-b border-blue-100/30">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">
                Display
              </label>
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
            <input
              placeholder="Search by name or school..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-[15px] text-gray-700">
            <thead>
              <tr className="bg-slate-50 border-b border-blue-100/50">
                <th className="px-6 py-3 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600"
                    onChange={(e) => {
                      if (e.target.checked)
                        setSelectedIds(currentData.map((x) => x.id));
                      else setSelectedIds([]);
                    }}
                  />
                </th>
                <th className="py-3 px-6 font-semibold text-center">
                  Guard Name
                </th>
                <th className="py-3 px-6 font-semibold text-center">
                  School Name
                </th>
                <th className="py-3 px-6 font-semibold text-center">Date</th>
                <th className="py-3 px-6 font-semibold text-center">Action</th>
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
                      <p className="text-gray-500 text-base font-medium">
                        No Pending Patrolling Requests
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
                        className="w-4 h-4"
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => {
                          if (selectedIds.includes(item.id))
                            setSelectedIds(
                              selectedIds.filter((x) => x !== item.id),
                            );
                          else setSelectedIds([...selectedIds, item.id]);
                        }}
                      />
                    </td>
                    <td className="py-3 px-6 text-center font-medium">
                      {item.name}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {item.school_name}
                    </td>
                    <td className="py-3 px-6 text-center">{item.date}</td>
                    <td className="py-3 px-6 text-center flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedId(item.id);
                          setOpenModal(true);
                        }}
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => updateStatus(item.id, "Approved")}
                        className="bg-emerald-500 hidden sm:table-cell text-white px-3 py-1 rounded text-xs font-bold uppercase"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(item.id, "Rejected")}
                        className="bg-rose-500 hidden sm:table-cell text-white px-3 py-1 rounded text-xs font-bold uppercase"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {openModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-400">
              <h2 className="text-2xl font-black text-gray-800">
                Patrolling Detailed Review
              </h2>
              <button onClick={() => setOpenModal(false)}>
                <RxCross2 className="text-2xl hover:text-red-500 transition-colors" />
              </button>
            </div>

            {/* Header Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-dashed border-gray-400">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Guard
                </p>
                <p className="font-bold text-gray-700">{selectedItem.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Staff ID
                </p>
                <p className="font-bold text-gray-700">
                  {selectedItem.staff_id}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Location
                </p>
                <p className="font-bold text-gray-700">
                  {selectedItem.school_name}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Shift Timing
                </p>
                <p className="font-bold text-gray-700">
                  {selectedItem.shift_timing
                    ? selectedItem.shift_timing
                      ? new Date(selectedItem.shift_timing).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          },
                        )
                      : selectedItem.shift_timing
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Date
                </p>
                <p className="font-bold text-gray-700">{selectedItem.date}</p>
              </div>
            </div>

            {/* Checklist Table */}
            <div className="border border-gray-400 rounded-2xl overflow-hidden mb-8">
              <table className="w-full text-sm">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="p-4 text-center">Section & Task</th>
                    <th className="p-4 text-center">Unattended</th>
                    <th className="p-4 text-center">Hazardous</th>
                    <th className="p-4 text-center">IAS</th>
                    <th className="p-4 text-center">Assets</th>
                    <th className="p-4 text-center">Parking</th>
                    <th className="p-4 text-center">PTW</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItem.rows?.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-400 even:bg-slate-50">
                      <td className="p-4">
                        <p className="text-blue-600 font-bold text-xs uppercase">
                          {row.section || "N/A"}
                        </p>
                        <p className="text-gray-800 font-medium">
                          {row.taskList}
                        </p>
                      </td>
                      {[
                        {
                          ok: row.unattended_ok,
                          rep: row.unattended_reported_to,
                        },
                        {
                          ok: row.hazardous_ok,
                          rep: row.hazardous_reported_to,
                        },
                        { ok: row.ias_ok, rep: row.ias_reported_to },
                        {
                          ok: row.gems_assets_ok,
                          rep: row.gems_assets_reported_to,
                        },
                        {
                          ok: row.vehicle_parking_ok,
                          rep: row.vehicle_parking_reported_to,
                        },
                        { ok: row.ptw_ok, rep: row.ptw_reported_to },
                      ].map((cell, i) => (
                        <td
                          key={i}
                          className="p-4 text-center border-l  border-gray-400"
                        >
                          <span
                            className={
                              cell.ok
                                ? "text-green-500"
                                : "text-red-500 font-bold"
                            }
                          >
                            {cell.ok ? "✅" : "❌"}
                          </span>
                           {cell.rep ? (
                            <p className="text-[14px] text-gray-500 italic mt-1 leading-tight bg-gray-100 rounded p-1">
                              To: {cell.rep}
                            </p>
                          ) : (
                            !cell.ok && (
                              <p className="text-[10px] text-gray-300 mt-1 italic">
                                No report info
                              </p>
                            )
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* E-Signature Display */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-gray-400 mb-8">
              <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">
                Employee Digital Signature
              </p>
              {selectedItem.eSignaturePreview ||
              selectedItem.signature_drawn ? (
                <img
                  src={
                    selectedItem.eSignaturePreview ||
                    selectedItem.signature_drawn
                  }
                  alt="Signature"
                  className="h-24 bg-white p-2 rounded-lg border border-gray-400 shadow-sm"
                />
              ) : (
                <p className="text-gray-400 italic">No signature provided</p>
              )}
            </div>

            {/* Final Actions */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                onClick={() => updateStatus(selectedItem.id, "Rejected")}
                className="px-10 py-3 border-2 border-red-500 text-red-500 rounded-xl font-bold hover:bg-red-50 transition-all"
              >
                Reject
              </button>
              <button
                onClick={() => updateStatus(selectedItem.id, "Approved")}
                className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
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

export default PatrollingChecklistApproval;

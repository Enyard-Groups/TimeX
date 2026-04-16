import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaAngleRight, FaEye } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";

const FacilityComplaintFormApproval = () => {
  const [requests, setRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchPendingRequests = () => {
    setLoading(true);
    const stored = JSON.parse(
      localStorage.getItem("facility_complaint") || "[]",
    );
    // Only show Pending items
    setRequests(stored.filter((item) => item.status === "Pending"));
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const updateStatus = (id, newValue) => {
    const stored = JSON.parse(
      localStorage.getItem("facility_complaint") || "[]",
    );
    const updated = stored.map((item) =>
      item.id === id ? { ...item, status: newValue } : item,
    );
    localStorage.setItem("facility_complaint", JSON.stringify(updated));
    toast.success(`Complaint ${newValue}`);
    setOpenModal(false);
    fetchPendingRequests();
  };

  const bulkAction = (value) => {
    if (selectedIds.length === 0) return toast.error("Please select a Request");
    const stored = JSON.parse(
      localStorage.getItem("facility_complaint") || "[]",
    );
    const updated = stored.map((item) =>
      selectedIds.includes(item.id) ? { ...item, status: value } : item,
    );
    localStorage.setItem("facility_complaint", JSON.stringify(updated));
    setSelectedIds([]);
    toast.success(`Bulk ${value}`);
    fetchPendingRequests();
  };

  const filteredData = requests.filter(
    (x) =>
      (x.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (x.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (x.issue_type || "").toLowerCase().includes(searchTerm.toLowerCase()),
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
          <div className="text-blue-600">Facility Complaint Approvals</div>
        </h1>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl">
        {/* Bulk Actions */}
        <div className="m-6 bg-slate-900 rounded-xl p-4 shadow-lg">
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
                className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
            <input
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
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
                  Reporter
                </th>
                <th className="py-3 px-6 font-semibold text-center">
                  Category
                </th>
                <th className="py-3 px-6 font-semibold text-center">
                  Location
                </th>
                <th className="py-3 px-6 font-semibold text-center">
                  Priority
                </th>
                <th className="py-3 px-6 font-semibold text-center">Action</th>
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
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
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
                        className="w-4 h-4"
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => {
                          if (selectedIds.includes(item.id)) {
                            setSelectedIds(
                              selectedIds.filter((x) => x !== item.id),
                            );
                          } else {
                            setSelectedIds([...selectedIds, item.id]);
                          }
                        }}
                      />
                    </td>
                    <td className="py-3 px-6 font-medium text-gray-900 text-center">
                      {item.name}
                    </td>
                    <td className="py-3 px-6 text-center">{item.issue_type}</td>
                    <td className="py-3 px-6 text-center">{item.location}</td>
                    <td className="py-3 px-6 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${item.urgent ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                      >
                        {item.urgent ? "Urgent" : "Normal"}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex gap-2 text-center">
                      <button
                        onClick={() => {
                          setSelectedId(item.id);
                          setOpenModal(true);
                        }}
                        className="text-blue-500 hover:bg-blue-100 p-2 rounded-lg"
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

      {/* Review Modal */}
      {openModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-400">
              <h2 className="text-2xl font-black text-gray-800">
                Review Facility Complaint
              </h2>
              <button onClick={() => setOpenModal(false)}>
                <RxCross2 className="text-2xl hover:text-red-500 transition-colors" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Left Column: Details */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border  border-gray-400">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Reporter Details
                  </p>
                  <p className="font-bold text-gray-800">{selectedItem.name}</p>
                  <p className="text-sm text-gray-500">
                    {selectedItem.email} | {selectedItem.contact}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border  border-gray-400">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Issue Overview
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    Category:{" "}
                    <span className="text-blue-600">
                      {selectedItem.issue_type}
                    </span>
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    Location:{" "}
                    <span className="text-blue-600">
                      {selectedItem.location}
                    </span>
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    Date Noticed:{" "}
                    <span className="text-blue-600">
                      {selectedItem.date_noticed}
                    </span>
                  </p>
                </div>

                <div className="p-4 rounded-xl border-2 border-dashed  border-gray-400">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Issue Description
                  </p>
                  <p className="text-gray-700 italic leading-relaxed">
                    "{selectedItem.description || "No description provided."}"
                  </p>
                </div>
              </div>

              {/* Right Column: Actions & Safety */}
              <div className="space-y-4">
                <div
                  className={`${selectedItem.urgent ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"} p-4 rounded-xl border`}
                >
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Priority Status
                  </p>
                  <p
                    className={`font-black uppercase ${selectedItem.urgent ? "text-red-600" : "text-emerald-600"}`}
                  >
                    {selectedItem.urgent
                      ? "Urgent Attention Required"
                      : "Standard Priority"}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border  border-gray-400">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Requested Action
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {selectedItem.requested_action ||
                      "Standard repair requested."}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">
                    Safety Concerns
                  </p>
                  <p className="font-bold text-blue-800">
                    {selectedItem.safety_concerns === "Yes"
                      ? "⚠️ Immediate Hazard Reported"
                      : "No specific safety hazard noted"}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                onClick={() => updateStatus(selectedItem.id, "Rejected")}
                className="px-8 py-2.5 border-2 border-red-500 text-red-500 rounded-xl font-bold hover:bg-red-50 transition-all"
              >
                Reject
              </button>
              <button
                onClick={() => updateStatus(selectedItem.id, "Approved")}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
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

export default FacilityComplaintFormApproval;

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaAngleRight } from "react-icons/fa6";
import { GrNext, GrPrevious } from "react-icons/gr";
import { FaEye } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

const API_BASE = "http://localhost:3000/api";

const LeaveRequestApproval = () => {
  const [requests, setRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/requests/leave?status=Pending`);
      setRequests(res.data);
    } catch (error) {
      console.error("Failed to fetch pending requests", error);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const inputStyle =
    "text-lg w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  // Single Approve/ Reject
  const updateStatus = async (id, value) => {
    const item = requests.find((r) => r.id === id);
    if (!item) return;

    const payload = {
      status: value,
      remarks: item.remarks || "-",
      rejectedreason: value === "Rejected" ? item.rejectedreason || "-" : "-",
    };

    try {
      await axios.put(`${API_BASE}/requests/leave/${id}`, payload);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success(`Request ${value}`);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Update failed");
    }
  };

  const handleRemarks = (id, text) => {
    setRequests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, remarks: text } : item)),
    );
  };

  const handleRejectedReason = (id, text) => {
    setRequests((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, rejectedreason: text } : item,
      ),
    );
  };

  // Selecting Ids
  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk Approve and Reject
  const bulkAction = async (value) => {
    if (selectedIds.length === 0) {
      toast.error("Please select Request");
      return;
    }

    const payload = {
      ids: selectedIds,
      status: value,
      remarks: "-",
      rejectedreason: value === "Rejected" ? "Bulk Rejection" : "-",
    };

    try {
      await axios.put(`${API_BASE}/requests/leave/bulk`, payload);
      setRequests((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      setSelectedIds([]);
      toast.success(`Bulk ${value}`);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Bulk update failed");
    }
  };

  const filteredData = requests.filter((x) =>
    (x.employee_name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / entriesPerPage),
  );

  const selectedItem = requests.find((item) => item.id === selectedId);

  return (
    <div className="mb-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Approvals</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div className="text-blue-600">Leave Approval</div>
        </h1>
      </div>

      {/* Main Container */}
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
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-1.5 rounded-lg font-semibold transition-all active:scale-95 shadow-md shadow-emerald-900/20"
              >
                Approve Selected
              </button>
              <button
                onClick={() => bulkAction("Rejected")}
                className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-1.5 rounded-lg font-semibold transition-all active:scale-95 shadow-md shadow-rose-900/20"
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
                placeholder="Search pending leaves..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 rounded-lg text-sm xl:text-base placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto min-h-[350px]"
          style={{scrollbarWidth:"none"}}>
          <table className="w-full text-[16px] xl:text-[20px] text-gray-700">
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
                <th className="px-4 py-3 text-center font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-4 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                  From
                </th>
                <th className="px-4 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                  To
                </th>
                <th className="px-4 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                  Leave Type
                </th>
                <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                  Total Day(s)
                </th>
                <th className="px-4 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                  Remarks
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 whitespace-nowrap">
                  Approve / Reject
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
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-4xl opacity-40">🍃</div>
                      <p className="text-gray-500 text-base font-medium">
                        No Pending Leave Requests
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/40 "
                  >
                    <td className="px-6 py-2 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelect(item.id)}
                      />
                    </td>
                    <td className="px-4 py-2 text-center font-medium text-gray-800">
                      {item.employee_name}
                    </td>
                    <td className="px-4 py-2 text-center hidden lg:table-cell text-gray-600 text-sm whitespace-nowrap">
                      {item.start_date
                        ? new Date(item.start_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2 text-center hidden lg:table-cell text-gray-600 text-sm whitespace-nowrap">
                      {item.end_date
                        ? new Date(item.end_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2 text-center hidden sm:table-cell">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold uppercase">
                        {item.leave_type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center hidden md:table-cell font-bold text-slate-700">
                      {item.number_of_days}
                    </td>
                    <td className="px-4 py-2 text-center hidden xl:table-cell">
                      <div className="flex flex-col gap-1">
                        <input
                          placeholder="Remarks..."
                          className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs w-32 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                          value={item.remarks || ""}
                          onChange={(e) =>
                            handleRemarks(item.id, e.target.value)
                          }
                        />
                        <input
                          placeholder="Reason to reject..."
                          className="bg-white border border-rose-100 rounded-md px-2 py-1 text-xs w-32 focus:ring-1 focus:ring-rose-400 focus:outline-none"
                          value={item.rejectedreason || ""}
                          onChange={(e) =>
                            handleRejectedReason(item.id, e.target.value)
                          }
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedId(item.id);
                            setOpenModal(true);
                          }}
                          className="text-blue-500 hover:bg-blue-100 p-2 rounded-lg transition-all"
                          title="View Details"
                        >
                          <FaEye className="text-lg" />
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, "Approved")}
                          className="hidden sm:block bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1 rounded-md text-xs font-bold transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, "Rejected")}
                          className="hidden sm:block bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1 rounded-md text-xs font-bold transition-all"
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

        {/* Pagination Section */}
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
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            >
              First
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
            >
              <GrPrevious />
            </button>
            <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-bold min-w-[45px] text-center">
              {currentPage}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
            >
              <GrNext />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Modal Section */}
      {openModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-5xl max-h-[90vh] overflow-y-auto p-8"
          style={{scrollbarWidth:"none"}}>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-blue-100/30">
              <h2 className="text-xl font-bold text-slate-800">
                Leave Application Details
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-slate-400 hover:text-rose-500 transition-colors"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: "Employee", value: selectedItem.employee_name },
                { label: "Leave Type", value: selectedItem.leave_type },
                { label: "Total Days", value: selectedItem.number_of_days },
                {
                  label: "Start Date",
                  value: selectedItem.start_date
                    ? new Date(selectedItem.start_date).toLocaleDateString()
                    : "-",
                },
                {
                  label: "End Date",
                  value: selectedItem.end_date
                    ? new Date(selectedItem.end_date).toLocaleDateString()
                    : "-",
                },
                {
                  label: "Resume Duty On",
                  value: selectedItem.resume_date
                    ? new Date(selectedItem.resume_date).toLocaleDateString()
                    : "-",
                },
              ].map((field, idx) => (
                <div key={idx}>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                    {field.label}
                  </label>
                  <p className="bg-slate-100/50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-800 font-medium">
                    {field.value}
                  </p>
                </div>
              ))}

              <div className="md:col-span-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  Leave Reason
                </label>
                <div className="bg-slate-100/50 border border-slate-200 px-4 py-4 rounded-xl text-slate-800 italic">
                  {selectedItem.reason || "No reason specified."}
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block text-emerald-600">
                    Approval Remarks
                  </label>
                  <textarea
                    placeholder="Enter remarks for approval..."
                    className="w-full bg-white border-2 border-slate-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all text-sm h-20"
                    value={selectedItem.remarks || ""}
                    onChange={(e) =>
                      handleRemarks(selectedItem.id, e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block text-rose-600">
                    Rejection Reason
                  </label>
                  <textarea
                    placeholder="Enter reason if rejecting..."
                    className="w-full bg-white border-2 border-slate-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-rose-500 transition-all text-sm h-20"
                    value={selectedItem.rejectedreason || ""}
                    onChange={(e) =>
                      handleRejectedReason(selectedItem.id, e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  Current Status
                </label>
                <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg font-bold text-sm shadow-sm inline-block">
                  {selectedItem.status}
                </span>
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-4 border-t border-slate-100 pt-6">
              <button
                onClick={() => {
                  updateStatus(selectedItem.id, "Rejected");
                  setOpenModal(false);
                }}
                className="px-8 py-2.5 rounded-xl border-2 border-rose-200 text-rose-600 font-bold hover:bg-rose-50 transition-all"
              >
                Reject Request
              </button>
              <button
                onClick={() => {
                  updateStatus(selectedItem.id, "Approved");
                  setOpenModal(false);
                }}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Approve Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestApproval;

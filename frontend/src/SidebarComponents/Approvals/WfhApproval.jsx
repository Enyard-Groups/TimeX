import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaAngleRight } from "react-icons/fa6";
import { GrNext, GrPrevious } from "react-icons/gr";
import { FaEye } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

const API_BASE = "http://localhost:3000/api";

const WfhApproval = () => {
  const [requests, setRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/requests/wfh`);
      setRequests(res.data);
      console.log;
    } catch (error) {
      console.error("Failed to fetch WFH requests", error);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);
  const inputStyle =
    "text-lg w-full  border  border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const approverName =
    JSON.parse(localStorage.getItem("user")).role.charAt(0).toUpperCase() +
    JSON.parse(localStorage.getItem("user")).role.slice(1).toLowerCase();

  // Single Approve/ Reject
  const updateStatus = async (id, value) => {
    try {
      const item = requests.find((r) => r.id === id);
      await axios.put(`${API_BASE}/requests/wfh/bulk`, {
        ids: [id],
        status: value,
        rejectedreason: value === "Rejected" ? item.rejectedreason : "-",
      });

      setRequests((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: value } : item,
        ),
      );
      toast.success(`Request ${value}`);
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleRejectedReason = (id, text) => {
    const updated = requests.map((item) =>
      item.id === id ? { ...item, rejectedreason: text } : item,
    );

    setRequests(updated);
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

    try {
      await axios.put(`${API_BASE}/requests/wfh/bulk`, {
        ids: selectedIds,
        status: value,
        rejectedreason: value === "Rejected" ? "" : "-", // For bulk rejection, we might not have individual reasons yet
      });

      setRequests((prev) =>
        prev.map((item) =>
          selectedIds.includes(item.id) ? { ...item, status: value } : item,
        ),
      );
      setSelectedIds([]);
      toast.success(`Bulk ${value}`);
    } catch (error) {
      toast.error("Bulk update failed");
    }
  };

  const pending = requests.filter((r) => r.status === "Pending");

  const filteredData = pending.filter((x) =>
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
          <div className="text-blue-600">WFH Approval</div>
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
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-1.5 rounded-lg font-semibold transition-all active:scale-95 shadow-md"
              >
                Approve Selected
              </button>
              <button
                onClick={() => bulkAction("Rejected")}
                className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-1.5 rounded-lg font-semibold transition-all active:scale-95 shadow-md"
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
                placeholder="Search WFH requests..."
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
          <table className="w-full text-[17px]">
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
                  Employee
                </th>
                <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                  From
                </th>
                <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                  To
                </th>
                <th className="px-4 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                  Reason
                </th>
                <th className="px-4 py-3 text-center hidden xl:table-cell font-semibold text-gray-700 whitespace-nowrap">
                  Rejected Reason
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">
                  Approve / Reject
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
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-4xl opacity-40">🏠</div>
                      <p className="text-gray-500 text-base font-medium">
                        No Pending WFH Requests
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
                    <td className="px-4 py-2 text-center font-medium text-gray-800">
                      {item.employee_name}
                    </td>
                    <td className="px-4 py-2 text-center hidden md:table-cell text-gray-600 text-sm">
                      {formatDate(item.start_date)}
                    </td>
                    <td className="px-4 py-2 text-center hidden md:table-cell text-gray-600 text-sm">
                      {formatDate(item.end_date)}
                    </td>
                    <td className="px-4 py-2 text-center hidden lg:table-cell text-gray-600 max-w-xs truncate italic">
                      {item.reason || "NIL"}
                    </td>
                    <td className="px-4 py-2 text-center hidden xl:table-cell">
                      <input
                        placeholder="Reason to reject..."
                        className="bg-white border border-rose-100 rounded-md px-2 py-1 text-xs w-40 focus:ring-1 focus:ring-rose-400 focus:outline-none"
                        value={item.rejectedreason || ""}
                        onChange={(e) =>
                          handleRejectedReason(item.id, e.target.value)
                        }
                      />
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

        {/* Pagination */}
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
      {openModal && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-5xl max-h-[90vh] overflow-y-auto p-8"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-blue-100/30">
              <h2 className="text-xl font-bold text-slate-800">
                Work From Home Details
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
                { label: "Employee Name", value: selectedItem.employee_name },
                {
                  label: "From Date",
                  value: formatDate(selectedItem.start_date),
                },
                { label: "To Date", value: formatDate(selectedItem.end_date) },
              ].map((field, idx) => (
                <div key={idx}>
                  <label className="text-xs xl:text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                    {field.label}
                  </label>
                  <p className="bg-slate-100/50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-800 font-medium">
                    {field.value}
                  </p>
                </div>
              ))}

              <div className="md:col-span-2">
                <label className="text-xs xl:text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  Reason for WFH
                </label>
                <div className="bg-slate-100/50 border border-slate-200 px-4 py-4 rounded-xl text-slate-800 italic min-h-[60px]">
                  {selectedItem.reason || "No reason specified."}
                </div>
              </div>

              <div>
                <label className="text-xs xl:text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  Current Status
                </label>
                <span
                  className={`px-4 py-2 rounded-lg font-bold text-sm xl:text-base shadow-sm inline-block
                ${selectedItem.status === "Approved" ? "bg-emerald-100 text-emerald-700" : ""}
                ${selectedItem.status === "Rejected" ? "bg-rose-100 text-rose-700" : ""}
                ${selectedItem.status === "Pending" ? "bg-amber-100 text-amber-700" : ""}
             `}
                >
                  {selectedItem.status}
                </span>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs xl:text-sm font-bold uppercase tracking-wider text-rose-600 mb-2 block">
                  Rejection Reason
                </label>
                <textarea
                  placeholder="Enter reason if rejecting..."
                  className="w-full bg-white border-2 border-slate-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-rose-500 transition-all text-sm xl:text-base h-24"
                  value={selectedItem.rejectedreason || ""}
                  onChange={(e) =>
                    handleRejectedReason(selectedItem.id, e.target.value)
                  }
                />
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

export default WfhApproval;

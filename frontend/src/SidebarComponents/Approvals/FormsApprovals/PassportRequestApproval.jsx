import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaAngleRight, FaEye } from "react-icons/fa6";
import { GrNext, GrPrevious } from "react-icons/gr";
import { RxCross2 } from "react-icons/rx";

const STORE_KEY = "passport_request";

const PassportRequestApproval = () => {
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
    const stored = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    setRequests(stored.filter((item) => item.status === "Pending"));
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const updateStatus = (id, newStatus) => {
    const stored = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    const updated = stored.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item,
    );
    localStorage.setItem(STORE_KEY, JSON.stringify(updated));
    toast.success(`Request ${newStatus}`);
    setOpenModal(false);
    fetchPendingRequests();
  };

  const bulkAction = (status) => {
    if (selectedIds.length === 0) return toast.error("Please select a request");
    const stored = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    const updated = stored.map((item) =>
      selectedIds.includes(item.id) ? { ...item, status } : item,
    );
    localStorage.setItem(STORE_KEY, JSON.stringify(updated));
    setSelectedIds([]);
    toast.success(`Bulk ${status}`);
    fetchPendingRequests();
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const filteredData = requests.filter(
    (x) =>
      (x.employee_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (x.enrollment_id || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (x.reason_for_request || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
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
  const selectedItem = requests.find((item) => item.id === selectedId);

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Approvals</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div className="text-blue-600">Passport Request Approval</div>
        </h1>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl">
        {/* Bulk Action Bar */}
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
            <input
              placeholder="Search pending entries..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-64 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all"
            />
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
                      currentData.every((emp) => selectedIds.includes(emp.id))
                    }
                    onChange={(e) =>
                      e.target.checked
                        ? setSelectedIds(currentData.map((x) => x.id))
                        : setSelectedIds([])
                    }
                  />
                </th>
                <th className="py-3 px-6 font-semibold text-gray-700 text-center">
                  Employee Name
                </th>
                <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                  Enrollment ID
                </th>
                <th className="py-3 px-6 hidden lg:table-cell font-semibold text-gray-700 text-center">
                  Passport Purpose
                </th>
                <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
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
                      {item.employee_name}
                    </td>
                    <td className="py-3 px-6 hidden md:table-cell text-gray-600 font-mono text-center">
                      {item.enrollment_id}
                    </td>
                    <td className="py-3 px-6 hidden lg:table-cell text-gray-600 italic truncate max-w-[200px] text-center">
                      {item.reason_for_request}
                    </td>
                    <td className="py-3 px-6 hidden md:table-cell text-gray-600 text-center">
                      {item.request_date}
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

        {/* Pagination */}
        <div className="p-6 border-t border-blue-100/30 flex flex-col sm:flex-row justify-between items-center gap-6">
          <span className="text-sm xl:text-base text-gray-600">
            Showing{" "}
            <span className="text-gray-900 font-semibold">
              {filteredData.length === 0 ? "0" : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="text-gray-900 font-semibold">
              {Math.min(startIndex + entriesPerPage, filteredData.length)}
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

      {/* Detail Modal */}
      {openModal && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[1000px] max-h-[90vh] overflow-y-auto p-8"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-400">
              <h2 className="text-xl font-bold">Request Details</h2>
              <button onClick={() => setOpenModal(false)}>
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-gray-400">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Employee
                </p>
                <p className="font-semibold">{selectedItem.employee_name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Enrollment ID
                </p>
                <p className="font-semibold font-mono">
                  {selectedItem.enrollment_id}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Date
                </p>
                <p className="font-semibold">{selectedItem.request_date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Department
                </p>
                <p>{selectedItem.department || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Position
                </p>
                <p>{selectedItem.position_title || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Mobile
                </p>
                <p>{selectedItem.mobile || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Passport Number
                </p>
                <p className="font-mono">
                  {selectedItem.passport_number || "—"}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                Purpose of Request
              </p>
              <p className="italic">{selectedItem.reason_for_request || "—"}</p>
            </div>
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                Expected Return Date
              </p>
              <p className="font-semibold text-blue-700">
                {selectedItem.expected_return_date || "—"}
              </p>
            </div>

            <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-gray-400 text-sm">
              Agreement:{" "}
              <span
                className={
                  selectedItem.agreement
                    ? "text-emerald-600 font-semibold"
                    : "text-rose-600 font-semibold"
                }
              >
                {selectedItem.agreement ? "Agreed to terms" : "Not agreed"}
              </span>
            </div>

            {selectedItem.employeeSignaturePreview && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                  Employee Signature
                </p>
                <img
                  src={selectedItem.employeeSignaturePreview}
                  alt="Signature"
                  className="h-16 border border-gray-400  rounded bg-white p-2 shadow-sm"
                />
              </div>
            )}

            <div className="flex justify-end gap-4 mt-8 pt-6">
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

export default PassportRequestApproval;

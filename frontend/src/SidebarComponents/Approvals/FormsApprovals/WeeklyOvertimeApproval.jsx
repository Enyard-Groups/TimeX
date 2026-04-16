import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaAngleRight, FaEye } from "react-icons/fa6";
import { GrNext, GrPrevious } from "react-icons/gr";
import { RxCross2 } from "react-icons/rx";

const WeeklyOvertimeApproval = () => {
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
      localStorage.getItem("weekly_overtime_form") || "[]",
    );
    setRequests(stored.filter((item) => item.status === "Pending"));
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const updateStatus = (id, newValue) => {
    const stored = JSON.parse(
      localStorage.getItem("weekly_overtime_form") || "[]",
    );
    const updated = stored.map((item) =>
      item.id === id ? { ...item, status: newValue } : item,
    );
    localStorage.setItem("weekly_overtime_form", JSON.stringify(updated));
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
      localStorage.getItem("weekly_overtime_form") || "[]",
    );
    const updated = stored.map((item) =>
      selectedIds.includes(item.id) ? { ...item, status: value } : item,
    );
    localStorage.setItem("weekly_overtime_form", JSON.stringify(updated));
    setSelectedIds([]);
    toast.success(`Bulk ${value}`);
    fetchPendingRequests();
  };

  const filteredData = requests.filter(
    (x) =>
      (x.employee_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (x.site_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (x.designation || "").toLowerCase().includes(searchTerm.toLowerCase()),
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
          <div className="text-blue-600">Weekly Overtime Approval</div>
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
                className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 xl:text-base rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
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
                <th className="py-3 px-6 font-semibold text-gray-700 text-center">
                  Employee Name
                </th>
                <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                  Enrollment ID
                </th>
                <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                  Designation
                </th>
                <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                  Site Name
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
                    <td className="py-3 px-6 hidden md:table-cell text-gray-600  text-center">
                      {item.enrollment_id}
                    </td>
                    <td className="py-3 px-6 hidden md:table-cell text-gray-600 text-center">
                      {item.designation}
                    </td>
                    <td className="py-3 px-6 hidden md:table-cell text-gray-600 text-center">
                      {item.site_name}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedId(item.id);
                            setOpenModal(true);
                          }}
                          className="text-blue-500 hover:bg-blue-100 p-2 rounded-lg transition-all"
                        >
                          <FaEye className="text-lg" />
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, "Approved")}
                          className="bg-emerald-500 hidden sm:table-cell hover:bg-emerald-600 text-white px-3 py-1 rounded text-sm font-bold transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, "Rejected")}
                          className="bg-rose-500 hidden sm:table-cell hover:bg-rose-600 text-white px-3 py-1 rounded text-sm font-bold transition-all"
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
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-400">
              <h2 className="text-xl font-bold text-gray-900">
                Weekly Overtime Request Details
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            {/* Employee Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border  border-gray-400">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Employee
                </p>
                <p className="font-semibold text-gray-800">
                  {selectedItem.employee_name || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Enrollment ID
                </p>
                <p className="font-semibold text-gray-800 ">
                  {selectedItem.enrollment_id || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Designation
                </p>
                <p className="font-semibold text-gray-800">
                  {selectedItem.designation || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Site Name
                </p>
                <p className="font-semibold text-gray-800">
                  {selectedItem.site_name || "—"}
                </p>
              </div>
            </div>

            {/* Overtime Type */}
            <div className="flex gap-6 mb-6 px-1">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold ${selectedItem.rest_day ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-400"}`}
              >
                <span
                  className={`w-3 h-3 rounded-full ${selectedItem.rest_day ? "bg-blue-500" : "bg-gray-300"}`}
                ></span>
                Rest Day
              </div>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold ${selectedItem.shift_extension ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-gray-50 border-gray-200 text-gray-400"}`}
              >
                <span
                  className={`w-3 h-3 rounded-full ${selectedItem.shift_extension ? "bg-purple-500" : "bg-gray-300"}`}
                ></span>
                Shift Extension
              </div>
            </div>

            {/* Overtime Details Table */}
            <div className="mb-8 border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-slate-800 text-white px-4 py-2 text-sm font-bold uppercase tracking-wide">
                Overtime Log
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 border-b border-gray-200">
                      <th className="p-3 text-center font-semibold text-gray-600">
                        #
                      </th>
                      <th className="p-3 text-center font-semibold text-gray-600">
                        Day
                      </th>
                      <th className="p-3 text-center font-semibold text-gray-600">
                        Date
                      </th>
                      <th className="p-3 text-center font-semibold text-gray-600">
                        Start
                      </th>
                      <th className="p-3 text-center font-semibold text-gray-600">
                        End
                      </th>
                      <th className="p-3 text-center font-semibold text-gray-600">
                        Total Hours
                      </th>
                      <th className="p-3 text-center font-semibold text-gray-600">
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedItem.overtime_details || []).length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="p-4 text-center text-gray-400"
                        >
                          No overtime entries
                        </td>
                      </tr>
                    ) : (
                      (selectedItem.overtime_details || []).map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-100 hover:bg-slate-50"
                        >
                          <td className="p-3 text-center text-gray-400 ">
                            {i + 1}
                          </td>
                          <td className="p-3 text-center text-gray-700">
                            {row.day || "—"}
                          </td>
                          <td className="p-3 text-center text-gray-700">
                            {row.date || "—"}
                          </td>
                          <td className="p-3 text-center  text-blue-600">
                            {row.startTime
                              ? new Date(row.startTime).toLocaleTimeString([], {
                                  hour12: false,
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })
                              : row.startTime || "—"}
                          </td>
                          <td className="p-3 text-center  text-blue-600">
                            {row.endTime
                              ? new Date(row.endTime).toLocaleTimeString([], {
                                  hour12: false,
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })
                              : row.endTime || "—"}
                          </td>
                          <td className="p-3 text-center font-bold text-gray-800">
                            {row.totalHours || "—"}
                          </td>
                          <td className="p-3 text-center text-gray-600">
                            {row.reason || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Checker & Approver */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Checker */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 text-sm font-bold text-gray-600 uppercase tracking-wide border-b border-slate-200">
                  Checked By: Security Head Guard
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-500">Name</span>
                    <span className="text-gray-800">
                      {selectedItem.checker_name || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-500">Date</span>
                    <span className="text-gray-800">
                      {selectedItem.checked_date || "—"}
                    </span>
                  </div>
                  {(selectedItem.checkerSignaturePreview ||
                    selectedItem.checker_signature_drawn) && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                        Signature
                      </p>
                      <img
                        src={
                          selectedItem.checkerSignaturePreview ||
                          selectedItem.checker_signature_drawn
                        }
                        alt="Checker Signature"
                        className="h-14 border border-gray-400 rounded bg-white p-1 shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Approver */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 text-sm font-bold text-gray-600 uppercase tracking-wide border-b border-slate-200">
                  Approved By: Manager School Operation
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-500">Name</span>
                    <span className="text-gray-800">
                      {selectedItem.approver_name || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-500">Date</span>
                    <span className="text-gray-800">
                      {selectedItem.approved_date || "—"}
                    </span>
                  </div>
                  {(selectedItem.approverSignaturePreview ||
                    selectedItem.approver_signature_drawn) && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                        Signature
                      </p>
                      <img
                        src={
                          selectedItem.approverSignaturePreview ||
                          selectedItem.approver_signature_drawn
                        }
                        alt="Approver Signature"
                        className="h-14 border border-gray-400 rounded bg-white p-1 shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Verifier (Office Use) */}
            <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-gray-500 uppercase tracking-widest mb-4 text-sm border-b border-slate-200 pb-2">
                For Office Use Only
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">
                      Verified By
                    </span>
                    <span className="text-gray-800">
                      {selectedItem.verifier_details?.verified_by || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">
                      Verifier Name
                    </span>
                    <span className="text-gray-800">
                      {selectedItem.verifier_details?.verifier_name || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">
                      Verified Date
                    </span>
                    <span className="text-gray-800">
                      {selectedItem.verifier_details?.verified_date || "—"}
                    </span>
                  </div>
                </div>
                {(selectedItem.verifierSignaturePreview ||
                  selectedItem.verifier_details?.verifier_signature_drawn) && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                      Verifier Signature
                    </p>
                    <img
                      src={
                        selectedItem.verifierSignaturePreview ||
                        selectedItem.verifier_details?.verifier_signature_drawn
                      }
                      alt="Verifier Signature"
                      className="h-14 border border-gray-400 rounded bg-white p-1 shadow-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6">
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

export default WeeklyOvertimeApproval;

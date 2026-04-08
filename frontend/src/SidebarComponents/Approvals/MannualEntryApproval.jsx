import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaAngleRight } from "react-icons/fa6";
import { GrNext, GrPrevious } from "react-icons/gr";
import { FaEye } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";

const API_BASE = "http://localhost:3000/api";

const API_BASE = "http://localhost:3000/api";

const MannualEntryApproval = () => {
  const [requests, setRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchPendingManualRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/requests/manual?status=Pending`);
      setRequests(res.data);
    } catch (error) {
      console.error("Failed to fetch pending manual entry requests", error);
      toast.error("Failed to load manual entry requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingManualRequests();
  }, []);

  const inputStyle =
    "text-lg w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  // Single Approve / Reject
  const updateStatus = async (id, value) => {
    const item = requests.find((r) => r.id === id);
    if (!item) return;

    const payload = {
      status: value,
      rejectedreason:
        value === "Rejected" ? item.rejectedreason || "Rejected" : "-",
    };

    try {
      await axios.put(`${API_BASE}/requests/manual/${id}`, payload);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success(`Request ${value}`);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Update failed");
    }
  };

  const handleRejectedReason = (id, text) => {
    setRequests((prev) =>
      prev.map((item) =>
<<<<<<< HEAD
        item.id === id ? { ...item, rejectedreason: text } : item
      )
=======
        item.id === id ? { ...item, rejectedreason: text } : item,
      ),
>>>>>>> 3411cc474c135c304879d0bb4504e2fe248f4555
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
      toast.error("Please select a Request");
      return;
    }

    const payload = {
      ids: selectedIds,
      status: value,
      rejectedreason: value === "Rejected" ? "Bulk Rejection" : "-",
    };

    try {
      await axios.put(`${API_BASE}/requests/manual/bulk`, payload);
      setRequests((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      setSelectedIds([]);
      toast.success(`Bulk ${value}`);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Bulk update failed");
    }
  };

  const filteredData = requests.filter((x) =>
<<<<<<< HEAD
    (x.employee_name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
=======
    (x.employee_name || "").toLowerCase().includes(searchTerm.toLowerCase()),
>>>>>>> 3411cc474c135c304879d0bb4504e2fe248f4555
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / entriesPerPage)
  );

  const selectedItem = requests.find((item) => item.id === selectedId);

  return (
    <div className="mb-6">
<<<<<<< HEAD
      <div className="flex items-center gap-2 text-lg font-semibold">
        <FaAngleRight />
        Approvals
        <FaAngleRight />
        Manual Entry Approval
      </div>

      <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.8_0.001_106.424)] p-6">
        <div className="w-full text-white">
          <div className="bg-[oklch(0.69_0.2_16.439)] p-3 rounded-xl">
            Bulk Approve / Reject
          </div>
          <div className="flex justify-end m-4 gap-4">
            <button
              onClick={() => bulkAction("Approved")}
              className="bg-gray-700 px-4 py-1 rounded font-medium"
            >
              Approve
            </button>
            <button
              onClick={() => bulkAction("Rejected")}
              className="bg-red-500 px-4 py-1 rounded font-medium"
            >
              Reject
            </button>
=======
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Requests</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div className="text-blue-600">Manual Entry Approval</div>
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
>>>>>>> 3411cc474c135c304879d0bb4504e2fe248f4555
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
<<<<<<< HEAD
                className="border rounded-full px-1 border-[oklch(0.645_0.246_16.439)]"
=======
                className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all"
>>>>>>> 3411cc474c135c304879d0bb4504e2fe248f4555
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
<<<<<<< HEAD
                className="shadow-sm px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]"
=======
                className="w-full bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 rounded-lg text-sm xl:text-base placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all"
>>>>>>> 3411cc474c135c304879d0bb4504e2fe248f4555
              />
            </div>
          </div>
        </div>

<<<<<<< HEAD
          {/* Table */}
          <div
            className="overflow-x-auto min-h-[250px]"
            style={{ scrollbarWidth: "none" }}
          >
            <table className="w-full text-lg border-collapse">
              <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
                <tr>
                  <th className="py-2 px-4">
                    <input
                      type="checkbox"
                      checked={
                        currentData.length > 0 &&
                        currentData.every((emp) =>
                          selectedIds.includes(emp.id)
                        )
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
                  <th className="p-2 font-semibold text-center">Emp Name</th>
                  <th className="p-2 font-semibold text-center hidden xl:table-cell">
                    Location
                  </th>
                  <th className="p-2 font-semibold text-center hidden md:table-cell whitespace-nowrap">
                    In Time
                  </th>
                  <th className="p-2 font-semibold text-center hidden md:table-cell whitespace-nowrap">
                    Out Time
                  </th>
                  <th className="p-2 font-semibold text-center hidden sm:table-cell whitespace-nowrap">
                    Created On
                  </th>
                  <th className="p-2 font-semibold text-center hidden xl:table-cell">
                    Remarks
                  </th>
                  <th className="p-2 font-semibold text-center hidden xl:table-cell">
                    Rejected Reason
                  </th>
                  <th className="p-2 font-semibold text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center p-10 font-medium">
                      Loading...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="text-center p-10 font-medium text-gray-500"
                    >
                      No Pending Requests
                    </td>
                  </tr>
                ) : (
                  currentData.map((item) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                    >
                      <td className="py-2 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleSelect(item.id)}
                        />
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {item.employee_name}
                      </td>
                      <td className="p-2 hidden xl:table-cell whitespace-nowrap">
                        {item.location}
                      </td>
                      <td className="p-2 hidden md:table-cell">
                        {item.in_time || "No Check-in"}
                      </td>
                      <td className="p-2 hidden md:table-cell whitespace-nowrap">
                        {item.out_time || "No Check-out"}
                      </td>
                      <td className="p-2 hidden sm:table-cell">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-2 hidden xl:table-cell">
                        {item.remarks || "-"}
                      </td>
                      <td className="p-2 hidden xl:table-cell">
                        <input
                          placeholder="Rejected Reason"
                          className="border border-gray-200 rounded px-2 py-1 text-sm w-40"
                          value={item.rejectedreason || ""}
                          onChange={(e) =>
                            handleRejectedReason(item.id, e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2 justify-center">
                          <FaEye
                            onClick={() => {
                              setSelectedId(item.id);
                              setOpenModal(true);
                            }}
                            className="text-blue-500 cursor-pointer text-lg hover:scale-110 transition-transform"
                          />
                          <button
                            onClick={() => updateStatus(item.id, "Approved")}
                            className="hidden sm:inline-flex bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(item.id, "Rejected")}
                            className="hidden sm:inline-flex bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
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
          <div className="flex justify-center md:justify-between items-center mt-4 text-sm flex-wrap gap-6">
            <span>
              Showing {filteredData.length === 0 ? "0" : startIndex + 1} to{" "}
              {Math.min(endIndex, filteredData.length)} of {filteredData.length}{" "}
              entries
            </span>
            <div className="flex flex-row space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="p-2 bg-gray-200 rounded-full disabled:opacity-50 hover:bg-gray-300"
              >
                First
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-3 bg-gray-200 rounded-full disabled:opacity-50 hover:bg-gray-300"
              >
                <GrPrevious />
              </button>
              <div className="p-3 px-4 shadow rounded-full font-medium">
                {currentPage}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-3 bg-gray-200 rounded-full disabled:opacity-50 hover:bg-gray-300"
              >
                <GrNext />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="p-2 bg-gray-200 rounded-full disabled:opacity-50 hover:bg-gray-300"
              >
                Last
              </button>
=======
        {/* Table Section */}
        <div className="overflow-x-auto min-h-[350px]">
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
                  Emp Name
                </th>
                <th className="px-4 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                  Location
                </th>
                <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                  In Time
                </th>
                <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                  Out Time
                </th>
                <th className="px-4 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                  Created On
                </th>
                <th className="px-4 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                  Remarks
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">
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
              ) : filteredData.length === 0 ? (
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
                    <td className="px-4 py-2 text-center font-medium text-gray-800">
                      {item.employee}
                    </td>
                    <td className="px-4 py-2 text-center hidden xl:table-cell text-gray-600">
                      {item.location}
                    </td>
                    <td className="px-4 py-2 text-center hidden md:table-cell text-gray-600">
                      {item.intime
                        ? new Date(item.intime).toLocaleTimeString([], {
                            hour12: false,
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-center hidden md:table-cell text-gray-600">
                      {item.outtime
                        ? new Date(item.outtime).toLocaleTimeString([], {
                            hour12: false,
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-center hidden sm:table-cell text-gray-500">
                      {item.createdDate
                        ? new Date(item.createdDate).toLocaleDateString()
                        : "Missed"}
                    </td>
                    <td className="px-4 py-2 text-center hidden xl:table-cell text-gray-500 italic truncate">
                      {item.remarks || "—"}
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
                          className="hidden sm:block bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1 rounded-md text-sm font-bold transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, "Rejected")}
                          className="hidden sm:block bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1 rounded-md text-sm font-bold transition-all"
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
>>>>>>> 3411cc474c135c304879d0bb4504e2fe248f4555
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

<<<<<<< HEAD
      {/* Detail Modal */}
      {openModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                Manual Entry Approval Details
              </h2>
              <RxCross2
                onClick={() => setOpenModal(false)}
                className="cursor-pointer text-xl text-red-500 hover:scale-110 transition-transform"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-lg">
              <div>
                <p className={labelStyle}>Employee</p>
                <p className={inputStyle}>{selectedItem.employee_name}</p>
              </div>
              <div>
                <p className={labelStyle}>Location</p>
                <p className={inputStyle}>{selectedItem.location}</p>
              </div>
              <div>
                <p className={labelStyle}>In Time</p>
                <p className={inputStyle}>{selectedItem.in_time || "No Check-in"}</p>
              </div>
              <div>
                <p className={labelStyle}>Out Time</p>
                <p className={inputStyle}>
                  {selectedItem.out_time || "No Check-out"}
                </p>
              </div>
              <div>
                <p className={labelStyle}>Created On</p>
                <p className={inputStyle}>
                  {selectedItem.created_at
                    ? new Date(selectedItem.created_at).toLocaleDateString()
                    : "-"}
                </p>
              </div>
              <div>
                <p className={labelStyle}>Status</p>
                <p
                  className={`px-2 py-1.5 rounded text-lg w-fit bg-yellow-100 text-yellow-700`}
                >
                  {selectedItem.status}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className={labelStyle}>Remarks</p>
                <p className={inputStyle}>{selectedItem.remarks || "-"}</p>
              </div>
              <div>
                <p className={labelStyle}>Rejected Reason</p>
                <input
                  placeholder="Rejected Reason"
                  className={inputStyle}
                  value={selectedItem.rejectedreason || ""}
                  onChange={(e) =>
                    handleRejectedReason(selectedItem.id, e.target.value)
                  }
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3 flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    updateStatus(selectedItem.id, "Approved");
                    setOpenModal(false);
                  }}
                  className="bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700 transition-colors shadow-lg"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    updateStatus(selectedItem.id, "Rejected");
                    setOpenModal(false);
                  }}
                  className="bg-red-500 text-white px-6 py-2 rounded font-medium hover:bg-red-600 transition-colors shadow-lg"
                >
                  Reject
                </button>
              </div>
=======
      {/* Modal Section */}
      {openModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-5xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-blue-100/30">
              <h2 className="text-xl font-bold text-slate-800">
                Manual Entry Details
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-slate-400 hover:text-rose-500 transition-colors p-1"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: "Employee Name", value: selectedItem.employee },
                { label: "Work Location", value: selectedItem.location },
                { label: "Company", value: selectedItem.company || "N/A" },
                {
                  label: "Designation",
                  value: selectedItem.designation || "N/A",
                },
                {
                  label: "Emp Category",
                  value: selectedItem.employeeCategory || "N/A",
                },
                {
                  label: "In Time",
                  value: selectedItem.intime
                    ? new Date(selectedItem.intime).toLocaleTimeString([], {
                        hour12: false,
                      })
                    : "No Checkin",
                },
                {
                  label: "Out Time",
                  value: selectedItem.outtime
                    ? new Date(selectedItem.outtime).toLocaleTimeString([], {
                        hour12: false,
                      })
                    : "No Checkout",
                },
                {
                  label: "Created Date",
                  value: selectedItem.createdDate
                    ? new Date(selectedItem.createdDate).toLocaleDateString()
                    : "N/A",
                },
                {
                  label: "Current Status",
                  value: selectedItem.status,
                  isStatus: true,
                },
              ].map((field, idx) => (
                <div key={idx}>
                  <label className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                    {field.label}
                  </label>
                  {field.isStatus ? (
                    <span
                      className={`px-4 py-1.5 rounded-lg text-md font-bold inline-block shadow-sm
                  ${field.value === "Approved" ? "bg-emerald-100 text-emerald-700" : ""}
                  ${field.value === "Rejected" ? "bg-rose-100 text-rose-700" : ""}
                  ${field.value === "Pending" ? "bg-amber-100 text-amber-700" : ""}
                `}
                    >
                      {field.value}
                    </span>
                  ) : (
                    <p className="bg-slate-100/50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-800 font-medium text-md">
                      {field.value}
                    </p>
                  )}
                </div>
              ))}

              <div className="md:col-span-3">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  Remarks
                </label>
                <div className="bg-slate-100/50 border border-slate-200 px-4 py-4 rounded-xl text-slate-800 italic min-h-[80px] text-md">
                  {selectedItem.remarks || "No remarks provided."}
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-4 border-t border-slate-100 pt-6">
              <button
                onClick={() => updateStatus(selectedItem.id, "Rejected")}
                className="px-8 py-2.5 rounded-xl border-2 border-rose-200 text-rose-600 font-bold hover:bg-rose-50 transition-all"
              >
                Reject Request
              </button>
              <button
                onClick={() => updateStatus(selectedItem.id, "Approved")}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Approve Entry
              </button>
>>>>>>> 3411cc474c135c304879d0bb4504e2fe248f4555
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MannualEntryApproval;

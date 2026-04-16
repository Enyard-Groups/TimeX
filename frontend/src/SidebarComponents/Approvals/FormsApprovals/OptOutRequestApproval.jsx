import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaAngleRight, FaEye } from "react-icons/fa6";
import { GrNext, GrPrevious } from "react-icons/gr";
import { RxCross2 } from "react-icons/rx";

const OptOutRequestApproval = () => {
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
    const stored = JSON.parse(localStorage.getItem("opt_out_request") || "[]");
    setRequests(stored.filter((item) => item.status === "Pending"));
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const updateStatus = (id, newValue) => {
    const stored = JSON.parse(localStorage.getItem("opt_out_request") || "[]");
    const updated = stored.map((item) =>
      item.id === id ? { ...item, status: newValue } : item,
    );
    localStorage.setItem("opt_out_request", JSON.stringify(updated));
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
    const stored = JSON.parse(localStorage.getItem("opt_out_request") || "[]");
    const updated = stored.map((item) =>
      selectedIds.includes(item.id) ? { ...item, status: value } : item,
    );
    localStorage.setItem("opt_out_request", JSON.stringify(updated));
    setSelectedIds([]);
    toast.success(`Bulk ${value}`);
    fetchPendingRequests();
  };

  const filteredData = requests.filter((x) =>
    (x.employee || "").toLowerCase().includes(searchTerm.toLowerCase()),
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
          <div className="text-blue-600">Opt-Out Request Approval</div>
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
                <th className="py-3 px-6 hidden sm:table-cell font-semibold text-gray-700 text-center">
                  SL.No
                </th>
                <th className="py-3 px-6 font-semibold text-gray-700 text-center">
                  Employee Name
                </th>
                <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                  Enrollment ID
                </th>
                <th className="py-3 px-6 hidden lg:table-cell font-semibold text-gray-700 text-center">
                  Designation
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
                      <div className="text-4xl opacity-40">✅</div>
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
                      {item.employee}
                    </td>
                    <td className="py-3 px-6 hidden md:table-cell text-gray-600 font-mono text-center">
                      {item.enrollment_id}
                    </td>
                    <td className="py-3 px-6 hidden lg:table-cell text-gray-600 text-center">
                      {item.designation}
                    </td>
                    <td className="py-3 px-6 hidden md:table-cell text-gray-600 text-center">
                      {item.date}
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
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-sm font-bold transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, "Rejected")}
                          className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded text-sm font-bold transition-all"
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

      {/* View Modal */}
      {openModal && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-y-auto p-8"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Opt-Out Request Details
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            {/* Employee Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Employee
                </p>
                <p className="font-semibold text-gray-800">
                  {selectedItem.employee || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Enrollment ID
                </p>
                <p className="font-semibold text-gray-800 font-mono">
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
                  Date
                </p>
                <p className="font-semibold text-gray-800">
                  {selectedItem.date || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Effective From
                </p>
                <p className="font-semibold text-gray-800">
                  {selectedItem.effectiveFrom || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Status
                </p>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                  {selectedItem.status}
                </span>
              </div>
            </div>

            {/* Opt-Out Choices */}
            <div className="mb-6 border rounded-xl overflow-hidden">
              <div className="bg-slate-800 text-white font-bold text-sm px-4 py-3">
                Opt-Out Selections
              </div>
              <div className="grid grid-cols-2 divide-x">
                <div className="p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                    Opting Out Of
                  </p>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!selectedItem.accommodation}
                        readOnly
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="font-medium">Accommodation</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!selectedItem.transportation}
                        readOnly
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="font-medium">Transportation</span>
                    </label>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                    Requesting Allowance For
                  </p>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!selectedItem.houseAllowance}
                        readOnly
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="font-medium">House Rent Allowance</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!selectedItem.transportationAllowance}
                        readOnly
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="font-medium">
                        Transportation Allowance
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Rented Accommodation Details */}
            <div className="mb-6 border rounded-xl overflow-hidden">
              <div className="bg-blue-700 text-white font-bold text-sm px-4 py-3 uppercase tracking-wide">
                Details of Rented Accommodation
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-slate-50">
                {[
                  { label: "House No.", value: selectedItem.houseNo },
                  { label: "Street Name", value: selectedItem.streetName },
                  { label: "Building", value: selectedItem.buildingName },
                  { label: "Area", value: selectedItem.area },
                  { label: "Country", value: selectedItem.country },
                  { label: "ZIP/PIN Code", value: selectedItem.zip_pin_code },
                  { label: "Landmark", value: selectedItem.landmark },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                      {label}
                    </p>
                    <p className="font-medium text-gray-800">{value || "—"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="mb-6 border rounded-xl overflow-hidden">
              <div className="bg-red-700 text-white font-bold text-sm px-4 py-3 uppercase tracking-wide">
                Emergency Contact Details
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                <div className="p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">
                    Primary Contact
                  </p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-semibold text-gray-500">
                        Name:{" "}
                      </span>
                      {selectedItem.emergencyContact || "—"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-500">
                        Phone:{" "}
                      </span>
                      {selectedItem.contactNo || "—"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-500">
                        Relation:{" "}
                      </span>
                      {selectedItem.relation || "—"}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">
                    Secondary Contact
                  </p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-semibold text-gray-500">
                        Name:{" "}
                      </span>
                      {selectedItem.emergencyContact2 || "—"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-500">
                        Phone:{" "}
                      </span>
                      {selectedItem.contactNo2 || "—"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-500">
                        Relation:{" "}
                      </span>
                      {selectedItem.relation2 || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="mb-6 border rounded-xl overflow-hidden">
              <div className="bg-slate-700 text-white font-bold text-sm px-4 py-3 uppercase tracking-wide">
                Signatures
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                {[
                  {
                    label: "Name & Signature",
                    preview: selectedItem.nameSignPreview,
                    drawn: selectedItem.name_sign_drawn,
                  },
                  {
                    label: "Approved by Human Resources Officer",
                    preview: selectedItem.approvedByPreview,
                    drawn: selectedItem.approvedBy_drawn,
                  },
                  {
                    label: "Concurred by Managing Director",
                    preview: selectedItem.concurredByPreview,
                    drawn: selectedItem.concurredBy_drawn,
                  },
                ].map(({ label, preview, drawn }) => (
                  <div
                    key={label}
                    className="p-4 flex flex-col items-center gap-2"
                  >
                    <p className="text-xs font-bold text-gray-400 uppercase text-center mb-1">
                      {label}
                    </p>
                    {preview ? (
                      <img
                        src={preview}
                        alt="Signature"
                        className="h-14 border rounded bg-white p-1 shadow-sm"
                      />
                    ) : drawn ? (
                      <img
                        src={drawn}
                        alt="Drawn Signature"
                        className="h-14 border rounded bg-white p-1 shadow-sm"
                      />
                    ) : (
                      <div className="h-14 w-full border-b border-dashed border-gray-300 flex items-end justify-center pb-1">
                        <span className="text-xs text-gray-400">
                          No signature
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 border-t pt-6">
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

export default OptOutRequestApproval;

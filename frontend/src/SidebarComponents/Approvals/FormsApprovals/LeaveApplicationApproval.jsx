/* eslint-disable react-hooks/static-components */
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaAngleRight, FaEye } from "react-icons/fa6";
import { GrNext, GrPrevious } from "react-icons/gr";
import { RxCross2 } from "react-icons/rx";

const LeaveApplicationApproval = () => {
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
      localStorage.getItem("leave_application") || "[]",
    );
    setRequests(stored.filter((item) => item.status === "Pending"));
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const updateStatus = (id, newValue) => {
    const stored = JSON.parse(
      localStorage.getItem("leave_application") || "[]",
    );
    const updated = stored.map((item) =>
      item.id === id ? { ...item, status: newValue } : item,
    );
    localStorage.setItem("leave_application", JSON.stringify(updated));
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
      localStorage.getItem("leave_application") || "[]",
    );
    const updated = stored.map((item) =>
      selectedIds.includes(item.id) ? { ...item, status: value } : item,
    );
    localStorage.setItem("leave_application", JSON.stringify(updated));
    setSelectedIds([]);
    toast.success(`Bulk ${value}`);
    fetchPendingRequests();
  };

  const filteredData = requests.filter(
    (x) =>
      (x.employee || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (x.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // --- Helpers ---
  const DetailCard = ({ label, value }) => (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="font-semibold text-gray-800 mt-0.5">{value || "—"}</p>
    </div>
  );

  const SectionHeader = ({ color = "blue", children }) => {
    const colorMap = {
      blue: "bg-blue-50 text-blue-800 border-blue-100",
      teal: "bg-teal-50 text-teal-800 border-teal-100",
      orange: "bg-orange-50 text-orange-800 border-orange-100",
      purple: "bg-purple-50 text-purple-800 border-purple-100",
      slate: "bg-slate-100 text-slate-800 border-slate-200",
    };
    return (
      <div
        className={`px-4 py-2.5 font-bold uppercase text-[10px] tracking-widest border-b ${colorMap[color] || colorMap.blue}`}
      >
        {children}
      </div>
    );
  };

  const FieldRow = ({ label, value }) => (
    <div className="grid grid-cols-2 border-b text-sm px-4 py-2.5 items-start last:border-b-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 break-words">
        {value || "—"}
      </span>
    </div>
  );

  const leaveTypes = [
    { label: "Annual Leave", key: "annualLeave" },
    { label: "Sick Leave", key: "sickleave" },
    { label: "TOIL", key: "toil" },
    { label: "Unpaid Leave", key: "unpaidLeave" },
    { label: "Compassionate", key: "cpmpassionLeave" },
    { label: "Emergency", key: "emergencyLeave" },
    { label: "Maternal", key: "maternalLeave" },
    { label: "Paternal", key: "paternalLeave" },
  ];

  const activeLeaveTypes = (natureofleave) =>
    leaveTypes
      .filter((lt) => natureofleave?.[lt.key])
      .map((lt) => lt.label)
      .join(", ") ||
    natureofleave?.othersSpecify ||
    "—";

  return (
    <div className="mb-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Approvals</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div className="text-blue-600">Leave Application Approval</div>
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
                <th className="py-3 px-6 font-semibold text-gray-700 text-center">
                  Employee
                </th>
                <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                  Location
                </th>
                <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700 text-center">
                  Enrollment ID
                </th>
                <th className="py-3 px-6 hidden lg:table-cell font-semibold text-gray-700 text-center">
                  Designation
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
                      {item.employee || "—"}
                    </td>
                    <td className="py-3 px-6 hidden md:table-cell text-gray-600 text-center">
                      {item.location}
                    </td>
                    <td className="py-3 px-6 hidden md:table-cell text-gray-600 text-sm text-center">
                      {item.enrollmentId || "—"}
                    </td>
                    <td className="py-3 px-6 hidden lg:table-cell text-gray-600 text-center">
                      {item.designation || "—"}
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

      {/* Detail Modal */}
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
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Leave Application Details
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border">
              <DetailCard label="Employee" value={selectedItem.employee} />
              <DetailCard label="Location" value={selectedItem.location} />
              <DetailCard
                label="Designation"
                value={selectedItem.designation}
              />
              <DetailCard label="Application Date" value={selectedItem.date} />
            </div>

            {/* Section I: Employee Details */}
            <div className="border rounded-xl overflow-hidden mb-6">
              <SectionHeader color="blue">I. Employee Details</SectionHeader>
              <FieldRow
                label="Enrollment ID"
                value={selectedItem.enrollmentId}
              />
              <FieldRow label="Nationality" value={selectedItem.nationality} />
              <FieldRow
                label="Nature of Leave"
                value={activeLeaveTypes(selectedItem.natureofleave)}
              />
              {selectedItem.natureofleave?.othersSpecify && (
                <FieldRow
                  label="Others (Specify)"
                  value={selectedItem.natureofleave.othersSpecify}
                />
              )}
            </div>

            {/* Leave & TOIL Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border rounded-xl overflow-hidden">
                <SectionHeader color="teal">Leave Period</SectionHeader>
                <FieldRow
                  label="Requested Days"
                  value={selectedItem.calenderDaysLeave}
                />
                <FieldRow label="Leave From" value={selectedItem.leaveFrom} />
                <FieldRow label="Leave To" value={selectedItem.leaveTo} />
                <FieldRow
                  label="Actual Working Days"
                  value={selectedItem.actualDays}
                />
                <FieldRow
                  label="Rejoining Date"
                  value={selectedItem.rejoinDate}
                />
              </div>
              <div className="border rounded-xl overflow-hidden">
                <SectionHeader color="purple">TOIL Details</SectionHeader>
                <FieldRow
                  label="TOIL Requested?"
                  value={selectedItem.toilReq}
                />
                <FieldRow
                  label="TOIL Days"
                  value={selectedItem.calenderDaystoil}
                />
                <FieldRow label="TOIL From" value={selectedItem.toilFrom} />
                <FieldRow label="TOIL To" value={selectedItem.toilTo} />
                <FieldRow
                  label="Grand Total (Leave + TOIL)"
                  value={selectedItem.calenderDaysLeaveToil}
                />
              </div>
            </div>

            {/* Reason & Visa */}
            <div className="border rounded-xl overflow-hidden mb-6">
              <SectionHeader color="orange">
                Additional Information
              </SectionHeader>
              <FieldRow
                label="Emergency Reason / Remarks"
                value={selectedItem.reasonForLeave}
              />
              <FieldRow
                label="VISA / SIRA Expiry"
                value={selectedItem.visaExpiry}
              />
              <FieldRow
                label="Emergency Contact"
                value={selectedItem.emergencyContact}
              />
            </div>

            {/* Section II: Admin Operations */}
            <div className="border rounded-xl overflow-hidden mb-6">
              <SectionHeader color="teal">II. Admin Operations</SectionHeader>
              <FieldRow
                label="Employee Date of Joining"
                value={selectedItem.adminoperation?.dateOfJoin}
              />
              <FieldRow
                label="Leave Days Due"
                value={selectedItem.adminoperation?.leaveDays}
              />
              <FieldRow
                label="Nature of Leave"
                value={selectedItem.adminoperation?.leavenature}
              />
              <FieldRow
                label="Total Entitlement"
                value={selectedItem.adminoperation?.totalEntitlement}
              />
              <FieldRow
                label="Leave Availed"
                value={selectedItem.adminoperation?.leaveAvailed}
              />
              <FieldRow
                label="Opening Balance"
                value={selectedItem.adminoperation?.openingBalance}
              />
              <FieldRow
                label="Leave Granted"
                value={selectedItem.adminoperation?.leaveGranted}
              />
              <FieldRow
                label="New Balance"
                value={selectedItem.adminoperation?.newBalance}
              />
              <FieldRow
                label="Remarks"
                value={selectedItem.adminoperation?.remarks}
              />
              <FieldRow
                label="Reason for Non-Approval"
                value={selectedItem.adminoperation?.nonApproveReason}
              />
              <FieldRow
                label="Leave Granted From"
                value={selectedItem.leaveGrantedFrom}
              />
              <FieldRow
                label="Leave Granted To"
                value={selectedItem.leaveGrantedTo}
              />
            </div>

            {/* Section III: Final Approvals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border rounded-xl overflow-hidden">
                <SectionHeader color="blue">
                  III. Approval — 1 (Ops Rep.)
                </SectionHeader>
                <FieldRow
                  label="Name"
                  value={selectedItem.finalApproval?.approval1Name}
                />
                <FieldRow
                  label="Non-Approval Reason"
                  value={selectedItem.finalApproval?.nonApprove1Reason}
                />
                {selectedItem.finalApproval?.upload1signaturePreview && (
                  <div className="px-4 py-3 text-sm border-b">
                    <p className="text-gray-500 mb-2">Signature</p>
                    <img
                      src={selectedItem.finalApproval.upload1signaturePreview}
                      alt="Approval 1 Signature"
                      className="h-14 border rounded bg-white p-1 shadow-sm"
                    />
                  </div>
                )}
              </div>
              <div className="border rounded-xl overflow-hidden">
                <SectionHeader color="teal">
                  III. Approval — 2 (HR Rep.)
                </SectionHeader>
                <FieldRow
                  label="Name"
                  value={selectedItem.finalApproval?.approval2Name}
                />
                <FieldRow
                  label="Non-Approval Reason"
                  value={selectedItem.finalApproval?.nonApprove2Reason}
                />
                {selectedItem.finalApproval?.upload2signaturePreview && (
                  <div className="px-4 py-3 text-sm border-b">
                    <p className="text-gray-500 mb-2">Signature</p>
                    <img
                      src={selectedItem.finalApproval.upload2signaturePreview}
                      alt="Approval 2 Signature"
                      className="h-14 border rounded bg-white p-1 shadow-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Passport Collection */}
            <div className="border rounded-xl overflow-hidden mb-6">
              <SectionHeader color="orange">Passport Collection</SectionHeader>
              <FieldRow
                label="Applicant Name"
                value={selectedItem.passportCollection?.applicantName}
              />
              <FieldRow
                label="Collection Date"
                value={selectedItem.passportCollection?.date}
              />
              {selectedItem.passportCollection?.signaturePreview && (
                <div className="px-4 py-3 text-sm border-b">
                  <p className="text-gray-500 mb-2">Signature</p>
                  <img
                    src={selectedItem.passportCollection.signaturePreview}
                    alt="Passport Signature"
                    className="h-14 border rounded bg-white p-1 shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Section IV: Employee Form */}
            <div className="border rounded-xl overflow-hidden mb-8">
              <SectionHeader color="slate">
                IV. Employee Declaration
              </SectionHeader>
              <FieldRow label="Name" value={selectedItem.employeeForm?.name} />
              <FieldRow
                label="ID No."
                value={selectedItem.employeeForm?.idNo}
              />
              <FieldRow
                label="Email Address"
                value={selectedItem.employeeForm?.emailAddress}
              />
              <FieldRow
                label="Home Country Contact 1"
                value={selectedItem.employeeForm?.homeCountrycontact1}
              />
              <FieldRow
                label="Home Country Contact 2"
                value={selectedItem.employeeForm?.homeCountrycontact2}
              />
              <FieldRow
                label="Home Address"
                value={selectedItem.employeeForm?.countryAddress}
              />
              <FieldRow
                label="Declaration Date"
                value={selectedItem.employeeForm?.date}
              />
              {selectedItem.finalSignaturePreview && (
                <div className="px-4 py-3 text-sm">
                  <p className="text-gray-500 mb-2">Employee Signature</p>
                  <img
                    src={selectedItem.finalSignaturePreview}
                    alt="Employee Signature"
                    className="h-14 border rounded bg-white p-1 shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex justify-end gap-4 border-t pt-6">
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

export default LeaveApplicationApproval;

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
            rejectedreason: value === "Rejected" ? (item.rejectedreason || "-") : "-",
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
            prev.map((item) => (item.id === id ? { ...item, remarks: text } : item))
        );
    };

    const handleRejectedReason = (id, text) => {
        setRequests((prev) =>
            prev.map((item) => (item.id === id ? { ...item, rejectedreason: text } : item))
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
        (x.employee_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const endIndex = currentPage * entriesPerPage;
    const startIndex = endIndex - entriesPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);
    const totalPages = Math.max(1, Math.ceil(filteredData.length / entriesPerPage));

    const selectedItem = requests.find((item) => item.id === selectedId);

    return (
        <div className="mb-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
                    <FaAngleRight />
                    Approvals
                    <FaAngleRight />
                    Leave Approval
                </h1>
            </div>

            <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.8_0.001_106.424)] p-6">
                <div className="w-full text-white">
                    <div className="bg-[oklch(0.69_0.2_16.439)] p-3 rounded-xl">
                        Bulk Approve / Reject
                    </div>
                    <div className="flex justify-end m-4 gap-4">
                        <button
                            onClick={() => bulkAction("Approved")}
                            className="bg-gray-700 px-4 py-1 rounded"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => bulkAction("Rejected")}
                            className="bg-red-500 px-4 py-1 rounded"
                        >
                            Reject
                        </button>
                    </div>
                </div>

                <div>
                    {/* Top Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <div>
                            <label className="mr-2 text-md">Show</label>
                            <select
                                value={entriesPerPage}
                                onChange={(e) => {
                                    setEntriesPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className=" border rounded-full px-1 border-[oklch(0.645_0.246_16.439)]"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span className="ml-2 text-md">entries</span>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center justify-center">
                            <input
                                placeholder="Search"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className=" shadow-sm px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div
                        className="overflow-x-auto min-h-[250px]"
                        style={{ scrollbarWidth: "none" }}
                    >
                        <table className="w-full text-lg border-collapse">
                            {/* Header */}
                            <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
                                <tr>
                                    <th className="py-2 px-4">
                                        <input
                                            type="checkbox"
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
                                    <th className="p-2 font-semibold">Name</th>
                                    <th className="p-2 font-semibold hidden lg:table-cell">From</th>
                                    <th className="p-2 font-semibold hidden lg:table-cell">To</th>
                                    <th className="p-2 font-semibold whitespace-nowrap hidden sm:table-cell">Leave Type</th>
                                    <th className="p-2 font-semibold whitespace-nowrap hidden md:table-cell">Total Day(s)</th>
                                    <th className="p-2 font-semibold hidden xl:table-cell">Remarks</th>
                                    <th className="p-2 font-semibold whitespace-nowrap hidden xl:table-cell">Rejected Reason</th>
                                    <th className="p-2 font-semibold whitespace-nowrap">Approve / Reject</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="11" className="text-center p-10">Loading...</td></tr>
                                ) : filteredData.length === 0 ? (
                                    <tr><td colSpan="11" className="text-center p-10">No Pending Requests</td></tr>
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
                                            <td className="p-2">{item.employee_name}</td>
                                            <td className="p-2 hidden lg:table-cell">
                                                {item.start_date ? new Date(item.start_date).toLocaleDateString() : "-"}
                                            </td>
                                            <td className="p-2 hidden lg:table-cell">
                                                {item.end_date ? new Date(item.end_date).toLocaleDateString() : "-"}
                                            </td>
                                            <td className="p-2 hidden sm:table-cell">{item.leave_type}</td>
                                            <td className="p-2 hidden md:table-cell">{item.number_of_days}</td>
                                            <td className="p-2 hidden xl:table-cell">
                                                <input
                                                    placeholder="Remarks"
                                                    className="border border-gray-200 rounded px-2 py-1 text-sm w-40"
                                                    value={item.remarks || ""}
                                                    onChange={(e) => handleRemarks(item.id, e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2 hidden xl:table-cell">
                                                <input
                                                    placeholder="Rejected Reason"
                                                    className="border border-gray-200 rounded px-2 py-1 text-sm w-40"
                                                    value={item.rejectedreason || ""}
                                                    onChange={(e) => handleRejectedReason(item.id, e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <div className="flex gap-2 justify-center">
                                                    <FaEye
                                                        onClick={() => {
                                                            setSelectedId(item.id);
                                                            setOpenModal(true);
                                                        }}
                                                        className="text-blue-500 cursor-pointer text-lg mt-2 mr-2"
                                                    />
                                                    <button
                                                        onClick={() => updateStatus(item.id, "Approved")}
                                                        className="hidden sm:table-cell bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(item.id, "Rejected")}
                                                        className="hidden sm:table-cell bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
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
                            {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
                        </span>
                        <div className="flex flex-row space-x-1">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                                className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
                            >
                                First
                            </button>
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                                className="p-3 bg-gray-200 rounded-full disabled:opacity-50"
                            >
                                <GrPrevious />
                            </button>
                            <div className="p-3 px-4 shadow rounded-full">{currentPage}</div>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                className="p-3 bg-gray-200 rounded-full disabled:opacity-50"
                            >
                                <GrNext />
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                                className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
                            >
                                Last
                            </button>
                        </div>
                    </div>
                </div>

                {openModal && selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                        <div
                            className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6"
                            style={{ scrollbarWidth: "none" }}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">Leave Details</h2>
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
                                    <p className={labelStyle}>Leave Type</p>
                                    <p className={inputStyle}>{selectedItem.leave_type}</p>
                                </div>
                                <div>
                                    <p className={labelStyle}>From</p>
                                    <p className={inputStyle}>{selectedItem.start_date ? new Date(selectedItem.start_date).toLocaleDateString() : "-"}</p>
                                </div>
                                <div>
                                    <p className={labelStyle}>To</p>
                                    <p className={inputStyle}>{selectedItem.end_date ? new Date(selectedItem.end_date).toLocaleDateString() : "-"}</p>
                                </div>
                                <div>
                                    <p className={labelStyle}>Resume On</p>
                                    <p className={inputStyle}>{selectedItem.resume_date ? new Date(selectedItem.resume_date).toLocaleDateString() : "-"}</p>
                                </div>
                                <div>
                                    <p className={labelStyle}>Total Days</p>
                                    <p className={inputStyle}>{selectedItem.number_of_days}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className={labelStyle}>Leave Reason</p>
                                    <p className={inputStyle}>{selectedItem.reason}</p>
                                </div>
                                <div>
                                    <p className={labelStyle}>Remarks</p>
                                    <input
                                        placeholder="Remarks"
                                        className={inputStyle}
                                        value={selectedItem.remarks || ""}
                                        onChange={(e) => handleRemarks(selectedItem.id, e.target.value)}
                                    />
                                </div>
                                <div>
                                    <p className={labelStyle}>Rejected Reason</p>
                                    <input
                                        placeholder="Rejected Reason"
                                        className={inputStyle}
                                        value={selectedItem.rejectedreason || ""}
                                        onChange={(e) => handleRejectedReason(selectedItem.id, e.target.value)}
                                    />
                                </div>
                                <div>
                                    <p className={labelStyle}>Status</p>
                                    <p className={`px-2 py-1.5 rounded text-lg w-fit bg-yellow-100 text-yellow-700`}>
                                        {selectedItem.status}
                                    </p>
                                </div>

                                <div className="sm:col-span-2 md:col-span-3 flex justify-end gap-4 mt-6">
                                    <button
                                        onClick={() => {
                                            updateStatus(selectedItem.id, "Approved");
                                            setOpenModal(false);
                                        }}
                                        className="bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700 transition-colors shadow-sm"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateStatus(selectedItem.id, "Rejected");
                                            setOpenModal(false);
                                        }}
                                        className="bg-red-500 text-white px-6 py-2 rounded font-medium hover:bg-red-600 transition-colors shadow-sm"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaveRequestApproval;

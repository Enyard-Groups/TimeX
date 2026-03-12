/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaAngleRight } from "react-icons/fa6";
import { GrNext, GrPrevious } from "react-icons/gr";

const BusinessTravelApproval = () => {
  const [requests, setRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("businessTravelRequests")) || [];
    setRequests(stored);
  }, []);

  const approverName =
    JSON.parse(localStorage.getItem("user")).role.charAt(0).toUpperCase() +
    JSON.parse(localStorage.getItem("user")).role.slice(1).toLowerCase();

  // Single Approve/ Reject
  const updateStatus = (id, value) => {
    const updated = requests.map((item) => {
      if (item.id === id) {
        if (value === "Approved") {
          return {
            ...item,
            status: "Approved",
            fa: "✔",
            sa: "✔",
            faname: approverName,
            saname: approverName,
            rejectedreason: "",
          };
        }

        if (value === "Rejected") {
          return {
            ...item,
            status: "Rejected",
            fa: "✘",
            sa: "✘",
            faname: approverName,
            saname: approverName,
            rejectedreason: item.rejectedreason || "",
          };
        }
      }

      return item;
    });

    setRequests(updated);

    localStorage.setItem("businessTravelRequests", JSON.stringify(updated));

    toast.success(`Request ${value}`);
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
  const bulkAction = (value) => {
    if (selectedIds.length === 0) {
      toast.error("Please select Request");
      return;
    }

    const updated = requests.map((item) => {
      if (selectedIds.includes(item.id)) {
        if (value === "Approved") {
          return {
            ...item,
            status: "Approved",
            fa: "✔",
            sa: "✔",
            faname: approverName,
            saname: approverName,
            rejectedreason: "-",
          };
        }

        if (value === "Rejected") {
          return {
            ...item,
            status: "Rejected",
            fa: "✘",
            sa: "✘",
            faname: approverName,
            saname: approverName,
            rejectedreason: item.rejectedreason || "",
          };
        }
      }

      return item;
    });

    setRequests(updated);
    localStorage.setItem("businessTravelRequests", JSON.stringify(updated));

    setSelectedIds([]);

    toast.success(`Bulk ${value}`);
  };

  const pending = requests.filter((r) => r.status === "Pending");

  const filteredData = pending.filter((x) =>
    x.employee.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentData = filteredData.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / entriesPerPage),
  );

  return (
    <div className="mb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
          <FaAngleRight />
          Approvals
          <FaAngleRight />
          Business Travel Approval
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
                className=" border rounded-full px-1  border-[oklch(0.645_0.246_16.439)]"
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
                className=" shadow-sm px-3 py-1 rounded-full  focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]"
              />
            </div>
          </div>

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
                  <th className="py-2 px-6 font-semibold">Employee</th>
                  <th className="py-2 px-6 font-semibold whitespace-nowrap">Travel Type</th>
                  <th className="py-2 px-6 font-semibold">From</th>
                  <th className="py-2 px-6 font-semibold">To</th>
                  <th className="py-2 px-6 font-semibold whitespace-nowrap">Resume On</th>
                  <th className="py-2 px-6 font-semibold">Reason</th>
                  <th className="py-2 px-6 font-semibold whitespace-nowrap">Half Day (First)</th>
                  <th className="py-2 px-6 font-semibold whitespace-nowrap">Half Day (Last)</th>
                  <th className="py-2 px-6 font-semibold">FA</th>
                  <th className="py-2 px-6 font-semibold">SA</th>
                  <th className="py-2 px-6 font-semibold whitespace-nowrap">Rejected Reason</th>
                  <th className="py-2 px-6 font-semibold whitespace-nowrap">Approve / Reject</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="text-center p-10">
                      No Pending Requests
                    </td>
                  </tr>
                ) : (
                  currentData.map((item) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)]"
                    >
                      <td className="py-2 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleSelect(item.id)}
                        />
                      </td>
                      <td className="py-2 px-6">{item.employee}</td>

                      <td className="py-2 px-6">{item.travelType}</td>

                      <td className="py-2 px-6">{item.fromDate}</td>

                      <td className="py-2 px-6">{item.toDate}</td>

                      <td className="py-2 px-6">{item.resumeOn}</td>

                      <td className="py-2 px-6 whitespace-nowrap">
                        {item.reason
                          ? `${item.travelType} - ${item.reason}`
                          : `${item.travelType} - NIL`}
                      </td>

                      <td className="py-2 px-6">
                        {item.isHalfDayfirst ? "Yes" : "No"}
                      </td>

                      <td className="py-2 px-6">
                        {item.isHalfDaylast ? "Yes" : "No"}
                      </td>

                      <td className="py-2 px-6">{item.fa || "⏳"}</td>

                      <td className="py-2 px-6">{item.sa || "⏳"}</td>

                      <td className="py-2 px-6">
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
                          <button
                            onClick={() => updateStatus(item.id, "Approved")}
                            className="bg-green-100 text-green-700 px-3 py-1 rounded"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => updateStatus(item.id, "Rejected")}
                            className="bg-red-100 text-red-700 px-3 py-1 rounded"
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
                disabled={currentPage == 1}
                onClick={() => setCurrentPage(1)}
                className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
              >
                First
              </button>

              <button
                disabled={currentPage == 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-3 bg-gray-200 rounded-full disabled:opacity-50"
              >
                <GrPrevious />
              </button>

              <div className="p-3 px-4 shadow rounded-full">{currentPage}</div>

              <button
                disabled={currentPage == totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-3 bg-gray-200 rounded-full disabled:opacity-50"
              >
                <GrNext />
              </button>

              <button
                disabled={currentPage == totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessTravelApproval;

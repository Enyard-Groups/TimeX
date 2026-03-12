/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaAngleRight } from "react-icons/fa6";

const WfhApproval = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("wfhRequests")) || [];
    setRequests(stored);
  }, []);

  const approverName =
    JSON.parse(localStorage.getItem("user")).role.charAt(0).toUpperCase() +
    JSON.parse(localStorage.getItem("user")).role.slice(1).toLowerCase();

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

    localStorage.setItem("wfhRequests", JSON.stringify(updated));

    toast.success(`Request ${value}`);
  };

  const handleRejectedReason = (id, text) => {
    const updated = requests.map((item) =>
      item.id === id ? { ...item, rejectedreason: text } : item,
    );

    setRequests(updated);
  };

  const pending = requests.filter((r) => r.status === "Pending");

  return (
    <div className="mb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
          <FaAngleRight />
          Approvals
          <FaAngleRight />
          WFH Approval
        </h1>
      </div>

      <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.8_0.001_106.424)] p-6">
        <div
          className="overflow-x-auto min-h-[250px]"
          style={{ scrollbarWidth: "none" }}
        >
          <table className="w-full text-lg border-collapse">
            <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
              <tr>
                <th className="py-2 px-6 font-semibold">Employee</th>
                <th className="py-2 px-6 font-semibold">From</th>
                <th className="py-2 px-6 font-semibold">To</th>
                <th className="py-2 px-6 font-semibold">Reason</th>
                <th className="py-2 px-6 font-semibold">FA</th>
                <th className="py-2 px-6 font-semibold">SA</th>
                <th className="py-2 px-6 font-semibold">Rejected Reason</th>
                <th className="py-2 px-6 font-semibold">Approve / Reject</th>
              </tr>
            </thead>

            <tbody>
              {pending.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-10">
                    No Pending Requests
                  </td>
                </tr>
              ) : (
                pending.map((item) => (
                  <tr
                    key={item.id}
                    className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)]"
                  >
                    <td className="py-2 px-6">{item.employee}</td>

                    <td className="py-2 px-6">{item.fromDate}</td>

                    <td className="py-2 px-6">{item.toDate}</td>

                    <td className="py-2 px-6 whitespace-nowrap">
                      {item.reason || "NIL"}
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
      </div>
    </div>
  );
};

export default WfhApproval;

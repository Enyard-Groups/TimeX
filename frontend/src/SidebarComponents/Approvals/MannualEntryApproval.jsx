/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import toast from "react-hot-toast";

const MannualEntryApproval = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const storedvalue = localStorage.getItem("mannualEntryRequests");

    if (storedvalue) {
      const parsedData = JSON.parse(storedvalue);

      const pendingRequests = parsedData
        .filter((x) => x.status === "Pending")
        .map((item) => ({
          ...item,
          intime: item.intime ? new Date(item.intime) : null,
          outtime: item.outtime ? new Date(item.outtime) : null,
          createdDate: new Date(item.createdDate),
        }));

      setRequests(pendingRequests);
    }
  }, []);

  const updateLocalStorage = (newRequests) => {
    localStorage.setItem("mannualEntryRequests", JSON.stringify(newRequests));
  };

  const handleApprove = (item) => {
    const stored =
      JSON.parse(localStorage.getItem("mannualEntryRequests")) || [];

    const updated = stored.map((req) =>
      req.id === item.id ? { ...req, status: "Approved" } : req,
    );

    localStorage.setItem("mannualEntryRequests", JSON.stringify(updated));

    setRequests(updated.filter((x) => x.status === "Pending"));

    // Backend version
    // await axios.post(`/api/manual-entry/${item.id}/approve`)

    toast.success("Request Approved");
  };

  const handleReject = (item) => {
    const stored =
      JSON.parse(localStorage.getItem("mannualEntryRequests")) || [];

    const updated = stored.map((req) =>
      req.id === item.id ? { ...req, status: "Rejected" } : req,
    );

    localStorage.setItem("mannualEntryRequests", JSON.stringify(updated));

    setRequests(updated.filter((x) => x.status === "Pending"));

    // Backend version
    // await axios.post(`/api/manual-entry/${item.id}/reject`)

    toast.error("Request Rejected");
  };

  return (
    <div className="mb-16">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <FaAngleRight />
        Requests
        <FaAngleRight />
        Mannual Entry Approval
      </div>

      <div className="mt-6 bg-white shadow-xl rounded-xl  border border-[oklch(0.8_0.001_106.424)] p-6">
        <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <table className="w-full text-lg border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Emp Name</th>
                <th className="p-2">Location</th>
                <th className="p-2">In Time</th>
                <th className="p-2">Out Time</th>
                <th className="p-2">Created On</th>
                <th className="p-2">Remarks</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-10">
                    No Pending Requests
                  </td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr
                    key={item.id}
                    className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                  >
                    <td className="p-2">{item.employee}</td>

                    <td className="p-2">{item.location}</td>

                    <td className="p-2">
                      {item.intime
                        ? new Date(item.intime).toLocaleTimeString([], {
                            hour12: false,
                          })
                        : ""}
                    </td>

                    <td className="p-2">
                      {item.outtime
                        ? new Date(item.outtime).toLocaleTimeString([], {
                            hour12: false,
                          })
                        : ""}
                    </td>

                    <td className="p-2">
                      {new Date(item.createdDate).toLocaleDateString()}
                    </td>

                    <td className="p-2">{item.remarks}</td>

                    <td className="p-2">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleApprove(item)}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => handleReject(item)}
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

export default MannualEntryApproval;

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaAngleRight } from "react-icons/fa6";
import { GrNext, GrPrevious } from "react-icons/gr";
import { FaEye } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

const MannualEntryApproval = () => {
  const [requests, setRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("mannualEntryRequests")) || [];
    setRequests(stored);
  }, []);

  const inputStyle =
    "text-lg w-full  border  border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  // Single Approve/ Reject
  const updateStatus = (id, value) => {
    const updated = requests.map((item) => {
      if (item.id === id) {
        if (value === "Approved") {
          return {
            ...item,
            status: "Approved",
          };
        }

        if (value === "Rejected") {
          return {
            ...item,
            status: "Rejected",
          };
        }
      }

      return item;
    });

    setRequests(updated);

    localStorage.setItem("mannualEntryRequests", JSON.stringify(updated));

    toast.success(`Request ${value}`);
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
          };
        }

        if (value === "Rejected") {
          return {
            ...item,
            status: "Rejected",
          };
        }
      }

      return item;
    });

    setRequests(updated);
    localStorage.setItem("mannualEntryRequests", JSON.stringify(updated));

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

  const selectedItem = requests.find((item) => item.id === selectedId);

  return (
    <div className="mb-6">
      <div className="sm:flex sm:justify-between">
        <h1 className="flex items-center gap-2 text-[17px] font-semibold flex-wrap ml-10 lg:ml-0 mb-4 lg:mb-0">
          <FaAngleRight />
          Requests
          <FaAngleRight />
          Mannual Entry Approval
        </h1>
      </div>

      <div className="mt-6 bg-white shadow-xl rounded-xl  border border-[oklch(0.8_0.001_106.424)] p-6">
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
          <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <table className="w-full text-lg border-collapse">
              <thead className="bg-gray-100">
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
                  <th className="p-2 whitespace-nowrap">Emp Name</th>
                  <th className="p-2 hidden xl:table-cell ">Location</th>
                  <th className="p-2 hidden md:table-cell  whitespace-nowrap">
                    In Time
                  </th>
                  <th className="p-2 hidden md:table-cell  whitespace-nowrap">
                    Out Time
                  </th>
                  <th className="p-2 hidden sm:table-cell  whitespace-nowrap">
                    Created On
                  </th>
                  <th className="p-2 hidden xl:table-cell ">Remarks</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-10">
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
                      <td className="p-2  whitespace-nowrap">
                        {item.employee}
                      </td>

                      <td className="p-2 hidden xl:table-cell  whitespace-nowrap">
                        {item.location}
                      </td>

                      <td className="p-2 hidden md:table-cell ">
                        {item.intime
                          ? new Date(item.intime).toLocaleTimeString([], {
                              hour12: false,
                            })
                          : "No Checkin"}
                      </td>

                      <td className="p-2 hidden md:table-cell  whitespace-nowrap">
                        {item.outtime
                          ? new Date(item.outtime).toLocaleTimeString([], {
                              hour12: false,
                            })
                          : "No Checkout"}
                      </td>

                      <td className="p-2 hidden sm:table-cell ">
                        {item.createdDate
                          ? new Date(item.createdDate).toLocaleDateString()
                          : "Missed Entry"}
                      </td>

                      <td className="p-2 hidden xl:table-cell  whitespace-nowrap">
                        {item.remarks ? item.remarks : "-"}
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
                            className="hidden sm:table-cell bg-green-100 text-green-700 px-3 py-1 rounded"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => updateStatus(item.id, "Rejected")}
                            className="hidden sm:table-cell bg-red-100 text-red-700 px-3 py-1 rounded"
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
                className="p-2 hidden lg:table-cell  bg-gray-200 rounded-full disabled:opacity-50"
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
                className="p-2 hidden lg:table-cell  bg-gray-200 rounded-full disabled:opacity-50"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </div>

      {openModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Manual Entry Details</h2>

              <RxCross2
                onClick={() => setOpenModal(false)}
                className="cursor-pointer text-xl text-red-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-lg">
              <div>
                <p className={labelStyle}>Employee</p>
                <p className={inputStyle}>{selectedItem.employee}</p>
              </div>

              <div>
                <p className={labelStyle}>Location</p>
                <p className={inputStyle}>{selectedItem.location}</p>
              </div>

              <div>
                <p className={labelStyle}>Company</p>
                <p className={inputStyle}>{selectedItem.company || "N/A"}</p>
              </div>

              <div>
                <p className={labelStyle}>Designation</p>
                <p className={inputStyle}>
                  {selectedItem.designation || "N/A"}
                </p>
              </div>

              <div>
                <p className={labelStyle}>Employee Category</p>
                <p className={inputStyle}>
                  {selectedItem.employeeCategory || "N/A"}
                </p>
              </div>

              <div>
                <p className={labelStyle}>In Time</p>
                <p className={inputStyle}>
                  {selectedItem.intime
                    ? new Date(selectedItem.intime).toLocaleTimeString([], {
                        hour12: false,
                      })
                    : "No Checkin"}
                </p>
              </div>

              <div>
                <p className={labelStyle}>Out Time</p>
                <p className={inputStyle}>
                  {selectedItem.outtime
                    ? new Date(selectedItem.outtime).toLocaleTimeString([], {
                        hour12: false,
                      })
                    : "No Checkout"}
                </p>
              </div>

              <div>
                <p className={labelStyle}>Created Date</p>
                <p className={inputStyle}>
                  {selectedItem.createdDate
                    ? new Date(selectedItem.createdDate).toLocaleDateString()
                    : "Missed Entry"}
                </p>
              </div>

              <div>
                <p className={labelStyle}>Remarks</p>
                <p className={inputStyle}>
                  {selectedItem.remarks ? selectedItem.remarks : "-"}
                </p>
              </div>

              <div>
                <p className={labelStyle}>Status</p>
                <span
                  className={`px-2 py-1 rounded text-sm
            ${selectedItem.status === "Approved" && "bg-green-100 text-green-700"}
            ${selectedItem.status === "Rejected" && "bg-red-100 text-red-700"}
            ${selectedItem.status === "Pending" && "bg-yellow-100 text-yellow-700"}
            `}
                >
                  {selectedItem.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MannualEntryApproval;

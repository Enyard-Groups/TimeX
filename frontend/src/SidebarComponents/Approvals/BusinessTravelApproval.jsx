import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaAngleRight, FaFileExcel } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";

const BusinessTravelApproval = () => {
  const [employee] = useState([
    {
      id: "000971001",
      name: "Sharma",
      from: "Delhi",
      to: "Mumbai",
      fromDate: "12-03-2026",
      toDate: "14-03-2026",
      purpose: "Client Meeting",
      status: "Pending",
    },
    {
      id: "000971004",
      name: "Drishti",
      from: "Kolkata",
      to: "Bangalore",
      fromDate: "15-03-2026",
      toDate: "17-03-2026",
      purpose: "Project Discussion",
      status: "Pending",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const filteredemployee = employee.filter(
    (x) =>
      x.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.role.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const handleSelect = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentemployee = filteredemployee.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredemployee.length / entriesPerPage),
  );

  const handleApprove = () => {
    if (selectedEmployees.length === 0) {
      toast.error("Please select employees");
      return;
    }

    const selectedData = employee.filter((emp) =>
      selectedEmployees.includes(emp.id),
    );

    console.log("Approval Approved:", selectedData);

    toast.success(
      `${selectedEmployees.length} employees selected for approval`,
    );
  };

  const handleReject = () => {
    if (selectedEmployees.length === 0) {
      toast.error("Please select employees");
      return;
    }

    const selectedData = employee.filter((emp) =>
      selectedEmployees.includes(emp.id),
    );

    console.log("Approval Rejected:", selectedData);

    toast.success(
      `${selectedEmployees.length} employees selected for rejection`,
    );
  };

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

      <div className="mt-6 bg-white shadow-xl rounded-xl  border border-[oklch(0.8_0.001_106.424)] p-6">
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

        <div
          className="overflow-x-auto min-h-[250px]"
          style={{ scrollbarWidth: "none" }}
        >
          <table className="w-full text-lg border-collapse">
            <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
              <tr>
                <th className="py-2 px-5 font-semibold">
                  <input
                    type="checkbox"
                    checked={
                      currentemployee.length > 0 &&
                      currentemployee.every((emp) =>
                        selectedEmployees.includes(emp.id),
                      )
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmployees(currentemployee.map((x) => x.id));
                      } else {
                        setSelectedEmployees([]);
                      }
                    }}
                  />
                </th>

                <th className="py-2 px-5 font-semibold">SL.NO</th>
                <th className="py-2 px-5 font-semibold">Employee Name</th>
                <th className="py-2 px-5 font-semibold">Employee ID</th>
                <th className="py-2 px-5 font-semibold">Travel From</th>
                <th className="py-2 px-5 font-semibold">Travel To</th>
                <th className="py-2 px-5 font-semibold">From Date</th>
                <th className="py-2 px-5 font-semibold">To Date</th>
                <th className="py-2 px-5 font-semibold">Purpose</th>
                <th className="py-2 px-5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentemployee.length === 0 ? (
                <tr>
                  <td colSpan="14" className="lg:text-center p-10 ">
                    No Data Available
                  </td>
                </tr>
              ) : (
                currentemployee.map((item, index) => (
                  <tr
                    key={item.id}
                    className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                  >
                    <td className="py-2 px-5">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(item.id)}
                        onChange={() => handleSelect(item.id)}
                      />
                    </td>

                    <td className="py-2 px-5">{index + 1}</td>
                    <td className="py-2 px-5">{item.name}</td>
                    <td className="py-2 px-5">{item.id}</td>
                    <td className="py-2 px-5 whitespace-nowrap">{item.from}</td>
                    <td className="py-2 px-5 whitespace-nowrap">{item.to}</td>
                    <td className="py-2 px-5 whitespace-nowrap">
                      {item.fromDate}
                    </td>
                    <td className="py-2 px-5 whitespace-nowrap">
                      {item.toDate}
                    </td>
                    <td className="py-2 px-5 whitespace-nowrap">
                      {item.purpose}
                    </td>
                    <td className="py-2 px-5">
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center md:justify-between items-center mt-4 text-sm flex-wrap gap-6">
          <span>
            Showing {filteredemployee.length === 0 ? "0" : startIndex + 1} to{" "}
            {Math.min(endIndex, filteredemployee.length)} of{" "}
            {filteredemployee.length} entries
          </span>

          <div className="flex flex-row space-x-1">
            <button
              disabled={currentPage == 1}
              onClick={() => setCurrentPage(1)}
              className="py-2 px-5 bg-gray-200 rounded-full disabled:opacity-50"
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
              className="py-2 px-5 bg-gray-200 rounded-full disabled:opacity-50"
            >
              Last
            </button>
          </div>
        </div>

        <div className="flex justify-center mt-8 gap-4">
          <button
            className="px-6 py-2 rounded-lg text-white bg-green-500"
            onClick={handleApprove}
          >
            Approve
          </button>
          <button
            className="px-6 py-2 rounded-lg text-white bg-[oklch(0.58_0.246_16.439)]"
            onClick={handleReject}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessTravelApproval;

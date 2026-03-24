import React, { useState } from "react";
import { FaAngleRight, FaEye } from "react-icons/fa6";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";

const LeaveSummary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data for leave summary
  const [leaveData] = useState([
    {
      id: 1,
      idNo: "1001",
      employee: "Employee 1",
      leaveType: "Sick Leave",
      fromDate: "01/01/2024",
      toDate: "02/01/2024",
      days: 2,
      appliedOn: "30/12/2023",
      status: "Approved",
    },
    {
      id: 2,
      idNo: "1002",
      employee: "Employee 2",
      leaveType: "Annual Leave",
      fromDate: "10/01/2024",
      toDate: "15/01/2024",
      days: 6,
      appliedOn: "05/01/2024",
      status: "Pending",
    },
    // Add more mock data as needed
  ]);

  const filteredData = leaveData.filter(
    (item) =>
      item.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.idNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / entriesPerPage));

  const handleCopy = () => {
    const header = ["ID No", "Employee", "Leave Type", "From Date", "To Date", "Days", "Applied On", "Status"].join("\t");
    const rows = filteredData
      .map((item) =>
        [item.idNo, item.employee, item.leaveType, item.fromDate, item.toDate, item.days, item.appliedOn, item.status].join("\t")
      )
      .join("\n");
    navigator.clipboard.writeText(`${header}\n${rows}`);
    toast.success("Copied to clipboard");
  };

  const handleExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leave Summary");
    XLSX.writeFile(wb, "Leave_Summary.xlsx");
    toast.success("Excel downloaded");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    autoTable(doc, {
      head: [["ID No", "Employee", "Leave Type", "From Date", "To Date", "Days", "Applied On", "Status"]],
      body: filteredData.map((item) => [
        item.idNo,
        item.employee,
        item.leaveType,
        item.fromDate,
        item.toDate,
        item.days,
        item.appliedOn,
        item.status,
      ]),
    });
    doc.save("Leave_Summary.pdf");
    toast.success("PDF downloaded");
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <FaAngleRight />
          Requests
          <FaAngleRight />
          Leave Summary
        </h1>
      </div>

      <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.8_0.001_106.424)] p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div>
            <label className="mr-2 text-md">Show</label>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded-full px-1 border-[oklch(0.645_0.246_16.439)]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="ml-2 text-md">entries</span>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="shadow-sm px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]"
            />
            <div className="flex">
              <button onClick={handleCopy} className="text-xl px-3 py-1 text-gray-800">
                <GoCopy />
              </button>
              <button onClick={handleExcel} className="text-xl px-3 py-1 text-green-700">
                <FaFileExcel />
              </button>
              <button onClick={handlePDF} className="text-xl px-3 py-1 text-red-600">
                <FaFilePdf />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[250px]">
          <table className="w-full text-lg border-collapse">
            <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
              <tr>
                <th className="py-2 px-6 font-semibold">ID No</th>
                <th className="py-2 px-6 font-semibold">Employee</th>
                <th className="py-2 px-6 font-semibold">Leave Type</th>
                <th className="py-2 px-6 font-semibold">From Date</th>
                <th className="py-2 px-6 font-semibold">To Date</th>
                <th className="py-2 px-6 font-semibold">Days</th>
                <th className="py-2 px-6 font-semibold text-center">Applied On</th>
                <th className="py-2 px-6 font-semibold">Status</th>
                <th className="py-2 px-6 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center p-10">
                    No Data Available
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr
                    key={item.id}
                    className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                  >
                    <td className="py-2 px-6">{item.idNo}</td>
                    <td className="py-2 px-6 font-medium">{item.employee}</td>
                    <td className="py-2 px-6">{item.leaveType}</td>
                    <td className="py-2 px-6">{item.fromDate}</td>
                    <td className="py-2 px-6">{item.toDate}</td>
                    <td className="py-2 px-6">{item.days}</td>
                    <td className="py-2 px-6">{item.appliedOn}</td>
                    <td className="py-2 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2 px-6">
                      <button className="text-blue-500 hover:text-blue-700">
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm">
          <span>
            Showing {filteredData.length === 0 ? "0" : startIndex + 1} to{" "}
            {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
          </span>
          <div className="flex space-x-1">
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
    </div>
  );
};

export default LeaveSummary;

import React, { useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import toast from "react-hot-toast";

const Performance = () => {
  const [performance] = useState([
    {
      id: 1,
      serialno: "EMP001",
      firstname: "Sharma",
      dailyhours: 8,
      dailytarget: 8,
      dailystatus: "Good",
      totalweeklyhours: 40,
      targetweekly: 40,
      weeklystatus: "Good",
      totalmonthlyhours: 160,
      targetmonthly: 160,
      monthlystatus: "Good",
    },
    {
      id: 2,
      serialno: "EMP002",
      firstname: "Drishti",
      dailyhours: 6,
      dailytarget: 8,
      dailystatus: "Poor",
      totalweeklyhours: 32,
      targetweekly: 40,
      weeklystatus: "Poor",
      totalmonthlyhours: 120,
      targetmonthly: 160,
      monthlystatus: "Poor",
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredperformance = performance.filter(
    (item) =>
      item.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialno?.toString().includes(searchTerm),
  );

  const totalPages = Math.ceil(filteredperformance.length / entriesPerPage);

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;

  const currentperformance = filteredperformance.slice(startIndex, endIndex);

  // Copy Table Data
  const handleCopy = () => {
    const header = [
      "Serial No",
      "First Name",
      "Daily Hours",
      "Daily Target",
      "Daily Status",
      "Total Weekly Hours",
      "Target Weekly",
      "Weekly Status",
      "Total Monthly Hours",
      "Target Monthly",
      "Monthly Status",
    ].join("\t");

    const rows = filteredperformance
      .map(
        (d) =>
          `${d.serialno}\t${d.firstname}\t${d.dailyhours}\t${d.dailytarget}\t${d.dailystatus}\t${d.totalweeklyhours}\t${d.targetweekly}\t${d.weeklystatus}\t${d.totalmonthlyhours}\t${d.targetmonthly}\t${d.monthlystatus}`,
      )
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  // Export Excel
  const handleExcel = () => {
    const excelData = filteredperformance.map((item) => ({
      "Serial No": item.serialno,
      "First Name": item.firstname,
      "Daily Hours": item.dailyhours,
      "Daily Target": item.dailytarget,
      "Daily Status": item.dailystatus,
      "Total Weekly Hours": item.totalweeklyhours,
      "Target Weekly": item.targetweekly,
      "Weekly Status": item.weeklystatus,
      "Total Monthly Hours": item.totalmonthlyhours,
      "Target Monthly": item.targetmonthly,
      "Monthly Status": item.monthlystatus,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Performance Report");

    XLSX.writeFile(workbook, "PerformanceReport.xlsx");
  };

  // Export PDF
  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "Serial No",
      "First Name",
      "Daily Hours",
      "Daily Target",
      "Daily Status",
      "Total Weekly Hours",
      "Target Weekly",
      "Weekly Status",
      "Total Monthly Hours",
      "Target Monthly",
      "Monthly Status",
    ];

    const tableRows = [];

    filteredperformance.forEach((item) => {
      const row = [
        item.serialno,
        item.firstname,
        item.dailyhours,
        item.dailytarget,
        item.dailystatus,
        item.totalweeklyhours,
        item.targetweekly,
        item.weeklystatus,
        item.totalmonthlyhours,
        item.targetmonthly,
        item.monthlystatus,
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("PerformanceReport.pdf");
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 pt-1.5 text-lg font-semibold flex-wrap">
          <FaAngleRight />
          Masters
          <FaAngleRight />
          Performance Report
        </h1>
      </div>

      <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.8_0.001_106.424)]  p-6">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div>
            <label className="mr-2 text-sm">Show</label>
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
            </select>
            <span className="ml-2 text-md">entries</span>
          </div>
          <div className="flex">
            <button
              onClick={handleCopy}
              className="px-3 py-1 cursor-pointer text-gray-800"
            >
              <GoCopy />
            </button>

            <button
              onClick={handleExcel}
              className="px-3 py-1 cursor-pointer text-green-700"
            >
              <FaFileExcel />
            </button>

            <button
              onClick={handlePDF}
              className="px-3 py-1 cursor-pointer text-red-600"
            >
              <FaFilePdf />
            </button>
          </div>
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

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-lg border-collapse">
            <thead className="bg-[oklch(0.98_0.02_16.439)]  text-[oklch(0.70_0.246_16.439)]">
              <tr>
                <th className="py-2 px-6 font-semibold">SerialSerial No</th>
                <th className="py-2 px-6 font-semibold">SerialFirst Name</th>
                <th className="py-2 px-6 font-semibold">SerialDaily Hours</th>
                <th className="py-2 px-6 font-semibold">SerialDaily Target</th>
                <th className="py-2 px-6 font-semibold">SerialDaily Status</th>
                <th className="py-2 px-6 font-semibold">
                  SerialTotal Weekly Hours{" "}
                </th>
                <th className="py-2 px-6 font-semibold">SerialTarget Weekly</th>
                <th className="py-2 px-6 font-semibold">SerialWeekly Status</th>
                <th className="py-2 px-6 font-semibold">
                  SerialTotal Monthly Hours
                </th>
                <th className="py-2 px-6 font-semibold">
                  SerialTarget Monthly
                </th>
                <th className="py-2 px-6 font-semibold">
                  SerialMonthly Status
                </th>
              </tr>
            </thead>
            <tbody>
              {currentperformance.length === 0 ? (
                <tr>
                  <td colSpan="11" className="sm:text-center p-10">
                    No Data Available
                  </td>
                </tr>
              ) : (
                currentperformance.map((item) => (
                  <tr
                    key={item.id}
                    className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                  >
                    <td className="py-2 px-6">{item.serialno}</td>
                    <td className="py-2 px-6">{item.firstname}</td>
                    <td className="py-2 px-6">{item.dailyhours}</td>
                    <td className="py-2 px-6">{item.dailytarget}</td>
                    <td className="py-2 px-6">{item.dailystatus}</td>
                    <td className="py-2 px-6">{item.totalweeklyhours}</td>
                    <td className="py-2 px-6">{item.targetweekly}</td>
                    <td className="py-2 px-6">{item.weeklystatus}</td>
                    <td className="py-2 px-6">{item.totalmonthlyhours}</td>
                    <td className="py-2 px-6">{item.targetmonthly}</td>
                    <td className="py-2 px-6">{item.monthlystatus}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 text-sm">
          <span>
            Showing {Math.min(endIndex, filteredperformance.length)} of{" "}
            {filteredperformance.length} entries
          </span>

          <div className="space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              First
            </button>

            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-2 py-1 rounded ${
                  currentPage === index + 1
                    ? "bg-green-500 text-white"
                    : "border"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Performance;

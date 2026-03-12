import React, { useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import toast from "react-hot-toast";
import { GrPrevious, GrNext } from "react-icons/gr";

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
    {
      id: 3,
      serialno: "EMP003",
      firstname: "Rahul",
      dailyhours: 7,
      dailytarget: 8,
      dailystatus: "Average",
      totalweeklyhours: 36,
      targetweekly: 40,
      weeklystatus: "Average",
      totalmonthlyhours: 145,
      targetmonthly: 160,
      monthlystatus: "Average",
    },
    {
      id: 4,
      serialno: "EMP004",
      firstname: "Priya",
      dailyhours: 8,
      dailytarget: 8,
      dailystatus: "Good",
      totalweeklyhours: 41,
      targetweekly: 40,
      weeklystatus: "Good",
      totalmonthlyhours: 165,
      targetmonthly: 160,
      monthlystatus: "Good",
    },
    {
      id: 5,
      serialno: "EMP005",
      firstname: "Amit",
      dailyhours: 5,
      dailytarget: 8,
      dailystatus: "Poor",
      totalweeklyhours: 30,
      targetweekly: 40,
      weeklystatus: "Poor",
      totalmonthlyhours: 110,
      targetmonthly: 160,
      monthlystatus: "Poor",
    },
    {
      id: 6,
      serialno: "EMP006",
      firstname: "Neha",
      dailyhours: 8,
      dailytarget: 8,
      dailystatus: "Good",
      totalweeklyhours: 40,
      targetweekly: 40,
      weeklystatus: "Good",
      totalmonthlyhours: 158,
      targetmonthly: 160,
      monthlystatus: "Average",
    },
    {
      id: 7,
      serialno: "EMP007",
      firstname: "Karan",
      dailyhours: 7,
      dailytarget: 8,
      dailystatus: "Average",
      totalweeklyhours: 37,
      targetweekly: 40,
      weeklystatus: "Average",
      totalmonthlyhours: 150,
      targetmonthly: 160,
      monthlystatus: "Average",
    },
    {
      id: 8,
      serialno: "EMP008",
      firstname: "Anjali",
      dailyhours: 9,
      dailytarget: 8,
      dailystatus: "Excellent",
      totalweeklyhours: 44,
      targetweekly: 40,
      weeklystatus: "Excellent",
      totalmonthlyhours: 170,
      targetmonthly: 160,
      monthlystatus: "Excellent",
    },
    {
      id: 9,
      serialno: "EMP009",
      firstname: "Rohit",
      dailyhours: 6,
      dailytarget: 8,
      dailystatus: "Poor",
      totalweeklyhours: 33,
      targetweekly: 40,
      weeklystatus: "Poor",
      totalmonthlyhours: 125,
      targetmonthly: 160,
      monthlystatus: "Poor",
    },
    {
      id: 10,
      serialno: "EMP010",
      firstname: "Sneha",
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
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredperformance = performance.filter(
    (item) =>
      item.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialno?.toString().includes(searchTerm),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentperformance = filteredperformance.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredperformance.length / entriesPerPage),
  );

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
      <div className="mb-16">
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
              <div className="flex">
                <button
                  onClick={handleCopy}
                  className="text-xl px-3 py-1 cursor-pointer text-gray-800"
                >
                  <GoCopy />
                </button>

                <button
                  onClick={handleExcel}
                  className="text-xl px-3 py-1 cursor-pointer text-green-700"
                >
                  <FaFileExcel />
                </button>

                <button
                  onClick={handlePDF}
                  className="text-xl px-3 py-1 cursor-pointer text-red-600"
                >
                  <FaFilePdf />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            className="overflow-x-auto min-h-[300px]"
            style={{ scrollbarWidth: "none" }}
          >
            <table className="w-full text-lg border-collapse">
              <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
                <tr>
                  <th className="py-2 px-6 font-semibold">Serial No</th>
                  <th className="py-2 px-6 font-semibold"> First Name</th>
                  <th className="py-2 px-6 font-semibold"> Daily Hours</th>
                  <th className="py-2 px-6 font-semibold">Daily Target</th>
                  <th className="py-2 px-6 font-semibold">Daily Status</th>
                  <th className="py-2 px-6 font-semibold">
                    Total Weekly Hours{" "}
                  </th>
                  <th className="py-2 px-6 font-semibold">Target Weekly</th>
                  <th className="py-2 px-6 font-semibold">Weekly Status</th>
                  <th className="py-2 px-6 font-semibold">
                    Total Monthly Hours
                  </th>
                  <th className="py-2 px-6 font-semibold">Target Monthly</th>
                  <th className="py-2 px-6 font-semibold">Monthly Status</th>
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
          <div className="flex justify-center md:justify-between items-center mt-4 text-sm flex-wrap gap-6">
            <span>
              Showing {filteredperformance.length === 0 ? "0" : startIndex + 1}{" "}
              to {Math.min(endIndex, filteredperformance.length)} of{" "}
              {filteredperformance.length} entries
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
    </>
  );
};

export default Performance;

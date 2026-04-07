import React, { useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaEye, FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import toast from "react-hot-toast";
import { GrPrevious, GrNext } from "react-icons/gr";
import { RxCross2 } from "react-icons/rx";

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
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openModal, setOpenModal] = useState(false);

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
      <div className="mb-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center gap-2 h-[30px] text-lg font-semibold text-gray-800">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Masters</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div className="text-blue-600 hover:text-blue-700">
              Performance Report
            </div>
          </h1>
        </div>

        {/* Main Container */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl">
          {/* Top Controls */}
          <div className="p-6 border-b border-blue-100/30">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600">
                  Display
                </label>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 transition-all"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm font-medium text-gray-600">
                  entries
                </span>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <input
                  placeholder="Search performance..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 hover:text-blue-700 p-2.5 rounded-lg transition-all"
                    title="Copy to clipboard"
                  >
                    <GoCopy />
                  </button>

                  <button
                    onClick={handleExcel}
                    className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 hover:text-green-700 p-2.5 rounded-lg transition-all"
                    title="Export to Excel"
                  >
                    <FaFileExcel />
                  </button>

                  <button
                    onClick={handlePDF}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 p-2.5 rounded-lg transition-all"
                    title="Export to PDF"
                  >
                    <FaFilePdf />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            className="overflow-x-auto min-h-[300px]"
            style={{ scrollbarWidth: "none" }}
          >
            <table className="w-full text-[16px]">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50">
                  <th className="px-6 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                    SL.NO
                  </th>

                  <th className="px-6 py-3 text-center font-semibold text-gray-700">
                    Employee Name
                  </th>

                  <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden sm:table-cell">
                    Daily Hours
                  </th>

                  <th className="px-6 py-3 text-center hidden 2xl:table-cell font-semibold text-gray-700">
                    Daily Target
                  </th>

                  <th className="px-6 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                    Daily Status
                  </th>

                  <th className="px-6 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                    Weekly Hours
                  </th>

                  <th className="px-6 py-3 text-center hidden 2xl:table-cell font-semibold text-gray-700">
                    Weekly Target
                  </th>

                  <th className="px-6 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                    Weekly Status
                  </th>

                  <th className="px-6 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                    Monthly Hours
                  </th>

                  <th className="px-6 py-3 text-center hidden 2xl:table-cell font-semibold text-gray-700">
                    Monthly Target
                  </th>

                  <th className="px-6 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                    Monthly Status
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentperformance.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="text-4xl opacity-40">📭</div>
                        <p className="text-gray-500 text-base">
                          No Data Available
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentperformance.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 even:bg-blue-50/60"
                    >
                      <td className="px-6 py-2 text-center hidden sm:table-cell">
                        {index + 1}
                      </td>

                      <td className="px-6 py-2 text-center">
                        {item.firstname || "-"}
                      </td>

                      <td className="px-6 py-2 text-center hidden sm:table-cell">
                        {item.dailyhours || "-"}
                      </td>

                      <td className="px-6 py-2 text-center hidden 2xl:table-cell">
                        {item.dailytarget || "-"}
                      </td>

                      <td className="px-6 py-2 text-center hidden md:table-cell">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.dailystatus === "Completed" ||
                            item.dailystatus === "✓"
                              ? "bg-green-100 text-green-700"
                              : item.dailystatus === "Pending" ||
                                  item.dailystatus === "○"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {item.dailystatus || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-2 text-center hidden md:table-cell">
                        {item.totalweeklyhours || "-"}
                      </td>

                      <td className="px-6 py-2 text-center hidden 2xl:table-cell">
                        {item.targetweekly || "-"}
                      </td>

                      <td className="px-6 py-2 text-center hidden lg:table-cell">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.weeklystatus === "Completed" ||
                            item.weeklystatus === "✓"
                              ? "bg-green-100 text-green-700"
                              : item.weeklystatus === "Pending" ||
                                  item.weeklystatus === "○"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {item.weeklystatus || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-2 text-center hidden lg:table-cell">
                        {item.totalmonthlyhours || "-"}
                      </td>

                      <td className="px-6 py-2 text-center hidden 2xl:table-cell">
                        {item.targetmonthly || "-"}
                      </td>

                      <td className="px-6 py-2 text-center hidden lg:table-cell">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.monthlystatus === "Completed" ||
                            item.monthlystatus === "✓"
                              ? "bg-green-100 text-green-700"
                              : item.monthlystatus === "Pending" ||
                                  item.monthlystatus === "○"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {item.monthlystatus || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-2 text-center flex justify-center">
                        <FaEye
                          onClick={() => {
                            setSelectedEmployee(item);
                            setOpenModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-blue-100/30 flex flex-col sm:flex-row justify-between items-center gap-6">
            <span className="text-sm text-gray-600">
              Showing{" "}
              <span className="text-gray-900 font-semibold">
                {filteredperformance.length === 0 ? "0" : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="text-gray-900 font-semibold">
                {Math.min(endIndex, filteredperformance.length)}
              </span>{" "}
              of{" "}
              <span className="text-gray-900 font-semibold">
                {filteredperformance.length}
              </span>{" "}
              entries
            </span>

            <div className="flex gap-2">
              <button
                disabled={currentPage == 1}
                onClick={() => setCurrentPage(1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                title="First page"
              >
                First
              </button>

              <button
                disabled={currentPage == 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
                title="Previous page"
              >
                <GrPrevious />
              </button>

              <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-semibold min-w-[45px] text-center">
                {currentPage}
              </div>

              <button
                disabled={currentPage == totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
                title="Next page"
              >
                <GrNext />
              </button>

              <button
                disabled={currentPage == totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                title="Last page"
              >
                Last
              </button>
            </div>
          </div>
        </div>

        {openModal && selectedEmployee && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setOpenModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-2xl overflow-y-auto"
              style={{ maxHeight: "90vh", scrollbarWidth: "none" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-blue-100/30">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">
                    {selectedEmployee.firstname?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-base">
                      {selectedEmployee.firstname}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedEmployee.serialno}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpenModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <RxCross2 className="text-xl" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Metric Cards */}
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                    Performance overview
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        label: "Daily hours",
                        value: selectedEmployee.dailyhours,
                        target: selectedEmployee.dailytarget,
                        status: selectedEmployee.dailystatus,
                      },
                      {
                        label: "Weekly hours",
                        value: selectedEmployee.totalweeklyhours,
                        target: selectedEmployee.targetweekly,
                        status: selectedEmployee.weeklystatus,
                      },
                      {
                        label: "Monthly hours",
                        value: selectedEmployee.totalmonthlyhours,
                        target: selectedEmployee.targetmonthly,
                        status: selectedEmployee.monthlystatus,
                      },
                    ].map(({ label, value, target, status }) => (
                      <div key={label} className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        <p className="text-xl font-semibold text-gray-800">
                          {value}{" "}
                          <span className="text-sm font-normal text-gray-400">
                            / {target}
                          </span>
                        </p>
                        <span
                          className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            status === "Excellent"
                              ? "bg-teal-100 text-teal-700"
                              : status === "Good"
                                ? "bg-blue-100 text-blue-700"
                                : status === "Average"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details Table */}
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                    Details
                  </p>
                  <div className="divide-y divide-gray-100">
                    {[
                      ["Serial no.", selectedEmployee.serialno],
                      ["Daily target", `${selectedEmployee.dailytarget} hrs`],
                      ["Weekly target", `${selectedEmployee.targetweekly} hrs`],
                      [
                        "Monthly target",
                        `${selectedEmployee.targetmonthly} hrs`,
                      ],
                    ].map(([key, val]) => (
                      <div
                        key={key}
                        className="flex justify-between py-2 text-sm"
                      >
                        <span className="text-gray-500">{key}</span>
                        <span className="text-gray-800">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Performance;

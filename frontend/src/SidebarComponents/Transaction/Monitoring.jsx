import React, { useState } from "react";
import { FaAngleRight, FaEye } from "react-icons/fa6";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import toast from "react-hot-toast";
import { GrPrevious, GrNext } from "react-icons/gr";
import { RxCross2 } from "react-icons/rx";

const Monitoring = () => {
  const [monitoring] = useState([]);

  const attendanceData = {
    total: 100,
    present: 77,
    absent: 15,
    leave: 8,
  };

  const inputStyle =
    "w-full bg-white border border-gray-200 px-3 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm";

  const labelStyle = "text-sm font-semibold text-gray-700 mb-2 block";

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredmonitoring = monitoring.filter((device) =>
    device.employee.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentmonitoring = filteredmonitoring.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredmonitoring.length / entriesPerPage),
  );

  // Copy Table Data
  const handleCopy = () => {
    const header = [
      "Status",
      "Employee",
      "Date",
      "Day",
      "Login",
      "Logout",
      "Working Hours",
      "Location",
    ].join("\t");

    const rows = filteredmonitoring
      .map(
        (d) =>
          `${d.status}\t${d.employee}\t${d.date.toLocaleDateString()}\t${d.date.toLocaleDateString(
            "en-US",
            { weekday: "long" },
          )}\t${d.login}\t${d.logout}\t${calculateWH(
            d.login,
            d.logout,
          )}\t${d.location}`,
      )
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  // Export Excel
  const handleExcel = () => {
    const excelData = filteredmonitoring.map((item) => ({
      Status: item.status,
      Employee: item.employee,
      Date: item.date.toLocaleDateString(),
      Day: item.date.toLocaleDateString("en-US", { weekday: "long" }),
      Login: item.login,
      Logout: item.logout,
      "Working Hours": calculateWH(item.login, item.logout),
      Location: item.location,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Monitoring");

    XLSX.writeFile(workbook, "Monitoring.xlsx");
  };

  // Export PDF
  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "Status",
      "Employee",
      "Date",
      "Day",
      "Login",
      "Logout",
      "Working Hours",
      "Location",
    ];

    const tableRows = [];

    filteredmonitoring.forEach((item) => {
      tableRows.push([
        item.status,
        item.employee,
        item.date.toLocaleDateString(),
        item.date.toLocaleDateString("en-US", { weekday: "long" }),
        item.login,
        item.logout,
        calculateWH(item.login, item.logout),
        item.location,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("Monitoring.pdf");
  };

  const calculateWH = (login, logout) => {
    const toSeconds = (time) => {
      const [h, m, s] = time.split(":").map(Number);
      return h * 3600 + m * 60 + s;
    };

    const diff = toSeconds(logout) - toSeconds(login);

    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;

    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-900">
          <FaAngleRight className="text-blue-500 text-base" />
          <p className="text-gray-500">Transaction</p>
          <FaAngleRight className="text-blue-500 text-base" />
          <p className="text-blue-600">Monitoring</p>
        </h1>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { label: "Total Employees", value: attendanceData.total },
          { label: "Present Today", value: attendanceData.present },
          { label: "Absent", value: attendanceData.absent },
          { label: "Leave Requests", value: attendanceData.leave },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-blue-100/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <p className="text-base text-gray-500 mb-2">
              {item.label}
            </p>
            <h3 className="text-2xl font-bold text-gray-800">{item.value}</h3>
            <div className="mt-3 h-1 w-10 bg-blue-500 rounded-full" />
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl">
        {/* Header */}
        <div className="p-6 text-center border-b border-blue-100/30">
          <h2 className="text-xl font-semibold text-blue-600">
            Attendance Monitoring
          </h2>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-blue-100/30">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm xl:text-base font-medium text-gray-600">
                Display
              </label>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <p className="text-sm xl:text-base font-medium text-gray-600">
                entries
              </p>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-center">
              <input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 rounded-lg text-sm xl:text-base placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 p-2 rounded-lg"
                >
                  <GoCopy className="text-lg" />
                </button>
                <button
                  onClick={handleExcel}
                  className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 p-2 rounded-lg"
                >
                  <FaFileExcel className="text-lg" />
                </button>
                <button
                  onClick={handlePDF}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 p-2 rounded-lg"
                >
                  <FaFilePdf className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div
          className="overflow-x-auto min-h-[350px]"
          style={{ scrollbarWidth: "none" }}
        >
          <table className="w-full text-[17px]">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50">
                <th className="px-6 py-3 text-center font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">
                  Employee
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden sm:table-cell">
                  Date
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden lg:table-cell">
                  Day
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden lg:table-cell">
                  Login
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden lg:table-cell">
                  Logout
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden sm:table-cell">
                  Hours
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden lg:table-cell">
                  Location
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : currentmonitoring.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-4xl opacity-40">📅</div>
                      <p className="text-gray-500 text-base font-medium">
                        No attendance data
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentmonitoring.map((item) => (
                  <tr
                    className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 even:bg-blue-50/60"
                    key={item.id}
                  >
                    <td className="text-center">
                      <div
                        className={`w-3 h-3 rounded-full mx-auto ${
                          item.status === "Online"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      />
                    </td>

                    <td className="px-6 py-2 text-center">{item.employee}</td>
                    <td className="px-6 py-2 hidden sm:table-cell text-center">
                      {item.date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-2 hidden lg:table-cell text-center">
                      {item.date.toLocaleDateString("en-US", {
                        weekday: "long",
                      })}
                    </td>
                    <td className="px-6 py-2 hidden lg:table-cell text-center">
                      {item.login}
                    </td>
                    <td className="px-6 py-2 hidden lg:table-cell text-center">
                      {item.logout}
                    </td>
                    <td className="px-6 py-2 hidden sm:table-cell text-center">
                      {calculateWH(item.login, item.logout)}
                    </td>
                    <td className="px-6 py-2 hidden lg:table-cell text-center">
                      {item.location}
                    </td>
                    {/* Action */}
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setOpenModal(true);
                        }}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1.5 rounded-lg transition-all"
                        title="View"
                      >
                        <FaEye className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-blue-100/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            Showing {filteredmonitoring.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(endIndex, filteredmonitoring.length)} of{" "}
            {filteredmonitoring.length}
          </p>

          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg"
            >
              First
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="bg-blue-50 border border-blue-200 p-2 rounded-lg"
            >
              <GrPrevious />
            </button>

            <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg">
              {currentPage}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-blue-50 border border-blue-200 p-2 rounded-lg"
            >
              <GrNext />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {openModal && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Close */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
              <h2 className="text-xl font-bold text-gray-900">
                Attendance Overview
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <p>
                <p className={labelStyle}>Employee:</p>{" "}
                <p className={inputStyle}>{selectedItem.employee}</p>
              </p>
              <p>
                <p className={labelStyle}>Date:</p>{" "}
                <p className={inputStyle}>
                  {selectedItem.date.toLocaleDateString()}
                </p>
              </p>
              <p>
                <p className={labelStyle}>Day:</p>{" "}
                <p className={inputStyle}>
                  {selectedItem.date.toLocaleDateString("en-US", {
                    weekday: "long",
                  })}
                </p>
              </p>
              <p>
                <p className={labelStyle}>Login Time:</p>{" "}
                <p className={inputStyle}>{selectedItem.login}</p>
              </p>
              <p>
                <p className={labelStyle}>Logout Time:</p>{" "}
                <p className={inputStyle}>{selectedItem.logout}</p>
              </p>
              <p>
                <p className={labelStyle}>Working Hours:</p>{" "}
                <p className={inputStyle}>
                  {calculateWH(selectedItem.login, selectedItem.logout)}
                </p>
              </p>
              <p>
                <p className={labelStyle}>Location:</p>{" "}
                <p className={inputStyle}>{selectedItem.location}</p>
              </p>
              <p>
                <p className={labelStyle}>Status:</p>{" "}
                <p
                  className={`font-semibold ${
                    selectedItem.status === "Online"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  <p className={inputStyle}>
                    {selectedItem.status === "Online"
                      ? "● Online"
                      : "○ Offline"}
                  </p>
                </p>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Monitoring;

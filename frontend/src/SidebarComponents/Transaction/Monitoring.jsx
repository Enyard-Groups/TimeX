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

const Monitoring = () => {
  const [monitoring] = useState([
    {
      id: 1,
      employee: "Sharma",
      date: new Date("2026-03-07"),
      login: "10:30:00",
      logout: "18:30:00",
      location: "Home",
      status: "Online",
    },
    {
      id: 2,
      employee: "Drishti",
      date: new Date("2026-03-06"),
      login: "09:15:00",
      logout: "17:30:00",
      location: "Office",
      status: "Offline",
    },
    {
      id: 3,
      employee: "Amit",
      date: new Date("2026-03-05"),
      login: "10:00:00",
      logout: "18:00:00",
      location: "Home",
      status: "Online",
    },
    {
      id: 4,
      employee: "Neha",
      date: new Date("2026-03-04"),
      login: "09:45:00",
      logout: "18:10:00",
      location: "Office",
      status: "Online",
    },
    {
      id: 5,
      employee: "Priya",
      date: new Date("2026-03-03"),
      login: "11:00:00",
      logout: "19:00:00",
      location: "Home",
      status: "Offline",
    },
    {
      id: 6,
      employee: "Vikas",
      date: new Date("2026-03-02"),
      login: "09:30:00",
      logout: "17:45:00",
      location: "Office",
      status: "Online",
    },
    {
      id: 7,
      employee: "Anjali",
      date: new Date("2026-03-01"),
      login: "10:20:00",
      logout: "18:10:00",
      location: "Home",
      status: "Online",
    },
    {
      id: 8,
      employee: "Rohit",
      date: new Date("2026-02-28"),
      login: "09:10:00",
      logout: "17:20:00",
      location: "Office",
      status: "Offline",
    },
    {
      id: 9,
      employee: "Karan",
      date: new Date("2026-02-27"),
      login: "10:40:00",
      logout: "18:50:00",
      location: "Home",
      status: "Online",
    },
    {
      id: 10,
      employee: "Meena",
      date: new Date("2026-02-26"),
      login: "09:50:00",
      logout: "18:00:00",
      location: "Office",
      status: "Offline",
    },
  ]);

  const attendanceData = {
    total: 100,
    present: 77,
    absent: 15,
    leave: 8,
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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
    <div className="mb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 pt-1.5 text-lg font-semibold flex-wrap mb-6">
          <FaAngleRight />
          Transaction
          <FaAngleRight />
          Monitoring
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        {/* Total Employees */}
        <div
          className="
          hover:scale-105 active:scale-95 transition-all duration-300
    relative group
    p-6 rounded-3xl
    bg-white/60 backdrop-blur-xl
    border border-white/60
    shadow-[0_8px_30px_rgba(0,0,0,0.06)]
    hover:shadow-[0_15px_50px_rgba(0,0,0,0.08)]
    transition-all duration-300
  "
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

          <p
            className="text-md mb-2"
            style={{ color: "oklch(0.2 0.004 49.25)" }}
          >
            Total Employees
          </p>
          <h3
            className="text-3xl font-semibold tracking-tight"
            style={{ color: "oklch(0.3 0.004 49.25)" }}
          >
            {attendanceData.total}
          </h3>

          <div
            className="mt-3 h-1 w-12 rounded-full"
            style={{ backgroundColor: "oklch(0.3 0.004 49.25)" }}
          />
        </div>

        {/* Present Today */}
        <div
          className="
          hover:scale-105 active:scale-95 transition-all duration-300
    relative group
    p-6 rounded-3xl
    bg-white/60 backdrop-blur-xl
    border border-white/60
    shadow-[0_8px_30px_rgba(0,0,0,0.06)]
    hover:shadow-[0_15px_50px_rgba(0,0,0,0.08)]
    transition-all duration-300
  "
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

          <p
            className="text-md mb-2"
            style={{ color: "oklch(0.2 0.004 49.25)" }}
          >
            Present Today
          </p>
          <h3
            className="text-3xl font-semibold tracking-tight "
            style={{ color: "oklch(0.6 0.246 16.439)" }}
          >
            {attendanceData.present}
          </h3>

          <div
            className="mt-3 h-1 w-12 rounded-full"
            style={{ backgroundColor: "oklch(0.6 0.246 16.439)" }}
          />
        </div>

        {/* Absent */}
        <div
          className="
          hover:scale-105 active:scale-95 transition-all duration-300
    relative group
    p-6 rounded-3xl
    bg-white/60 backdrop-blur-xl
    border border-white/60
    shadow-[0_8px_30px_rgba(0,0,0,0.06)]
    hover:shadow-[0_15px_50px_rgba(0,0,0,0.08)]
    transition-all duration-300
  "
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

          <p
            className="text-md mb-2"
            style={{ color: "oklch(0.2 0.004 49.25)" }}
          >
            Absent
          </p>
          <h3
            className="text-3xl font-semibold tracking-tight"
            style={{ color: "oklch(0.72 0.245 27.325)" }}
          >
            {attendanceData.absent}
          </h3>

          <div
            className="mt-3 h-1 w-12 rounded-full"
            style={{ backgroundColor: "oklch(0.72 0.245 27.325)" }}
          />
        </div>

        {/* Leave Requests */}
        <div
          className="
          hover:scale-105 active:scale-95 transition-all duration-300
    relative group
    p-6 rounded-3xl
    bg-white/60 backdrop-blur-xl
    border border-white/60
    shadow-[0_8px_30px_rgba(0,0,0,0.06)]
    hover:shadow-[0_15px_50px_rgba(0,0,0,0.08)]
    transition-all duration-300
  "
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

          <p
            className="text-md mb-2"
            style={{ color: "oklch(0.2 0.004 49.25)" }}
          >
            Leave Requests
          </p>
          <h3
            className="text-3xl font-semibold tracking-tight "
            style={{ color: "oklch(0.45 0.004 49.25)" }}
          >
            {attendanceData.leave}
          </h3>

          <div
            className="mt-3 h-1 w-12 rounded-full"
            style={{ backgroundColor: "oklch(0.45 0.004 49.25)" }}
          />
        </div>
      </div>

      <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.8_0.001_106.424)]  p-6">
        <h1 className="border-b-2 mb-4 w-fit border-[oklch(0.8_0.001_106.424)] text-[oklch(0.6_0.246_16.439)]">
          Attendance Monitoring
        </h1>

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
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-lg border-collapse">
            <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
              <tr>
                <th className="py-2 px-6 font-semibold">Status</th>
                <th className="py-2 px-6 font-semibold">Employee</th>
                <th className="py-2 px-6 font-semibold">Date</th>
                <th className="py-2 px-6 font-semibold">Day</th>
                <th className="py-2 px-6 font-semibold">Login</th>
                <th className="py-2 px-6 font-semibold">Logout</th>
                <th className="py-2 px-6 font-semibold">Working Hours</th>
                <th className="py-2 px-6 font-semibold">Location</th>
              </tr>
            </thead>

            <tbody>
              {currentmonitoring.length === 0 ? (
                <tr>
                  <td colSpan="8" className="sm:text-center p-10">
                    No Data Available
                  </td>
                </tr>
              ) : (
                currentmonitoring.map((item) => (
                  <tr
                    key={item.id}
                    className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                  >
                    <td className="text-center">
                      <div
                        className={`w-3 h-3 rounded-full mx-auto ${
                          item.status === "Online"
                            ? "bg-green-700"
                            : "bg-red-700"
                        }`}
                      ></div>
                    </td>

                    <td className="py-2 px-6">{item.employee}</td>

                    <td className="py-2 px-6">
                      {item.date.toLocaleDateString()}
                    </td>

                    <td className="py-2 px-6">
                      {item.date.toLocaleDateString("en-US", {
                        weekday: "long",
                      })}
                    </td>

                    <td className="py-2 px-6">{item.login}</td>

                    <td className="py-2 px-6">{item.logout}</td>

                    <td className="py-2 px-6">
                      {calculateWH(item.login, item.logout)}
                    </td>

                    <td className="py-2 px-6">{item.location}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center md:justify-between items-center mt-4 text-sm flex-wrap gap-6">
          <span>
            Showing {filteredmonitoring.length === 0 ? "0" : startIndex + 1} to{" "}
            {Math.min(endIndex, filteredmonitoring.length)} of{" "}
            {filteredmonitoring.length} entries
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
  );
};

export default Monitoring;

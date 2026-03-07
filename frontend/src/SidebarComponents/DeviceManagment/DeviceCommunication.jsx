import React, { useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import toast from "react-hot-toast";

const DeviceCommunication = () => {
  const [devicecommunication] = useState([
    {
      id: 1,
      status: "Online",
      serialno: "SN001",
      devicename: "ZKTeco F18",
      transfername: "10:30 AM",
      interval: "5 min",
      lastactivity: "2026-03-07 10:25 AM",
      fwversion: "v6.2.1",
      usercount: 120,
      fpcount: 95,
      transactioncount: 3500,
    },
    {
      id: 2,
      status: "Offline",
      serialno: "SN002",
      devicename: "ZKTeco K40",
      transfername: "09:45 AM",
      interval: "10 min",
      lastactivity: "2026-03-07 09:40 AM",
      fwversion: "v5.9.0",
      usercount: 80,
      fpcount: 60,
      transactioncount: 2100,
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filtereddevicecommunication = devicecommunication.filter(
    (device) =>
      device.devicename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.serialno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.status.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(
    filtereddevicecommunication.length / entriesPerPage,
  );

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;

  const currentdevicecommunication = filtereddevicecommunication.slice(
    startIndex,
    endIndex,
  );

  // Copy Table Data
  const handleCopy = () => {
    const header = [
      "Status",
      "Serial No",
      "Device Name",
      "Transfer Time",
      "Interval",
      "Last Activity",
      "FW Version",
      "User Count",
      "FP Count",
      "Transaction Count",
    ].join("\t");

    const rows = filtereddevicecommunication
      .map(
        (d) =>
          `${d.status}\t${d.serialno}\t${d.devicename}\t${d.transfername}\t${d.interval}\t${d.lastactivity}\t${d.fwversion}\t${d.usercount}\t${d.fpcount}\t${d.transactioncount}`,
      )
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  // Export Excel
  const handleExcel = () => {
    const excelData = filtereddevicecommunication.map((item) => ({
      Status: item.status,
      "Serial No": item.serialno,
      "Device Name": item.devicename,
      "Transfer Time": item.transfername,
      Interval: item.interval,
      "Last Activity": item.lastactivity,
      "FW Version": item.fwversion,
      "User Count": item.usercount,
      "FP Count": item.fpcount,
      "Transaction Count": item.transactioncount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Device Communication");

    XLSX.writeFile(workbook, "DeviceCommunication.xlsx");
  };

  // Export PDF
  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "Status",
      "Serial No",
      "Device Name",
      "Transfer Time",
      "Interval",
      "Last Activity",
      "FW Version",
      "User Count",
      "FP Count",
      "Transaction Count",
    ];

    const tableRows = [];

    filtereddevicecommunication.forEach((item) => {
      const row = [
        item.status,
        item.serialno,
        item.devicename,
        item.transfername,
        item.interval,
        item.lastactivity,
        item.fwversion,
        item.usercount,
        item.fpcount,
        item.transactioncount,
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("DeviceCommunication.pdf");
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 pt-1.5 text-lg font-semibold flex-wrap">
          <FaAngleRight />
          Device Management
          <FaAngleRight />
          Device Communication
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
        <div className="overflow-x-auto min-h-[250px]">
          <table className="w-full text-lg border-collapse">
            <thead className="bg-[oklch(0.948_0.001_106.424)]">
              <tr>
                <th className="py-2 px-6">Status</th>
                <th className="py-2 px-6">Serial No</th>
                <th className="py-2 px-6">Device Name</th>
                <th className="py-2 px-6">Transfer Time</th>
                <th className="py-2 px-6">Interval</th>
                <th className="py-2 px-6">LastActivity</th>
                <th className="py-2 px-6">FW Version</th>
                <th className="py-2 px-6">User Count</th>
                <th className="py-2 px-6">FP Count</th>
                <th className="py-2 px-6">Transaction Count</th>
              </tr>
            </thead>
            <tbody>
              {currentdevicecommunication.length === 0 ? (
                <tr>
                  <td colSpan="11" className="sm:text-center p-10">
                    No Data Available
                  </td>
                </tr>
              ) : (
                currentdevicecommunication.map((item) => (
                  <tr key={item.id} className="text-center">
                    <td className="py-2 px-6">
                      <span
                        className={
                          item.status === "Online"
                            ? "bg-green-100 text-green-700 rounded-xl px-2 py-1"
                            : "bg-red-100 text-red-700 rounded-xl px-2 py-1"
                        }
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2 px-6">{item.serialno}</td>
                    <td className="py-2 px-6">{item.devicename}</td>
                    <td className="py-2 px-6">{item.transfername}</td>
                    <td className="py-2 px-6">{item.interval}</td>
                    <td className="py-2 px-6">{item.lastactivity}</td>
                    <td className="py-2 px-6">{item.fwversion}</td>
                    <td className="py-2 px-6">{item.usercount}</td>
                    <td className="py-2 px-6">{item.fpcount}</td>
                    <td className="py-2 px-6">{item.transactioncount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 text-sm">
          <span>
            Showing {Math.min(endIndex, filtereddevicecommunication.length)} of{" "}
            {filtereddevicecommunication.length} entries
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

export default DeviceCommunication;

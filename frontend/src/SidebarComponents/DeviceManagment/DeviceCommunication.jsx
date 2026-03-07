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
    {
      id: 3,
      status: "Online",
      serialno: "SN003",
      devicename: "ZKTeco MB20",
      transfername: "11:00 AM",
      interval: "5 min",
      lastactivity: "2026-03-07 10:55 AM",
      fwversion: "v6.0.3",
      usercount: 150,
      fpcount: 110,
      transactioncount: 4200,
    },
    {
      id: 4,
      status: "Offline",
      serialno: "SN004",
      devicename: "ZKTeco X990",
      transfername: "08:20 AM",
      interval: "15 min",
      lastactivity: "2026-03-07 08:10 AM",
      fwversion: "v5.8.7",
      usercount: 60,
      fpcount: 40,
      transactioncount: 1500,
    },
    {
      id: 5,
      status: "Online",
      serialno: "SN005",
      devicename: "ZKTeco F22",
      transfername: "10:10 AM",
      interval: "5 min",
      lastactivity: "2026-03-07 10:05 AM",
      fwversion: "v6.1.0",
      usercount: 140,
      fpcount: 100,
      transactioncount: 3900,
    },
    {
      id: 6,
      status: "Online",
      serialno: "SN006",
      devicename: "ZKTeco iFace302",
      transfername: "10:50 AM",
      interval: "5 min",
      lastactivity: "2026-03-07 10:45 AM",
      fwversion: "v7.0.2",
      usercount: 200,
      fpcount: 150,
      transactioncount: 5200,
    },
    {
      id: 7,
      status: "Offline",
      serialno: "SN007",
      devicename: "ZKTeco K14",
      transfername: "09:00 AM",
      interval: "10 min",
      lastactivity: "2026-03-07 08:55 AM",
      fwversion: "v5.7.5",
      usercount: 70,
      fpcount: 50,
      transactioncount: 1800,
    },
    {
      id: 8,
      status: "Online",
      serialno: "SN008",
      devicename: "ZKTeco F19",
      transfername: "11:15 AM",
      interval: "5 min",
      lastactivity: "2026-03-07 11:10 AM",
      fwversion: "v6.3.0",
      usercount: 160,
      fpcount: 120,
      transactioncount: 4600,
    },
    {
      id: 9,
      status: "Online",
      serialno: "SN009",
      devicename: "ZKTeco U160",
      transfername: "10:05 AM",
      interval: "5 min",
      lastactivity: "2026-03-07 10:00 AM",
      fwversion: "v6.1.5",
      usercount: 130,
      fpcount: 90,
      transactioncount: 3300,
    },
    {
      id: 10,
      status: "Offline",
      serialno: "SN010",
      devicename: "ZKTeco F17",
      transfername: "08:45 AM",
      interval: "15 min",
      lastactivity: "2026-03-07 08:30 AM",
      fwversion: "v5.9.8",
      usercount: 95,
      fpcount: 70,
      transactioncount: 2500,
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

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentdevicecommunication = filtereddevicecommunication.slice(
    startIndex,
    endIndex,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filtereddevicecommunication.length / entriesPerPage),
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
              <option value={100}>100</option>
            </select>
            <span className="ml-2 text-md">entries</span>
          </div>
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
            <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
              <tr>
                <th className="py-2 px-6 font-semibold">Status</th>
                <th className="py-2 px-6 font-semibold">Serial No</th>
                <th className="py-2 px-6 font-semibold">Device Name</th>
                <th className="py-2 px-6 font-semibold">Transfer Time</th>
                <th className="py-2 px-6 font-semibold">Interval</th>
                <th className="py-2 px-6 font-semibold">LastActivity</th>
                <th className="py-2 px-6 font-semibold">FW Version</th>
                <th className="py-2 px-6 font-semibold">User Count</th>
                <th className="py-2 px-6 font-semibold">FP Count</th>
                <th className="py-2 px-6 font-semibold">Transaction Count</th>
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
                  <tr
                    key={item.id}
                    className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                  >
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
            Showing{" "}
            {filtereddevicecommunication.length === 0 ? "0" : startIndex + 1} to{" "}
            {Math.min(endIndex, filtereddevicecommunication.length)} of{" "}
            {filtereddevicecommunication.length} entries
          </span>

          <div className="flex flex-row space-x-2">
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
    </>
  );
};

export default DeviceCommunication;

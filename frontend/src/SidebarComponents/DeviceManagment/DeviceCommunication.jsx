import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaAngleRight } from "react-icons/fa6";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import toast from "react-hot-toast";
import { GrPrevious, GrNext } from "react-icons/gr";

const API_BASE = "http://localhost:3000/api";

const DeviceCommunication = () => {
  const [devicecommunication, setDeviceCommunication] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCommunications = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const response = await axios.get(`${API_BASE}/device/device-communications`, { headers });
      const payload = response?.data?.data ?? response?.data;
      setDeviceCommunication(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error("Failed to fetch device communications", error);
      toast.error("Failed to load data");
    }
  };

  useEffect(() => {
    fetchCommunications();
  }, []);

  const filtereddevicecommunication = devicecommunication.filter(
    (device) =>
      (device.devicename ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.serialno ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.status ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentdevicecommunication = filtereddevicecommunication.slice(startIndex, endIndex);
  const totalPages = Math.max(1, Math.ceil(filtereddevicecommunication.length / entriesPerPage));

  // Copy Table Data
  const handleCopy = () => {
    const header = [
      "Status", "Serial No", "Device Name", "Transfer Time", "Interval",
      "Last Activity", "FW Version", "User Count", "FP Count", "Transaction Count",
    ].join("\t");

    const rows = filtereddevicecommunication
      .map(
        (d) =>
          `${d.status}\t${d.serialno}\t${d.devicename}\t${d.transfername}\t${d.interval}\t${d.lastactivity}\t${d.fwversion}\t${d.usercount}\t${d.fpcount}\t${d.transactioncount}`,
      )
      .join("\n");

    navigator.clipboard.writeText(`${header}\n${rows}`);
    toast.success("Table copied to clipboard");
  };

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

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    const tableColumn = [
      "Status", "Serial No", "Device Name", "Transfer Time", "Interval",
      "Last Activity", "FW Version", "User Count", "FP Count", "Transaction Count",
    ];
    const tableRows = filtereddevicecommunication.map((item) => [
      item.status, item.serialno, item.devicename, item.transfername, item.interval,
      item.lastactivity, item.fwversion, item.usercount, item.fpcount, item.transactioncount,
    ]);
    autoTable(doc, { head: [tableColumn], body: tableRows });
    doc.save("DeviceCommunication.pdf");
  };

  return (
    <div className="mb-16">
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
              onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
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
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className=" shadow-sm px-3 py-1 rounded-full  focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]"
            />
            <div className="flex">
              <button onClick={handleCopy} className="text-xl px-3 py-1 cursor-pointer text-gray-800"><GoCopy /></button>
              <button onClick={handleExcel} className="text-xl px-3 py-1 cursor-pointer text-green-700"><FaFileExcel /></button>
              <button onClick={handlePDF} className="text-xl px-3 py-1 cursor-pointer text-red-600"><FaFilePdf /></button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]" style={{ scrollbarWidth: "none" }}>
          <table className="w-full text-lg border-collapse">
            <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
              <tr>
                <th className="py-2 px-6 font-semibold">Status</th>
                <th className="py-2 px-6 font-semibold hidden sm:table-cell">Serial No</th>
                <th className="py-2 px-6 font-semibold">Device Name</th>
                <th className="py-2 px-6 font-semibold hidden xl:table-cell">Transfer Time</th>
                <th className="py-2 px-6 font-semibold hidden xl:table-cell">Interval</th>
                <th className="py-2 px-6 font-semibold hidden lg:table-cell">Last Activity</th>
                <th className="py-2 px-6 font-semibold hidden xl:table-cell">FW Version</th>
                <th className="py-2 px-6 font-semibold hidden xl:table-cell">User Count</th>
                <th className="py-2 px-6 font-semibold hidden xl:table-cell">FP Count</th>
                <th className="py-2 px-6 font-semibold hidden lg:table-cell">Transaction Count</th>
              </tr>
            </thead>
            <tbody>
              {currentdevicecommunication.length === 0 ? (
                <tr>
                  <td colSpan="10" className="sm:text-center p-10">No Data Available</td>
                </tr>
              ) : (
                currentdevicecommunication.map((item) => (
                  <tr
                    key={item.id}
                    className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                  >
                    <td className="py-2 px-6">
                      <span className={item.status === "Online" ? "bg-green-100 text-green-700 rounded-xl px-2 py-1" : "bg-red-100 text-red-700 rounded-xl px-2 py-1"}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2 px-6 hidden sm:table-cell">{item.serialno}</td>
                    <td className="py-2 px-6">{item.devicename}</td>
                    <td className="py-2 px-6 hidden xl:table-cell">{item.transfername}</td>
                    <td className="py-2 px-6 hidden xl:table-cell">{item.interval}</td>
                    <td className="py-2 px-6 hidden lg:table-cell">{item.lastactivity}</td>
                    <td className="py-2 px-6 hidden xl:table-cell">{item.fwversion}</td>
                    <td className="py-2 px-6 hidden xl:table-cell">{item.usercount}</td>
                    <td className="py-2 px-6 hidden xl:table-cell">{item.fpcount}</td>
                    <td className="py-2 px-6 hidden lg:table-cell">{item.transactioncount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center md:justify-between items-center mt-4 text-sm flex-wrap gap-6">
          <span>
            Showing {filtereddevicecommunication.length === 0 ? "0" : startIndex + 1} to{" "}
            {Math.min(endIndex, filtereddevicecommunication.length)} of{" "}
            {filtereddevicecommunication.length} entries
          </span>
          <div className="flex flex-row space-x-1">
            <button disabled={currentPage == 1} onClick={() => setCurrentPage(1)} className="p-2 bg-gray-200 rounded-full disabled:opacity-50">First</button>
            <button disabled={currentPage == 1} onClick={() => setCurrentPage(currentPage - 1)} className="p-3 bg-gray-200 rounded-full disabled:opacity-50"><GrPrevious /></button>
            <div className="p-3 px-4 shadow rounded-full">{currentPage}</div>
            <button disabled={currentPage == totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="p-3 bg-gray-200 rounded-full disabled:opacity-50"><GrNext /></button>
            <button disabled={currentPage == totalPages} onClick={() => setCurrentPage(totalPages)} className="p-2 bg-gray-200 rounded-full disabled:opacity-50">Last</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceCommunication;

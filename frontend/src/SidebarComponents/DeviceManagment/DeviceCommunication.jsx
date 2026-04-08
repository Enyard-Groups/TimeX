import React, { useState, useEffect } from "react";
import axios from "axios";
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

const API_BASE = "http://localhost:3000/api";

const DeviceCommunication = () => {
  const [devicecommunication, setDeviceCommunication] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openModal, setopenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const response = await axios.get(
        `${API_BASE}/device/device-communications`,
        { headers },
      );
      const payload = response?.data?.data ?? response?.data;
      setDeviceCommunication(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error("Failed to fetch device communications", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunications();
  }, []);

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-lg rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm";

  const labelStyle =
    "text-sm xl:text-lg font-semibold text-gray-700 mb-2 block";

  const filtereddevicecommunication = devicecommunication.filter(
    (device) =>
      (device.devicename ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (device.serialno ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (device.status ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
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
    const tableRows = filtereddevicecommunication.map((item) => [
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
    ]);
    autoTable(doc, { head: [tableColumn], body: tableRows });
    doc.save("DeviceCommunication.pdf");
  };

  return (
    <div className="mb-6 max-w-[1920px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-base lg:text-xl 3xl:text-4xl font-semibold text-gray-800">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Device Management</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div className="text-blue-600 hover:text-blue-700 transition cursor-pointer">
            Device Communication
          </div>
        </h1>
      </div>

      {/* Main Container */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl">
        {/* Top Controls */}
        <div className="p-6 border-b border-blue-100/30">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm lg:text-base 3xl:text-lg font-medium text-gray-600">
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
              <span className="text-sm lg:text-base 3xl:text-lg font-medium text-gray-600">
                entries
              </span>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-center">
              <input
                placeholder="Search device name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 lg:text-base 3xl:text-lg rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 hover:text-blue-700 p-2.5 rounded-lg transition-all"
                  title="Copy to clipboard"
                >
                  <GoCopy className="text-lg lg:text-xl 3xl:text-3xl" />
                </button>
                <button
                  onClick={handleExcel}
                  className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 hover:text-green-700 p-2.5 rounded-lg transition-all"
                  title="Export to Excel"
                >
                  <FaFileExcel className="text-lg lg:text-xl 3xl:text-3xl" />
                </button>
                <button
                  onClick={handlePDF}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 p-2.5 rounded-lg transition-all"
                  title="Export to PDF"
                >
                  <FaFilePdf className="text-lg lg:text-xl 3xl:text-3xl" />
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
          <table className="w-full text-[16px] lg:text-[19px] 3xl:text-[22px]">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50">
                <th className="px-6 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                  Serial No
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">
                  Device Name
                </th>
                <th className="px-6 py-3 text-center hidden 2xl:table-cell font-semibold text-gray-700">
                  Transfer Time
                </th>
                <th className="px-6 py-3 text-center hidden 2xl:table-cell font-semibold text-gray-700">
                  Interval
                </th>
                <th className="px-6 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                  Transactions
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
                    colSpan="10"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : currentdevicecommunication.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-4xl opacity-40">💻</div>
                      <p className="text-gray-500 text-base font-medium">
                        No Device available
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentdevicecommunication.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-200 even:bg-blue-50/60"
                  >
                    <td className="px-6 py-3 text-center hidden sm:table-cell">
                      <span
                        className={`px-3 py-1 rounded-full text-sm lg:text-base 3xl:text-lg font-semibold border whitespace-nowrap ${item.status === "Online" ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}`}
                      >
                        {item.status === "Online" ? "● Online" : "○ Offline"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center hidden sm:table-cell text-gray-600">
                      {item.serialno || "-"}
                    </td>
                    <td className="px-6 py-3 text-center font-medium text-gray-900">
                      {item.devicename || "-"}
                    </td>
                    <td className="px-6 py-3 text-center hidden 2xl:table-cell text-gray-600">
                      {item.transfername || "-"}
                    </td>
                    <td className="px-6 py-3 text-center hidden 2xl:table-cell text-gray-600">
                      {item.interval || "-"}
                    </td>
                    <td className="px-6 py-3 text-center hidden lg:table-cell text-gray-600 whitespace-nowrap">
                      {item.lastactivity || "-"}
                    </td>
                    <td className="px-6 py-3 text-center hidden lg:table-cell text-gray-600">
                      {item.transactioncount ?? "-"}
                    </td>
                    <td className="px-6 py-3 text-center flex justify-center">
                      <FaEye
                        onClick={() => {
                          setSelectedItem(item);
                          setopenModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 lg:text-xl 3xl:text-3xl cursor-pointer transition-all"
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
          <span className="text-sm lg:text-base 3xl:text-lg text-gray-600">
            Showing{" "}
            <span className="text-gray-900 font-semibold">
              {filtereddevicecommunication.length === 0 ? "0" : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="text-gray-900 font-semibold">
              {Math.min(endIndex, filtereddevicecommunication.length)}
            </span>{" "}
            of{" "}
            <span className="text-gray-900 font-semibold">
              {filtereddevicecommunication.length}
            </span>{" "}
            entries
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            >
              First
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
            >
              <GrPrevious />
            </button>
            <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-semibold min-w-[45px] text-center">
              {currentPage}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
            >
              <GrNext />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {openModal && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 overflow-y-auto"
          onClick={() => setopenModal(false)}
        >
          <div
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-4 border-b border-blue-100/30 mb-6">
              <h2 className="text-xl lg:text-2xl 3xl:text-4xl font-bold text-gray-900">
                Device Communication Details
              </h2>
              <button
                onClick={() => setopenModal(false)}
                className="text-gray-400 hover:text-red-600 transition"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: "Status", value: selectedItem.status },
                { label: "Serial No", value: selectedItem.serialno },
                { label: "Device Name", value: selectedItem.devicename },
                { label: "Transfer Time", value: selectedItem.transfername },
                { label: "Interval", value: selectedItem.interval },
                { label: "Last Activity", value: selectedItem.lastactivity },
                { label: "FW Version", value: selectedItem.fwversion },
                { label: "User Count", value: selectedItem.usercount },
                { label: "FP Count", value: selectedItem.fpcount },
                {
                  label: "Transaction Count",
                  value: selectedItem.transactioncount,
                },
              ].map((field) => (
                <div key={field.label}>
                  <p className="text-sm lg:text-lg 3xl:text-xl font-semibold text-gray-700 mb-1">
                    {field.label}
                  </p>
                  <p className="w-full bg-blue-50/50 border border-gray-200 text-gray-900 px-3 py-2 rounded-lg lg:text-lg 3xl:text-xl">
                    {field.value || "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceCommunication;

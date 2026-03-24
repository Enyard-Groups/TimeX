import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaAngleRight } from "react-icons/fa6";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";

const API_BASE = "http://localhost:3000/api";

const WfhSummary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [wfhData, setWfhData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWfhEntries = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/requests/wfh`);
      setWfhData(res.data);
    } catch (error) {
      console.error("Failed to fetch WFH entries", error);
      toast.error("Failed to load WFH summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWfhEntries();
  }, []);

  const filteredData = wfhData.filter(
    (item) =>
      (item.employee_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.idNo || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / entriesPerPage));

  const handleCopy = () => {
    const header = ["ID No", "Employee", "From Date", "To Date", "Days", "Applied On", "Status"].join("\t");
    const rows = filteredData
      .map((item) =>
        [
          item.idNo,
          item.employee_name,
          item.start_date,
          item.end_date,
          item.number_of_days,
          new Date(item.created_at).toLocaleDateString(),
          item.status,
        ].join("\t")
      )
      .join("\n");
    navigator.clipboard.writeText(`${header}\n${rows}`);
    toast.success("Copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredData.map((item) => ({
      "ID No": item.idNo,
      Employee: item.employee_name,
      "From Date": item.start_date,
      "To Date": item.end_date,
      Days: item.number_of_days,
      "Applied On": new Date(item.created_at).toLocaleDateString(),
      Status: item.status,
    }));
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "WFH Summary");
    XLSX.writeFile(wb, "WFH_Summary.xlsx");
    toast.success("Excel downloaded");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    autoTable(doc, {
      head: [["ID No", "Employee", "From Date", "To Date", "Days", "Applied On", "Status"]],
      body: filteredData.map((item) => [
        item.idNo,
        item.employee_name,
        item.start_date,
        item.end_date,
        item.number_of_days,
        new Date(item.created_at).toLocaleDateString(),
        item.status,
      ]),
    });
    doc.save("WFH_Summary.pdf");
    toast.success("PDF downloaded");
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <FaAngleRight />
          Requests
          <FaAngleRight />
          WFH Summary
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
                <th className="py-2 px-6 font-semibold">From Date</th>
                <th className="py-2 px-6 font-semibold">To Date</th>
                <th className="py-2 px-6 font-semibold">Days</th>
                <th className="py-2 px-6 font-semibold text-center">Applied On</th>
                <th className="py-2 px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center p-10">
                    Loading...
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-10">
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
                    <td className="py-2 px-6 font-medium">{item.employee_name}</td>
                    <td className="py-2 px-6">{item.start_date}</td>
                    <td className="py-2 px-6">{item.end_date}</td>
                    <td className="py-2 px-6">{item.number_of_days}</td>
                    <td className="py-2 px-6">{new Date(item.created_at).toLocaleDateString()}</td>
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

export default WfhSummary;

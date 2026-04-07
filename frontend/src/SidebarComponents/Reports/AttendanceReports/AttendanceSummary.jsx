import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { GrPrevious, GrNext } from "react-icons/gr";
import SearchDropdown from "../../SearchDropdown";
import SpinnerDatePicker from "../../SpinnerDatePicker";
import { FaEye } from "react-icons/fa";
import { GoCopy } from "react-icons/go";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = "http://localhost:3000/api";

const AttendanceSummary = () => {
  const [openModal, setOpenModal] = useState(false);
  const [summaryData, setSummaryData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [modalOpenSelectedItem, setModalOpenSelectedItem] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dropdown data
  const [companyOptions, setCompanyOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFromDateSpinner, setShowFromDateSpinner] = useState(false);
  const [showToDateSpinner, setShowToDateSpinner] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    company_id: "",
    employee: "",
    employee_id: "",
    fromPunchDate: "",
    toPunchDate: "",
  });

  const inputStyle =
    "w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 text-lg py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [companiesRes, employeesRes] = await Promise.all([
          axios.get(`${API_BASE}/companies`),
          axios.get(`${API_BASE}/employee`),
        ]);
        setCompanyOptions(companiesRes.data);
        setEmployeeOptions(employeesRes.data);
      } catch (err) {
        console.error("Failed to load dropdown options:", err);
        toast.error("Failed to load filter options");
      }
    };
    fetchDropdowns();
  }, []);

  const getWeekNumber = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const day = start.getDay();
    const dateNum = date.getDate();
    return Math.ceil((dateNum + day) / 7);
  };

  const calculateHours = (inTime, outTime) => {
    if (!inTime || !outTime) return 0;
    try {
      const [ih, im, is] = inTime.split(":").map(Number);
      const [oh, om, os] = outTime.split(":").map(Number);
      const inSec = ih * 3600 + im * 60 + (is || 0);
      const outSec = oh * 3600 + om * 60 + (os || 0);
      let diff = outSec - inSec;
      if (diff < 0) diff += 24 * 3600;
      return diff / 3600;
    } catch (e) {
      return 0;
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (formData.company_id) params.company_id = formData.company_id;
      if (formData.employee_id) params.employee_id = formData.employee_id;
      if (formData.fromPunchDate) params.from_date = formData.fromPunchDate;
      if (formData.toPunchDate) params.to_date = formData.toPunchDate;

      const res = await axios.get(`${API_BASE}/requests/manual/report`, { params });
      
      // Group by employee
      const grouped = {};
      res.data.forEach(item => {
        const eid = item.employee_id;
        if (!grouped[eid]) {
          grouped[eid] = {
            id: eid,
            employee_name: item.employee_name,
            employee_code: item.employee_code,
            company_name: item.company_name,
            totalDays: 0,
            totalHours: 0,
            weeks: [0, 0, 0, 0, 0, 0] // total hours per week
          };
        }
        
        const hrs = calculateHours(item.in_time, item.out_time);
        grouped[eid].totalDays += 1;
        grouped[eid].totalHours += hrs;
        
        const dt = item.created_at ? new Date(item.created_at) : null;
        if (dt) {
          const week = getWeekNumber(dt);
          if (week >= 1 && week <= 6) {
            grouped[eid].weeks[week-1] += hrs;
          }
        }
      });

      setSummaryData(Object.values(grouped));
      setCurrentPage(1);
      setOpenModal(true);
    } catch (err) {
      console.error("Failed to generate report:", err);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const filteredReport = summaryData.filter(
    (x) =>
      (x.employee_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (x.employee_code || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredReport.length / entriesPerPage));
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filteredReport.slice(startIndex, startIndex + entriesPerPage);

  const selectedItem = summaryData.find((item) => item.id === selectedId);

  const handleCopy = () => {
    const header = ["Sl.No", "Employee", "Days Worked", "Hrs Worked", "W1", "W2", "W3", "W4", "W5"].join("\t");
    const rows = filteredReport.map((item, i) => {
      return [
        i + 1,
        item.employee_name,
        item.totalDays,
        item.totalHours.toFixed(2),
        item.weeks[0].toFixed(1),
        item.weeks[1].toFixed(1),
        item.weeks[2].toFixed(1),
        item.weeks[3].toFixed(1),
        item.weeks[4].toFixed(1),
      ].join("\t");
    }).join("\n");
    navigator.clipboard.writeText(`${header}\n${rows}`);
    toast.success("Copied to clipboard");
  };

  const handleExcel = () => {
    const data = filteredReport.map((item, i) => ({
      "Sl.No": i + 1,
      Employee: item.employee_name,
      "Employee ID": item.employee_code,
      "Days Worked": item.totalDays,
      "Hrs Worked": item.totalHours.toFixed(2),
      "Week 1": item.weeks[0].toFixed(1),
      "Week 2": item.weeks[1].toFixed(1),
      "Week 3": item.weeks[2].toFixed(1),
      "Week 4": item.weeks[3].toFixed(1),
      "Week 5": item.weeks[4].toFixed(1),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AttendanceSummary");
    XLSX.writeFile(wb, "AttendanceSummary.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    doc.text("Attendance Summary", 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [["Sl.No", "Employee", "Days Worked", "Hrs Worked", "W1", "W2", "W3", "W4", "W5"]],
      body: filteredReport.map((item, i) => [
        i + 1,
        item.employee_name,
        item.totalDays,
        item.totalHours.toFixed(2),
        item.weeks[0].toFixed(1),
        item.weeks[1].toFixed(1),
        item.weeks[2].toFixed(1),
        item.weeks[3].toFixed(1),
        item.weeks[4].toFixed(1),
      ]),
    });
    doc.save("AttendanceSummary.pdf");
  };

  return (
    <>
      <div className="mb-6">
        <div className="sm:flex sm:justify-between">
          <h1 className="flex items-center gap-2 text-[17px] font-semibold flex-wrap ml-10 lg:ml-0 mb-4 lg:mb-0">
            <FaAngleRight />
            Reports
            <FaAngleRight />
            Attendance Report
            <FaAngleRight />
            Attendance Summary
          </h1>
        </div>

        <div className="flex items-center justify-center p-4 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="bg-white rounded-xl shadow-sm w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6" style={{ scrollbarWidth: "none" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <SearchDropdown
                  label="Company"
                  name="company"
                  value={formData.company}
                  options={companyOptions}
                  labelKey="name"
                  valueKey="id"
                  labelName="company"
                  formData={formData}
                  setFormData={(updated) =>
                    setFormData((prev) => ({
                      ...prev,
                      company: updated.company,
                      company_id: updated.company_id ?? updated.company,
                    }))
                  }
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>
              <div className="relative">
                <label className={labelStyle}>From Date</label>
                <input
                  name="fromPunchDate"
                  value={formData.fromPunchDate}
                  onClick={() => setShowFromDateSpinner(true)}
                  placeholder="dd/mm/yyyy"
                  readOnly
                  className={`${inputStyle} cursor-pointer`}
                />
                {showFromDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.fromPunchDate}
                    onChange={(date) => setFormData((prev) => ({ ...prev, fromPunchDate: date }))}
                    onClose={() => setShowFromDateSpinner(false)}
                  />
                )}
              </div>
              <div className="relative">
                <label className={labelStyle}>To Date</label>
                <input
                  name="toPunchDate"
                  value={formData.toPunchDate}
                  onClick={() => setShowToDateSpinner(true)}
                  placeholder="dd/mm/yyyy"
                  readOnly
                  className={`${inputStyle} cursor-pointer`}
                />
                {showToDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.toPunchDate}
                    onChange={(date) => setFormData((prev) => ({ ...prev, toPunchDate: date }))}
                    onClose={() => setShowToDateSpinner(false)}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end mt-10">
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="bg-[oklch(0.645_0.246_16.439)] text-white px-8 py-2 rounded-md disabled:opacity-60"
              >
                {loading ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>
        </div>

        {openModal && (
          <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.8_0.001_106.424)] p-6 ">
            <div className="flex justify-end">
              <RxCross2 onClick={() => setOpenModal(false)} className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer" />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
              <div>
                <label className="mr-2 text-md">Show</label>
                <select value={entriesPerPage} onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border rounded-full px-1 border-[oklch(0.645_0.246_16.439)]">
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="ml-2 text-md">entries</span>
              </div>
              <div className="flex flex-wrap gap-2 items-center justify-center">
                <input placeholder="Search" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className=" shadow-sm px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]" />
                 <div className="flex">
                  <button onClick={handleCopy} className="text-xl px-3 py-1 cursor-pointer text-gray-800"><GoCopy /></button>
                  <button onClick={handleExcel} className="text-xl px-3 py-1 cursor-pointer text-green-700"><FaFileExcel /></button>
                  <button onClick={handlePDF} className="text-xl px-3 py-1 cursor-pointer text-red-600"><FaFilePdf /></button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[250px]" style={{ scrollbarWidth: "none" }}>
              <h1 className="text-[oklch(0.577_0.245_27.325)] text-xl mb-4 text-center"> Attendance Summary </h1>
              <table className="w-full text-lg border-collapse">
                <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
                  <tr>
                    <th className="p-2 font-semibold">Name</th>
                    <th className="p-2 font-semibold whitespace-nowrap hidden md:table-cell">Days Worked</th>
                    <th className="p-2 font-semibold whitespace-nowrap hidden lg:table-cell">Hrs Worked</th>
                    <th className="p-2 font-semibold hidden xl:table-cell">W1</th>
                    <th className="p-2 font-semibold hidden xl:table-cell">W2</th>
                    <th className="p-2 font-semibold hidden xl:table-cell">W3</th>
                    <th className="p-2 font-semibold hidden xl:table-cell">W4</th>
                    <th className="p-2 font-semibold hidden xl:table-cell">W5</th>
                    <th className="p-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr><td colSpan="9" className="sm:text-center p-10">No Data Available</td></tr>
                  ) : (
                    currentData.map((item) => (
                      <tr key={item.id} className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]">
                        <td className="p-2 whitespace-nowrap">{item.employee_name}</td>
                        <td className="p-2 hidden md:table-cell">{item.totalDays}</td>
                        <td className="p-2 hidden lg:table-cell">{item.totalHours.toFixed(2)}</td>
                        <td className="p-2 hidden xl:table-cell">{item.weeks[0].toFixed(1)}</td>
                        <td className="p-2 hidden xl:table-cell">{item.weeks[1].toFixed(1)}</td>
                        <td className="p-2 hidden xl:table-cell">{item.weeks[2].toFixed(1)}</td>
                        <td className="p-2 hidden xl:table-cell">{item.weeks[3].toFixed(1)}</td>
                        <td className="p-2 hidden xl:table-cell">{item.weeks[4].toFixed(1)}</td>
                        <td className="p-2 ">
                          <FaEye onClick={() => { setSelectedId(item.id); setModalOpenSelectedItem(true); }} className="text-blue-500 cursor-pointer text-lg mx-auto" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center md:justify-between items-center mt-4 text-sm flex-wrap gap-6">
              <span> Showing {filteredReport.length === 0 ? "0" : startIndex + 1} to {Math.min(startIndex + entriesPerPage, filteredReport.length)} of {filteredReport.length} entries </span>
              <div className="flex flex-row space-x-1">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="p-2 bg-gray-200 rounded-full disabled:opacity-50">First</button>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="p-3 bg-gray-200 rounded-full disabled:opacity-50"><GrPrevious /></button>
                <div className="p-3 px-4 shadow rounded-full">{currentPage}</div>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="p-3 bg-gray-200 rounded-full disabled:opacity-50"><GrNext /></button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} className="p-2 bg-gray-200 rounded-full disabled:opacity-50">Last</button>
              </div>
            </div>
          </div>
        )}

        {modalOpenSelectedItem && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6" style={{ scrollbarWidth: "none" }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{selectedItem.employee_name} Summary</h2>
                <RxCross2 onClick={() => (setModalOpenSelectedItem(false), setSelectedId(null))} className="cursor-pointer text-xl text-red-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-lg">
                <div><p className={labelStyle}>Employee ID</p><p className={inputStyle}>{selectedItem.employee_code || "—"}</p></div>
                <div><p className={labelStyle}>Name</p><p className={inputStyle}>{selectedItem.employee_name}</p></div>
                <div><p className={labelStyle}>Total Days Worked</p><p className={inputStyle}>{selectedItem.totalDays}</p></div>
                <div><p className={labelStyle}>Total Hrs Worked</p><p className={inputStyle}>{selectedItem.totalHours.toFixed(2)}</p></div>
                <div><p className={labelStyle}>Week 1 Hrs</p><p className={inputStyle}>{selectedItem.weeks[0].toFixed(2)}</p></div>
                <div><p className={labelStyle}>Week 2 Hrs</p><p className={inputStyle}>{selectedItem.weeks[1].toFixed(2)}</p></div>
                <div><p className={labelStyle}>Week 3 Hrs</p><p className={inputStyle}>{selectedItem.weeks[2].toFixed(2)}</p></div>
                <div><p className={labelStyle}>Week 4 Hrs</p><p className={inputStyle}>{selectedItem.weeks[3].toFixed(2)}</p></div>
                <div><p className={labelStyle}>Week 5 Hrs</p><p className={inputStyle}>{selectedItem.weeks[4].toFixed(2)}</p></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AttendanceSummary;

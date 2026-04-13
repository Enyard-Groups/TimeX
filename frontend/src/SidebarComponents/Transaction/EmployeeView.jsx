import React, { useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaEye, FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import SearchDropdown from "../SearchDropdown";
import SpinnerDatePicker from "../SpinnerDatePicker";

const API_BASE = "http://localhost:3000/api";

const EmployeeView = () => {
  const [employee, setEmployee] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [openModal, setopenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [openMassModal, setOpenMassModal] = useState(false);
  const [shifts, setShifts] = useState({});
  const [shiftMasters, setShiftMasters] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [showstartSpinner, setshowstartSpinner] = useState(false);
  const [showendSpinner, setshowendSpinner] = useState(false);

  const [formData, setFormData] = useState({
    startdate: "",
    enddate: "",
    location_id: "",
    location: "",
  });

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/employee`, { headers: getHeaders() });
      setEmployee(res.data || []);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasters = async () => {
    try {
      const [shiftRes, locRes] = await Promise.all([
        axios.get(`${API_BASE}/master/shifts`, { headers: getHeaders() }),
        axios.get(`${API_BASE}/master/geofencing`, { headers: getHeaders() }),
      ]);
      setShiftMasters(shiftRes.data || []);
      setLocationOptions(locRes.data || []);
    } catch (error) {
      console.error("Failed to fetch masters:", error);
    }
  };

  React.useEffect(() => {
    fetchEmployees();
    fetchMasters();
  }, []);

  const filteredemployee = (employee || []).filter(
    (x) =>
      (x.full_name || "").toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      (x.designation_name || "").toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const handleSelect = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentemployee = filteredemployee.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredemployee.length / entriesPerPage),
  );

  const handleCopy = () => {
    const header = ["SL.NO", "Name", "Enrollment ID", "Designation"].join("\t");

    const rows = filteredemployee
      .map((item, index) => {
        return [index + 1, item.full_name, item.company_enrollment_id, item.designation_name].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredemployee.map((item, index) => ({
      "SL.NO": index + 1,
      Name: item.full_name,
      EnrollmentID: item.company_enrollment_id,
      Designation: item.designation_name,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Details");

    XLSX.writeFile(workbook, "Employee Details.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = ["SL.NO", "Name", "Enrollment ID", "Designation"];

    const tableRows = [];

    filteredemployee.forEach((item, index) => {
      const row = [index + 1, item.full_name, item.company_enrollment_id, item.designation_name];
      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("Employee Details.pdf");
  };

  const handleMassUpdate = () => {
    if (selectedEmployees.length === 0) {
      toast.error("Please select employees");
      return;
    }
    setOpenMassModal(true);
  };

  const handleApplyMassRoster = async () => {
    const { startdate, enddate, location_id } = formData;
    if (!startdate || !enddate || !location_id) {
      toast.error("Please fill all fields");
      return;
    }

    const parseDate = (dateStr) => {
      const [d, m, y] = dateStr.split("/");
      return new Date(y, m - 1, d);
    };

    const start = parseDate(startdate);
    const end = parseDate(enddate);

    if (end < start) {
      toast.error("End date cannot be before start date");
      return;
    }

    const dates = [];
    let current = new Date(start);
    while (current <= end) {
      dates.push(current.toLocaleDateString("en-GB"));
      current.setDate(current.getDate() + 1);
    }

    const rosterData = {};
    dates.forEach((d) => {
      rosterData[d] = shifts[d] || "";
    });

    if (Object.values(rosterData).some((v) => v === "")) {
      toast.error("Please select shifts for all dates");
      return;
    }

    try {
      setLoading(true);
      await Promise.all(
        selectedEmployees.map((empId) =>
          axios.post(
            `${API_BASE}/shift-planner/assign`,
            { employee_id: empId, location_id, roster: rosterData },
            { headers: getHeaders() }
          )
        )
      );
      toast.success("Roster assigned to selected employees");
      setOpenMassModal(false);
      setSelectedEmployees([]);
      setShifts({});
      setFormData({ startdate: "", enddate: "", location_id: "", location: "" });
    } catch (error) {
      console.error("Failed to assign roster:", error);
      toast.error("Failed to assign roster");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        {/* Top Controls */}
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
              <span className="text-sm xl:text-base text-gray-600">
                entries
              </span>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-center">
              <input
                placeholder="Search employee..."
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
          <table className="w-full text-[17px] ">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50">
                <th className="px-4 py-3 text-center font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={
                      currentemployee.length > 0 &&
                      currentemployee.every((emp) =>
                        selectedEmployees.includes(emp.id),
                      )
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmployees(currentemployee.map((x) => x.id));
                      } else {
                        setSelectedEmployees([]);
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 hidden sm:table-cell">
                  SL.NO
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 hidden md:table-cell">
                  Enrollment Id
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 hidden md:table-cell">
                  Designation
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : currentemployee.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    No Data Available
                  </td>
                </tr>
              ) : (
                currentemployee.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-blue-100/30 bg-white hover:bg-blue-50 transition even:bg-blue-50/50"
                  >
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(item.id)}
                        onChange={() => handleSelect(item.id)}
                      />
                    </td>

                    <td className="px-4 py-2 text-center hidden sm:table-cell">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 text-center">{item.full_name}</td>
                    <td className="px-4 py-2 text-center hidden md:table-cell">
                      {item.company_enrollment_id}
                    </td>
                    <td className="px-4 py-2 text-center  hidden md:table-cell">
                      {item.designation_name}
                    </td>
                    <td className="px-6 py-3 text-center flex justify-center mt-1">
                      <FaEye
                        onClick={() => {
                          setSelectedItem(item);
                          setopenModal(true);
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

        {/* Pagination Section */}
        <div className="p-6 border-t border-blue-100/30 flex flex-col sm:flex-row justify-between items-center gap-6">
          <span className="text-sm xl:text-base text-gray-600">
            Showing{" "}
            <span className="text-gray-900 font-semibold">
              {filteredemployee.length === 0 ? "0" : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="text-gray-900 font-semibold">
              {Math.min(endIndex, filteredemployee.length)}
            </span>{" "}
            of{" "}
            <span className="text-gray-900 font-semibold">
              {filteredemployee.length}
            </span>{" "}
            entries
          </span>

          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            >
              First
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
            >
              <GrPrevious />
            </button>
            <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-semibold min-w-[45px] text-center">
              {currentPage}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
            >
              <GrNext />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Last
            </button>
          </div>
        </div>

        {/* Mass Update */}
        <div className="flex justify-center mt-6">
          <button
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            onClick={handleMassUpdate}
          >
            Mass Update
          </button>
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
              <h2 className="text-xl font-bold text-gray-900">View Employee</h2>
              <button
                onClick={() => setopenModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-lg font-semibold">
                  {selectedItem.full_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedItem.full_name}
                  </h3>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Enrollment ID:</span>{" "}
                  {selectedItem.company_enrollment_id}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-medium">Designation:</span>{" "}
                  {selectedItem.designation_name}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {openMassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mass Shift Update</h2>
              <button onClick={() => setOpenMassModal(false)}><RxCross2 className="text-2xl" /></button>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Start Date</label>
                <input
                  value={formData.startdate}
                  onChange={(e) => setFormData({ ...formData, startdate: e.target.value })}
                  onClick={() => setshowstartSpinner(true)}
                  className="w-full border rounded-lg p-2"
                  placeholder="dd/mm/yyyy"
                />
                {showstartSpinner && (
                  <SpinnerDatePicker
                    value={formData.startdate}
                    onChange={(d) => setFormData({ ...formData, startdate: d })}
                    onClose={() => setshowstartSpinner(false)}
                  />
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">End Date</label>
                <input
                  value={formData.enddate}
                  onChange={(e) => setFormData({ ...formData, enddate: e.target.value })}
                  onClick={() => setshowendSpinner(true)}
                  className="w-full border rounded-lg p-2"
                  placeholder="dd/mm/yyyy"
                />
                {showendSpinner && (
                  <SpinnerDatePicker
                    value={formData.enddate}
                    onChange={(d) => setFormData({ ...formData, enddate: d })}
                    onClose={() => setshowendSpinner(false)}
                  />
                )}
              </div>
              <div>
                <SearchDropdown
                  label="Location"
                  name="location_id"
                  value={formData.location_id}
                  displayValue={formData.location}
                  options={locationOptions}
                  labelKey="name"
                  valueKey="id"
                  labelName="location"
                  formData={formData}
                  setFormData={setFormData}
                  inputStyle="w-full border rounded-lg p-2"
                  labelStyle="text-sm font-semibold text-gray-700 mb-1 block"
                />
              </div>
            </div>

            {formData.startdate && formData.enddate && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                {(() => {
                  const [sd, sm, sy] = formData.startdate.split("/");
                  const [ed, em, ey] = formData.enddate.split("/");
                  const start = new Date(sy, sm - 1, sd);
                  const end = new Date(ey, em - 1, ed);
                  const dates = [];
                  let curr = new Date(start);
                  while (curr <= end) {
                    dates.push(new Date(curr));
                    curr.setDate(curr.getDate() + 1);
                  }
                  return dates.map((d) => {
                    const k = d.toLocaleDateString("en-GB");
                    return (
                      <div key={k} className="p-2 border rounded-lg bg-gray-50">
                        <p className="text-xs font-bold text-blue-600 mb-1">{k}</p>
                        <select
                          className="w-full text-xs p-1 border rounded"
                          value={shifts[k] || ""}
                          onChange={(e) => setShifts({ ...shifts, [k]: e.target.value })}
                        >
                          <option value="">Shift</option>
                          {shiftMasters.map((s) => (
                            <option key={s.id} value={s.id}>{s.shift_name}</option>
                          ))}
                          <option value="Off">Off</option>
                        </select>
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            <div className="flex justify-end gap-4 mt-8">
              <button onClick={() => setOpenMassModal(false)} className="px-6 py-2 border rounded-lg font-semibold">Cancel</button>
              <button onClick={handleApplyMassRoster} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold">Apply to {selectedEmployees.length} Employees</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeView;

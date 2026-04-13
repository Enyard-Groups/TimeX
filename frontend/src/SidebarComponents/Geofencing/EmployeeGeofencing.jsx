import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";
import { FaAngleRight, FaEye } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";

const EmployeeGeofencing = () => {
  const API_BASE = "http://localhost:3000/api";

  const [employee, setEmployee] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]); // Changed to array
  const [showSingleLocation, setShowSingleLocation] = useState(false);
  const [showMultipleLocation, setShowMultipleLocation] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, locRes] = await Promise.all([
        axios.get(`${API_BASE}/master/employee-geofencing`, {
          headers: getHeaders(),
        }),
        axios.get(`${API_BASE}/master/geofencing`, {
          headers: getHeaders(),
        }),
      ]);

      const empData = Array.isArray(empRes.data) ? empRes.data : [];
      // Group by employee to handle multiple geofencing names
      const grouped = empData.reduce((acc, curr) => {
        const existing = acc.find((e) => e.id === curr.employee_id);
        if (existing) {
          if (curr.geofencing_name) {
            existing.location = existing.location
              ? `${existing.location}, ${curr.geofencing_name}`
              : curr.geofencing_name;
          }
        } else {
          acc.push({
            id: curr.employee_id,
            enroll_id: curr.device_enrollment_id || curr.company_enrollment_id,
            name: curr.full_name,
            department: curr.department_name || "",
            designation: curr.designation_name || "",
            location: curr.geofencing_name || "",
          });
        }
        return acc;
      }, []);

      setEmployee(grouped);
      setLocations(Array.isArray(locRes.data) ? locRes.data : []);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Unable to load employee geofencing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredemployee = employee.filter(
    (x) =>
      x.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.department.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.designation.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm";

  const labelStyle = "text-sm font-semibold text-gray-700 mb-2 block";

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;

  const currentemployee = filteredemployee.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredemployee.length / entriesPerPage),
  );

  const applyLocation = async () => {
    if (selectedLocations.length === 0) {
      toast.error("Please select at least one location");
      return;
    }

    if (selectedEmployees.length === 0) {
      toast.error("Please select employees");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/master/employee-geofencing`,
        {
          employeeIds: selectedEmployees,
          geofencingIds: selectedLocations,
        },
        { headers: getHeaders() },
      );

      toast.success("Location assigned successfully");
      fetchData(); // Refresh the list
      setSelectedEmployees([]);
      setSelectedLocations([]);
    } catch (error) {
      console.error("Failed to assign location", error);
      toast.error(error.response?.data?.message || "Unable to assign location");
    }
  };

  const handleSelect = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCopy = () => {
    const header = [
      "Enrollment ID",
      "Employee Name",
      "Department Name",
      "Designation Name",
      "Assigned Location",
    ].join("\t");

    const rows = filteredemployee
      .map((item) => {
        return [
          item.enroll_id || item.id,
          item.name,
          item.department,
          item.designation,
          item.location,
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredemployee.map((item) => ({
      EnrollmentID: item.enroll_id || item.id,
      EmployeeName: item.name,
      DepartmentName: item.department,
      DesignationName: item.designation,
      AssignedLocation: item.location,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Details");

    XLSX.writeFile(workbook, "Employee Details.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "EnrollmentID",
      "Employee Name",
      "Department Name",
      "Designation Name",
      "Assigned Location",
    ];

    const tableRows = [];

    filteredemployee.forEach((item) => {
      const row = [
        item.enroll_id || item.id,
        item.name,
        item.department,
        item.designation,
        item.location,
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("Employee Details.pdf");
  };

  return (
    <div className="mb-6">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center gap-2 text-lg xl:text-xl font-semibold text-gray-900">
            <FaAngleRight className="text-blue-500" />
            <span className="text-gray-500">Geofencing</span>
            <FaAngleRight className="text-blue-500" />
            <span className="text-blue-600">Employee Geofencing</span>
          </h1>
        </div>

        {/* Assign Location Card */}
        <div className="bg-gradient-to-br from-white to-slate-50 border border-blue-100/50 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 min-h-[180px]">
          {/* Radio */}
          <div className="flex flex-col gap-4">
            <label className="flex items-center xl:text-lg gap-3 text-gray-700">
              <input
                type="radio"
                name="mode"
                onClick={() => {
                  setShowSingleLocation(true);
                  setShowMultipleLocation(false);
                }}
                className="accent-blue-500 size-lg"
              />
              Single
            </label>

            <label className="flex items-center xl:text-lg gap-3 text-gray-700">
              <input
                type="radio"
                name="mode"
                onClick={() => {
                  setShowMultipleLocation(true);
                  setShowSingleLocation(false);
                }}
                className="accent-blue-500 size-lg"
              />
              Multiple
            </label>
          </div>

          {/* Dropdowns */}
          {showSingleLocation && (
            <select
              value={selectedLocations[0] || ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedLocations(val ? [Number(val)] : []);
              }}
              className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg w-56 focus:ring-2 xl:text-lg focus:ring-blue-500/60"
            >
              <option value="">Select Location</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          )}

          {showMultipleLocation && (
            <select
              multiple
              size={3}
              value={selectedLocations}
              onChange={(e) =>
                setSelectedLocations(
                  Array.from(e.target.selectedOptions, (option) =>
                    Number(option.value),
                  ),
                )
              }
              className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg w-56 focus:ring-2 xl:text-lg focus:ring-blue-500/60"
              style={{ scrollbarWidth: "none" }}
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          )}

          {/* Button */}
          <button
            onClick={applyLocation}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition xl:text-lg"
          >
            + Assign Location
          </button>
        </div>

        {/* Table Card */}
        <div className="mt-6 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-blue-100/50 shadow-xl p-6">
          {/* Top Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm xl:text-base text-gray-600">
                Display
              </label>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/60"
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
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-200 p-2 rounded-lg text-blue-600"
                >
                  <GoCopy className="text-lg" />
                </button>
                <button
                  onClick={handleExcel}
                  className="bg-green-50 hover:bg-green-100 border border-green-200 p-2 rounded-lg text-green-600"
                >
                  <FaFileExcel className="text-lg" />
                </button>
                <button
                  onClick={handlePDF}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 p-2 rounded-lg text-red-600"
                >
                  <FaFilePdf className="text-lg" />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            className="overflow-x-auto min-h-[350px]"
            style={{ scrollbarWidth: "none" }}
          >
            <table className="w-full text-[17px] text-gray-700">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50 text-gray-600">
                  <th className="p-3">
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
                          setSelectedEmployees(
                            currentemployee.map((x) => x.id),
                          );
                        } else {
                          setSelectedEmployees([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700  hidden sm:table-cell">
                    Enrollment ID
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">
                    Employee Name
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden lg:table-cell">
                    Department
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden md:table-cell">
                    Designation
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
                      colSpan="7"
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
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="text-4xl opacity-40">📍</div>
                        <p className="text-gray-500 text-base font-medium">
                          No Employee Geofencing Data
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentemployee.map((item) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-blue-100/30 hover:bg-blue-50 transition"
                    >
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(item.id)}
                          onChange={() => handleSelect(item.id)}
                        />
                      </td>

                      <td className="px-6 py-3 hidden sm:table-cell">
                        {item.enroll_id}
                      </td>
                      <td className="px-6 py-3 font-medium">{item.name}</td>
                      <td className="px-6 py-3 hidden lg:table-cell">
                        {item.department}
                      </td>
                      <td className="px-6 py-3 hidden md:table-cell">
                        {item.designation}
                      </td>
                      <td className="px-6 py-3 hidden lg:table-cell">
                        {item.location}
                      </td>
                      <td className="px-6 py-3 text-center flex justify-center mt-1">
                        <FaEye
                          onClick={() => {
                            setSelectedItem(item);
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
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className={labelStyle}>Enrollment ID</h3>
                <p className={inputStyle}> {selectedItem.enroll_id}</p>
              </div>
              <div>
                <h3 className={labelStyle}>Employee Name</h3>
                <p className={inputStyle}>{selectedItem.name}</p>
              </div>
              <div>
                <h3 className={labelStyle}>Department</h3>
                <p className={inputStyle}>{selectedItem.department}</p>
              </div>
              <div>
                <h3 className={labelStyle}>Designation</h3>
                <p className={inputStyle}>{selectedItem.designation}</p>
              </div>
              <div>
                <h3 className={labelStyle}>Assigned Location(s)</h3>
                <p className={inputStyle}>{selectedItem.location}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeGeofencing;

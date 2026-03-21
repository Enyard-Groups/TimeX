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
import { FaAngleRight } from "react-icons/fa6";

const EmployeeGeofencing = () => {
  const API_BASE = "http://localhost:3000/api";

  const [employee, setEmployee] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]); // Changed to array
  const [showSingleLocation, setShowSingleLocation] = useState(false);
  const [showMultipleLocation, setShowMultipleLocation] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchData = async () => {
    try {
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
        { headers: getHeaders() }
      );

      toast.success("Location assigned successfully");
      fetchData(); // Refresh the list
      setSelectedEmployees([]);
      setSelectedLocations([]);
    } catch (error) {
      console.error("Failed to assign location", error);
      toast.error(
        error.response?.data?.message || "Unable to assign location"
      );
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
    <div className="mb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
          <FaAngleRight />
          Geofencing
          <FaAngleRight />
          Employee Geofencing
        </h1>
      </div>

      <div className="border rounded-lg mt-6 p-4 flex flex-col md:flex-row items-center justify-between ">
        <div className="flex flex-col p-8 gap-2">
          <label className="flex gap-3">
            <input
              type="radio"
              name="mode"
              onClick={() => {
                (setShowSingleLocation(true), setShowMultipleLocation(false));
              }}
            />
            Single
          </label>

          <label className="flex gap-3">
            <input
              type="radio"
              name="mode"
              onClick={() => {
                (setShowMultipleLocation(true), setShowSingleLocation(false));
              }}
            />
            Multiple
          </label>
        </div>

        {showSingleLocation && (
          <select
            value={selectedLocations[0] || ""}
            onChange={(e) => setSelectedLocations([Number(e.target.value)])}
            className="shadow-md ml-4 rounded-md p-2 w-40 md:w-70"
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
                  Number(option.value)
                )
              )
            }
            className="shadow-md ml-4 rounded-md p-2 w-40 md:w-70"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={applyLocation}
          className="px-4 py-2 m-4 border rounded-md text-[oklch(0.645_0.246_16.439)] border-[oklch(0.645_0.246_16.439)]"
        >
          + Assign Location
        </button>
      </div>

      <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.8_0.001_106.424)] p-6 ">
        {/* Top Controls */}
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

          <div className="flex flex-wrap gap-2 items-center justify-center">
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

        <div
          className="overflow-x-auto min-h-[250px]"
          style={{ scrollbarWidth: "none" }}
        >
          <table className="w-full text-lg border-collapse">
            <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
              <tr>
                <th className="p-2 font-semibold">
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

                <th className="p-2 font-semibold hidden sm:table-cell">Enrollment ID</th>
                <th className="p-2 font-semibold ">Employee Name</th>
                <th className="p-2 font-semibold  hidden lg:table-cell">Department Name</th>
                <th className="p-2 font-semibold hidden md:table-cell ">Designation Name</th>
                <th className="p-2 font-semibold  hidden lg:table-cell">Assigned Location</th>
              </tr>
            </thead>

            <tbody>
              {currentemployee.length === 0 ? (
                <tr>
                  <td colSpan="6" className="lg:text-center p-10">
                    No Records Found
                  </td>
                </tr>
              ) : (
                currentemployee.map((item) => (
                  <tr
                    key={item.id}
                    className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                  >
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(item.id)}
                        onChange={() => handleSelect(item.id)}
                      />
                    </td>

                    <td className="p-2 hidden sm:table-cell">{item.enroll_id}</td>
                    <td className="p-2 ">{item.name}</td>
                    <td className="p-2 hidden lg:table-cell ">{item.department}</td>
                    <td className="p-2 hidden md:table-cell">{item.designation}</td>
                    <td className="p-2 hidden lg:table-cell ">{item.location}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center md:justify-between items-center mt-4 text-sm flex-wrap gap-6">
          <span>
            Showing {filteredemployee.length === 0 ? "0" : startIndex + 1} to{" "}
            {Math.min(endIndex, filteredemployee.length)} of{" "}
            {filteredemployee.length} entries
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

export default EmployeeGeofencing;

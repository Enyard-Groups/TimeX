import React, { useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const LeaveSummary = () => {
  const [employeeFilter, setEmployeeFilter] = useState("");

  const [openEmployeeModal, setopenEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [leave] = useState([
    {
      employee: "Employee 1",
      leaves: [
        {
          id: 1,
          leaveType: "Sick Leave",
          year: new Date().getFullYear(),
          maximumLeaves: "30",
          totalCarryForward: 0,
          cfRemaining: 0,
          totalComboOff: 0,
          coRemaining: 0,
          availed: 0,
          balance: "30",
        },
        {
          id: 2,
          leaveType: "Annual Leave",
          year: new Date().getFullYear(),
          maximumLeaves: 30,
          totalCarryForward: 0,
          cfRemaining: 0,
          totalComboOff: 0,
          coRemaining: 0,
          availed: 5,
          balance: 25,
        },
        {
          id: 3,
          leaveType: "Paternity Leave",
          year: new Date().getFullYear(),
          maximumLeaves: 5,
          totalCarryForward: 0,
          cfRemaining: 0,
          totalComboOff: 0,
          coRemaining: 0,
          availed: 1,
          balance: 4,
        },
      ],
    },
    {
      employee: "Employee 2",
      leaves: [
        {
          id: 4,
          leaveType: "Sick Leave",
          year: new Date().getFullYear(),
          maximumLeaves: 20,
          totalCarryForward: 0,
          cfRemaining: 0,
          totalComboOff: 0,
          coRemaining: 0,
          availed: 2,
          balance: 18,
        },
        {
          id: 5,
          leaveType: "Annual Leave",
          year: new Date().getFullYear(),
          maximumLeaves: 25,
          totalCarryForward: 0,
          cfRemaining: 0,
          totalComboOff: 0,
          coRemaining: 0,
          availed: 3,
          balance: 22,
        },
        {
          id: 6,
          leaveType: "Paternity Leave",
          year: new Date().getFullYear(),
          maximumLeaves: 5,
          totalCarryForward: 0,
          cfRemaining: 0,
          totalComboOff: 0,
          coRemaining: 0,
          availed: 0,
          balance: 5,
        },
      ],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLeave = leave.filter((x) => {
    if (!employeeFilter) return false;

    const matchSearch = x.employee
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchEmployee = x.employee === employeeFilter;

    return matchSearch && matchEmployee;
  });

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentLeave = filteredLeave.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLeave.length / entriesPerPage),
  );

  const handleCopy = () => {
    const header = [
      "Employee",
      "Leave Type",
      "From Date",
      "To Date",
      "Resume On",
      "Reason",
      "Created Date",
    ].join("\t");

    const rows = filteredLeave
      .map((item) => {
        return [
          item.employee,
          item.leaveType,
          item.fromDate,
          item.toDate,
          item.resumeOn,
          item.reason || "NIL",
          new Date(item.createdDate).toLocaleDateString(),
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredLeave.map((item) => ({
      Employee: item.employee,
      LeaveType: item.leaveType,
      FromDate: item.fromDate,
      ToDate: item.toDate,
      ResumeOn: item.resumeOn,
      Reason: item.reason || "NIL",
      CreatedDate: new Date(item.createdDate).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "LeaveRequest");

    XLSX.writeFile(workbook, "LeaveRequestData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "Employee",
      "Leave Type",
      "From Date",
      "To Date",
      "Resume On",
      "Reason",
      "Created Date",
    ];

    const tableRows = [];

    filteredLeave.forEach((item) => {
      const row = [
        item.employee,
        item.leaveType,
        item.fromDate,
        item.toDate,
        item.resumeOn,
        item.reason || "NIL",
        new Date(item.createdDate).toLocaleDateString(),
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("LeaveRequestData.pdf");
  };

  return (
    <>
      <div className="mb-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
            <FaAngleRight />
            Requests
            <FaAngleRight />
            Leave Summary
          </h1>
        </div>

        <div className="mt-6 bg-white flex justify-between items-center shadow-xl rounded-xl border border-[oklch(0.8_0.001_106.424)] p-6 sm:px-20">
          <h1 className="font-medium">Employee</h1>

          <div className="w-60 relative">
            {/* Dropdown header */}
            <div
              onClick={() => setopenEmployeeModal(!openEmployeeModal)}
              className="flex items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded border border-gray-400"
            >
              <span className="font-medium">
                {selectedEmployee || "Select Employee"}
              </span>

              {openEmployeeModal ? (
                <MdKeyboardArrowUp className="text-xl" />
              ) : (
                <MdKeyboardArrowDown className="text-xl" />
              )}
            </div>

            {/* Dropdown menu */}
            {openEmployeeModal && (
              <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded mt-1 z-40  border border-gray-400">
                <input
                  type="text"
                  placeholder="Search Employee..."
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-3 py-2 border-b outline-none"
                />

                <div
                  className="max-h-30 overflow-y-auto"
                  style={{ scrollbarWidth: "none" }}
                >
                  {[
                    "Employee 1",
                    "Employee 2",
                    "Employee 3",
                    "Employee 4",
                    "Employee 5",
                  ]
                    .filter((emp) =>
                      emp
                        .toLowerCase()
                        .includes(selectedEmployee.toLowerCase()),
                    )
                    .map((emp) => (
                      <div
                        key={emp}
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setopenEmployeeModal(false);
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        {emp}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <button
            disabled={!selectedEmployee}
            onClick={() => {
              setEmployeeFilter(selectedEmployee);
              setCurrentPage(1);
              setSelectedEmployee("");
            }}
            className="px-6 py-1 rounded-full shadow disabled:opacity-50"
          >
            Search
          </button>
        </div>

        {employeeFilter && (
          <div className="mt-6 bg-white shadow-xl rounded-xl  border border-[oklch(0.8_0.001_106.424)] p-6">
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
                  className=" border rounded-full px-1  border-[oklch(0.645_0.246_16.439)]"
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
            <div
              className="overflow-x-auto min-h-[250px]"
              style={{ scrollbarWidth: "none" }}
            >
              <table className="w-full text-lg border-collapse">
                <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
                  <tr>
                    <th className="py-2 px-6 font-semibold">Employee</th>
                    <th className="py-2 px-6 font-semibold whitespace-nowrap">
                      Leave Type
                    </th>
                    <th className="py-2 px-6 font-semibold">Year</th>
                    <th className="py-2 px-6 font-semibold whitespace-nowrap">
                      Maximum Leaves
                    </th>
                    <th className="py-2 px-6 font-semibold whitespace-nowrap">
                      Carry Forward
                    </th>
                    <th className="py-2 px-6 font-semibold whitespace-nowrap">
                      CF Remaining
                    </th>
                    <th className="py-2 px-6 font-semibold whitespace-nowrap">
                      Comp Off
                    </th>
                    <th className="py-2 px-6 font-semibold whitespace-nowrap">
                      CO Remaining
                    </th>
                    <th className="py-2 px-6 font-semibold">Availed</th>
                    <th className="py-2 px-6 font-semibold">Balance</th>
                  </tr>
                </thead>

                <tbody>
                  {currentLeave.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center p-10">
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    currentLeave.map((emp) =>
                      emp.leaves.map((item) => (
                        <tr
                          key={item.id}
                          className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                        >
                          <td className="py-2 px-6">{emp.employee}</td>
                          <td className="py-2 px-6 whitespace-nowrap">
                            {item.leaveType}
                          </td>
                          <td className="py-2 px-6">{item.year}</td>
                          <td className="py-2 px-6">{item.maximumLeaves}</td>
                          <td className="py-2 px-6">
                            {item.totalCarryForward}
                          </td>
                          <td className="py-2 px-6">{item.cfRemaining}</td>
                          <td className="py-2 px-6">{item.totalComboOff}</td>
                          <td className="py-2 px-6">{item.coRemaining}</td>
                          <td className="py-2 px-6">{item.availed}</td>
                          <td className="py-2 px-6">{item.balance}</td>
                        </tr>
                      )),
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center md:justify-between items-center mt-4 text-sm flex-wrap gap-6">
              <span>
                Showing {filteredLeave.length === 0 ? "0" : startIndex + 1} to{" "}
                {Math.min(endIndex, filteredLeave.length)} of{" "}
                {filteredLeave.length} entries
              </span>

              <div className="flex flex-row space-x-1">
                <button
                  disabled={currentPage == 1}
                  onClick={() => setCurrentPage(1)}
                  className=" p-2 bg-gray-200 rounded-full disabled:opacity-50"
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

                <div className="p-3 px-4 shadow rounded-full">
                  {currentPage}
                </div>

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
                  className=" p-2 bg-gray-200 rounded-full disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LeaveSummary;

import React, { useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";

const EmployeeView = () => {
  const [employee] = useState([
    { name: "Sharma", id: "000971001", role: "Senior Banking Officer" },
    { name: "Drishti", id: "000971004", role: "Banking Officer" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const filteredemployee = employee.filter(
    (x) =>
      x.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.role.toLowerCase().startsWith(searchTerm.toLowerCase()),
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
        return [index + 1, item.name, item.id, item.role].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredemployee.map((item, index) => ({
      "SL.NO": index + 1,
      Name: item.name,
      EnrollmentID: item.id,
      Designation: item.role,
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
      const row = [index + 1, item.name, item.id, item.role];

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

    const selectedData = employee.filter((emp) =>
      selectedEmployees.includes(emp.id),
    );

    console.log("Mass Update Employees:", selectedData);

    toast.success(`${selectedEmployees.length} employees selected for update`);
  };

  return (
    <div>
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

      <div className="overflow-x-auto min-h-[250px]">
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
              <th className="p-2 font-semibold">SL.NO</th>
              <th className="p-2 font-semibold">Name</th>
              <th className="p-2 font-semibold">Enrollment Id</th>
              <th className="p-2 font-semibold">Designation</th>
            </tr>
          </thead>
          <tbody>
            {currentemployee.length === 0 ? (
              <tr>
                <td colSpan="14" className="lg:text-center p-10 ">
                  No Data Available
                </td>
              </tr>
            ) : (
              currentemployee.map((item, index) => (
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

                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.id}</td>
                  <td className="p-2">{item.role}</td>
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

      <div className="flex justify-center mt-8">
        <button
          className="px-6 py-2 rounded-lg text-white bg-[oklch(0.645_0.246_16.439)]"
          onClick={handleMassUpdate}
        >
          Mass Update
        </button>
      </div>
    </div>
  );
};

export default EmployeeView;

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

const EmployeeView = () => {
  const [employee] = useState([
    { name: "Sharma", id: "000971001", role: "Senior Banking Officer" },
    { name: "Drishti", id: "000971004", role: "Banking Officer" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [openModal, setopenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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
    <>
      <div>
        {/* Top Controls */}
        <div className="p-6 border-b border-blue-100/30">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">
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
              <span className="text-sm text-gray-600">entries</span>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-center">
              <input
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
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
        <div className="overflow-x-auto min-h-[250px]">
          <table className="w-full text-[16px]">
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
              {currentemployee.length === 0 ? (
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
                    <td className="px-4 py-2 text-center">{item.name}</td>
                    <td className="px-4 py-2 text-center hidden md:table-cell">
                      {item.id}
                    </td>
                    <td className="px-4 py-2 text-center  hidden md:table-cell">
                      {item.role}
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

        {/* Pagination */}
        <div className="p-6 border-t border-blue-100/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sm text-gray-600">
            Showing {filteredemployee.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(endIndex, filteredemployee.length)} of{" "}
            {filteredemployee.length}
          </span>

          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg"
            >
              First
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="bg-blue-50 border border-blue-200 p-2 rounded-lg"
            >
              <GrPrevious />
            </button>

            <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg">
              {currentPage}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-blue-50 border border-blue-200 p-2 rounded-lg"
            >
              <GrNext />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
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
                  {selectedItem.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedItem.name}
                  </h3>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Enrollment ID:</span>{" "}
                  {selectedItem.id}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-medium">Designation:</span>{" "}
                  {selectedItem.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeView;

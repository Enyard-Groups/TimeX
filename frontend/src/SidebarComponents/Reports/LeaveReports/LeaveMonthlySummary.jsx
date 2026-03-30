/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { GrPrevious, GrNext } from "react-icons/gr";
import SearchDropdown from "../../SearchDropdown";
import { FaEye } from "react-icons/fa";

const LeaveMonthlySummary = () => {
  const [openModal, setOpenModal] = useState(false);
  const [leaveMonthlySummary, setLeaveMonthlySummary] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [modalOpenSelectedItem, setModalOpenSelectedItem] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("leaveRequests")) || [];
    setLeaveMonthlySummary(stored);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const parseDate = (dateStr) => {
    if (!dateStr) return null;

    const [day, month, year] = dateStr.split("/");
    return new Date(year, month - 1, day);
  };

  const [formData, setFormData] = useState({
    employee: "",
    monthyear: "",
  });

  const inputStyle =
    "w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 text-lg py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filteredReport = leaveMonthlySummary.filter((emp) => {
    if (!formData.employee && !formData.monthyear) return true;

    // Employee filter
    const matchEmployee =
      !formData.employee || emp.employee === formData.employee;

    // Month-Year filter
    let matchMonthYear = true;

    if (formData.monthyear) {
      const [year, month] = formData.monthyear.split("-");

      const from = parseDate(emp.fromDate);

      if (!from) return false;

      const empMonth = from.getMonth() + 1; // 0-based
      const empYear = from.getFullYear();

      matchMonthYear = empYear === Number(year) && empMonth === Number(month);
    }

    return matchEmployee && matchMonthYear;
  });

  const filteredleaveMonthlySummary = filteredReport.filter((x) =>
    x.employee.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentleaveMonthlySummary = filteredleaveMonthlySummary.slice(
    startIndex,
    endIndex,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredleaveMonthlySummary.length / entriesPerPage),
  );

  const selectedItem = leaveMonthlySummary.find(
    (item) => item.id === selectedId,
  );

  return (
    <>
      <div className="mb-6">
        {/* Header */}
        <div className="sm:flex sm:justify-between">
          <h1 className="flex items-center gap-2 text-[17px] font-semibold flex-wrap ml-10 lg:ml-0 mb-4 lg:mb-0">
            <FaAngleRight />
            Reports
            <FaAngleRight />
            Leave
            <FaAngleRight />
            Leave Monthly Summary
          </h1>
        </div>

        <div
          className="flex items-center justify-center p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-white rounded-xl shadow-sm w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <SearchDropdown
                  label="Employee"
                  name="employee"
                  value={formData.employee}
                  options={[
                    "Employee 1",
                    "Employee 2",
                    "Employee 3",
                    "Employee 4",
                    "Employee 5",
                  ]}
                  formData={formData}
                  setFormData={setFormData}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Month</label>

                <input
                  type="month"
                  name="monthyear"
                  value={formData.monthyear}
                  onChange={(e) =>
                    setFormData({ ...formData, monthyear: e.target.value })
                  }
                  className={inputStyle}
                />
              </div>
            </div>

            {/* Save */}

            <div className="flex justify-end mt-10">
              <button
                onClick={() => {
                  setOpenModal(true);
                }}
                className="bg-[oklch(0.645_0.246_16.439)] text-white px-8 py-2 rounded-md"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {openModal && (
          <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.8_0.001_106.424)] p-6 ">
            {/* Close */}
            <div className="flex justify-end">
              <RxCross2
                onClick={() => setOpenModal(false)}
                className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer"
              />
            </div>

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
                  className=" shadow-sm px-3 py-1 rounded-full  focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]"
                />
              </div>
            </div>

            {/* Table */}
            <div
              className="overflow-x-auto min-h-[250px]"
              style={{ scrollbarWidth: "none" }}
            >
              <h1 className="text-[oklch(0.577_0.245_27.325)] text-xl mb-4 text-center">
                Leave Monthly Summary
              </h1>
              <table className="w-full text-lg border-collapse">
                <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
                  <tr>
                    <th className="p-2 font-semibold">Name</th>

                    <th className="p-2 font-semibold whitespace-nowrap hidden md:table-cell">
                      Leave Type
                    </th>

                    <th className="p-2 font-semibold whitespace-nowrap hidden lg:table-cell">
                      Month
                    </th>

                    <th className="p-2 font-semibold whitespace-nowrap hidden lg:table-cell">
                      Year
                    </th>

                    <th className="p-2 font-semibold whitespace-nowrap hidden md:table-cell">
                      Number Of date
                    </th>

                    <th className="p-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentleaveMonthlySummary.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="sm:text-center p-10">
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    currentleaveMonthlySummary.map((item) => {
                      const date = parseDate(item.fromDate);
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0",
                      );
                      const year = date.getFullYear();
                      const numberofdays = String(item.numberOfDays).padStart(
                        2,
                        "0",
                      );

                      return (
                        <tr
                          key={item.id}
                          className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                        >
                          <td className="p-2  whitespace-nowrap">
                            {item.employee}
                          </td>

                          <td className="p-2 hidden md:table-cell">
                            {item.leaveType}
                          </td>

                          <td className="p-2 hidden lg:table-cell">{month}</td>

                          <td className="p-2 hidden lg:table-cell">{year}</td>

                          <td className="p-2 hidden md:table-cell">
                            {numberofdays}
                          </td>

                          <td className="p-2 ">
                            <div className="flex gap-2 justify-center">
                              <FaEye
                                onClick={() => {
                                  setSelectedId(item.id);
                                  setModalOpenSelectedItem(true);
                                }}
                                className="text-blue-500 cursor-pointer text-lg mt-2 mr-2"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center md:justify-between items-center mt-4 text-sm flex-wrap gap-6">
              <span>
                Showing{" "}
                {filteredleaveMonthlySummary.length === 0
                  ? "0"
                  : startIndex + 1}{" "}
                to {Math.min(endIndex, filteredleaveMonthlySummary.length)} of{" "}
                {filteredleaveMonthlySummary.length} entries
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
                  className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}

        {modalOpenSelectedItem && selectedItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div
              className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {selectedItem.employee} Details
                </h2>

                <RxCross2
                  onClick={() => (
                    setModalOpenSelectedItem(false),
                    setSelectedId(null)
                  )}
                  className="cursor-pointer text-xl text-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-lg">
                <div>
                  <p className={labelStyle}>Name</p>
                  <p className={inputStyle}>{selectedItem.employee}</p>
                </div>

                <div>
                  <p className={labelStyle}>From Date</p>
                  <p className={inputStyle}> {selectedItem.fromDate}</p>
                </div>

                <div>
                  <p className={labelStyle}>To Date</p>
                  <p className={inputStyle}> {selectedItem.toDate}</p>
                </div>

                <div>
                  <p className={labelStyle}>Number of Days</p>
                  <p className={inputStyle}>{selectedItem.numberOfDays}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LeaveMonthlySummary;

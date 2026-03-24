/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { GrPrevious, GrNext } from "react-icons/gr";
import SearchDropdown from "../SearchDropdown";
import SpinnerDatePicker from "../SpinnerDatePicker";
import { FaEye } from "react-icons/fa";

const AllTransactionReport = () => {
  const [openModal, setOpenModal] = useState(false);
  const [allTransactionReport, setAllTransactionReport] = useState([]);

  const [selectedId, setSelectedId] = useState(null);
  const [modalOpenSelectedItem, setModalOpenSelectedItem] = useState(false);

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("mannualEntryRequests")) || [];
    setAllTransactionReport(stored);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPunchDateSpinner, setShowPunchDateSpinner] = useState(false);
  const [showToPunchDateSpinner, setShowToPunchDateSpinner] = useState(false);

  const parseDate = (dateStr) => {
    if (!dateStr) return null;

    const [day, month, year] = dateStr.split("/");
    return new Date(year, month - 1, day);
  };

  const getTimeDiff = (inTime, outTime) => {
    const [ih, im, is] = inTime.split(":").map(Number);
    const [oh, om, os] = outTime.split(":").map(Number);

    const inSeconds = ih * 3600 + im * 60 + is;
    const outSeconds = oh * 3600 + om * 60 + os;

    const diff = outSeconds - inSeconds;

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const [formData, setFormData] = useState({
    employeeCategory: "",
    company: "",
    location: "",
    department: "",
    employee: "",
    fromPunchDate: "",
    toPunchDate: "",
  });

  const inputStyle =
    "w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 text-lg py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filteredReport = allTransactionReport.filter((emp) => {
    const punchDate = new Date(emp.createdDate);
    const fromDate = parseDate(formData.fromPunchDate);
    const toDate = parseDate(formData.toPunchDate);

    if (toDate) {
      toDate.setHours(23, 59, 59, 999);
    }

    return (
      (!formData.company || emp.company === formData.company) &&
      (!formData.employeeCategory ||
        formData.employeeCategory === "All Category" ||
        emp.employeeCategory === formData.employeeCategory) &&
      (!formData.location || emp.location === formData.location) &&
      (!formData.department || emp.department === formData.department) &&
      (!formData.employee ||
        formData.employee === "All" ||
        emp.employee === formData.employee) &&
      (!fromDate || punchDate >= fromDate) &&
      (!toDate || punchDate <= toDate)
    );
  });

  const filteredallTransactionReport = filteredReport.filter(
    (x) =>
      x.company.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.employeeCategory.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.location.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentallTransactionReport = filteredallTransactionReport.slice(
    startIndex,
    endIndex,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredallTransactionReport.length / entriesPerPage),
  );

  const selectedItem = allTransactionReport.find(
    (item) => item.id === selectedId,
  );

  return (
    <>
      <div className="mb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
            <FaAngleRight />
            Reports
            <FaAngleRight />
            All Transaction Report
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <SearchDropdown
                  label="Company"
                  name="company"
                  value={formData.company}
                  options={["Company 1", "Company 2"]}
                  formData={formData}
                  setFormData={setFormData}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              <div>
                <SearchDropdown
                  label="Employee Category"
                  name="employeeCategory"
                  value={formData.employeeCategory}
                  options={[
                    "All Category",
                    "Full Time Equivalent",
                    "Contingent",
                    "Freelence",
                    "Contract",
                    "Permanent",
                  ]}
                  formData={formData}
                  setFormData={setFormData}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              <div>
                <SearchDropdown
                  label="Location"
                  name="location"
                  value={formData.location}
                  options={["Head Office", "Location 2"]}
                  formData={formData}
                  setFormData={setFormData}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              <div>
                <SearchDropdown
                  label="Designation"
                  name="department"
                  value={formData.department}
                  options={[
                    "Regional Sales Support Manager",
                    "Operations Support Officer",
                    "Finance Assistant",
                    "Trade Finance Specialist",
                    "Banking Operations Officer",
                    "Sales Support Officer",
                    "Banking Operations Officer",
                    "Project Manager",
                    "Administrative Assistant",
                    "Sales Officer",
                    "Banking Officer",
                    "Sales Manager",
                    "Senior Banking Officer",
                    "Client Service Manager",
                    "Senior Director – Banking Operations",
                    "Relationship Officer",
                    "Accountant",
                    "Director – Sales Excellence",
                    "Service Sales Support Officer",
                    "HR Manager",
                    "Sales & Logistics Officer",
                    "Operation Officer",
                  ]}
                  formData={formData}
                  setFormData={setFormData}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>From Punch Date</label>
                <input
                  name="fromPunchDate"
                  value={formData.fromPunchDate}
                  onClick={() => {
                    setShowPunchDateSpinner(true);
                  }}
                  placeholder="dd/mm/yyyy"
                  className={inputStyle}
                />

                {showPunchDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.fromPunchDate}
                    onChange={(date) =>
                      setFormData({ ...formData, fromPunchDate: date })
                    }
                    onClose={() => setShowPunchDateSpinner(false)}
                  />
                )}
              </div>

              <div>
                <label className={labelStyle}>To Punch Date</label>
                <input
                  name="toPunchDate"
                  value={formData.toPunchDate}
                  onClick={() => {
                    setShowToPunchDateSpinner(true);
                  }}
                  placeholder="dd/mm/yyyy"
                  className={inputStyle}
                />

                {showToPunchDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.toPunchDate}
                    onChange={(date) =>
                      setFormData({ ...formData, toPunchDate: date })
                    }
                    onClose={() => setShowToPunchDateSpinner(false)}
                  />
                )}
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
                All Transaction Report
              </h1>
              <table className="w-full text-lg border-collapse">
                <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
                  <tr>
                    <th className="p-2 font-semibold">Name</th>
                    <th className="p-2 font-semibold  hidden sm:table-cell">
                      SL.NO
                    </th>
                    <th className="p-2 font-semibold  hidden md:table-cell">
                      Employee Category
                    </th>
                    <th className="p-2 font-semibold hidden xl:table-cell">
                      Designation
                    </th>

                    <th className="p-2 font-semibold whitespace-nowrap hidden md:table-cell">
                      Date
                    </th>
                    <th className="p-2 font-semibold whitespace-nowrap hidden xl:table-cell">
                      Day
                    </th>
                    <th className="p-2 font-semibold whitespace-nowrap hidden xl:table-cell">
                      Check in
                    </th>
                    <th className="p-2 font-semibold whitespace-nowrap hidden xl:table-cell">
                      Check out
                    </th>
                    <th className="p-2 font-semibold whitespace-nowrap  hidden sm:table-cell">
                      Total Hours
                    </th>
                    <th className="p-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentallTransactionReport.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="sm:text-center p-10">
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    currentallTransactionReport.map((item, index) => (
                      <tr
                        key={item.id}
                        className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                      >
                        <td className="p-2  whitespace-nowrap">
                          {item.employee}
                        </td>
                        <td className="p-2  hidden sm:table-cell">
                          {index + 1}
                        </td>
                        <td className="p-2 hidden md:table-cell">
                          {item.employeeCategory}
                        </td>
                        <td className="p-2 hidden xl:table-cell">
                          {item.designation}
                        </td>

                        <td className="p-2  hidden md:table-cell">
                          {new Date(item.createdDate).toLocaleDateString()}
                        </td>
                        <td className="p-2  hidden xl:table-cell">
                          {" "}
                          {item.intime
                            ? new Date(item.intime).toLocaleString("en-US", {
                                weekday: "long",
                              })
                            : new Date(item.outtime).toLocaleString("en-US", {
                                weekday: "long",
                              })}
                        </td>

                        <td className="p-2 hidden xl:table-cell ">
                          {item.intime
                            ? new Date(item.intime).toLocaleTimeString()
                            : "No Checkin"}
                        </td>

                        <td className="p-2 hidden xl:table-cell ">
                          {item.outtime
                            ? new Date(item.outtime).toLocaleTimeString()
                            : "No Checkout"}
                        </td>

                        <td className="p-2  hidden sm:table-cell">
                          {item.intime && item.outtime
                            ? (() => {
                                const inT = new Date(
                                  item.intime,
                                ).toLocaleTimeString();
                                const outT = new Date(
                                  item.outtime,
                                ).toLocaleTimeString();
                                return getTimeDiff(inT, outT);
                              })()
                            : "Missed Punch"}
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center md:justify-between items-center mt-4 text-sm flex-wrap gap-6">
              <span>
                Showing{" "}
                {filteredallTransactionReport.length === 0
                  ? "0"
                  : startIndex + 1}{" "}
                to {Math.min(endIndex, filteredallTransactionReport.length)} of{" "}
                {filteredallTransactionReport.length} entries
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
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
                  <p className={labelStyle}>Employee Category</p>
                  <p className={inputStyle}>{selectedItem.employeeCategory}</p>
                </div>

                <div>
                  <p className={labelStyle}>Designation</p>
                  <p className={inputStyle}>{selectedItem.designation}</p>
                </div>

                <div>
                  <p className={labelStyle}>Punch Date</p>
                  <p className={inputStyle}>
                    {new Date(selectedItem.createdDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className={labelStyle}>Punch Day</p>
                  <p className={inputStyle}>
                    {new Date(selectedItem.intime).toLocaleString("en-US", {
                      weekday: "long",
                    })}
                  </p>
                </div>

                <div>
                  <p className={labelStyle}>Check in</p>
                  <p className={inputStyle}>
                    {selectedItem.intime
                      ? new Date(selectedItem.intime).toLocaleString()
                      : "No Checkin"}
                  </p>
                </div>

                <div>
                  <p className={labelStyle}>Check out</p>
                  <p className={inputStyle}>
                    {selectedItem.outtime
                      ? new Date(selectedItem.outtime).toLocaleString()
                      : "No Checkout"}
                  </p>
                </div>

                <div>
                  <p className={labelStyle}>Work Hours</p>
                  <p className={inputStyle}>
                    {selectedItem.intime && selectedItem.outtime
                      ? (() => {
                          const inT = new Date(
                            selectedItem.intime,
                          ).toLocaleTimeString();
                          const outT = new Date(
                            selectedItem.outtime,
                          ).toLocaleTimeString();
                          return getTimeDiff(inT, outT);
                        })()
                      : "Missed Punch"}
                  </p>
                </div>

                <div>
                  <p className={labelStyle}>Location</p>
                  <p className={inputStyle}>{selectedItem.location}</p>
                </div>

                <div>
                  <p className={labelStyle}>Remarks</p>
                  <p className={inputStyle}>{selectedItem.remarks}</p>
                </div>

                <div>
                  <p className={labelStyle}>Status</p>
                  <p
                    className={` py-1 px-3 w-fit rounded
                                             ${selectedItem.status === "Approved" && "bg-green-100 text-green-700"}
                              ${selectedItem.status === "Rejected" && "bg-red-100 text-red-700"}
                              ${selectedItem.status === "Pending" && "bg-yellow-100 text-yellow-700"}`}
                  >
                    {selectedItem.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AllTransactionReport;

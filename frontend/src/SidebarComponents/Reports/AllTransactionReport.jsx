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
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm";
  const labelStyle =
    "text-sm xl:text-base font-semibold text-gray-700 mb-2 block";

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
      <div className="mb-6 max-w-[1920px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Reports</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Manual Reports</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div
              onClick={() => setOpenModal(false)}
              className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
            >
              All Transaction Report
            </div>
          </h1>
        </div>

        {/* Filter Section */}
        {!openModal && (
          <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-blue-100/50 shadow-xl mb-6">
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

            <div className="flex justify-end mt-10">
              <button
                onClick={() => setOpenModal(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-2.5 rounded-lg shadow-md xl:text-lg transition-all duration-200"
              >
                Generate Report
              </button>
            </div>
          </div>
        )}

        {/* Results Table Section */}
        {openModal && (
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl animate-in fade-in duration-500">
            <div className="p-6 border-b border-blue-100/30">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  All Transaction Report
                </h2>
                <RxCross2
                  onClick={() => setOpenModal(false)}
                  className="text-2xl text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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
                    className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/60 transition-all"
                  >
                    {[10, 25, 50, 100].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm xl:text-base font-medium text-gray-600">
                    entries
                  </span>
                </div>

                <div className="flex gap-3">
                  <input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 xl:text-base  rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
                  />
                </div>
              </div>
            </div>

            <div
              className="overflow-x-auto min-h-[350px]"
              style={{ scrollbarWidth: "none" }}
            >
              <table className="w-full text-[17px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-blue-100/50">
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                      SL.NO
                    </th>
                    <th className="px-4 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-4 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                      Designation
                    </th>
                    <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                      Check in
                    </th>
                    <th className="px-4 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                      Check out
                    </th>
                    <th className="px-4 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                      Total Hours
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentallTransactionReport.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="p-12 text-center text-gray-500 font-medium"
                      >
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    currentallTransactionReport.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/60"
                      >
                        <td className="px-4 py-3 text-center font-medium text-gray-900">
                          {item.employee}
                        </td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell text-gray-600">
                          {item.employeeCategory}
                        </td>
                        <td className="px-4 py-3 text-center hidden xl:table-cell text-gray-600">
                          {item.designation}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell text-gray-600">
                          {new Date(item.createdDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center hidden xl:table-cell text-gray-600">
                          {item.intime
                            ? new Date(item.intime).toLocaleTimeString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-center hidden xl:table-cell text-gray-600">
                          {item.outtime
                            ? new Date(item.outtime).toLocaleTimeString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-600">
                          {item.outtime && item.intime
                            ? getTimeDiff(
                                new Date(item.intime).toLocaleTimeString(),
                                new Date(item.outtime).toLocaleTimeString(),
                              )
                            : "Missed Punch"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            <FaEye
                              onClick={() => {
                                setSelectedId(item.id);
                                setModalOpenSelectedItem(true);
                              }}
                              className="text-blue-500 hover:text-blue-700 xl:text-xl cursor-pointer transition-all"
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
            <div className="p-6 border-t border-blue-100/30 flex flex-col sm:flex-row justify-between items-center gap-6">
              <span className="text-sm xl:text-base text-gray-600">
                Showing{" "}
                <span className="text-gray-900 font-semibold">
                  {filteredallTransactionReport.length === 0
                    ? "0"
                    : startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-gray-900">
                  {Math.min(endIndex, filteredallTransactionReport.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-900">
                  {filteredallTransactionReport.length}
                </span>{" "}
                entries
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage == 1}
                  onClick={() => setCurrentPage(1)}
                  className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  title="First page"
                >
                  First
                </button>

                <button
                  disabled={currentPage == 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
                  title="Previous page"
                >
                  <GrPrevious />
                </button>

                <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-semibold min-w-[45px] text-center">
                  {currentPage}
                </div>

                <button
                  disabled={currentPage == totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
                  title="Next page"
                >
                  <GrNext />
                </button>

                <button
                  disabled={currentPage == totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  title="Last page"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selection Detail Modal */}
        {modalOpenSelectedItem && selectedItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div
              className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in duration-200"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedItem.employee} Transaction Details
                </h2>
                <button
                  onClick={() => {
                    setModalOpenSelectedItem(false);
                    setSelectedId(null);
                  }}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <RxCross2 className="text-2xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
                    {new Date(
                      selectedItem.intime || selectedItem.outtime,
                    ).toLocaleString("en-US", { weekday: "long" })}
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
                      ? getTimeDiff(
                          new Date(selectedItem.intime).toLocaleTimeString(),
                          new Date(selectedItem.outtime).toLocaleTimeString(),
                        )
                      : "Missed Punch"}
                  </p>
                </div>
                <div>
                  <p className={labelStyle}>Location</p>
                  <p className={inputStyle}>{selectedItem.location || "-"}</p>
                </div>
                <div>
                  <p className={labelStyle}>Remarks</p>
                  <p className={inputStyle}>{selectedItem.remarks || "-"}</p>
                </div>
                <div>
                  <p className={labelStyle}>Status</p>
                  <p
                    className={`py-1 px-3 w-fit rounded xl:text-lg font-semibold border ${selectedItem.status === "Approved" ? "bg-green-100 text-green-700 border-green-200" : selectedItem.status === "Rejected" ? "bg-red-100 text-red-700 border-red-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"}`}
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

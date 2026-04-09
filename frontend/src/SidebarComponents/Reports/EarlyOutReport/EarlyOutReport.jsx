import React, { useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { GrPrevious, GrNext } from "react-icons/gr";
import SearchDropdown from "../../SearchDropdown";
import SpinnerDatePicker from "../../SpinnerDatePicker";
import { FaEye } from "react-icons/fa";

const EarlyOutReport = () => {
  const [openModal, setOpenModal] = useState(false);
  const [earlyOutReport, setEarlyOutReport] = useState([]);

  const [selectedId, setSelectedId] = useState(null);
  const [modalOpenSelectedItem, setModalOpenSelectedItem] = useState(false);

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("mannualEntryRequests")) || [];
    setEarlyOutReport(stored);
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

    let diff = outSeconds - inSeconds;

    if (diff <= 0) return "00:00:00";

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
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 lg:text-lg 3xl:text-xl rounded-lg focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm";
  const labelStyle =
    "text-sm lg:text-base 3xl:text-xl font-semibold text-gray-700 mb-2 block";

  const filteredReport = earlyOutReport.filter((emp) => {
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

  const filteredearlyOutReport = filteredReport.filter(
    (x) =>
      x.company.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.employeeCategory.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.location.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentearlyOutReport = filteredearlyOutReport.slice(
    startIndex,
    endIndex,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredearlyOutReport.length / entriesPerPage),
  );

  const selectedItem = earlyOutReport.find((item) => item.id === selectedId);

  return (
    <>
      <div className="mb-6 max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center h-[30px] gap-2 text-base lg:text-xl 3xl:text-4xl font-semibold text-gray-900 ">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Reports</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div
              onClick={() => setOpenModal(false)}
              className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
            >
              Early Out Report
            </div>
          </h1>
        </div>

        {/* Filter Section Area */}
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
                  options={["Manager", "Officer", "Specialist"]}
                  formData={formData}
                  setFormData={setFormData}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              <div>
                <SearchDropdown
                  label="Employee"
                  name="employee"
                  value={formData.employee}
                  options={["Employee 1", "Employee 2", "Employee 3"]}
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
                  onClick={() => setShowPunchDateSpinner(true)}
                  readOnly
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
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-2.5 rounded-lg shadow-md lg:text-lg 3xl:text-xl transition-all duration-200"
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
                <h2 className="text-xl lg:text-2xl 3xl:text-3xl font-bold text-gray-800">
                  Early Out Summary
                </h2>
                <RxCross2
                  onClick={() => setOpenModal(false)}
                  className="text-2xl text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm lg:text-base 3xl:text-lg font-medium text-gray-600">
                    Display
                  </label>
                  <select
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm lg:text-base 3xl:text-xl"
                  >
                    {[10, 25, 50, 100].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm lg:text-base 3xl:text-lg font-medium text-gray-600">
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
                    className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 lg:text-base 3xl:text-lg rounded-lg focus:ring-2 focus:ring-blue-500/60 transition-all"
                  />
                </div>
              </div>
            </div>

            <div
              className="overflow-x-auto min-h-[350px]"
              style={{ scrollbarWidth: "none" }}
            >
              <table className="w-full text-[16px] lg:text-[18px] 3xl:text-[22px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-blue-100/50">
                    <th className="px-4 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                      Enrollment ID
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                      Shift Hours
                    </th>
                    <th className="px-4 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                      Total Hours
                    </th>
                    <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                      Missed Hours
                    </th>
                    <th className="px-4 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentearlyOutReport.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="p-12 text-center text-gray-500 font-medium"
                      >
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    currentearlyOutReport.map((item) => {
                      let totalhours = "";
                      if (item.intime && item.outtime) {
                        totalhours = getTimeDiff(
                          new Date(item.intime).toLocaleTimeString(),
                          new Date(item.outtime).toLocaleTimeString(),
                        );
                      }
                      const timeDiff = totalhours
                        ? getTimeDiff(totalhours, "07:00:00")
                        : "-";
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/60"
                        >
                          <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-600">
                            {item.employeeId}
                          </td>
                          <td className="px-4 py-3 text-center font-medium text-gray-900">
                            {item.employee}
                          </td>
                          <td className="px-4 py-3 text-center hidden md:table-cell text-gray-600">
                            {new Date(item.createdDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-center hidden lg:table-cell text-gray-500">
                            07:00:00
                          </td>
                          <td className="px-4 py-3 text-center hidden xl:table-cell text-gray-900 font-medium">
                            {totalhours || "-"}
                          </td>
                          <td
                            className={`px-4 py-3 text-center hidden md:table-cell ${timeDiff !== "00:00:00" ? "text-red-500 font-bold" : "font-semibold text-green-600"}`}
                          >
                            {timeDiff || "-"}
                          </td>
                          <td className="px-4 py-3 text-center hidden xl:table-cell">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${item.intime && item.outtime ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            >
                              {item.intime && item.outtime
                                ? "Normal Shift"
                                : "Missed Punch"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <FaEye
                              onClick={() => {
                                setSelectedId(item.id);
                                setModalOpenSelectedItem(true);
                              }}
                              className="text-blue-500 hover:text-blue-700 lg:text-xl 3xl:text-3xl cursor-pointer mx-auto"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-6 border-t border-blue-100/30 flex flex-col sm:flex-row justify-between items-center gap-6">
              <span className="text-sm lg:text-base 3xl:text-lg text-gray-600">
                Showing{" "}
                <span className="font-bold text-gray-900">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-gray-900">
                  {Math.min(endIndex, filteredearlyOutReport.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-900">
                  {filteredearlyOutReport.length}
                </span>{" "}
                entries
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm lg:text-base 3xl:text-xl font-medium disabled:opacity-50"
                >
                  First
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-2.5 border rounded-lg bg-white disabled:opacity-50"
                >
                  <GrPrevious />
                </button>
                <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-bold text-sm lg:text-base 3xl:text-xl">
                  {currentPage}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-2.5 border rounded-lg bg-white disabled:opacity-50"
                >
                  <GrNext />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm lg:text-base 3xl:text-xl font-medium disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selection Detail Modal */}
        {modalOpenSelectedItem &&
          selectedItem &&
          (() => {
            let totalhours = "";
            if (selectedItem.intime && selectedItem.outtime) {
              totalhours = getTimeDiff(
                new Date(selectedItem.intime).toLocaleTimeString(),
                new Date(selectedItem.outtime).toLocaleTimeString(),
              );
            }
            return (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
                style={{ scrollbarWidth: "none" }}
                onClick={() => {
                  setModalOpenSelectedItem(false);
                  setSelectedId(null);
                }}
              >
                <div
                  className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-5xl max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in duration-200"
                  style={{ scrollbarWidth: "none" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
                    <h2 className="text-xl lg:text-2xl 3xl:text-4xl font-bold text-gray-900">
                      {selectedItem.employee} Early Out Details
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
                      <p className={labelStyle}>Employee ID</p>
                      <p className={inputStyle}>{selectedItem.employeeId}</p>
                    </div>
                    <div>
                      <p className={labelStyle}>Date</p>
                      <p className={inputStyle}>
                        {new Date(
                          selectedItem.createdDate,
                        ).toLocaleDateString()}
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
                      <p className={labelStyle}>Shift Hours</p>
                      <p className={inputStyle}>07:00:00</p>
                    </div>
                    <div>
                      <p className={labelStyle}>Work Hours</p>
                      <p className={inputStyle}>{totalhours || "-"}</p>
                    </div>
                    <div>
                      <p className={labelStyle}>Missed Hours</p>
                      <p className={inputStyle}>
                        {totalhours
                          ? getTimeDiff(totalhours, "07:00:00")
                          : "00:00:00"}
                      </p>
                    </div>
                    <div>
                      <p className={labelStyle}>Status</p>
                      <p
                        className={`py-1 px-3 w-fit rounded lg:text-lg 3xl:text-xl font-semibold border ${selectedItem.intime && selectedItem.outtime ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}
                      >
                        {selectedItem.intime && selectedItem.outtime
                          ? "Normal Shift"
                          : "Missed Punch"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
      </div>
    </>
  );
};

export default EarlyOutReport;

import React, { useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { GrPrevious, GrNext } from "react-icons/gr";
import SearchDropdown from "../../SearchDropdown";
import SpinnerDatePicker from "../../SpinnerDatePicker";

const AbsenceSummaryReport = () => {
  const [openModal, setOpenModal] = useState(false);
  const [absenceSummaryReport, setAbsenceSummaryReport] = useState([]);

  const parseDate = (dateStr) => {
    if (!dateStr) return null;

    // supports both dd/mm/yyyy and ISO
    if (dateStr.includes("/")) {
      const [day, month, year] = dateStr.split("/");
      return new Date(year, month - 1, day);
    }

    return new Date(dateStr);
  };

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("mannualEntryRequests")) || [];
    setAbsenceSummaryReport(stored);
  }, []);

  const [showPunchDateSpinner, setShowPunchDateSpinner] = useState(false);
  const [showToPunchDateSpinner, setShowToPunchDateSpinner] = useState(false);

  const [formData, setFormData] = useState({
    employeeCategory: "",
    company: "",
    location: "",
    department: "",
    fromPunchDate: "",
    toPunchDate: "",
  });

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 lg:text-lg 3xl:text-xl rounded-lg focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm";
  const labelStyle =
    "text-sm lg:text-base 3xl:text-xl font-semibold text-gray-700 mb-2 block";

  const absentences = absenceSummaryReport.filter(
    (x) =>
      (x.intime === "" || x.intime === null) &&
      (x.outtime === "" || x.outtime === null),
  );

  const filteredReport = absentences.filter((emp) => {
    const punchDate = parseDate(emp.createdDate);
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
      (!fromDate || punchDate >= fromDate) &&
      (!toDate || punchDate <= toDate)
    );
  });

  const getDateRange = (from, to) => {
    const dates = [];
    if (!from || !to) return dates;

    let current = new Date(from);
    const end = new Date(to);

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const generateSummary = () => {
    const fromDate = parseDate(formData.fromPunchDate) || new Date();
    const toDate = parseDate(formData.toPunchDate) || new Date();

    const dateRange = getDateRange(fromDate, toDate);

    const summary = {};

    filteredReport.forEach((item) => {
      const loc = item.location || "Unknown";
      const date = new Date(item.createdDate).toDateString();

      if (!summary[loc]) {
        summary[loc] = {};
      }

      summary[loc][date] = (summary[loc][date] || 0) + 1;
    });

    return { summary, dateRange };
  };

  const { summary, dateRange } = generateSummary();
  const locations = Object.keys(summary);

  return (
    <>
      <div className="mb-6 max-w-[1920px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center h-[30px] gap-2 text-base lg:text-xl 3xl:text-4xl font-semibold text-gray-900 ">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Reports</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Absence Reports</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div
              onClick={() => setOpenModal(false)}
              className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
            >
              Absence Summary Report
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
                  options={["Head Office", "Location 2", "UAE"]}
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
                  options={["Regional Sales Support Manager", "HR Manager"]}
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
                  value={
                    formData.fromPunchDate || new Date().toLocaleDateString()
                  }
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
                  value={
                    formData.toPunchDate || new Date().toLocaleDateString()
                  }
                  onClick={() => setShowToPunchDateSpinner(true)}
                  readOnly
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
                  Absence Summary Report
                </h2>
                <RxCross2
                  onClick={() => setOpenModal(false)}
                  className="text-2xl text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                />
              </div>
            </div>

            <div
              className="overflow-x-auto min-h-[350px]"
              style={{ scrollbarWidth: "none" }}
            >
              <table className="w-full text-[16px] lg:text-[18px] 3xl:text-[22px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-blue-100/50">
                    <th className="px-4 py-3 text-left font-bold text-gray-700 border-r border-blue-100">
                      Date
                    </th>
                    {locations.map((loc, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-center font-bold text-gray-700 border-r border-blue-100"
                      >
                        {loc}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center font-bold text-red-600">
                      TOTAL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dateRange.length === 0 ? (
                    <tr>
                      <td
                        colSpan={locations.length + 2}
                        className="p-12 text-center text-gray-500 font-medium"
                      >
                        No Data Found
                      </td>
                    </tr>
                  ) : (
                    dateRange.map((date, idx) => {
                      const key = date.toDateString();
                      const rowTotal = locations.reduce(
                        (sum, loc) => sum + (summary[loc]?.[key] || 0),
                        0,
                      );

                      return (
                        <tr
                          key={idx}
                          className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/60"
                        >
                          <td className="px-4 py-3 text-left font-semibold text-gray-900 border-r border-blue-100/50">
                            {date.toLocaleDateString()}
                            <br />
                            <span className="text-xs lg:text-sm 3xl:text-lg font-normal text-gray-500">
                              {date.toLocaleDateString("en-US", {
                                weekday: "long",
                              })}
                            </span>
                          </td>
                          {locations.map((loc, i) => (
                            <td
                              key={i}
                              className="px-4 py-3 text-center text-gray-700 border-r border-blue-100/50"
                            >
                              <span
                                className={
                                  summary[loc]?.[key] > 0
                                    ? "font-bold text-gray-900"
                                    : "text-gray-400"
                                }
                              >
                                {summary[loc]?.[key] || 0}
                              </span>
                            </td>
                          ))}
                          <td className="px-4 py-3 text-center text-red-600 font-bold bg-red-50/30">
                            {rowTotal}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AbsenceSummaryReport;

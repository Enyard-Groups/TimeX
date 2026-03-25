/* eslint-disable react-hooks/set-state-in-effect */
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
    "w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 text-lg py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

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
      <div className="mb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
            <FaAngleRight />
            Reports
            <FaAngleRight />
            Absence Reports
            <FaAngleRight />
            Absence Summary Report
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
                  value={
                    formData.fromPunchDate
                      ? formData.fromPunchDate
                      : new Date().toLocaleDateString()
                  }
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
                  value={
                    formData.toPunchDate
                      ? formData.toPunchDate
                      : new Date().toLocaleDateString()
                  }
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

            {/* Table  */}
            <div className="overflow-x-auto mt-6 min-h-[300px]">
              <h1 className="text-[oklch(0.577_0.245_27.325)] text-xl mb-4 text-center">
                Absence Summary Report
              </h1>
              <table className="min-w-full border border-gray-300 text-sm">
                <thead className="bg-red-100">
                  <tr>
                    <th className="border border-red-300 px-3 py-2">Date</th>

                    {locations.map((loc, i) => (
                      <th key={i} className="border border-red-300 px-3 py-2">
                        {loc}
                      </th>
                    ))}

                    <th className="border border-red-300 px-3 py-2">TOTAL</th>
                  </tr>
                </thead>

                <tbody>
                  {dateRange.length === 0 ? (
                    <tr>
                      <td
                        colSpan={locations.length + 2}
                        className="text-center py-4"
                      >
                        No Data Found
                      </td>
                    </tr>
                  ) : (
                    dateRange.map((date, idx) => {
                      const key = date.toDateString();

                      // total per date
                      const rowTotal = locations.reduce(
                        (sum, loc) => sum + (summary[loc]?.[key] || 0),
                        0,
                      );

                      return (
                        <tr key={idx}>
                          {/* DATE COLUMN */}
                          <td className="border border-gray-300 px-3 py-2 font-semibold">
                            {date.toLocaleDateString()}
                            <br />
                            <span className="text-xs">
                              {date.toLocaleDateString("en-US", {
                                weekday: "long",
                              })}
                            </span>
                          </td>

                          {/* LOCATION COLUMNS */}
                          {locations.map((loc, i) => (
                            <td
                              key={i}
                              className="border border-gray-300 px-3 py-2 text-center"
                            >
                              {summary[loc]?.[key] || 0}
                            </td>
                          ))}

                          {/* ROW TOTAL */}
                          <td className="border border-gray-300 px-3 py-2 text-center text-red-500 font-bold">
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

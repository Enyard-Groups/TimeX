import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import SearchDropdown from "../../SearchDropdown";
import SpinnerDatePicker from "../../SpinnerDatePicker";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:3000/api";

const AbsenceSummaryReport = () => {
  const [openModal, setOpenModal] = useState(false);
  const [absenceData, setAbsenceData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dropdown data
  const [companyOptions, setCompanyOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [showFromDateSpinner, setShowFromDateSpinner] = useState(false);
  const [showToDateSpinner, setShowToDateSpinner] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    company_id: "",
    employee: "",
    employee_id: "",
    fromPunchDate: "",
    toPunchDate: "",
  });

  const inputStyle =
    "w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 text-lg py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [companiesRes, employeesRes] = await Promise.all([
          axios.get(`${API_BASE}/companies`),
          axios.get(`${API_BASE}/employee`),
        ]);
        setCompanyOptions(companiesRes.data);
        setEmployeeOptions(employeesRes.data);
      } catch (err) {
        console.error("Failed to load dropdown options:", err);
        toast.error("Failed to load filter options");
      }
    };
    fetchDropdowns();
  }, []);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (formData.company_id) params.company_id = formData.company_id;
      if (formData.employee_id) params.employee_id = formData.employee_id;
      if (formData.fromPunchDate) params.from_date = formData.fromPunchDate;
      if (formData.toPunchDate) params.to_date = formData.toPunchDate;

      const res = await axios.get(`${API_BASE}/requests/manual/report`, { params });
      // Filter for Absence
      const filteredResult = res.data.filter(item => !item.in_time && !item.out_time);
      setAbsenceData(filteredResult);
      setOpenModal(true);
    } catch (err) {
      console.error("Failed to generate report:", err);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (from, to) => {
    const dates = [];
    if (!from || !to) return dates;
    
    // Parse from dd/mm/yyyy
    const [fd, fm, fy] = from.split("/").map(Number);
    const [td, tm, ty] = to.split("/").map(Number);
    
    let current = new Date(fy, fm-1, fd);
    const end = new Date(ty, tm-1, td);

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const generateSummary = () => {
    const dateRange = getDateRange(formData.fromPunchDate, formData.toPunchDate);
    const summary = {};
    const locationsSet = new Set();

    absenceData.forEach((item) => {
      const loc = item.location || "Unknown Location";
      locationsSet.add(loc);
      const dt = item.created_at ? new Date(item.created_at) : null;
      if (!dt) return;
      const dateStr = dt.toDateString();

      if (!summary[loc]) summary[loc] = {};
      summary[loc][dateStr] = (summary[loc][dateStr] || 0) + 1;
    });

    return { summary, dateRange, locations: Array.from(locationsSet) };
  };

  const { summary, dateRange, locations } = generateSummary();

  return (
    <>
      <div className="mb-6">
        <div className="sm:flex sm:justify-between">
          <h1 className="flex items-center gap-2 text-[17px] font-semibold flex-wrap ml-10 lg:ml-0 mb-4 lg:mb-0">
            <FaAngleRight />
            Reports
            <FaAngleRight />
            Absence Reports
            <FaAngleRight />
            Absence Summary Report
          </h1>
        </div>

        <div className="flex items-center justify-center p-4 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="bg-white rounded-xl shadow-sm w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6" style={{ scrollbarWidth: "none" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <SearchDropdown
                  label="Company"
                  name="company"
                  value={formData.company}
                  options={companyOptions}
                  labelKey="name"
                  valueKey="id"
                  labelName="company"
                  formData={formData}
                  setFormData={(updated) =>
                    setFormData((prev) => ({
                      ...prev,
                      company: updated.company,
                      company_id: updated.company_id ?? updated.company,
                    }))
                  }
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>
              <div className="relative">
                <label className={labelStyle}>From Date</label>
                <input
                  name="fromPunchDate"
                  value={formData.fromPunchDate}
                  onClick={() => setShowFromDateSpinner(true)}
                  placeholder="dd/mm/yyyy"
                  readOnly
                  className={`${inputStyle} cursor-pointer`}
                />
                {showFromDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.fromPunchDate}
                    onChange={(date) => setFormData((prev) => ({ ...prev, fromPunchDate: date }))}
                    onClose={() => setShowFromDateSpinner(false)}
                  />
                )}
              </div>
              <div className="relative">
                <label className={labelStyle}>To Date</label>
                <input
                  name="toPunchDate"
                  value={formData.toPunchDate}
                  onClick={() => setShowToDateSpinner(true)}
                  placeholder="dd/mm/yyyy"
                  readOnly
                  className={`${inputStyle} cursor-pointer`}
                />
                {showToDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.toPunchDate}
                    onChange={(date) => setFormData((prev) => ({ ...prev, toPunchDate: date }))}
                    onClose={() => setShowToDateSpinner(false)}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end mt-10">
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="bg-[oklch(0.645_0.246_16.439)] text-white px-8 py-2 rounded-md disabled:opacity-60"
              >
                {loading ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>
        </div>

        {openModal && (
          <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.8_0.001_106.424)] p-6 ">
            <div className="flex justify-end">
              <RxCross2 onClick={() => setOpenModal(false)} className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer" />
            </div>

            <div className="overflow-x-auto mt-6 min-h-[300px]">
              <h1 className="text-[oklch(0.577_0.245_27.325)] text-xl mb-4 text-center">
                Absence Summary Report
              </h1>
              <table className="min-w-full border border-gray-300 text-sm">
                <thead className="bg-[oklch(0.99_0.01_16.439)]">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2">Date</th>
                    {locations.map((loc, i) => (
                      <th key={i} className="border border-gray-300 px-3 py-2">{loc}</th>
                    ))}
                    <th className="border border-gray-300 px-3 py-2">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {dateRange.length === 0 ? (
                    <tr><td colSpan={locations.length + 2} className="text-center py-4">No Data Found</td></tr>
                  ) : (
                    dateRange.map((date, idx) => {
                      const dateStr = date.toDateString();
                      const rowTotal = locations.reduce((sum, loc) => sum + (summary[loc]?.[dateStr] || 0), 0);
                      return (
                        <tr key={idx}>
                          <td className="border border-gray-300 px-3 py-2 font-semibold bg-gray-50">
                            {date.toLocaleDateString()}
                            <br /><span className="text-[10px] uppercase">{date.toLocaleDateString("en-US", { weekday: "long" })}</span>
                          </td>
                          {locations.map((loc, i) => (
                            <td key={i} className="border border-gray-300 px-3 py-2 text-center">
                              {summary[loc]?.[dateStr] || 0}
                            </td>
                          ))}
                          <td className="border border-gray-300 px-3 py-2 text-center text-red-500 font-bold bg-red-50">
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

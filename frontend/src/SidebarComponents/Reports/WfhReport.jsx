import React, { useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { GrPrevious, GrNext } from "react-icons/gr";
import SearchDropdown from "../SearchDropdown";
import SpinnerDatePicker from "../SpinnerDatePicker";
import { FaEye } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

const WfhReport = () => {
  const API_BASE = "http://localhost:3000/api";
  const [openModal, setOpenModal] = useState(false);
  const [wfhReport, setWfhReport] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [modalOpenSelectedItem, setModalOpenSelectedItem] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE}/employee`);
      setEmployeeOptions(res.data || []);
    } catch (error) {
      console.error("Failed to fetch employees", error);
      toast.error("Unable to load employees");
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPunchDateSpinner, setShowPunchDateSpinner] = useState(false);
  const [showToPunchDateSpinner, setShowToPunchDateSpinner] = useState(false);

  const [formData, setFormData] = useState({
    employee: "",
    employee_name: "",
    fromdateinform: "",
    todateinform: "",
  });

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (formData.employee)
        params.append("company_enrollment_id", formData.employee);
      if (formData.fromdateinform)
        params.append("from_date", formData.fromdateinform);
      if (formData.todateinform)
        params.append("to_date", formData.todateinform);

      const res = await axios.get(
        `${API_BASE}/requests/wfh/report?${params.toString()}`,
      );
      console.log(res.data);
      setWfhReport(res.data || []);
      setOpenModal(true);
    } catch (error) {
      console.error("Failed to generate report", error);
      toast.error("Error generating report");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base  rounded-lg focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm";
  const labelStyle =
    "text-sm xl:text-base font-semibold text-gray-700 mb-2 block";

  const filteredwfhReport = wfhReport.filter((x) =>
    (x.employee_name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentwfhReport = filteredwfhReport.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredwfhReport.length / entriesPerPage),
  );

  const selectedItem = wfhReport.find((item) => item.id === selectedId);

  return (
    <>
      <div className="mb-6 max-w-[1920px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Reports</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div
              onClick={() => setOpenModal(false)}
              className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
            >
              WFH Report
            </div>
          </h1>
        </div>

        {/* Filter Section Area */}
        {!openModal && (
          <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-blue-100/50 shadow-xl mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <SearchDropdown
                  label="Employee"
                  name="employee"
                  value={formData.employee}
                  displayValue={formData.employee_name}
                  options={employeeOptions}
                  valueKey="company_enrollment_id"
                  labelKey="full_name"
                  labelName="employee_name"
                  formData={formData}
                  setFormData={setFormData}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>From Date</label>
                <input
                  name="fromdateinform"
                  value={formData.fromdateinform}
                  onClick={() => setShowPunchDateSpinner(true)}
                  readOnly
                  placeholder="dd/mm/yyyy"
                  className={inputStyle}
                />
                {showPunchDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.fromdateinform}
                    onChange={(date) =>
                      setFormData({ ...formData, fromdateinform: date })
                    }
                    onClose={() => setShowPunchDateSpinner(false)}
                  />
                )}
              </div>

              <div>
                <label className={labelStyle}>To Date</label>
                <input
                  name="todateinform"
                  value={formData.todateinform}
                  onClick={() => setShowToPunchDateSpinner(true)}
                  readOnly
                  placeholder="dd/mm/yyyy"
                  className={inputStyle}
                />
                {showToPunchDateSpinner && (
                  <SpinnerDatePicker
                    value={formData.todateinform}
                    onChange={(date) =>
                      setFormData({ ...formData, todateinform: date })
                    }
                    onClose={() => setShowToPunchDateSpinner(false)}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end mt-10">
              <button
                disabled={loading}
                onClick={handleGenerate}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-2.5 rounded-lg shadow-md xl:text-base transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Report"}
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
                  WFH Summary View
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
                  <span className="text-sm xl:text-base  font-medium text-gray-600">
                    entries
                  </span>
                </div>

                <div className="flex gap-3">
                  <input
                    placeholder="Search WFH records..."
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
                    <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                      From Date
                    </th>
                    <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                      To Date
                    </th>
                    <th className="px-4 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                      Total Days
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentwfhReport.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-12 text-center text-gray-500 font-medium"
                      >
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    currentwfhReport.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/60"
                      >
                        <td className="px-4 py-3 text-center font-medium text-gray-900">
                          {item.employee_name}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell text-gray-600">
                          {item.start_date
                            ? new Date(item.start_date).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell text-gray-600">
                          {item.end_date
                            ? new Date(item.end_date).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell text-gray-500 truncate max-w-xs">
                          {item.reason}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell font-bold text-blue-600">
                          {item.number_of_days}
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
                  {filteredwfhReport.length === 0 ? "0" : startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-gray-900">
                  {Math.min(endIndex, filteredwfhReport.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-900">
                  {filteredwfhReport.length}
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
                  {selectedItem.employee_name} WFH Details
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
                  <p className={inputStyle}>{selectedItem.employee_name}</p>
                </div>
                <div>
                  <p className={labelStyle}>From Date</p>
                  <p className={inputStyle}>
                    {selectedItem.start_date
                      ? new Date(selectedItem.start_date).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className={labelStyle}>To Date</p>
                  <p className={inputStyle}>
                    {selectedItem.end_date
                      ? new Date(selectedItem.end_date).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className={labelStyle}>Number of Days</p>
                  <p className={`${inputStyle} font-bold text-blue-600`}>
                    {selectedItem.number_of_days}
                  </p>
                </div>
                <div className="sm:col-span-2 md:col-span-3">
                  <p className={labelStyle}>Reason</p>
                  <p className={`${inputStyle} min-h-[80px]`}>
                    {selectedItem.reason || "No reason provided"}
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

export default WfhReport;

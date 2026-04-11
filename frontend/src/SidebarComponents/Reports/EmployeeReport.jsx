import React, { useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { GrPrevious, GrNext } from "react-icons/gr";
import SearchDropdown from "../SearchDropdown";
import { FaEye } from "react-icons/fa";

const EmployeeReport = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [modalOpenSelectedItem, setModalOpenSelectedItem] = useState(false);
  const [employeeReport] = useState([
    {
      employeeID: "EMP001",
      name: "Sharma",
      company: "Enyard",
      employeeCategory: "Full Time Equivalent",
      location: "Head Office",
      department: "Finance Assistant",
      finger: "10",
    },
    {
      employeeID: "EMP002",
      name: "Drishti",
      company: "Company 2",
      employeeCategory: "Freelence",
      location: "Head Office",
      department: "Project Manager",
      finger: "10",
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    employeeCategory: "",
    company: "",
    location: "",
    department: "",
    finger: "",
  });

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 lg:text-base rounded-lg focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm";
  const labelStyle =
    "text-sm lg:text-base font-semibold text-gray-700 mb-2 block";

  const filteredReport = employeeReport.filter((emp) => {
    return (
      (formData.company === "" || emp.company === formData.company) &&
      (formData.employeeCategory === "" ||
        formData.employeeCategory === "All Category" ||
        emp.employeeCategory === formData.employeeCategory) &&
      (formData.location === "" || emp.location === formData.location) &&
      (formData.department === "" || emp.department === formData.department) &&
      (formData.finger === "" || emp.finger === formData.finger)
    );
  });

  const filteredemployeeReport = filteredReport.filter(
    (x) =>
      x.company.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.employeeCategory.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.location.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentemployeeReport = filteredemployeeReport.slice(
    startIndex,
    endIndex,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredemployeeReport.length / entriesPerPage),
  );

  const selectedItem = employeeReport.find(
    (item) => item.employeeID === selectedId,
  );

  return (
    <>
      <div className="mb-6 max-w-[1920px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center h-[30px] gap-2 text-lg xl:text-xl font-semibold text-gray-900">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Reports</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div className="text-blue-600 hover:text-blue-700 transition cursor-pointer">
              Employee Reports
            </div>
          </h1>
        </div>

        {/* Filter Section */}
        <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-blue-100/50 shadow-xl mb-6">
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
              <SearchDropdown
                label="Finger"
                name="finger"
                value={formData.finger}
                options={["10", "9", "8", "7", "6", "5", "4", "3", "2", "1"]}
                formData={formData}
                setFormData={setFormData}
                inputStyle={inputStyle}
                labelStyle={labelStyle}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setOpenModal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 py-2 lg:text-base  rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {openModal && (
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl animate-in fade-in duration-500">
            {/* Table Controls */}
            <div className="p-6 border-b border-blue-100/30">
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
                    className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm xl:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all"
                  >
                    {[10, 25, 50, 100].map((val) => (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm xl:text-base font-medium text-gray-600">
                    entries
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 placeholder-blue-500 focus:outline-none xl:text-base  rounded-lg focus:ring-2 focus:ring-blue-500/60 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div
              className="overflow-x-auto min-h-[350px]"
              style={{ scrollbarWidth: "none" }}
            >
              <table className="w-full text-[17px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-blue-100/50">
                    <th className="px-4 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                      SL.NO
                    </th>
                    <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                      Employee ID
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                      Company
                    </th>
                    <th className="px-4 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-4 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                      Designation
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentemployeeReport.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="p-12 text-center text-gray-500 font-medium"
                      >
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    currentemployeeReport.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/60"
                      >
                        <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell text-gray-600">
                          {item.employeeID}
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-center hidden xl:table-cell text-gray-600">
                          {item.company}
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell text-gray-600">
                          {item.employeeCategory}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell text-gray-600">
                          {item.department}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            <FaEye
                              onClick={() => {
                                setSelectedId(item.employeeID);
                                setModalOpenSelectedItem(true);
                              }}
                              className="text-blue-500 hover:text-blue-700 xl:text-xl cursor-pointer"
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
                <span className="font-bold text-gray-900">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-gray-900">
                  {Math.min(endIndex, filteredemployeeReport.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-900">
                  {filteredemployeeReport.length}
                </span>{" "}
                entries
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
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
                <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-bold text-sm xl:text-base ">
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
                  className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm  font-medium disabled:opacity-50"
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
                  {selectedItem.name} Details
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
                {[
                  { label: "Employee ID", value: selectedItem.employeeID },
                  { label: "Category", value: selectedItem.employeeCategory },
                  { label: "Designation", value: selectedItem.department },
                  { label: "Company", value: selectedItem.company },
                  { label: "Location", value: selectedItem.location },
                  { label: "Finger", value: selectedItem.finger },
                ].map((field) => (
                  <div key={field.label} className="space-y-1">
                    <p className="text-xs xl:text-sm font-bold text-gray-700">
                      {field.label}
                    </p>
                    <p className="bg-white border border-gray-200 p-3 rounded-xl text-gray-800 font-medium xl:text-lg  shadow-sm">
                      {field.value || "-"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EmployeeReport;

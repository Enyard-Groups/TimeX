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
    "w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 text-lg py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

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
      <div className="mb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
            <FaAngleRight />
            Reports
            <FaAngleRight />
            Employee Reports
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
                Employee Report
              </h1>
              <table className="w-full text-lg border-collapse">
                <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
                  <tr>
                    <th className="p-2 font-semibold hidden sm:table-cell">
                      SL.NO
                    </th>
                    <th className="p-2 font-semibold hidden md:table-cell ">
                      Employee ID
                    </th>
                    <th className="p-2 font-semibold">Name</th>
                    <th className="p-2 font-semibold hidden xl:table-cell">
                      Company
                    </th>
                    <th className="p-2 font-semibold  hidden lg:table-cell">
                      Employee Category
                    </th>
                    <th className="p-2 font-semibold  hidden xl:table-cell">
                      Location
                    </th>
                    <th className="p-2 font-semibold hidden md:table-cell">
                      Designation
                    </th>
                    <th className="p-2 font-semibold hidden xl:table-cell">
                      Finger
                    </th>
                    <th className="p-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentemployeeReport.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="sm:text-center p-10">
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    currentemployeeReport.map((item, index) => (
                      <tr
                        key={item.id}
                        className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                      >
                        <td className="p-2 hidden sm:table-cell">
                          {index + 1}
                        </td>
                        <td className="p-2 hidden md:table-cell">
                          {item.employeeID}
                        </td>
                        <td className="p-2">{item.name}</td>
                        <td className="p-2 hidden xl:table-cell ">
                          {item.company}
                        </td>
                        <td className="p-2  hidden lg:table-cell ">
                          {item.employeeCategory}
                        </td>
                        <td className="p-2  hidden xl:table-cell ">
                          {item.location}
                        </td>
                        <td className="p-2 hidden md:table-cell ">
                          {item.department}
                        </td>
                        <td className="p-2 hidden xl:table-cell">
                          {item.finger}
                        </td>
                        <td className="p-2 ">
                          <div className="flex gap-2 justify-center">
                            <FaEye
                              onClick={() => {
                                setSelectedId(item.employeeID);
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
                {filteredemployeeReport.length === 0 ? "0" : startIndex + 1} to{" "}
                {Math.min(endIndex, filteredemployeeReport.length)} of{" "}
                {filteredemployeeReport.length} entries
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
                  {selectedItem.name} Details
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
                  <p className={labelStyle}>Employee ID</p>
                  <p className={inputStyle}>{selectedItem.employeeID}</p>
                </div>

                <div>
                  <p className={labelStyle}>Name</p>
                  <p className={inputStyle}>{selectedItem.name}</p>
                </div>

                <div>
                  <p className={labelStyle}>Employee Category</p>
                  <p className={inputStyle}>{selectedItem.employeeCategory}</p>
                </div>

                <div>
                  <p className={labelStyle}>Designation</p>
                  <p className={inputStyle}>{selectedItem.department}</p>
                </div>

                <div>
                  <p className={labelStyle}>Company</p>
                  <p className={inputStyle}>{selectedItem.company}</p>
                </div>

                <div>
                  <p className={labelStyle}>Location</p>
                  <p className={inputStyle}>{selectedItem.location}</p>
                </div>

                <div>
                  <p className={labelStyle}>Finger</p>
                  <p className={inputStyle}>{selectedItem.finger}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EmployeeReport;

import React, { useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";

const EmployeeMaster = () => {
  const [openModal, setOpenModal] = useState(false);
  const [employeeMaster, setEmployeeMaster] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    deviceEnrollmentId: "",
    companyEnrollmentId: "",
    fullName: "",
    gender: "Male",
    email: "",
    mobile: "",
    dob: "",
    doj: "",
    company: "",
    location: "",
    department: "",
    designation: "",
    empCategory: "",
    shift: "",
    leavePlan: "",
    firstApprover: "",
    secondApprover: "",
    isManager: false,
    type: "User",
    breakHoursFriday: false,
    active: false,
    isMobileUser: false,
  });

  const inputStyle =
    "w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-sm font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filteredemployeeMaster = employeeMaster.filter(
    (x) =>
      x.fullName.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.location.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredemployeeMaster.length / entriesPerPage);

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;

  const currentemployeeMaster = filteredemployeeMaster.slice(
    startIndex,
    endIndex,
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    const { deviceEnrollmentId, companyEnrollmentId, fullName } = formData;

    if (!deviceEnrollmentId || !companyEnrollmentId || !fullName) {
      toast.error("Please fill required fields");
      return;
    }

    setEmployeeMaster((prev) => [...prev, { id: Date.now(), ...formData }]);

    setOpenModal(false);

    setFormData({
      deviceEnrollmentId: "",
      companyEnrollmentId: "",
      fullName: "",
      gender: "Male",
      email: "",
      mobile: "",
      dob: "",
      doj: "",
      company: "",
      location: "",
      department: "",
      designation: "",
      empCategory: "",
      shift: "",
      leavePlan: "",
      firstApprover: "",
      secondApprover: "",
      isManager: false,
      type: "User",
      breakHoursFriday: false,
      active: false,
      isMobileUser: false,
    });

    toast.success("Employee added");
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
          <FaAngleRight />
          Masters
          <FaAngleRight />
          <div onClick={() => setOpenModal(false)} className="cursor-pointer">
            Employee Master
          </div>
        </h1>
        {!openModal && (
          <button
            onClick={() => setOpenModal(true)}
            className="bg-[oklch(0.645_0.246_16.439)] text-white px-4 py-2 rounded-md"
          >
            + Add New
          </button>
        )}
      </div>
      {!openModal && (
        <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.8_0.001_106.424)] p-4">
          {/* Top Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <div>
              <label className="mr-2 text-sm">Show</label>
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
              </select>
              <span className="ml-2 text-sm">entries</span>
            </div>

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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-[oklch(0.948_0.001_106.424)]">
                <tr>
                  <th className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                    Sl.No
                  </th>
                  <th className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                    Device ID
                  </th>
                  <th className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                    Company ID
                  </th>
                  <th className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                    Gender
                  </th>
                  <th className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                    Location
                  </th>
                  <th className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                    Full Name
                  </th>
                  <th className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                    Email
                  </th>
                  <th className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                    Category
                  </th>
                  <th className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                    Shift
                  </th>
                  <th className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                    Designation
                  </th>
                  <th className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                    Department
                  </th>
                  <th className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentemployeeMaster.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="text-center p-4">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentemployeeMaster.map((item, index) => (
                    <tr key={item.id} className="text-center">
                      <td className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                        {index + 1}
                      </td>
                      <td className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                        {item.deviceEnrollmentId}
                      </td>
                      <td className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                        {item.companyEnrollmentId}
                      </td>
                      <td className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                        {item.gender === "Male" ? "M" : "F"}
                      </td>
                      <td className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                        {item.location}
                      </td>
                      <td className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                        {item.fullName}
                      </td>
                      <td className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                        {item.email}
                      </td>
                      <td className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                        {item.empCategory}
                      </td>
                      <td className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                        {item.shift}
                      </td>
                      <td className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                        {item.designation}
                      </td>

                      <td className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                        {item.department}
                      </td>

                      <td className="p-2 border border-[oklch(0.8_0.001_106.424)] space-x-2">
                        <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            setEmployeeMaster(
                              employeeMaster.filter((v) => v.id !== item.id),
                            )
                          }
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <span>
              Showing {Math.min(endIndex, filteredemployeeMaster.length)} of{" "}
              {filteredemployeeMaster.length} entries
            </span>

            <div className="space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                First
              </button>

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-2 py-1 rounded ${
                    currentPage === index + 1
                      ? "bg-green-500 text-white"
                      : "border"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}
      {openModal && (
        <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.923_0.003_48.717)] p-6">
          {/* Close */}
          <div className="flex justify-end">
            <RxCross2
              onClick={() => setOpenModal(false)}
              className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className={labelStyle}>
                Device EnrollmentID{" "}
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <input
                name="deviceEnrollmentId"
                value={formData.deviceEnrollmentId}
                onChange={handleChange}
                placeholder="DeviceID"
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelStyle}>
                Company EnrollmentID{" "}
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <input
                name="companyEnrollmentId"
                value={formData.companyEnrollmentId}
                onChange={handleChange}
                placeholder="CompanyID"
                className={inputStyle}
              />
            </div>

            {/* Full Name */}
            <div>
              <label className={labelStyle}>
                Full Name{" "}
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className={inputStyle}
              />
            </div>

            {/* Gender */}
            <div>
              <label className={labelStyle}>Gender</label>
              <div className="flex gap-4 mt-2">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={formData.gender === "Male"}
                    onChange={handleChange}
                  />{" "}
                  Male
                </label>

                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={formData.gender === "Female"}
                    onChange={handleChange}
                  />{" "}
                  Female
                </label>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelStyle}>Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={inputStyle}
              />
            </div>

            {/* Mobile */}
            <div>
              <label className={labelStyle}>Mobile</label>
              <input
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Mobile"
                className={inputStyle}
              />
            </div>

            {/* Date Of Birth */}
            <div>
              <label className={labelStyle}>Date Of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 border-t pt-4">
            {/* Date Of Join */}
            <div>
              <label className={labelStyle}>Date Of Join</label>
              <input
                type="date"
                name="doj"
                value={formData.doj}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            {/* Company */}
            <div>
              <label className={labelStyle}>Company</label>
              <select
                name="company"
                value={formData.company}
                onChange={handleChange}
                className={inputStyle}
              >
                <option>-Select-</option>
                <option>Company 1</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className={labelStyle}>Location</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={inputStyle}
              >
                <option>-Select-</option>
                <option>Location1</option>
                <option>Location2</option>
                <option>Location3</option>
                <option>Location4</option>
                <option>Location5</option>
                <option>Location6</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className={labelStyle}>Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={inputStyle}
              >
                <option>-Select-</option>
                <option> Treasury And Markets</option>
                <option> IT </option>
                <option> Human Resources</option>
                <option> Banking Division</option>
                <option> Commercial / SME Banking</option>
              </select>
            </div>

            {/* Designation */}
            <div>
              <label className={labelStyle}>Designation</label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className={inputStyle}
              >
                <option>-Select-</option>
                <option>Banking Officer</option>
                <option>Service Sales manager</option>
                <option>Finance Assistant</option>
                <option>Trade Finance Specialist</option>
                <option>Sales Support Officer</option>
                <option>General</option>
                <option>HR manager</option>
                <option>HR Supervisor</option>
                <option>HR Specialist</option>
                <option>Facilities Manager</option>
                <option>Acting Chief Human Resource Manager</option>
                <option>Senior Technical Support Officer</option>
                <option>Project Manager</option>
                <option>Team Lead – Operations</option>
                <option>Regional Sales Support Manager</option>
                <option>Operations Support Officer</option>
                <option>
                  Human Resources Transformation Projects Specialist
                </option>
                <option>Head of Government Relations and HR Operations</option>
                <option>Client Service Executive</option>
                <option>Talent Acquisition Specialist</option>
                <option>Driver</option>
              </select>
            </div>

            {/* Emp Category */}
            <div>
              <label className={labelStyle}>Emp Category</label>
              <select
                name="empCategory"
                value={formData.empCategory}
                onChange={handleChange}
                className={inputStyle}
              >
                <option>-Select-</option>
                <option>Full Time Equivalent</option>
                <option>Contingent</option>
                <option>Freelence</option>
                <option>Contract</option>
                <option>Permanent</option>
              </select>
            </div>

            {/* Shift */}
            <div>
              <label className={labelStyle}>Shift</label>
              <select
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                className={inputStyle}
              >
                <option>-Select-</option>
                <option>Morning</option>
                <option>Evening</option>
                <option>Night</option>
                <option>General</option>
              </select>
            </div>

            {/* Leave Plan */}
            <div>
              <label className={labelStyle}>Leave Plan</label>
              <select
                name="leavePlan"
                value={formData.leavePlan}
                onChange={handleChange}
                className={inputStyle}
              >
                <option>-Select-</option>
                <option>Working Days</option>
                <option>Calendar Days</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 border-t pt-4">
            {/* First Approver */}
            <div>
              <label className={labelStyle}>First Approver</label>
              <select
                name="firstApprover"
                value={formData.firstApprover}
                onChange={handleChange}
                className={inputStyle}
              >
                <option>-Select-</option>
                <option>Name 1</option>
                <option>Name 2</option>
              </select>
            </div>

            {/* Second Approver */}
            <div>
              <label className={labelStyle}>Second Approver</label>
              <select
                name="secondApprover"
                value={formData.secondApprover}
                onChange={handleChange}
                className={inputStyle}
              >
                <option>-Select-</option>
                <option>Name 1</option>
                <option>Name 2</option>
              </select>
            </div>

            {/* Manager */}
            <div className="flex items-center gap-2 mt-6">
              <label className={labelStyle}>IsManager</label>
              <input
                type="checkbox"
                name="isManager"
                checked={formData.isManager}
                onChange={handleChange}
              />
            </div>

            {/* Type */}
            <div>
              <label className={labelStyle}>Type</label>
              <div className="flex gap-4 mt-2">
                <label>
                  <input
                    type="radio"
                    name="type"
                    value="Card"
                    checked={formData.type === "Card"}
                    onChange={handleChange}
                  />{" "}
                  Card
                </label>

                <label>
                  <input
                    type="radio"
                    name="type"
                    value="User"
                    checked={formData.type === "User"}
                    onChange={handleChange}
                  />{" "}
                  User
                </label>
              </div>
            </div>

            {/* Break Hours */}
            <div className="flex items-center gap-2 mt-6">
              <label className={labelStyle}>Break Hours (Friday)</label>
              <input
                type="checkbox"
                name="breakHoursFriday"
                checked={formData.breakHoursFriday}
                onChange={handleChange}
              />
            </div>

            {/* Active */}
            <div className="flex items-center gap-2 mt-6">
              <label className={labelStyle}>Active</label>
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />
            </div>

            {/* Mobile User */}
            <div className="flex items-center gap-2 mt-6">
              <label className={labelStyle}>Is Mobile User</label>
              <input
                type="checkbox"
                name="isMobileUser"
                checked={formData.isMobileUser}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end mt-10">
            <button
              onClick={handleSubmit}
              className="bg-[oklch(0.645_0.246_16.439)] text-white px-8 py-2 rounded-md"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeMaster;
